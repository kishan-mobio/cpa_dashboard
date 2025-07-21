import ExcelData from '../models/excel.model.js';
import logger from '../config/logger.config.js';
import { CONSTANTS } from '../utils/constants.utils.js'; // Correct path for CONSTANTS
import { LOG_MESSAGES } from '../utils/log_messages.utils.js'; // Correct path for LOG_MESSAGES
import { performDbOperation, DB_OPERATIONS } from '../utils/db.utils.js';

/**
 * Save uploaded Excel data to the database
 * @param {string} fileName - The name of the uploaded file
 * @param {Array} data - Parsed Excel data
 * @returns {Promise<Object>} - Saved Excel data document
 */
export const uploadExcelData = async (fileName, data) => {
  try {
    logger.info(LOG_MESSAGES.FILE.SAVING);

    return await performDbOperation(ExcelData, DB_OPERATIONS.CREATE, {
      fileName,
      data,
    });
  } catch (error) {
    logger.error(LOG_MESSAGES.FILE.ERROR_SAVING, error);
    throw new Error(CONSTANTS.EXCEL.ERROR_SAVING_DATA);
  }
};

/**
 * Fetch Excel data from the database by file name
 * @param {string} name - File name to search
 * @returns {Promise<Object>} - Found Excel data document
 * @throws {Error} - If no data is found
 */
export const getExcelData = async (name) => {
  try {
    logger.info(`${LOG_MESSAGES.FILE.ERROR_FETCHING_FILE_INFO}: ${name}`);

    const result = await performDbOperation(ExcelData, DB_OPERATIONS.FIND_ONE, {
      fileName: name,
    });

    if (!result) {
      throw new Error(CONSTANTS.EXCEL.NO_DATA_FOUND_IN_DATABASE);
    }

    return result;
  } catch (error) {
    logger.error(`${LOG_MESSAGES.FILE.ERROR_FETCHING}: ${name}`, error);
    throw new Error(error.message);
  }
};
