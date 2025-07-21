import winston from 'winston';

/**
 * Create a logger instance with the specified context
 * @param {string} context - The context/name of the logger
 * @returns {winston.Logger} Winston logger instance
 */
export const createLogger = (context) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { context },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ],
  });
};

// Export a default logger instance
export default createLogger('app');
