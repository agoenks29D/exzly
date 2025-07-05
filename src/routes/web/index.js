const ms = require('ms');
const express = require('express');
const httpErrors = require('http-errors');
const { securityConfig } = require('@exzly-config');
const { jwtHelper } = require('@exzly-helpers');
const { authMiddleware, asyncRoute } = require('@exzly-middlewares');
const { AuthVerifyModel, UserModel } = require('@exzly-models');
const { createRoute } = require('@exzly-utils');

const app = express.Router();

/**
 * Web middleware
 */
app.use(authMiddleware.getAuthorization, (req, res, next) => {
  const skiplist = `${process.env.API_ROUTE}/auth/(sign-(up|in)|(forgot|reset)-password|verification)`;
  const whitelist = /(sign-(up|in)|(forgot|reset)-password|verification)/;
  const regexPath = whitelist.test(req.path);

  if (req.user && regexPath) {
    const skip = new RegExp(skiplist);

    if (!skip.exec(req.path)) {
      return res.redirect(createRoute('web'));
    }
  }

  return next();
});

/**
 * Home page
 */
app.get('/', (req, res) => {
  return res.render('web/index');
});

/**
 * Sign up
 */
app.get('/sign-up', (req, res) => {
  return res.render('web/auth/sign-up');
});

/**
 * Sign in
 */
app.get('/sign-in', (req, res) => {
  return res.render('web/auth/sign-in');
});

/**
 * Sign out
 */
app.get('/sign-out', (req, res) => {
  return req.session.destroy(() => {
    return res.redirect(createRoute('web'));
  });
});

/**
 * Verification
 */
app.get(
  '/verification',
  asyncRoute(async (req, res, next) => {
    if (req.query.token) {
      const authVerify = await AuthVerifyModel.findOne({
        where: { sha1: req.query.token },
        include: [
          {
            model: UserModel,
            as: 'user',
          },
        ],
      });

      if (!authVerify) {
        return next(httpErrors.BadRequest('The requested link has expired'));
      }

      /**
       * Check expires time
       */
      const isExpired = new Date(authVerify.expiresAt) < new Date();

      if (isExpired) {
        return res.render('web/auth/verification', { isExpired });
      }

      if (authVerify.codeIsUsed || authVerify.tokenIsUsed) {
        return next(httpErrors.BadRequest('The requested link has been used'));
      }

      await authVerify.update({
        codeIsUsed: true,
        expiresAt: new Date(Date.now() + ms(securityConfig.passwordResetExpires)), // update for token expires
      });

      /**
       * Reset password requested
       */
      if (authVerify.purpose === 'password-reset') {
        const token = jwtHelper.createPasswordResetToken(authVerify.code);

        req.session.cookie.maxAge = ms(securityConfig.passwordResetExpires);
        req.session.resetPassword = token;
        req.session.save();

        await authVerify.update({ token });

        return res.redirect(createRoute('web', '/reset-password'));
      }
    }

    return res.render('web/auth/verification', { isExpired: false });
  }),
);

/**
 * Forgot password
 */
app.get('/forgot-password', (req, res) => {
  return res.render('web/auth/forgot-password');
});

/**
 * Reset password
 */
app.get('/reset-password', (req, res, next) => {
  if (!req.session.resetPassword) {
    return next();
  }

  return res.render('web/auth/reset-password', { resetPassword: req.session.resetPassword });
});

/**
 * Account overview
 */
app.get(
  '/account',
  asyncRoute(async (req, res) => {
    if (!req.session.userId) {
      return res.redirect(createRoute('web', 'sign-in'));
    }

    const user = await UserModel.findByPk(req.session.userId);
    return res.render('web/user/account-overview', { user });
  }),
);

/**
 * Account setting
 */
app.get(
  '/account/setting',
  asyncRoute(async (req, res) => {
    if (!req.session.userId) {
      return res.redirect(createRoute('web', 'sign-in'));
    }

    const user = await UserModel.findByPk(req.session.userId);
    return res.render('web/user/account-setting', { user });
  }),
);

/**
 * Oauth
 */
app.use('/oauth', require('./oauth'));

app.use((req, res, next) => next(httpErrors.NotFound('Page not found')));

module.exports = app;
