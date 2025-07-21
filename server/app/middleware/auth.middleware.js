import { CONSTANTS } from '../utils/constants.utils.js';
import * as status from '../utils/status_code.utils.js';
import { errorResponse } from '../utils/response.util.js';
import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import * as authService from '../services/auth.service.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../utils/jwt.utils.js';

/**
 * Extracts JWT token from request headers or cookies
 */
const extractToken = (req) =>
  req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

/**
 * Handle token verification failure
 */
const handleTokenError = (res, error) =>
  res
    .status(status.STATUS_CODE_UNAUTHORIZED)
    .json(
      errorResponse(
        error.name === CONSTANTS.ERRORS.TOKEN_EXPIRED
          ? CONSTANTS.ERRORS.TOKEN_EXPIRED
          : CONSTANTS.PASSWORD_RESET.INVALID_TOKEN
      )
    );

/**
 * Create tokens for user
 * @param {Object} userData - User data for token payload
 * @returns {Object} Access and refresh tokens
 */
export const createTokens = ({ _id, email, roleId }) => {
  try {
    const payload = { id: _id, email, role: roleId };

    logger.info(LOG_MESSAGES.TOKEN.CREATED(_id));

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  } catch (error) {
    logger.error(LOG_MESSAGES.TOKEN.ERROR_CREATING, error);
    throw error;
  }
};

/**
 * Verify access token middleware
 */
export const verifyAccessToken = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    logger.warn(LOG_MESSAGES.TOKEN.MISSING);

    return res
      .status(status.STATUS_CODE_UNAUTHORIZED)
      .json(errorResponse(CONSTANTS.TOKEN.REQUIRED));
  }

  try {
    req.user = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    next();
  } catch (error) {
    return handleTokenError(res, error);
  }
};

/**
 * Role-based access control middleware (DB-based approach)
 */
export const checkRole = (roleNames) => async (req, res, next) => {
  try {
    const roles = await authService.findRolesByNames(roleNames);

    const validRoleIds = new Set(roles.map((role) => role._id.toString()));

    if (!validRoleIds.has(req.user.role)) {
      logger.warn(LOG_MESSAGES.ACCESS_DENIED);

      return res
        .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
        .json(errorResponse(CONSTANTS.INTERNAL_SERVER_ERROR));
    }

    next();
  } catch (error) {
    logger.error(LOG_MESSAGES.ERROR_CHECKING_ROLE, error);

    return res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(CONSTANTS.USER.INTERNAL_SERVER_ERROR));
  }
};
