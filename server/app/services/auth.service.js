import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js'; // Corrected path for LOG_MESSAGES
import { CONSTANTS } from '../utils/constants.utils.js';
import { db } from '../utils/db1.utils.js';
import { pool } from '../config/db.config.js';
import { QUERY } from '../utils/query.constants.js';

dotenv.config();

const handleError = (logMessage, error) => {
  logger.error(logMessage, error);
  throw new Error(error.message || CONSTANTS.USER.INTERNAL_SERVER_ERROR);
};

export const createUser = async (userData) => {
  const { name, email, password, phone_number, role_id } = userData;
  const values = [name, email, password, phone_number, role_id];

  try {
    const result = await pool.query(QUERY.INSERT_USER, values);
    const user = result.rows[0];
    logger.info(`${LOG_MESSAGES.USER.CREATED_SUCCESSFULLY}: ${user.id}`);
    return user;
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.CREATING, error);
    throw new Error(error.message);
  }
};

export const checkUserExists = async (email) => {
  try {
    const result = await db.query(QUERY.GET_USER_BY_EMAIL, [email]);
    return result[0] || null;
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.FETCHING_BY_EMAIL, error);
    throw new Error(error.message);
  }
};

export const addLastLogin = async (userId) => {
  try {
    const values = [userId];
    const rows = await db.query(QUERY.UPDATE_USER_LAST_LOGIN, values);
    return rows[0];
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.UPDATING_LAST_LOGIN, error);
    throw new Error(error.message);
  }
};

export const updateUserPassword = async (userId, newPassword) => {
  try {
    const values = [newPassword, userId];
    const rows = await db.query(QUERY.UPDATE_USER_PASSWORD, values);
    return rows[0];
  } catch (error) {
    logger.error(
      LOG_MESSAGES.USER.PASSWORD_RESET.ERROR_UPDATING_PASSWORD,
      error
    );
    throw new Error(error.message);
  }
};

export const findRolesByNames = async (roleName) => {
  try {
    const result = await db.query(QUERY.FIND_ROLES_BY_NAMES, [roleName]);
    return result;
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR_FETCHING_ROLE_BY_NAME, error);
    throw new Error(error.message);
  }
};

export const updateUserPasswordAndToken = async (
  userId,
  resetPasswordToken,
  resetPasswordExpires
) => {
  try {
    const values = [
      resetPasswordToken,
      new Date(Number(resetPasswordExpires)),
      userId,
    ];
    const rows = await db.query(QUERY.UPDATE_USER_TOKEN, values);
    return rows[0];
  } catch (error) {
    logger.error(LOG_MESSAGES.TOKEN.ERROR_UPDATING_PASSWORD, error);
    throw new Error(error.message);
  }
};

export const getUserByResetPasswordToken = async (resetPasswordToken) => {
  try {
    const values = [resetPasswordToken];
    const result = await db.query(
      QUERY.GET_USER_BY_RESET_PASSWORD_TOKEN,
      values
    );
    return result[0] || null;
  } catch (error) {
    handleError(
      LOG_MESSAGES.USER.ERROR_FETCHING_BY_RESET_PASSWORD_TOKEN,
      error
    );
    throw new Error(error.message);
  }
};

// Password & Token

export const validatePassword = async (enteredPassword, storedPassword) => {
  try {
    return await bcrypt.compare(enteredPassword, storedPassword);
  } catch (error) {
    handleError(LOG_MESSAGES.USER.ERROR_VALIDATING_PASSWORD, error);
  }
};

export const generateResetPasswordToken = (userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: CONSTANTS.PASSWORD_RESET.TOKEN_EXPIRY,
    });

    logger.info(LOG_MESSAGES.TOKEN.RESET_PASSWORD_TOKEN_CREATED(userId));
    return token;
  } catch (error) {
    handleError(LOG_MESSAGES.USER.ERROR_GENERATING_RESET_PASSWORD_TOKEN, error);
  }
};

export const verifyResetPasswordToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(
      LOG_MESSAGES.TOKEN.RESET_PASSWORD_TOKEN_VERIFIED(decoded.userId)
    );
    return decoded;
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR_VERIFYING_RESET_PASSWORD_TOKEN, error);
    if (error.name === CONSTANTS.TokenExpiredError) {
      throw new Error(CONSTANTS.RESET_PASSWORD_TOKEN_EXPIRED);
    }
    throw new Error(CONSTANTS.INVALID_RESET_TOKEN);
  }
};

export const checkRoleExistsById = async (roleId) => {
  try {
    return await db.getById(CONSTANTS.ROLE.FIELD_NAME, roleId);
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR_FETCHING_ROLE_BY_ID, error);
    throw new Error(error.message);
  }
};


export const findRoleByName = async (roleName) => {
  try {
    const result = await db.query(QUERY.FIND_ROLE_BY_NAME, [roleName]);
    return result[0] || null;
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR_FETCHING_ROLE_BY_NAME, error);
    throw new Error(error.message);
  }
};
