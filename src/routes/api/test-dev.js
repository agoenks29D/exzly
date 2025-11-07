const express = require('express');
const { securityConfig } = require('@exzly-config');
const { storageHelper } = require('@exzly-helpers');
const { storageMiddleware, authMiddleware } = require('@exzly-middlewares');
const { randomString, getFileTypeFromBuffer } = require('@exzly-utils');

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
  '/dynamic-path-memory-storage',
  storageMiddleware.memoryStorage.single('photo'),
  storageMiddleware.validateFileMimes(securityConfig.allowedImageMimeTypes),
  storageMiddleware.saveToDisk(`upload-test//${randomString(10)}/`),
  (req, res) => {
    // eslint-disable-next-line no-unused-vars
    const { buffer, ...fileWithoutBuffer } = req.file;
    return res.json(fileWithoutBuffer);
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
    const hasError = req.files.some((item) => !item.path);
    if (hasError) {
      return res.status(207).json(req.files);
    }
    return res.json(req.files);
  },
);

app.post(
  '/dynamic-path-disk-storage',
  storageMiddleware.diskStorage(`test//${randomString(10)}/`, 'photo').single('photo'),
  storageMiddleware.validateFileMimes(securityConfig.allowedImageMimeTypes),
  (req, res) => {
    return res.json(req.file);
  },
);

app.post(
  '/gcloud-upload',
  storageMiddleware.memoryStorage.single('photo'),
  storageMiddleware.validateFileMimes(securityConfig.allowedImageMimeTypes),
  async (req, res) => {
    const buffer = req.file.buffer;
    const fileName = randomString(10);
    const fileType = await getFileTypeFromBuffer(buffer);
    const bucket = process.env.GOOGLE_CLOUD_BUCKET_NAME;
    const gcloud = storageHelper.GCloudUpload();
    const storage = gcloud.bucket(bucket).file(fileName);
    await storage.save(buffer, {
      metadata: {
        contentType: fileType.mime,
      },
      public: true,
    });
    return res.json({ url: `https://storage.googleapis.com/${bucket}/${fileName}` });
  },
);

app.get('/access-token', authMiddleware.rejectUnauthorized, (req, res) => {
  return res.json({ message: 'access token valid' });
});

module.exports = app;
