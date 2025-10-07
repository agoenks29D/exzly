const express = require('express');
const _ = require('lodash');
const httpErrors = require('http-errors');
const { matchedData } = require('express-validator');
const { securityConfig } = require('@exzly-config');
const { UserModel } = require('@exzly-models');
const { storageMiddleware, authMiddleware, asyncRoute } = require('@exzly-middlewares');
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
    const { order, where } = UserModel.dataTablesQuery(req);

    /** @type {import('sequelize').FindAndCountOptions} */
    const queryOptions = {
      where,
      order,
      paranoid: !reqQuery['in-trash'],
      limit: reqQuery['size'],
      offset: reqQuery['skip'],
    };
    const { count, rows } = await UserModel.findAndCountAll(queryOptions);
    const hasNext = queryOptions.offset + rows.length < count;

    // send response
    return res
      .setHeader('X-Total-Count', await UserModel.count({ paranoid: !reqQuery['in-trash'] }))
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
    const user = await UserModel.create({
      email: reqBody.email,
      username: reqBody.username,
      password: reqBody.password,
      isAdmin: reqBody.isAdmin,
      gender: reqBody.gender,
      fullName: reqBody.fullName,
    });

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

    const user = await UserModel.findByPk(req.params.userId || req.userId);

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
    return res.json(_.omit(user.toJSON(), fieldsToOmit));
  }),
);

/**
 * Update profile
 */
app.put(
  '/profile/:userId?',
  authMiddleware.rejectUnauthorized,
  [userValidator.updateProfile],
  asyncRoute(async (req, res, next) => {
    const user = await UserModel.findByPk(req.params.userId || req.userId);
    const { fullName, gender } = matchedData(req, { locations: ['body'] });

    if (!user) {
      // send error : not found
      return next(httpErrors.NotFound('User not found'));
    }

    if (user.id !== req.userId && !req.user.isAdmin) {
      // send error : permission denied
      return next(httpErrors.Forbidden('Permission denied'));
    }

    await user.update({ fullName, gender });

    // send response
    return res.json(user);
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
    const user = await UserModel.findByPk(req.params.userId, {
      paranoid: !req.query['in-trash'],
    });

    if (!user) {
      // send error : not found
      return next(httpErrors.NotFound('User not found'));
    }

    if (user.id === req.userId && req.user.isAdmin) {
      // send error : bad request
      return next(httpErrors.BadRequest('Unable to delete'));
    }

    if (user.id !== req.userId) {
      if (!req.user.isAdmin) {
        // send error : forbidden
        return next(httpErrors.Forbidden("You don't have permission to do that"));
      }

      if (new Date(req.user.createdAt) > new Date(user.createdAt)) {
        // send error : forbidden
        return next(
          httpErrors.Forbidden('Cannot delete a user with an earlier account creation date'),
        );
      }
    }

    await user.destroy({ force: req.query['in-trash'] });

    // send response
    return res.json({ success: true });
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
    const user = await UserModel.findByPk(req.params.userId, {
      paranoid: false,
    });

    if (!user) {
      // send error : not found
      return next(httpErrors.NotFound('User not found'));
    }

    await user.restore();

    // send response
    return res.json({ success: true });
  }),
);

/**
 * Change or remove photo profile
 */
app.put(
  '/profile/:userId/photo',
  authMiddleware.rejectUnauthorized,
  storageMiddleware.diskStorage('user-photos').single('photo'),
  storageMiddleware.validateFileMimes(securityConfig.allowedImageMimeTypes),
  asyncRoute(async (req, res, next) => {
    if (!req.file && !req.query.remove) {
      // send error : photo profile or remove is required
      return next(httpErrors.BadRequest('Profile photo is required'));
    }

    const user = await UserModel.findByPk(req.params.userId);

    if (!user) {
      // send error : not found
      return next(httpErrors.NotFound('User not found'));
    }

    if (user.id !== req.userId && !req.user.isAdmin) {
      // send error : permission denied
      return next(httpErrors.Forbidden('Permission denied'));
    }

    if (req.file) {
      await user.update({ photoProfile: req.file.path });
    }

    if (req.query.remove === 'true') {
      await user.update({ photoProfile: null });
    }

    if (req.file) {
      // send response
      return res.json({ photoProfile: req.file.path });
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
    const user = await UserModel.findByPk(req.params.userId);

    if (!user) {
      return next(httpErrors.NotFound('User not found'));
    }

    if (user.isAdmin) {
      return next(httpErrors.BadRequest('User is already an admin'));
    }

    await user.update({ isAdmin: true });

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
    const user = await UserModel.findByPk(req.params.userId);

    if (!user) {
      return next(httpErrors.NotFound('User not found'));
    }

    if (!user.isAdmin) {
      return next(httpErrors.BadRequest('User is not an admin'));
    }

    if (new Date(req.user.createdAt) > new Date(user.createdAt)) {
      return next(
        httpErrors.Forbidden('Cannot demote a user with an earlier account creation date'),
      );
    }

    await user.update({ isAdmin: false });

    // send response
    return res.json({ success: true });
  }),
);

/**
 * Update user credentials
 */
app.put(
  '/credentials/:userId',
  authMiddleware.rejectUnauthorized,
  [userValidator.updateCredentials],
  asyncRoute(async (req, res, next) => {
    const user = await UserModel.findByPk(req.params.userId);
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

    await user.update({ email, username, password: newPassword });

    // send response
    return res.json({ success: true });
  }),
);

module.exports = app;
