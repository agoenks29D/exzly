/**
 * @typedef {Object} FileTypeResult
 * @property {string} ext
 * @property {string} mime
 */

/**
 * Get file type from buffer
 *
 * @param {Buffer} buffer
 * @returns {Promise<FileTypeResult>}
 */
const getFileTypeFromBuffer = async (buffer) => {
  const { fileTypeFromBuffer } = await import('file-type');
  const fileType = await fileTypeFromBuffer(buffer);

  return fileType;
};

/**
 * Get file type from file
 *
 * @param {string} filePath
 * @returns {Promise<FileTypeResult>}
 */
const getFileTypeFromFile = async (filePath) => {
  const { fileTypeFromFile } = await import('file-type');
  const fileType = await fileTypeFromFile(filePath);

  return fileType;
};

module.exports = { getFileTypeFromBuffer, getFileTypeFromFile };
