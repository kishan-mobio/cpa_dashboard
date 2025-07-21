import { validationResult } from 'express-validator';
import * as status from '../utils/status_code.utils.js';

/**
 * Middleware to validate requests using express-validator
 * @param {Array} validations - Array of validation chains
 * @returns {Function} - Middleware function to validate requests and handle errors
 * @module validate
 * @exports validate
 * @author neelmehta
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(status.STATUS_CODE_BAD_REQUEST).json({
      status: false,
      errors: errors.array(),
    });
  };
};
