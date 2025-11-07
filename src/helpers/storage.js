const { Storage } = require('@google-cloud/storage');

/**
 * Google cloud storage
 *
 * @param {import('@google-cloud/storage').StorageOptions} options
 */
const GCloudUpload = (options) => {
  return new Storage({
    keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT,
    ...options,
  });
};

module.exports = { GCloudUpload };
