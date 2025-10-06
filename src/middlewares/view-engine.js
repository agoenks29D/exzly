/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {(req: Request, res: Response, next: NextFunction) => void} ExpressMiddleware
 */

const crypto = require('crypto');
const moment = require('moment');
const lodash = require('lodash');
const nunjucks = require('nunjucks');
const httpErrors = require('http-errors');
const { viewEngineHelper } = require('@exzly-helpers');
const { getPackageJSON, createRoute } = require('@exzly-utils');

/**
 * View engine
 *
 * @param {import('express').Express} express
 * @returns {ExpressMiddleware}
 */
module.exports = (express) => {
  const viewEngine = nunjucks.configure('src/views', {
    autoescape: false,
    express,
    watch: process.env.NODE_ENV !== 'test',
    noCache: true,
  });

  return (req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    /**
     * Custom function
     */
    viewEngine.addGlobal('_', lodash);
    viewEngine.addGlobal('moment', moment);
    viewEngine.addGlobal('apiRoute', (path = '') => createRoute('api', path));
    viewEngine.addGlobal('webRoute', (path = '') => createRoute('web', path));
    viewEngine.addGlobal('adminRoute', (path = '') => createRoute('admin', path));
    viewEngine.addGlobal('getQueryParams', (key = undefined) => {
      return viewEngineHelper.getQueryParams(req, key);
    });
    viewEngine.addGlobal('uriSegments', () => {
      return viewEngineHelper.uriSegments(req);
    });
    viewEngine.addGlobal('uriSegmentMatches', (text, num = 0) => {
      return viewEngineHelper.uriSegmentMatches(req, text, num);
    });

    /**
     * Custom variable
     */
    viewEngine.addGlobal('req', req);
    viewEngine.addGlobal('nonce', res.locals.nonce);
    viewEngine.addGlobal('app_env', process.env);
    viewEngine.addGlobal('app_name', process.env.APP_NAME);
    viewEngine.addGlobal('appRoute', {
      api: process.env.API_ROUTE,
      web: process.env.WEB_ROUTE,
      admin: process.env.ADMIN_ROUTE,
    });
    viewEngine.addGlobal('httpErrors', (code = 500) => {
      return httpErrors[code]();
    });
    viewEngine.addGlobal('environment', process.env.NODE_ENV);
    viewEngine.addGlobal('version', getPackageJSON().version);
    viewEngine.addGlobal(
      'reqURL',
      new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
    );
    viewEngine.addGlobal(
      'isBasePath',
      req.path.split('/').filter((item) => item !== '').length === 1,
    );
    viewEngine.addGlobal('assetsUrl', (assetPath) => {
      const assetsURL = process.env.ASSETS_URL || '/';
      return `${assetsURL}${assetPath}`.replace(/\/{2,}/g, '/');
    });

    /**
     * Custom filter
     */
    viewEngine.addFilter(
      'json',
      async (input, callback) => {
        if (input instanceof Promise) {
          const result = await input;
          callback(null, JSON.stringify(result));
        } else {
          callback(null, JSON.stringify(input));
        }
      },
      true,
    );

    return next();
  };
};
