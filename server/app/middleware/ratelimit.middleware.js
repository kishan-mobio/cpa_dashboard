import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '../utils/constants.utils.js'; // Corrected import for CONSTANTS

const windowMinutes = process.env.RATE_LIMIT_WINDOW_MINUTES || 15; // Default to 15 minutes if not set
const maxRequests =
  process.env.RATE_LIMIT_MAX_REQUESTS || CONSTANTS.RATE_LIMIT.MAX_REQUESTS;

/**
 * Rate limiter middleware with customizable options
 * @returns {Function} - Express middleware function for rate limiting
 */
const rateLimiter = () =>
  rateLimit({
    windowMs: windowMinutes * CONSTANTS.TIME_CONSTANTS.MILLISECONDS_MULTIPLIER,
    max: maxRequests,
    message: { error: CONSTANTS.RATE_LIMIT.MESSAGE },
    headers: true,
    standardHeaders: true,
    legacyHeaders: false,
  });

export default rateLimiter;
