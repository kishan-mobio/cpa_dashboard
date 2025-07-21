import { check } from 'express-validator';
import { CONSTANTS } from '../utils/constants.utils.js';
import { REQUEST_BODY } from '../utils/global.constants.js';

/**
 * @constant generatePDFSchema
 * @description A schema for validating the PDF generation request
 */
export const generatePDFSchema = [
  check(REQUEST_BODY.HEADER)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED),
  check(REQUEST_BODY.BODY)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED),
  check(REQUEST_BODY.FILENAME)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED),
];
