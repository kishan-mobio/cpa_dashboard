import { createLogger } from './logger.utils.js';
import { jwtConfig } from '../config/security.config.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from './jwt.utils.js';
import { securityAudit } from './security_audit.utils.js';
import { LOG_MESSAGES } from './log_messages.utils.js';
import { TOKEN } from './global.constants.js';
import { CONSTANTS } from './constants.utils.js';

const logger = createLogger(TOKEN.SERVICE_NAME);

const refreshTokens = async (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken, jwtConfig.refreshToken.secret);

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    securityAudit.logSecurityEvent({
      type: TOKEN.AUDIT_TYPE,
      userId: decoded.id,
      ip: decoded.ip,
      details: {
        refreshTokenExpiry: decoded.exp,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    logger.error(LOG_MESSAGES.TOKEN.REFRESH_ERROR, error);
    throw new Error(CONSTANTS.TOKEN.INVALID);
  }
};

const isTokenExpired = (token) => {
  try {
    const decoded = verifyToken(token, jwtConfig.accessToken.secret);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    logger.error(LOG_MESSAGES.TOKEN.EXPIRY_CHECK_ERROR, error);
    return true;
  }
};

const getTokenExpiry = (token) => {
  try {
    const decoded = verifyToken(token, jwtConfig.accessToken.secret);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    logger.error(LOG_MESSAGES.TOKEN.GET_EXPIRY_ERROR, error);
    return null;
  }
};

const isValidTokenFormat = (token) => {
  return TOKEN.REGEX.test(token);
};

const getTokenPayload = (token) => {
  try {
    return verifyToken(token, jwtConfig.accessToken.secret);
  } catch (error) {
    logger.error(LOG_MESSAGES.TOKEN.GET_PAYLOAD_ERROR, error);
    return null;
  }
};

export const tokenRefresh = {
  refreshTokens,
  isTokenExpired,
  getTokenExpiry,
  isValidTokenFormat,
  getTokenPayload,
};
