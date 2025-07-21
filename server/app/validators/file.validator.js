import { check } from 'express-validator';
import { isValidFileType } from '../utils/file.utils.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import { FILE_CONSTANTS } from '../utils/global.constants.js';

/**
 * @constant fileSchema
 * @description A schema for validating the file uploaded by the user.
 */

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE);
export const uploadFileSchema = [
  check(CONSTANTS.STORAGE.FILE).custom((_, { req }) => {
    if (!req.file) {
      throw new Error(CONSTANTS.STORAGE.NO_FILE_UPLOADED);
    }
    if (!isValidFileType(req.file.mimetype)) {
      throw new Error(CONSTANTS.STORAGE.INVALID_FILE_TYPE);
    }
    if (req.file.size > FILE_CONSTANTS.MAX_SIZE) {
      throw new Error(CONSTANTS.STORAGE.FILE_SIZE_EXCEEDED);
    }
    return true;
  }),
];

export const downloadFileSchema = [
  check(CONSTANTS.STORAGE.FILENAME)
    .isString()
    .withMessage(CONSTANTS.VALIDATION.INVALID_STRING),
];
