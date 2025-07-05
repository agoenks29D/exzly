const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');
const compression = require('compression');
const { unless } = require('express-unless');
const {
  viewEngineMiddleware,
  fileLoaderMiddleware,
  sessionMiddleware,
} = require('@exzly-middlewares');
const { getRouteName } = require('@exzly-utils');
const apiRoutes = require('./api');
const webRoutes = require('./web');
const adminRoutes = require('./admin');
const apiErrorHandler = require('./api/error');
const webErrorHandler = require('./web/error');
const adminErrorHandler = require('./admin/error');

const app = express();

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: [
        'data:',
        "'self'",
        'https://picsum.photos',
        'https://loremflickr.com',
        'https://fastly.picsum.photos',
        'https://lh3.googleusercontent.com',
        'https://lh4.googleusercontent.com',
        'https://lh5.googleusercontent.com',
        'https://lh6.googleusercontent.com',
      ],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      scriptSrcAttr: [(req, res) => `'nonce-${res.locals.nonce}'`],
      // reportUri: `${process.env.API_ROUTE}/csp-violation-report`,
    },
  },
});

helmetMiddleware.unless = unless;

/**
 * Set view engine & proxy
 */
app.set('trust proxy', process.env.TRUST_PROXY);
app.set('view engine', 'njk');
app.use(sessionMiddleware, viewEngineMiddleware(app));

/**
 * Global middleware
 */
app.use(cors());
app.use(
  morgan('dev', {
    skip: () => process.env.NODE_ENV !== 'development',
  }),
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
app.use(helmetMiddleware.unless({ path: ['/public'] }));
app.use('/storage/user-photos/:file', fileLoaderMiddleware.imageLoader.diskStorage('user-photos'));

if (process.env.NODE_ENV !== 'production') {
  app.use('/storage/:file', fileLoaderMiddleware.imageLoader.diskStorage('test'));
  app.use('/storage/:file', fileLoaderMiddleware.imageLoader.diskStorage('upload-test'));

  const userData = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = { id: 1, name: 'Exzly Developers', email: 'developer@exzly.dev' };
        resolve(data);
      }, 1000);
    });
  };
  app.get('/test', (req, res) => res.render('test/index', { userData }));
}

/**
 * Set routes
 */
app.use(process.env.API_ROUTE, apiRoutes);
app.use(process.env.ADMIN_ROUTE, adminRoutes);
app.use(process.env.WEB_ROUTE, webRoutes);

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  switch (getRouteName(req)) {
    case 'api':
      return apiErrorHandler(err, req, res, next);

    case 'admin':
      return adminErrorHandler(err, req, res, next);

    default:
      return webErrorHandler(err, req, res, next);
  }
});

module.exports = app;
