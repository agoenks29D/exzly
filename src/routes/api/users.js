const express = require('express');
const _ = require('lodash');
const httpErrors = require('http-errors');
const { matchedData } = require('express-validator');
const { securityConfig } = require('@exzly-config');
const { storageMiddleware, authMiddleware, asyncRoute } = require('@exzly-middlewares');
const { userService } = require('@exzly-services');
const { commonValidator, userValidator } = require('@exzly-validators');

const app = express.Router();

/**
 * Get users
 */
app.get(
  '/',
  authMiddleware.rejectUnauthorized,
  authMiddleware.rejectNonAdmin,
  [commonValidator.dataQuery, commonValidator.dataTablesQuery],
  asyncRoute(async (req, res) => {
    const reqQuery = matchedData(req, { locations: ['query'] });
    const { rows, count, totalCount, hasNext } = await userService.paginate(req, {
      size: reqQuery['size'],
      skip: reqQuery['skip'],
      inTrash: reqQuery['in-trash'],
    });

    // send response
    return res
      .setHeader('X-Total-Count', totalCount)
      .setHeader('X-Filtered-Count', count)
      .json({ data: rows, hasNext });
  }),
);

/**
 * Create user
 */
app.post(
  '/',
  authMiddleware.rejectUnauthorized,
  authMiddleware.rejectNonAdmin,
  [userValidator.createNew],
  asyncRoute(async (req, res) => {
    const reqBody = matchedData(req, { locations: ['body'], includeOptionals: true });
    const user = await userService.createUser(reqBody);

    // send response
    return res.status(201).json(_.omit(user.toJSON(), ['password']));
  }),
);

/**
 * View profile
 */
app.get(
  '/profile/:userId?',
  asyncRoute(async (req, res, next) => {
    if (!(req.params.userId || req.userId)) {
      return next(
        httpErrors.BadRequest('User ID is required in either the URL or the authenticated session'),
      );
    }

    const user = await userService.findById(req.params.userId || req.userId);

    if (!user) {
      // send error : not found
      return next(httpErrors.NotFound('User not found'));
    }

    const fieldsToOmit = ['createdAt', 'updatedAt', 'deletedAt'];

    if (!req.user.isAdmin) {
      if (req.userId !== user.id) {
        fieldsToOmit.push('email');
      }
    }

    // send response
    return res.json(userService.toSafeJSON(user, fieldsToOmit));
  }),
);

/**
 * Update profile
 */
app.patch(
  '/profile/:userId?',
  authMiddleware.rejectUnauthorized,
  [userValidator.updateProfile],
  asyncRoute(async (req, res, next) => {
    const targetUserId = req.params.userId || req.userId;
    const user = await userService.findById(targetUserId);
    const { fullName, gender } = matchedData(req, { locations: ['body'] });

    if (!user) {
      // send error : not found
      return next(httpErrors.NotFound('User not found'));
    }

    if (user.id !== req.userId && !req.user.isAdmin) {
      // send error : permission denied
      return next(httpErrors.Forbidden('Permission denied'));
    }

    const updated = await userService.updateProfile(targetUserId, { fullName, gender });

    // send response
    return res.json(updated);
  }),
);

/**
 * Delete account
 */
app.delete(
  '/profile/:userId',
  authMiddleware.rejectUnauthorized,
  [commonValidator.dataQuery],
  asyncRoute(async (req, res, next) => {
    const { status } = await userService.deleteAccount(
      req.userId,
      req.user.isAdmin,
      req.params.userId,
      Boolean(req.query['in-trash']),
    );

    switch (status) {
      case 'not-found':
        return next(httpErrors.NotFound('User not found'));
      case 'self-admin':
        return next(httpErrors.BadRequest('Unable to delete'));
      case 'forbidden':
        return next(httpErrors.Forbidden("You don't have permission to do that"));
      case 'older-account':
        return next(
          httpErrors.Forbidden('Cannot delete a user with an earlier account creation date'),
        );
      default:
        // send response
        return res.json({ success: true });
    }
  }),
);

