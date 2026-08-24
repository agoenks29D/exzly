const express = require('express');
const httpErrors = require('http-errors');
const { authMiddleware, asyncRoute } = require('@exzly-middlewares');
const { userService } = require('@exzly-services');
const { createRoute } = require('@exzly-utils');

const app = express.Router();

/**
 * Admin middleware
 */
app.use(
  authMiddleware.getAuthorization,
  (req, res, next) => {
    const whitelist = /(sign-(in)|(forgot|reset)-password|verification)/;
    const regexPath = whitelist.test(req.path);

    if (!req.user && !regexPath) {
      return res.redirect(createRoute('admin', '/sign-in'));
    } else if (regexPath && req.user) {
      if (req.user.isAdmin) {
        return res.redirect(createRoute('admin'));
      } else {
        return res.redirect(createRoute('web'));
      }
    }

    return next();
  },
  authMiddleware.rejectNonAdmin,
);

/**
 * Admin route
 */
app.get('/', (req, res) => {
  return res.render('admin/index');
});

/**
 * Sign in
 */
app.get('/sign-in', (req, res) => {
  return res.render('admin/auth/sign-in');
});

/**
 * Forgot password
 */
app.get('/forgot-password', (req, res) => {
  return res.render('admin/auth/forgot-password');
});

/**
 * Sign out
 */
app.get('/sign-out', (req, res) => {
  return req.session.destroy(() => {
    return res.redirect(`${process.env.ADMIN_ROUTE}/sign-in`);
  });
});

/**
 * Users
 */
app.get(
  '/users',
  asyncRoute(async (req, res) => {
    return res.render('admin/users/index', {
      deletedCount: await userService.countTrashed(),
    });
  }),
);

/**
 * Add new user
 */
app.get('/users/add-new', (req, res) => {
  return res.render('admin/users/add-new');
});

/**
 * User profile
 */
app.get(
  '/users/profile/:id',
  asyncRoute(async (req, res, next) => {
    const user = await userService.findById(req.params.id);

    if (!user) {
      return next(httpErrors.NotFound('User not found'));
    }

    return res.render('admin/users/profile', { user });
  }),
);

/**
 * User profile
 */
app.get(
  '/users/profile/:id/edit',
  asyncRoute(async (req, res, next) => {
    const user = await userService.findById(req.params.id);

    if (!user) {
      return next(httpErrors.NotFound('User not found'));
    }

    if (user.id === req.userId) {
      return res.redirect(createRoute('admin', '/account/setting'));
    }

    return res.render('admin/users/edit', { user });
  }),
);

/**
 * User account
 */
app.get(
  '/account',
  asyncRoute(async (req, res) => {
    const user = await userService.findById(req.userId);
    return res.render('admin/account/index', { user });
  }),
);

/**
 * User account setting
 */
app.get(
  '/account/setting',
  asyncRoute(async (req, res) => {
    const user = await userService.findById(req.userId);
    return res.render('admin/account/setting', { user });
  }),
);

app.use((req, res, next) => next(httpErrors.NotFound('Page not found')));

module.exports = app;
