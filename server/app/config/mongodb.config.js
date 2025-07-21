import mongoose from 'mongoose';
import logger from './logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';

/**
 * Function to connect to the MongoDB database
 * @module connectToMongoDB
 * @returns {Promise<void>}
 * @throws {Error} If connection fails
 * @author neelmehta
 */
const connectDB = async () => {
  try {
    // Connect to the MongoDB database using the provided URI
    const mongoURI =
      process.env.NODE_ENV === 'test'
        ? process.env.TEST_DB_URL
        : process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    logger.info(LOG_MESSAGES.CONNECTION.MONGO_SUCCESS);
  } catch (error) {
    logger.error(LOG_MESSAGES.CONNECTION.MONGO_ERROR, error);
    throw error;
  }
};

export { connectDB };
