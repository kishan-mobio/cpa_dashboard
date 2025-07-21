import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createLogger } from '../utils/logger.utils.js';
import {
  rateLimitConfig,
  corsConfig,
  securityHeaders,
  passwordPolicy,
  helmetConfig,
} from '../config/security.config.js';

import { securityAudit } from '../utils/security_audit.utils.js';
import { tokenRefresh } from '../utils/token_refresh.utils.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import {
  API,
  COMMON,
  COOKIE,
  ENV,
  LOG_LEVELS,
  LOGSECURITYEVENT,
  SECURITY_HEADERS,
  TOKEN_TYPES,
  TYPE,
} from '../utils/global.constants.js';
import {
  STATUS_CODE_UNAUTHORIZED,
  STATUS_CODE_BAD_REQUEST,
} from '../utils/status_code.utils.js';

const logger = createLogger('security-middleware');

// Rate limiting middleware
export const rateLimiter = rateLimit(rateLimitConfig);

// CORS middleware
export const corsMiddleware = cors(corsConfig);

// Security headers verification middleware
const verifySecurityHeaders = (req, res, next) => {
  const requiredHeaders = [
    SECURITY_HEADERS.CSP,
    SECURITY_HEADERS.HSTS,
    SECURITY_HEADERS.FRAME_OPTIONS,
    SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
    SECURITY_HEADERS.XSS_PROTECTION,
    SECURITY_HEADERS.REFERRER_POLICY,
    SECURITY_HEADERS.PERMISSIONS_POLICY,
  ];

  res.on(LOGSECURITYEVENT, () => {
    const headers = res.getHeaders();
    const missingHeaders = requiredHeaders.filter((header) => !headers[header]);

    if (missingHeaders.length > 0) {
      logger.warn(CONSTANTS.SECURITY.MESSAGES.MISSING_HEADERS, {
        path: req.path,
        missing: missingHeaders,
      });
    }

    // Log all security headers in development
    if (process.env.NODE_ENV === ENV.DEVELOPMENT) {
      logger.debug(CONSTANTS.SECURITY.MESSAGES.SECURITY_HEADERS_DEBUG, {
        path: req.path,
        headers: Object.fromEntries(
          requiredHeaders.map((header) => [header, headers[header]])
        ),
      });
    }
  });

  next();
};

// Enhanced XSS protection middleware
const xssProtectionMiddleware = (req, res, next) => {
  const sanitize = (data) => {
    if (!data) return data;
    if (typeof data === TYPE.string) {
      return data.replace(/[<>]/g, '');
    }
    if (Array.isArray(data)) {
      return data.map(sanitize);
    }
    if (typeof data === TYPE.object) {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, sanitize(value)])
      );
    }
    return data;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

// Security headers middleware
const securityHeadersMiddleware = (req, res, next) => {
  Object.entries(securityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  next();
};

// Token validation middleware
export const validateTokenMiddleware = async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  // Update in validateTokenMiddleware
  if (!token) {
    return res
      .status(STATUS_CODE_UNAUTHORIZED)
      .json({ message: CONSTANTS.SECURITY.MESSAGES.TOKEN_REQUIRED });
  }

  try {
    if (!tokenRefresh.isValidTokenFormat(token)) {
      throw new Error(CONSTANTS.SECURITY.MESSAGES.TOKEN_INVALID_FORMAT);
    }

    if (tokenRefresh.isTokenExpired(token)) {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new Error(CONSTANTS.SECURITY.MESSAGES.TOKEN_EXPIRED);
      }

      const newTokens = await tokenRefresh.refreshTokens(refreshToken);
      req.user = tokenRefresh.getTokenPayload(newTokens.accessToken);

      // Set new tokens in cookies
      res.cookie(TOKEN_TYPES.ACCESS.KEY, newTokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: COOKIE.strict,
        maxAge: COOKIE.maxAge,
      });

      res.cookie(TOKEN_TYPES.REFRESH.KEY, newTokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: COOKIE.strict,
        maxAge: COOKIE.severndaysmaxage, // 7 days
      });

      return next();
    }

    req.user = tokenRefresh.getTokenPayload(token);
    next();
  } catch (error) {
    logger.error(`${CONSTANTS.VALIDATION.TOKEN_VALIDATION_ERROR}:`, error);
    securityAudit.logSecurityEvent({
      type: COMMON.suspiciousActivity,
      userId: req.user?.id,
      ip: req.ip,
      details: {
        error: error.message,
        path: req.path,
      },
    });
    return res
      .status(STATUS_CODE_UNAUTHORIZED)
      .json({ message: CONSTANTS.SECURITY.MESSAGES.TOKEN_INVALID });
  }
};

