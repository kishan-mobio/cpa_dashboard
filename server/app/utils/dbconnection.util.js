import { pool } from '../config/db.config.js';
import logger from '../config/logger.config.js';

/**
 * Check if tables exist and create them if they don't
 */
export const checkAndCreateTables = async () => {
  try {
    // Check if roles table exists
    const rolesTableExists = await checkTableExists('roles');
    if (!rolesTableExists) {
      await createRolesTable();
      logger.info('Roles table created successfully');
    }

    // Check if users table exists
    const usersTableExists = await checkTableExists('users');
    if (!usersTableExists) {
      await createUsersTable();
      logger.info('Users table created successfully');
    }
  } catch (error) {
    logger.error('Error checking or creating tables:', error);
  }
};

/**
 * Check if a table exists in the database
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} - Whether the table exists
 */
const checkTableExists = async (tableName) => {
  const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `;
  
  const result = await pool.query(query, [tableName]);
  return result.rows[0].exists;
};

/**
 * Create the roles table
 */
const createRolesTable = async () => {
  const query = `
    CREATE TABLE roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Insert default roles
    INSERT INTO roles (name, description) 
    VALUES 
      ('admin', 'Administrator role with full access'),
      ('employee', 'Regular employee role');
  `;
  
  await pool.query(query);
};

/**
 * Create the users table
 */
const createUsersTable = async () => {
  const query = `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) NOT NULL UNIQUE,
      phone_number VARCHAR(20) UNIQUE,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      address VARCHAR(255) DEFAULT '',
      reset_password_token VARCHAR(255),
      reset_password_expires TIMESTAMP,
      role_id INTEGER NOT NULL REFERENCES roles(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
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
    logger.error('Database query error:', error);
    throw error;
  }
};

// Close the pool when the application is shutting down
process.on('SIGINT', async () => {
  await pool.end();
  logger.info('Database connection pool closed');
  process.exit(0);
});