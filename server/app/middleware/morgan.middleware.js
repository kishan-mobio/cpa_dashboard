import morgan from 'morgan';
import logger from '../config/logger.config.js';
import { CONSTANTS } from '../utils/constants.utils.js';

/**
 * Morgan middleware to log all requests
 */
const morganMiddleware = morgan(CONSTANTS.MIDDLEWARE.COMBINED_LOG_FORMAT, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

export default morganMiddleware;
