const debug = require('debug')('exzly');

const debugMiddleware = debug.extend('middleware');

module.exports = {
  debug,
  debugMiddleware,
};
