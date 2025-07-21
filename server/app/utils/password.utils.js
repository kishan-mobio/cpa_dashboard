import bcrypt from 'bcryptjs';
import { SECURITY } from '../utils/global.constants.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import logger from '../config/logger.config.js';

export const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(
      password,
      SECURITY.PASSWORD.SALT_ROUNDS
    );
    logger.info(LOG_MESSAGES.SECURITY.PASSWORD.HASH_SUCCESS);
    return hashedPassword;
  } catch (error) {
    logger.error(LOG_MESSAGES.SECURITY.PASSWORD.HASH_ERROR, error);
    throw new Error(LOG_MESSAGES.SECURITY.PASSWORD.HASH_ERROR);
  }
};

export const validatePasswordStrength = (password, policy) => {
  if (
    password.length < policy.minLength ||
    password.length > policy.maxLength
  ) {
    return {
      isValid: false,
      message: CONSTANTS.SECURITY.MESSAGES.PASSWORD_LENGTH(
        policy.minLength,
        policy.maxLength
      ),
    };
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: CONSTANTS.SECURITY.MESSAGES.PASSWORD_UPPERCASE,
    };
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: CONSTANTS.SECURITY.MESSAGES.PASSWORD_LOWERCASE,
    };
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    return {
      isValid: false,
      message: CONSTANTS.SECURITY.MESSAGES.PASSWORD_NUMBER,
    };
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: CONSTANTS.SECURITY.MESSAGES.PASSWORD_SPECIAL,
    };
  }

  return { isValid: true };
};
