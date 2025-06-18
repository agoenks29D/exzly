/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {(req: Request, res: Response, next: NextFunction) => void} ExpressMiddleware
 */

const mime = require('mime');
const express = require('express');

/**
 * Middleware to serve static files from the 'public' directory.
 * If the file is in .gz format, it sets the Content-Encoding and Content-Type headers.
 *
 * @type {ExpressMiddleware}
 */
const publicDir = express.static('public', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.gz')) {
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Type', mime.getType(filePath));
    }
  },
});

/**
 * Middleware to serve static files from the 'public/service-worker' directory.
 * If the file is in .gz format, it sets the Content-Encoding and Content-Type headers.
 *
 * @type {ExpressMiddleware}
 */
const serviceWorker = express.static('public/service-worker', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.gz')) {
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Type', mime.getType(filePath));
    }
  },
});

module.exports = { publicDir, serviceWorker };
