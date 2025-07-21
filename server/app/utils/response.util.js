import { CONSTANTS } from './constants.utils.js';

// Success Response
export const successResponse = (message, data) => {
  return {
    status: true,
    message: message,
    data: data,
  };
};

// Error Response
export const errorResponse = (message, data) => {
  return {
    status: false,
    message: message || CONSTANTS.ERRORS.GENERAL,
    data: data,
  };
};
