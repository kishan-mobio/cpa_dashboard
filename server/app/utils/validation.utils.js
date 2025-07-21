import { validationResult } from 'express-validator';
import logger from '../config/logger.config.js';
import { CONSTANTS } from './constants.utils.js';
import * as status from './status_code.utils.js';
import { errorResponse } from './response.util.js';

/**
 * Validates request using express-validator
 * @param {Object} req - Express request object
 * @returns {Array|null} - Returns array of validation errors or null if valid
 */
export const validateRequest = (req) => {
  const errors = validationResult(req);

  return errors.isEmpty() ? null : errors.array();
};

/**
 * Logs and formats error response
 * @param {Error} error - Error object
 * @param {string} logMessage - Message to log
 * @returns {Object} - Object containing status code and formatted error response
 */
export const handleError = (error, logMessage = 'Unhandled error') => {
  logger.error(logMessage, error);
  const errorMessage = error.message || CONSTANTS.USER.INTERNAL_SERVER_ERROR;
  return {
    status: status.STATUS_CODE_INTERNAL_SERVER_STATUS,
    response: errorResponse(errorMessage),
  };
};

/**
 * Validates request and sends bad request response if invalid
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {boolean} - True if validation failed
 */
export const checkValidation = (req, res) => {
  const errors = validateRequest(req);

  if (errors) {
    res.status(status.STATUS_CODE_BAD_REQUEST).json(errorResponse(errors));
    return true;
  }

  return false;
};
