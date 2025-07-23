import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js'; // Corrected path for LOG_MESSAGES
import { CONSTANTS } from '../utils/constants.utils.js';
import { Role, User } from '../models/index.js';


const handleError = (logMessage, error) => {
  logger.error(logMessage, error);
  throw new Error(error.message || CONSTANTS.USER.INTERNAL_SERVER_ERROR);
};

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

export const checkUserExists = async (email) => {
  try {
    return await User.findOne({ where: { email } });
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.FETCHING_BY_EMAIL, error);
    throw new Error(error.message);
  }
};


export const addLastLogin = async (userId) => {
  try {
    await User.update({ last_login: new Date() }, { where: { id: userId } });
    return await User.findByPk(userId);
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR.UPDATING_LAST_LOGIN, error);
    throw new Error(error.message);
  }
};

export const updateUserPassword = async (userId, newPassword) => {
  try {
    await User.update(
      {
        password: newPassword,
        reset_token: null,
        reset_token_expires: null,
      },
      { where: { id: userId } }
    );
    return await User.findByPk(userId);
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.PASSWORD_RESET.ERROR_UPDATING_PASSWORD, error);
    throw new Error(error.message);
  }
};


export const findRolesByNames = async (roleNames) => {
  try {
    return await Role.findAll({ where: { name: roleNames } });
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
    await User.update(
      {
        reset_token: resetPasswordToken,
        reset_token_expires: new Date(Number(resetPasswordExpires)),
      },
      { where: { id: userId } }
    );
    return await User.findByPk(userId);
  } catch (error) {
    logger.error(LOG_MESSAGES.TOKEN.ERROR_UPDATING_PASSWORD, error);
    throw new Error(error.message);
  }
};


export const getUserByResetPasswordToken = async (resetPasswordToken) => {
  try {
    return await User.findOne({ where: { reset_token: resetPasswordToken } });
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR_FETCHING_BY_RESET_PASSWORD_TOKEN, error);
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
    return await Role.findByPk(roleId);
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR_FETCHING_ROLE_BY_ID, error);
    throw new Error(error.message);
  }
};

export const findRoleByName = async (roleName) => {
  try {
    return await Role.findOne({ where: { name: roleName } });
  } catch (error) {
    logger.error(LOG_MESSAGES.USER.ERROR_FETCHING_ROLE_BY_NAME, error);
    throw new Error(error.message);
  }
};

