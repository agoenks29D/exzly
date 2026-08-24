/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {(req: Request, res: Response, next: NextFunction) => void} ExpressMiddleware
 */

const httpErrors = require('http-errors');
const { userService } = require('@exzly-services');
const { createRoute, getRouteName } = require('@exzly-utils');
const bearerToken = require('./bearer-token');

/**
 * Authorize
 *
 * @type {ExpressMiddleware}
 */
const getAuthorization = async (req, res, next) => {
  req.userId = req.userId || req.session?.userId;

  if (req.userId) {
    const user = await userService.findById(req.userId);

    if (!user) {
      req.userId = null;
      return req.session.destroy((err) => {
        if (err) {
          return next(err);
        }

        return next();
      });
    }

    req.user = user.toJSON();
  }

  return next();
};

/**
 * Reject Unauthorized
 *
 * @type {ExpressMiddleware}
 */
const rejectUnauthorized = (req, res, next) => {
  if (!req.user) {
    return next(httpErrors.Unauthorized());
  }

  return next();
};

/**
 * Reject Non Admin
 *
 * @type {ExpressMiddleware}
 */
const rejectNonAdmin = (req, res, next) => {
  if (req.user && !req.user.isAdmin) {
    if (getRouteName(req) === 'admin') {
      return res.redirect(createRoute('web'));
    }

    return next(httpErrors.Forbidden());
  }

  return next();
};

module.exports = {
  getAuthorization,
  rejectUnauthorized,
  rejectNonAdmin,
  bearerToken,
};
