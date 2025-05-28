const express = require('express');
const { securityConfig } = require('@exzly-config');
const { storageMiddleware, authMiddleware } = require('@exzly-middlewares');
require('@exzly-models');

const app = express.Router();

app.post(
  '/single-memory-storage',
  storageMiddleware.memoryStorage.single('photo'),
  storageMiddleware.validateFileMimes(securityConfig.allowedImageMimeTypes),
  storageMiddleware.saveToDisk('upload-test'),
  (req, res) => {
    // eslint-disable-next-line no-unused-vars
    const { buffer, ...fileWithoutBuffer } = req.file;
    return res.json(fileWithoutBuffer);
  },
);

app.post(
  '/array-memory-storage',
  storageMiddleware.memoryStorage.array('photos'),
  storageMiddleware.validateFileMimes(securityConfig.allowedImageMimeTypes),
  storageMiddleware.saveToDisk('upload-test'),
  (req, res) => {
    return res.json(
      // eslint-disable-next-line no-unused-vars
      req.files.map(({ buffer, ...fileWithoutBuffer }) => fileWithoutBuffer),
    );
  },
);

app.post(
  '/single-disk-storage',
  storageMiddleware.diskStorage('test').single('photo'),
  storageMiddleware.validateFileMimes(securityConfig.allowedImageMimeTypes),
  (req, res) => {
    return res.json(req.file);
  },
);

app.post(
  '/array-disk-storage',
  storageMiddleware.diskStorage('test').array('photos'),
  storageMiddleware.validateFileMimes(securityConfig.allowedImageMimeTypes),
  (req, res) => {
    return res.json(req.files);
  },
);

app.get('/access-token', authMiddleware.rejectUnauthorized, (req, res) => {
  return res.json({ message: 'access token valid' });
});

module.exports = app;
