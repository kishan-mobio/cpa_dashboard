import { check } from 'express-validator';
import { TOKEN_TYPES } from '../utils/global.constants.js';
import { CONSTANTS } from '../utils/constants.utils.js';

/**
 * @constant ssoTokenRefreshSchema
 * @description A schema for validating the SSO token refresh.
 */
export const ssoTokenRefreshSchema = [
  check(TOKEN_TYPES.ACCESS.KEY)
    .isString()
    .withMessage(CONSTANTS.VALIDATION.INVALID_TOKEN),
  check(TOKEN_TYPES.REFRESH.KEY)
    .isString()
    .withMessage(CONSTANTS.VALIDATION.INVALID_TOKEN),
];
