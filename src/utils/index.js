const commonUtils = require('./common');
const debugUtils = require('./debug');
const fileUtils = require('./file');
const jwtUtils = require('./jwt');
const loggerUtils = require('./logger');
const numberUtils = require('./number');
const stringUtils = require('./string');

/**
 * Get route name
 * @param {import('express').Request} req
 * @returns {'api'|'admin'|'web'}
 */
const getRouteName = (req) => {
  const apiRegex = new RegExp(`^${process.env.API_ROUTE.replace(/\//g, '\\/')}(\\/|$)`);
  const adminRegex = new RegExp(`^${process.env.ADMIN_ROUTE.replace(/\//g, '\\/')}(\\/|$)`);

  if (apiRegex.test(req.originalUrl)) {
    return 'api';
  } else if (adminRegex.test(req.originalUrl)) {
    return 'admin';
  } else {
    return 'web';
  }
};

module.exports = {
  ...commonUtils,
  ...debugUtils,
  ...fileUtils,
  ...jwtUtils,
  ...loggerUtils,
  ...numberUtils,
  ...stringUtils,
  getRouteName,
};
