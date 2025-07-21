import { pool } from '../config/db.config.js';
import logger from '../config/logger.config.js';
import { CONSTANTS } from './constants.utils.js';
import { LOG_MESSAGES } from './log_messages.utils.js';
import { QUERY } from './query.constants.js';

/**
 * Check if tables exist and create them if they don't
 */
export const checkAndCreateTables = async () => {
  try {
    // Check if roles table exists
    const rolesTableExists = await checkTableExists(CONSTANTS.ROLE.FIELD_NAME);
    if (!rolesTableExists) {
      await createRolesTable();
      logger.info(LOG_MESSAGES.DB.ROLES_TABLE_CREATED);
    }

    // Check if users table exists
    const usersTableExists = await checkTableExists(CONSTANTS.ROLE.USERS);
    if (!usersTableExists) {
      await createUsersTable();
      logger.info(LOG_MESSAGES.DB.USERS_TABLE_CREATED);
    }
  } catch (error) {
    logger.error(CONSTANTS.DB.ERROR_CONNECTING, error);
  }
};

/**
 * Check if a table exists in the database
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} - Whether the table exists
 */
const checkTableExists = async (tableName) => {
  const query = QUERY.TABLE_EXIST;
  
  const result = await pool.query(query, [tableName]);
  return result.rows[0].exists;
};

/**
 * Create the roles table
 */
const createRolesTable = async () => {
  const query = QUERY.CREATE_ROLES_TABLE;
  
  await pool.query(query);
};

/**
 * Create the users table
 */
const createUsersTable = async () => {
  const query = QUERY.CREATE_USERS_TABLE;
  
  await pool.query(query);
};

/**
 * Execute a query on the database
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
export const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    logger.error(LOG_MESSAGES.DB.QUERY_ERROR, error);
    throw error;
  }
};

// Close the pool when the application is shutting down
process.on('SIGINT', async () => {
  await pool.end();
  logger.info(LOG_MESSAGES.DB.CONNECTION_POOL_CLOSED);
  process.exit(0);
});