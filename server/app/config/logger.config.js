import winston, { format } from 'winston';
import 'winston-daily-rotate-file';
import { CONSTANTS } from '../utils/constants.utils.js';

const logDirectory = './logs';

const createDailyRotateFileTransport = (type, level = 'info') => {
  return new winston.transports.DailyRotateFile({
    filename: `${logDirectory}/${type}-%DATE%.log`,
    datePattern: CONSTANTS.DATE.FORMAT,
    level: level,
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  });
};

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: CONSTANTS.DATE.LOG_FORMAT,
    }),
    format.json()
  ),
  transports: [
    createDailyRotateFileTransport('applications'),
    createDailyRotateFileTransport('error', 'error'),
    new winston.transports.Console(),
  ],
});

export default logger;