/**
 * Restore account
 */
app.patch(
  '/profile/:userId',
  authMiddleware.rejectUnauthorized,
  authMiddleware.rejectNonAdmin,
  asyncRoute(async (req, res, next) => {
    const restored = await userService.restoreById(req.params.userId);

    if (!restored) {
      return next(httpErrors.NotFound('User not found'));
    }

    // send response
    return res.json({ success: true });
  }),
);

/**
 * Change or remove photo profile
 */
app.patch(
  '/profile/:userId/photo',
  authMiddleware.rejectUnauthorized,
  storageMiddleware.diskStorage('user-photos').single('photo'),
  storageMiddleware.validateFileMimes(securityConfig.allowedImageMimeTypes),
  asyncRoute(async (req, res, next) => {
    if (!req.file && !req.query.remove) {
      // send error : photo profile or remove is required
      return next(httpErrors.BadRequest('Profile photo is required'));
    }

    const targetUserId = req.params.userId;
    const user = await userService.findById(targetUserId);

    if (!user) {
      // send error : not found
      return next(httpErrors.NotFound('User not found'));
    }

    if (user.id !== req.userId && !req.user.isAdmin) {
      // send error : permission denied
      return next(httpErrors.Forbidden('Permission denied'));
    }

    if (req.file) {
      await userService.updatePhoto(targetUserId, req.file.path);
      // send response
      return res.json({ photoProfile: req.file.path });
    }

    if (req.query.remove === 'true') {
      await userService.updatePhoto(targetUserId, null);
    }

    // send response
    return res.json({ success: true });
  }),
);

/**
 * Promote user as admin
 */
app.get(
  '/promote/:userId',
  authMiddleware.rejectUnauthorized,
  authMiddleware.rejectNonAdmin,
  asyncRoute(async (req, res, next) => {
    const { user, alreadyAdmin } = await userService.promote(req.params.userId);

    if (!user) {
      return next(httpErrors.NotFound('User not found'));
    }

    if (alreadyAdmin) {
      return next(httpErrors.BadRequest('User is already an admin'));
    }

    // send response
    return res.json({ success: true });
  }),
);

/**
 * Demote user from admin
 */
app.get(
  '/demote/:userId',
  authMiddleware.rejectUnauthorized,
  authMiddleware.rejectNonAdmin,
  asyncRoute(async (req, res, next) => {
    const { status } = await userService.demote(req.userId, req.params.userId);

    switch (status) {
      case 'not-found':
        return next(httpErrors.NotFound('User not found'));
      case 'not-admin':
        return next(httpErrors.BadRequest('User is not an admin'));
      case 'self':
        return next(httpErrors.BadRequest('Cannot demote yourself'));
      case 'older-account':
        return next(
          httpErrors.Forbidden('Cannot demote a user with an earlier account creation date'),
        );
      default:
        // send response
        return res.json({ success: true });
    }
  }),
);

/**
 * Update user credentials
 */
app.patch(
  '/credentials/:userId',
  authMiddleware.rejectUnauthorized,
  [userValidator.updateCredentials],
  asyncRoute(async (req, res, next) => {
    const targetUserId = req.params.userId;
    const user = await userService.findById(targetUserId);
    const { email, username, newPassword } = matchedData(req, {
      locations: ['body'],
    });

    if (!user) {
      // send error : not found
      return next(httpErrors.NotFound('User not found'));
    }

    if (user.id !== req.userId && !req.user.isAdmin) {
      // send error : permission denied
      return next(httpErrors.Forbidden('Permission denied'));
    }

    if (email && email !== user.email) {
      // todo : confirm new email address
    }

    await userService.updateCredentials(targetUserId, { email, username, newPassword });

    // send response
    return res.json({ success: true });
  }),
);

module.exports = app;
