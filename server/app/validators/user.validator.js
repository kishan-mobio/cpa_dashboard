import { body } from 'express-validator';
import { CONSTANTS } from '../utils/constants.utils.js';
import { PASSWORD_REGEX } from '../utils/pattern.utils.js';
import { REQUEST_BODY } from '../utils/global.constants.js';

// Base validation rules that are common between create and update
const baseValidationRules = {
  firstName: body(REQUEST_BODY.FIRST_NAME)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIRST_NAME_REQUIRED),

  lastName: body(REQUEST_BODY.LAST_NAME)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.LAST_NAME_REQUIRED),

  email: body(REQUEST_BODY.EMAIL)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED)
    .isEmail()
    .withMessage(CONSTANTS.VALIDATION.INVALID_EMAIL),

  phoneNumber: body(REQUEST_BODY.PHONE_NUMBER)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED)
    .isMobilePhone()
    .withMessage(CONSTANTS.VALIDATION.INVALID_PHONE_NUMBER)
    .isLength({ min: 10 })
    .withMessage(CONSTANTS.VALIDATION.PHONE_NUMBER_MIN_LENGTH),
};

/**
 * Validation schema for creating a user
 */
export const createUserSchema = [
  baseValidationRules.firstName,
  baseValidationRules.lastName,
  baseValidationRules.email,
  baseValidationRules.phoneNumber,

  // Password validation only needed for create
  body(REQUEST_BODY.PASSWORD)
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED)
    .isLength({ min: 8, max: 15 })
    .withMessage(CONSTANTS.VALIDATION.INVALID_PASSWORD_LENGTH)
    .matches(PASSWORD_REGEX)
    .withMessage(CONSTANTS.VALIDATION.INVALID_PASSWORD_FORMAT),
];

/**
 * Validation schema for updating a user
 * @author neelmehta
 */
export const updateUserSchema = [
  // Make base rules optional for updates
  baseValidationRules.firstName.optional(),
  baseValidationRules.lastName.optional(),
  baseValidationRules.email.optional(),
  baseValidationRules.phoneNumber.optional(),

  // Role validation only needed for update
  body(REQUEST_BODY.ROLE_ID)
    .optional()
    .notEmpty()
    .withMessage(CONSTANTS.VALIDATION.FIELD_REQUIRED)
    .isMongoId()
    .withMessage(CONSTANTS.USER.INVALID_ROLE_ID),
];
