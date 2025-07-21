import jwt from 'jsonwebtoken';
import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import * as status from '../utils/status_code.utils.js';
import { errorResponse } from '../utils/response.util.js';
import { SSO } from '../utils/global.constants.js';
import { getActiveSSOProvider } from '../controllers/sso.controller.js';

const { JWT_ACCESS_SECRET, AZURE_CLIENT_SECRET } = process.env;

/**
 * Get token secret based on current SSO provider
 */
const getTokenSecret = () =>
  getActiveSSOProvider() === SSO.PROVIDERS.AUTH0
    ? JWT_ACCESS_SECRET
    : AZURE_CLIENT_SECRET;

/**
 * Extract token from headers or cookies
 */
const extractToken = (req) =>
  req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getTokenSecret());
  } catch (error) {
    logger.error(LOG_MESSAGES.TOKEN.VERIFICATION_FAILED(error.message), error);
    return null;
  }
};

/**
 * Check token expiration
 */
export const checkTokenExpiration = (token) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return false;

    return (
      Date.now() <
      decoded.exp * CONSTANTS.TIME_CONSTANTS.MILLISECONDS_MULTIPLIER
    );
  } catch (error) {
    logger.error(LOG_MESSAGES.TOKEN.EXPIRATION_CHECK, error);
    return false;
  }
};

/**
 * SSO Authentication Middleware
 */
export const authenticateSSO = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      logger.warn(LOG_MESSAGES.TOKEN.MISSING_AUTH_HEADER);

      return res
        .status(status.STATUS_CODE_UNAUTHORIZED)
        .json(errorResponse(CONSTANTS.TOKEN.REQUIRED));
    }

    if (!checkTokenExpiration(token)) {
      logger.warn(LOG_MESSAGES.TOKEN.EXPIRED);
      return res
        .status(status.STATUS_CODE_UNAUTHORIZED)
        .json(errorResponse(CONSTANTS.TOKEN.EXPIRED));
    }

    req.user = verifyToken(token);

    if (!req.user) {
      logger.warn(LOG_MESSAGES.TOKEN.INVALID);
      return res
        .status(status.STATUS_CODE_UNAUTHORIZED)
        .json(errorResponse(CONSTANTS.TOKEN.INVALID));
    }

    next();
  } catch (error) {
    logger.error(LOG_MESSAGES.GENERAL.AUTHENTICATION_ERROR, error);

    return res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(CONSTANTS.USER.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Role-based Authorization Middleware
 */
export const authorizeRole = (roles) => (req, res, next) => {
  try {
    if (!req.user) {
      logger.warn(LOG_MESSAGES.GENERAL.UNAUTHORIZED_ACCESS);

      return res
        .status(status.STATUS_CODE_UNAUTHORIZED)
        .json(errorResponse(CONSTANTS.AUTH.ACCESS_DENIED));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(LOG_MESSAGES.GENERAL.AUTHORIZATION_ERROR);

      return res
        .status(status.STATUS_CODE_FORBIDDEN)
        .json(errorResponse(CONSTANTS.AUTH.ACCESS_DENIED));
    }

    next();
  } catch (error) {
    logger.error(LOG_MESSAGES.GENERAL.AUTHORIZATION_ERROR, error);

    return res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(CONSTANTS.USER.INTERNAL_SERVER_ERROR));
  }
};