// Input validation middleware
export const validateInputMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      securityAudit.logSecurityEvent({
        type: COMMON.validationError,
        userId: req.user?.id,
        ip: req.ip,
        details: {
          errors: error.details,
          path: req.path,
        },
      });
      return res
        .status(STATUS_CODE_BAD_REQUEST)
        .json({ message: error.details[0].message });
    }
    next();
  };
};

// Enhanced security audit middleware
export const securityAuditMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const requestId =
    Date.now().toString(36) + Math.random().toString(36).substring(2);

  // Log request
  securityAudit.logSecurityEvent({
    type: LOGSECURITYEVENT.REQUEST,
    requestId,
    userId: req.user?.id,
    ip: req.ip,
    details: {
      method: req.method,
      url: req.url,
      userAgent: req.get(LOGSECURITYEVENT.USER_AGENT),
      referer: req.get(LOGSECURITYEVENT.REFERER),
      body: req.method !== API.GET ? JSON.stringify(req.body) : undefined,
    },
  });

  // Log response
  res.on(LOGSECURITYEVENT.finish, () => {
    const duration = Date.now() - startTime;
    securityAudit.logSecurityEvent({
      type: LOGSECURITYEVENT.response,
      requestId,
      userId: req.user?.id,
      ip: req.ip,
      details: {
        status: res.statusCode,
        duration,
        contentLength: res.get(LOGSECURITYEVENT.content_length),
      },
    });
  });

  next();
};

// Password validation middleware
export const passwordValidationMiddleware = (req, res, next) => {
  if (req.body?.password) {
    const { password } = req.body;
    if (
      password.length < passwordPolicy.minLength ||
      password.length > passwordPolicy.maxLength
    ) {
      return res.status(STATUS_CODE_BAD_REQUEST).json({
        message: CONSTANTS.SECURITY.MESSAGES.PASSWORD_LENGTH(
          passwordPolicy.minLength,
          passwordPolicy.maxLength
        ),
      });
    }
  }
  next();
};

// Security headers monitoring middleware
const monitorSecurityHeaders = (req, res, next) => {
  res.on(LOGSECURITYEVENT.finish, () => {
    const headers = res.getHeaders();
    const securityHeaders = [
      SECURITY_HEADERS.CSP,
      SECURITY_HEADERS.HSTS,
      SECURITY_HEADERS.FRAME_OPTIONS,
      SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
      SECURITY_HEADERS.XSS_PROTECTION,
      SECURITY_HEADERS.REFERRER_POLICY,
      SECURITY_HEADERS.PERMISSIONS_POLICY,
      SECURITY_HEADERS.FEATURE_POLICY,
      SECURITY_HEADERS.EXPECT_CT,
    ];

    const missingHeaders = securityHeaders.filter((header) => !headers[header]);

    if (missingHeaders.length > 0) {
      logger.warn(CONSTANTS.SECURITY.MESSAGES.MISSING_HEADERS, {
        path: req.path,
        missing: missingHeaders,
        ip: req.ip,
        method: req.method,
      });

      // Log security audit
      securityAudit.logSecurityEvent({
        type: COMMON.securityHeaders,
        severity: LOG_LEVELS.WARNING,
        details: {
          missingHeaders,
          path: req.path,
          ip: req.ip,
          method: req.method,
        },
      });
    }
  });

  next();
};

// Update the combined security middleware
export const securityMiddleware = [
  // Apply Helmet with configured options
  helmet(helmetConfig),

  // Apply security headers
  securityHeadersMiddleware,

  // Monitor security headers
  monitorSecurityHeaders,

  // Apply additional security headers
  (req, res, next) => {
    Object.entries(securityHeaders).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
    next();
  },

  verifySecurityHeaders,
  xssProtectionMiddleware,
  passwordValidationMiddleware,
];
