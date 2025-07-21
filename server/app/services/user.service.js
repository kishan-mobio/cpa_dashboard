import User from '../models/user.model.js';
import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import { SSO } from '../utils/global.constants.js';
import { performDbOperation, DB_OPERATIONS } from '../utils/db.utils.js';

/**
 * Get all users from the database
 * @returns {Promise<Array>} Array of user documents
 */
export const getAllUsers = async () => {
  try {
    logger.info(LOG_MESSAGES.USER.FETCHING_ALL);
    return await performDbOperation(User, DB_OPERATIONS.FIND, {});
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.FETCHING_ALL, error);
    throw new Error(error.message);
  }
};

/**
 * Get a user by ID from the database
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} User document or null if not found
 */
export const getUserById = async (id) => {
  try {
    logger.info(`${LOG_MESSAGES.USER.FETCHING_BY_ID}: ${id}`);
    return await performDbOperation(User, DB_OPERATIONS.FIND_BY_ID, id);
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.FETCHING_BY_ID, error);
    throw new Error(error.message);
  }
};

/**
 * Update a user in the database by ID
 * @param {string} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object|null>} Updated user document or null if user not found
 */
export const updateUser = async (id, userData) => {
  try {
    logger.info(`${LOG_MESSAGES.USER.UPDATING}: ${id}`);
    return await performDbOperation(
      User,
      DB_OPERATIONS.FIND_BY_ID_AND_UPDATE,
      id,
      userData
    );
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.UPDATING, error);
    throw new Error(error.message);
  }
};

/**
 * Delete a user from the database by ID
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} Deleted user document or null if user not found
 */
export const deleteUser = async (id) => {
  try {
    logger.info(`${LOG_MESSAGES.USER.DELETING}: ${id}`);
    return await performDbOperation(
      User,
      DB_OPERATIONS.FIND_BY_ID_AND_DELETE,
      id
    );
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.DELETING, error);
    throw new Error(error.message);
  }
};

/**
 * Find a user by a given query
 * @param {Object} query - MongoDB query object
 * @returns {Promise<Object|null>} Found user or null
 */
export const findUser = async (query) => {
  try {
    logger.info(LOG_MESSAGES.USER.FETCHING_BY_EMAIL);
    return await performDbOperation(User, DB_OPERATIONS.FIND_ONE, query);
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.FETCHING_BY_EMAIL, error);
    throw new Error(error.message);
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user document
 */
export const createUser = async (userData) => {
  try {
    const user = await performDbOperation(User, DB_OPERATIONS.CREATE, userData);
    logger.info(`${LOG_MESSAGES.USER.CREATED_SUCCESSFULLY}: ${user._id}`);
    return user;
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.CREATING, error);
    throw new Error(error.message);
  }
};

/**
 * Create or find SSO user using reusable service methods
 * @param {Object} profile - SSO profile data
 * @param {string} provider - SSO provider (AUTH0 or AZURE_AD)
 * @returns {Promise<Object>} User document
 */
export const createOrFindSSOUser = async (profile, provider) => {
  try {
    logger.info(LOG_MESSAGES.SSO.CHECKING_USER);

    const { emails = [], name, id, oid } = profile || {};
    const email = emails[0]?.value;

    if (!email) throw new Error(CONSTANTS.ERRORS.SSO_PROFILE_INVALID);

    const existingUser = await findUser({ email });
    if (existingUser) return existingUser;

    const newUser = {
      email,
      firstName: name?.givenName,
      lastName: name?.familyName,
      ssoProvider: provider,
      ssoId: provider === SSO.PROVIDERS.AUTH0 ? id : oid,
      role: CONSTANTS.SSO.CONFIG.DEFAULT_ROLE,
    };

    return await createUser(newUser);
  } catch (error) {
    logger.error(LOG_MESSAGES.SSO.ERROR_CREATING_SSO_USER, error);
    throw new Error(error.message);
  }
};
