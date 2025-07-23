import 'dotenv/config';
import logger from './logger.config.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import sequelizeConfig from './sequelizeconnection.config.js';

/**
 * Connect to PostgreSQL database
 */
export const connectDB = async () => {
  try {
    await sequelizeConfig.authenticate();
    logger.info(CONSTANTS.DB.CONNECTED);
    await sequelizeConfig.sync(); // Ensure all models/tables are created
    logger.info(CONSTANTS.DB.TABLE_SYNC);
  } catch (error) {
    logger.error(CONSTANTS.DB.ERROR_CONNECTING, error);
  }
};
