import sql from 'mssql';
import logger from './logger.config.js';
import {
  mssql_connection_successfully,
  mssql_connection_unsuccessfully,
} from '../utils/log_messages.utils.js';

/**
 * Function to connect to the SQL Server database
 * @module connectToSQLServer
 * @returns {Promise<void>}
 * @throws {Error} If connection fails
 * @author neelmehta
 */
const connectDB = async () => {
  try {
    const config = {
      user: process.env.DB_SQL_USER,
      password: process.env.DB_SQL_PASSWORD,
      server: process.env.DB_SQL_HOST,
      database: process.env.DB_SQL_DATABASE,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };

    const pool = await sql.connect(config);
    global.sqlConnection = pool;
    logger.info(mssql_connection_successfully);
  } catch (error) {
    logger.error(mssql_connection_unsuccessfully, error);
    throw error;
  }
};

export { connectDB };
