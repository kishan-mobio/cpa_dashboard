import { body } from 'express-validator';
import { CONSTANTS } from '../utils/constants.utils.js';
import { PASSWORD_REGEX } from '../utils/pattern.utils.js';
import {
  PASSWORD,
  PHONE_NUMBER,
  REQUEST_BODY,
} from '../utils/global.constants.js';

// Common validation rules
const commonValidations = {
  email: body(REQUEST_BODY.EMAIL)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED)
    .isEmail()
    .withMessage(CONSTANTS.VALIDATION.INVALID_EMAIL),

  password: body(REQUEST_BODY.PASSWORD)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED),
};

/**
 * Validation schema for creating a user
 */
export const signUpSchema = [
  body(REQUEST_BODY.FIRST_NAME)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIRST_NAME_REQUIRED),
  body(REQUEST_BODY.LAST_NAME)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.LAST_NAME_REQUIRED),
  commonValidations.email,
  body(REQUEST_BODY.PHONE_NUMBER)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED)
    .isMobilePhone()
    .withMessage(CONSTANTS.VALIDATION.INVALID_PHONE_NUMBER)
    .isLength({ min: PHONE_NUMBER.MIN_LENGTH })
    .withMessage(CONSTANTS.VALIDATION.PHONE_NUMBER_MIN_LENGTH),
  commonValidations.password
    .isLength({ min: PASSWORD.MIN_LENGTH, max: PASSWORD.MAX_LENGTH })
    .withMessage(CONSTANTS.VALIDATION.INVALID_PASSWORD_LENGTH)
    .matches(PASSWORD_REGEX)
    .withMessage(CONSTANTS.VALIDATION.INVALID_PASSWORD_FORMAT),
];

/**
 * Validation schema for logging in a user
 */
export const loginSchema = [
  commonValidations.email,
  commonValidations.password,
];

export const resetPasswordSchema = [
  body(REQUEST_BODY.TOKEN)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED),
  body(REQUEST_BODY.NEW_PASSWORD)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED),
  body(REQUEST_BODY.CONFIRM_PASSWORD)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED),
];

export const forgotPasswordSchema = [
  body(REQUEST_BODY.EMAIL)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED)
    .isEmail()
    .withMessage(CONSTANTS.VALIDATION.INVALID_EMAIL),
  body(REQUEST_BODY.URL)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED)
    .isURL()
    .withMessage(CONSTANTS.VALIDATION.INVALID_URL),
];
