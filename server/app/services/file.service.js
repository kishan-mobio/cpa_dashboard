import File from '../models/file.model.js';
import logger from '../config/logger.config.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js'; // Correct path for LOG_MESSAGES
import { performDbOperation, DB_OPERATIONS } from '../utils/db.utils.js';

/**
 * Save uploaded file metadata to the database
 * @param {string} fileName - The original file name
 * @param {string} publicUrl - The public download URL of the uploaded file
 * @returns {Promise<void>}
 */
export const saveUploadedFile = async (fileName, publicUrl) => {
  try {
    logger.info(LOG_MESSAGES.FILE.SAVING);

    const filter = {
      name: fileName,
      downloadUrl: publicUrl,
    };

    await performDbOperation(File, DB_OPERATIONS.CREATE, filter);
  } catch (error) {
    logger.error(LOG_MESSAGES.FILE.ERROR_SAVING, error);
    throw new Error(CONSTANTS.STORAGE.FILE_NOT_FOUND);
  }
};

/**
 * Get a file by name
 * @param {string} filename - The name of the file
 * @returns {Promise<Object>} - The file document
 * @throws {Error} - If the file is not found
 */
export const getFileByName = async (filename) => {
  try {
    const filter = {
      name: filename,
    };

    const file = await performDbOperation(File, DB_OPERATIONS.FIND_ONE, filter);

    if (!file) {
      throw new Error(CONSTANTS.STORAGE.FILE_NOT_FOUND);
    }

    return file;
  } catch (error) {
    logger.error(LOG_MESSAGES.FILE.ERROR_FETCHING, error);
    throw new Error(error.message);
  }
};
