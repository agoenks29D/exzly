/**
 * @typedef {Object} S3ObjectStorageOptions
 * @property {import('@aws-sdk/client-s3').ObjectCannedACL} ACL
 * @property {string} ContentType
 * @property {string} ContentDisposition
 * @property {import('@aws-sdk/client-s3').StorageClass} StorageClass
 * @property {import('@aws-sdk/client-s3').S3ClientConfig} s3
 */

const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

/**
 * S3 storage config
 *
 * @param {import('@aws-sdk/client-s3').S3ClientConfig} options
 */
const S3Config = (options = {}) => {
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
    ...options,
  });
};

/**
 * S3 object storage
 *
 * @param {string} Bucket
 * @param {string} Key
 * @param {import('@aws-sdk/lib-storage').BodyDataTypes} Body
 * @param {S3ObjectStorageOptions} options
 * @returns {import('@aws-sdk/lib-storage').Upload}
 */
const S3Upload = (Bucket, Key, Body, options = {}) => {
  return new Upload({
    client: S3Config(options?.s3),
    params: {
      Bucket,
      Key,
      Body,
      ACL: options?.ACL || 'public-read',
      ContentType: options?.ContentType,
      ContentDisposition: options?.ContentDisposition || 'inline',
      StorageClass: options?.StorageClass || 'STANDARD',
    },
  });
};

module.exports = { S3Upload };
