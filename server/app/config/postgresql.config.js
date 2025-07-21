import 'dotenv/config';
import logger from './logger.config.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import { checkAndCreateTables } from '../utils/dbconnection.util.js';
import { pool } from './db.config.js';


/**
 * Connect to PostgreSQL database
 */
export const connectDB = async () => {
  try {
    await pool.connect();
    logger.info(CONSTANTS.DB.CONNECTED);
    
    // Check and create tables if they don't exist
    await checkAndCreateTables();
  } catch (error) {
    logger.error(CONSTANTS.DB.ERROR_CONNECTING, error);
    process.exit(1);
  }
};

