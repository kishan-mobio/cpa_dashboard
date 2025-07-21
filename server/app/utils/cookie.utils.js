import { COOKIE } from '../utils/global.constants.js';

/**
 * Utility functions for cookie management
 * @module cookieUtils
 */

/**
 * Get environment-specific cookie options
 * @param {Object} options - Additional cookie options
 * @returns {Object} Cookie configuration object
 */
export const getCookieOptions = (options = {}) => ({
  httpOnly: COOKIE.HTTP_ONLY,
  secure: COOKIE.SECURE,
  sameSite: COOKIE.SAME_SITE,
  maxAge: COOKIE.MAX_AGE,
  path: COOKIE.PATH,
  domain: COOKIE.DOMAIN,
  ...options,
});

/**
 * Set a secure cookie
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Additional cookie options
 */
export const setSecureCookie = (res, name, value, options = {}) => {
  const cookieOptions = getCookieOptions(options);
  res.cookie(name, value, cookieOptions);
};

/**
 * Clear a cookie
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 */
export const clearCookie = (res, name) => {
  setSecureCookie(res, name, '', { expires: new Date(0) });
};
