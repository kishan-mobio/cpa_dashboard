import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import { db } from '../utils/db1.utils.js';

/**
 * Get all users from the database
 */
export const getAllUsers = async () => {
  try {
    logger.info(LOG_MESSAGES.USER.FETCHING_ALL);
    return await db.getAll('users');
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.FETCHING_ALL, error);
    throw new Error(error.message);
  }
};

/**
 * Get a user by ID
 */
export const getUserById = async (id) => {
  try {
    logger.info(`${LOG_MESSAGES.USER.FETCHING_BY_ID}: ${id}`);
    return await db.getById('users', id);
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.FETCHING_BY_ID, error);
    throw new Error(error.message);
  }
};

/**
 * Update a user by ID
 */
export const updateUser = async (id, userData) => {
  try {
    logger.info(`${LOG_MESSAGES.USER.UPDATING}: ${id}`);
    return await db.updateById('users', id, userData);
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.UPDATING, error);
    throw new Error(error.message);
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (id) => {
  try {
    logger.info(`${LOG_MESSAGES.USER.DELETING}: ${id}`);
    return await db.deleteById('users', id);
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.DELETING, error);
    throw new Error(error.message);
  }
};

/**
 * Find a user by any condition (e.g. email)
 */
export const findUser = async (query) => {
  try {
    logger.info(LOG_MESSAGES.USER.FETCHING_BY_EMAIL);

    const key = Object.keys(query)[0];
    const value = query[key];
    const result = await db.query(`SELECT * FROM users WHERE ${key} = $1 LIMIT 1`, [value]);

    return result[0] || null;
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.FETCHING_BY_EMAIL, error);
    throw new Error(error.message);
  }
};

/**
 * Create a new user
 */
export const createUser = async (userData) => {
  try {
    const user = await db.insert('users', userData);
    logger.info(`${LOG_MESSAGES.USER.CREATED_SUCCESSFULLY}: ${user.id}`);
    return user;
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.CREATING, error);
    throw new Error(error.message);
  }
};

