/**
 * Get query params
 *
 * @param {import('express').Request} req
 * @param {string} key
 * @returns {string|undefined|object}
 */
const getQueryParams = (req, key = undefined) => {
  if (Array.isArray(key)) {
    const result = {};
    key.forEach((k) => {
      if (req.query[k]) {
        result[k] = req.query[k];
      }
    });

    return result;
  }

  if (key) {
    return req.query[key];
  }

  return req.query;
};

/**
 * Get URI segments
 *
 * @param {import('express').Request} req
 * @returns {string[]}
 */
const uriSegments = (req) => {
  const reqParams = req.originalUrl;
  return reqParams.split('/').filter((value) => value.trim() !== '');
};

/**
 * Checks if the specified segment of the URI matches the given text.
 *
 * @param {import('express').Request} req - The request object, typically from an Express.js route handler.
 * @param {string} text - The text to match against a URI segment.
 * @param {number} [num=0] - The index of the URI segment to check (default is 0 for the first segment).
 * @returns {boolean} True if the URI segment matches the given text, otherwise false.
 */
const uriSegmentMatches = (req, text, num = 0) => {
  const reqParams = req.originalUrl;
  const filtered = reqParams.split('/').filter((value) => value.trim() !== '');

  if (filtered.length > 0) {
    return filtered[num] === text;
  }

  return false;
};

module.exports = { getQueryParams, uriSegments, uriSegmentMatches };
