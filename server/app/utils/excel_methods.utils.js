import { EXCEL, FILE_CONSTANTS } from './global.constants.js';

export const isCSVFile = (file) => getFileExtension(file) === EXCEL.TYPES.CSV;

export const isExcelFile = (file) =>
  getFileExtension(file) === EXCEL.TYPES.XLSX ||
  getFileExtension(file) === EXCEL.TYPES.XLS;

export const isFileSizeValid = (fileSize) =>
  fileSize <= FILE_CONSTANTS.MAX_SIZE;

/**
 * Gets the extension of the file.
 * @param {string} fileName - The file name.
 * @returns {string} - Returns the extension of the file.
 */
export const getFileExtension = (fileName) =>
  fileName.split('.').pop().toLowerCase();
