/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {(req: Request, res: Response, next: NextFunction) => void} ExpressMiddleware
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { debugMiddleware } = require('@exzly-utils');

/**
 * Load image from disk storage
 *
 * @param {string} destination
 * @returns {ExpressMiddleware}
 */
const diskStorage = (destination = '/') => {
  return async (req, res, next) => {
    let width = 150;
    let height = 150;

    if (!Number.isNaN(parseFloat(req.query.width))) {
      width = parseFloat(req.query.width);
    }

    if (!Number.isNaN(parseFloat(req.query.height))) {
      height = parseFloat(req.query.height);
    }

    const diskStoragePath = path.join(process.env.STORAGE_PATH, destination);
    const imageExt = path.extname(req.params.file).toLowerCase();
    const imagePath = path.join(diskStoragePath, req.params.file);
    const fileName = req.params.file.replace(imageExt, '');
    const imageResizedName = `${fileName}-${width}x${height}${imageExt}`;
    const imageRezizedFile = path.resolve(path.join(diskStoragePath, imageResizedName));

    debugMiddleware('load image from disk storage');

    if (req.query.width && req.query.height) {
      if (fs.existsSync(imageRezizedFile)) {
        // send response
        return res.sendFile(imageRezizedFile);
      }

      if (fs.existsSync(imagePath)) {
        const loadImage = sharp(imagePath);
        const resizeImage = loadImage.resize(width, height, {
          fit: 'inside',
        });

        // save as file
        await resizeImage.toFile(imageRezizedFile);

        // send response
        return res.sendFile(imageRezizedFile);
      }
    }

    if (fs.existsSync(imagePath)) {
      // send response
      return res.sendFile(path.resolve(imagePath));
    }

    return next();
  };
};

module.exports = { diskStorage };
