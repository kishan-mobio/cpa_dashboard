import { check } from 'express-validator';
import {
  EXCEL_FILE_EXTENSIONS,
  FILE_CONSTANTS,
  REQUEST_BODY,
} from '../utils/global.constants.js';
import { EMAIL_REGEX, PHONE_REGEX, URL_REGEX } from '../utils/pattern.utils.js';
import { getFileExtension } from '../utils/excel_methods.utils.js';
import { CONSTANTS } from '../utils/constants.utils.js';

/**
 * @constant typeValidators
 * @description An object containing validation functions for different data types.
 * Each key represents a data type, and the corresponding value is a function that checks
 * if a given value adheres to that type's criteria.
 */

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE);
export const typeValidators = {
  number: check().isNumeric().withMessage(CONSTANTS.VALIDATION.INVALID_NUMBER),
  boolean: check()
    .isBoolean()
    .withMessage(CONSTANTS.VALIDATION.INVALID_BOOLEAN),
  string: check().isString().withMessage(CONSTANTS.VALIDATION.INVALID_STRING),
  email: check()
    .matches(EMAIL_REGEX)
    .withMessage(CONSTANTS.VALIDATION.INVALID_EMAIL),
  phone: check()
    .matches(PHONE_REGEX)
    .withMessage(CONSTANTS.VALIDATION.INVALID_PHONE_NUMBER),
  url: check().matches(URL_REGEX).withMessage(CONSTANTS.VALIDATION.INVALID_URL),
};

/**
 * @constant fileSchema
 * @description A schema for validating the file uploaded by the user.
 */
export const importExcelFileSchema = [
  check(CONSTANTS.STORAGE.FILE).custom((_, { req }) => {
    if (!req.file) {
      throw new Error(CONSTANTS.STORAGE.NO_FILE_UPLOADED);
    }
    if (
      !EXCEL_FILE_EXTENSIONS.includes(getFileExtension(req.file.originalname))
    ) {
      throw new Error(CONSTANTS.STORAGE.INVALID_FILE_TYPE);
    }
    if (req.file.size > FILE_CONSTANTS.MAX_SIZE) {
      throw new Error(CONSTANTS.STORAGE.FILE_SIZE_EXCEEDED);
    }
    return true;
  }),
];

/**
 * @constant exportExcelFileSchema
 * @description A schema for validating the file exported by the user.
 */
export const exportExcelFileSchema = [
  check(REQUEST_BODY.NAME)
    .isString()
    .withMessage(CONSTANTS.VALIDATION.INVALID_STRING),
  check(REQUEST_BODY.TYPE)
    .isIn(EXCEL_FILE_EXTENSIONS)
    .withMessage(CONSTANTS.STORAGE.INVALID_FILE_TYPE),
];
