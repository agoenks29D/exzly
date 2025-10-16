const express = require('express');
const httpErrors = require('http-errors');
const moment = require('moment-timezone');
const { authMiddleware } = require('@exzly-middlewares');
const { getPackageJSON } = require('@exzly-utils');
const authRoutes = require('./auth');
const testRoutes = require('./test-dev');
const userRoutes = require('./users');

const app = express.Router();

/**
 * API middleware
 */
app.use(authMiddleware.bearerToken, authMiddleware.getAuthorization, (req, res, next) => {
  const whitelist = /(sign-(up|in)|(forgot|reset)-password)/;
  const excludePaths = whitelist.test(req.path);

  if (!req.user && !excludePaths) {
    return next();
  }

  return next();
});

app.get('/', (req, res) => {
  res.json({
    version: getPackageJSON().version,
    timezone: moment.tz.guess(),
    serverTime: Date.now(),
  });
});

/**
 * API route
 */
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.use('/test', testRoutes);
}

app.use((req, res, next) => next(httpErrors.NotFound('Route not found')));

module.exports = app;
