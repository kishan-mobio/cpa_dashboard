import jwt from 'jsonwebtoken';
import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from './log_messages.utils.js';

/**
 * Generate access token
 * @param {Object} payload - Token payload
 * @returns {string} Access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY,
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY,
  });
};

/**
 * Verify token
 * @param {string} token - Token to verify
 * @param {string} secret - Secret to use for verification
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error(LOG_MESSAGES.TOKEN.VERIFICATION_FAILED(error.message));
    throw error;
  }
};
