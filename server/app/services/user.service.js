import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import User from '../models/user.model.js';

/**
 * Get all users from the database
 */
export const getAllUsers = async () => {
  try {
    logger.info(LOG_MESSAGES.USER.FETCHING_ALL);
    return await User.findAll();
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
    return await User.findByPk(id);
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
    await User.update(userData, { where: { id } });
    return await User.findByPk(id);
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
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.destroy();
    return user;
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
    const user = await User.findOne({ where: { [key]: value } });
    return user || null;
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
    const user = await User.create(userData);
    logger.info(`${LOG_MESSAGES.USER.CREATED_SUCCESSFULLY}: ${user.id}`);
    return user;
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.CREATING, error);
    throw new Error(error.message);
  }
};

