import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../models/user.model.js';
import Role from '../models/roles.model.js';
import LoginActivity from '../models/loginActivity.model.js';

import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js'; // Corrected path for LOG_MESSAGES
import { CONSTANTS } from '../utils/constants.utils.js';
import { performDbOperation, DB_OPERATIONS } from '../utils/db.utils.js';

dotenv.config();

const handleError = (logMessage, error) => {
  logger.error(logMessage, error);
  throw new Error(error.message || CONSTANTS.USER.INTERNAL_SERVER_ERROR);
};

// User Management

export const createUser = async (userData) => {
  try {
    return await performDbOperation(User, DB_OPERATIONS.CREATE, userData);
  } catch (error) {
    handleError(LOG_MESSAGES.USER.ERROR.CREATING, error);
  }
};

export const checkUserExists = async (email, phoneNumber) => {
  try {
    return await performDbOperation(User, DB_OPERATIONS.FIND_ONE, {
      $or: [{ email }, { phoneNumber }],
    });
  } catch (error) {
    handleError(LOG_MESSAGES.USER.ERROR.FETCHING_BY_EMAIL, error);
  }
};

export const updateUserPassword = async (userId, newPassword) => {
  try {
    await performDbOperation(
      User,
      DB_OPERATIONS.FIND_BY_ID_AND_UPDATE,
      userId,
      {
        password: newPassword,
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
      }
    );
  } catch (error) {
    handleError(
      LOG_MESSAGES.USER.PASSWORD_RESET.ERROR_UPDATING_PASSWORD,
      error
    );
  }
};

export const updateUserPasswordAndToken = async (
  userId,
  hashedPassword,
  resetPasswordToken,
  resetPasswordExpires
) => {
  try {
    return await performDbOperation(
      User,
      DB_OPERATIONS.FIND_BY_ID_AND_UPDATE,
      userId,
      {
        password: hashedPassword,
        resetPasswordToken,
        resetPasswordExpires,
      }
    );
  } catch (error) {
    handleError(LOG_MESSAGES.USER.ERROR_UPDATING_PASSWORD, error);
  }
};

export const getUserByResetPasswordToken = async (resetPasswordToken) => {
  try {
    return await performDbOperation(User, DB_OPERATIONS.FIND_ONE, {
      resetPasswordToken,
    });
  } catch (error) {
    handleError(
      LOG_MESSAGES.USER.ERROR_FETCHING_BY_RESET_PASSWORD_TOKEN,
      error
    );
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

    logger.info(LOG_MESSAGES.USER.RESET_PASSWORD_TOKEN_CREATED(userId));
    return token;
  } catch (error) {
    handleError(LOG_MESSAGES.USER.ERROR_GENERATING_RESET_PASSWORD_TOKEN, error);
  }
};

export const verifyResetPasswordToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(
      LOG_MESSAGES.USER.RESET_PASSWORD_TOKEN_VERIFIED(decoded.userId)
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

// Login Activity

export const logLoginActivity = async (logData) => {
  try {
    return await performDbOperation(
      LoginActivity,
      DB_OPERATIONS.CREATE,
      logData
    );
  } catch (error) {
    handleError(LOG_MESSAGES.USER.ERROR_LOGGING_ACTIVITY, error);
  }
};

// Roles

export const checkRoleExistsById = async (roleId) => {
  try {
    return await performDbOperation(Role, DB_OPERATIONS.FIND_BY_ID, roleId);
  } catch (error) {
    handleError(LOG_MESSAGES.USER.ERROR_FETCHING_ROLE_BY_ID, error);
  }
};

export const findRoleByName = async (roleName) => {
  try {
    return await performDbOperation(Role, DB_OPERATIONS.FIND_ONE, { roleName });
  } catch (error) {
    handleError(LOG_MESSAGES.USER.ERROR_FETCHING_ROLE_BY_NAME, error);
  }
};
