import bcrypt from 'bcryptjs';
import logger from '../config/logger.config.js';
import * as authService from '../services/auth.service.js';
import * as userService from '../services/user.service.js';
import * as emailService from '../utils/email.utils.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import * as status from '../utils/status_code.utils.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import { errorResponse, successResponse } from '../utils/response.util.js';
import { createTokens } from '../middleware/auth.middleware.js';
import { verifyToken } from '../utils/jwt.utils.js';
import { checkValidation, handleError } from '../utils/validation.utils.js';
import { setSecureCookie, clearCookie } from '../utils/cookie.utils.js';
import { TOKEN_TYPES } from '../utils/global.constants.js';

// Check if user exists by email or phone
const getUserIfExists = async (email, phone) =>
  await authService.checkUserExists(email, phone);

/**
 * @param {*} req
 * @param {*} res
 * @returns {JSON}
 * @description Register a new user
 * @route /api/auth/signup
 * @method POST
 */
export const signUp = async (req, res) => {
  if (checkValidation(req, res)) return;

  try {
    logger.info(LOG_MESSAGES.AUTH.SIGNING_UP);

    const { role, ...userData } = req.body;

    userData.roleId = role;

    const roleDoc = await authService.checkRoleExistsById(role);

    if (!roleDoc) {
      logger.warn(LOG_MESSAGES.ROLE.INVALID_ROLE);
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.ROLE.INVALID_PROVIDED));
    }

    if (await getUserIfExists(userData.email, userData.phoneNumber)) {
      logger.warn(LOG_MESSAGES.USER.EXISTS_EMAIL);
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.USER.ALREADY_EXISTS_ERROR));
    }

    userData.password = await bcrypt.hash(userData.password, 8);
    const newUser = await authService.createUser(userData);

    await emailService.sendWelcomeEmail(userData.email, userData.firstName);

    res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.AUTH.SIGNUP_SUCCESSFULLY, { newUser }));
  } catch (error) {
    const { status: errorStatus, response } = handleError(
      error,
      LOG_MESSAGES.AUTH.ERROR_SIGN_UP
    );

    res.status(errorStatus).json(response);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns {JSON}
 * @description Login a user
 * @route /api/auth/login
 * @method POST
 */
export const login = async (req, res) => {
  if (checkValidation(req, res)) return;

  const { email, password } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get('User-Agent') || 'unknown';

  try {
    logger.info(LOG_MESSAGES.AUTH.LOGGING_IN);

    const user = await authService.checkUserExists(email);
    if (!user) {
      await authService.logLoginActivity({
        userId: null,
        ipAddress,
        userAgent,
        successful: false,
      });
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.USER.DOES_NOT_EXIST));
    }

    if (!(await authService.validatePassword(password, user.password))) {
      await authService.logLoginActivity({
        userId: user._id,
        ipAddress,
        userAgent,
        successful: false,
      });
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.AUTH.PASSWORD_INCORRECT));
    }

    const { accessToken, refreshToken } = createTokens(user);
    setSecureCookie(res, TOKEN_TYPES.ACCESS.KEY, accessToken);
    setSecureCookie(res, TOKEN_TYPES.REFRESH.KEY, refreshToken);

    await authService.logLoginActivity({
      userId: user._id,
      ipAddress,
      userAgent,
      successful: true,
    });

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.AUTH.LOGIN_SUCCESSFULLY, { user }));
  } catch (error) {
    logger.error(LOG_MESSAGES.AUTH.ERROR_LOG_IN, error);

    await authService.logLoginActivity({
      userId: null,
      ipAddress,
      userAgent,
      successful: false,
    });
    res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(CONSTANTS.USER.INTERNAL_SERVER_ERROR));
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns {JSON}
 * @description Request password reset
 * @route /api/auth/forgot-password
 * @method POST
 */
export const forgotPassword = async (req, res) => {
  if (checkValidation(req, res)) return;

  try {
    logger.info(LOG_MESSAGES.PASSWORD_RESET.EMAIL_SENT);
    const { email, url } = req.body;

    const user = await authService.checkUserExists(email);
    if (!user)
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.USER.DOES_NOT_EXIST));

    const token = authService.generateResetPasswordToken(user._id);

    await authService.updateUserPasswordAndToken(
      user._id,
      null,
      token,
      Date.now() + 3600000
    );

    await emailService.sendForgotPasswordEmail(email, url, token);

    res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.PASSWORD_RESET.EMAIL_SENT));
  } catch (error) {
    const { status: errorStatus, response } = handleError(
      error,
      LOG_MESSAGES.PASSWORD_RESET.ERROR_EMAIL_SENT
    );
    res.status(errorStatus).json(response);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns {JSON}
 * @description Reset user password
 * @route /api/auth/reset-password
 * @method POST
 */
export const resetPassword = async (req, res) => {
  if (checkValidation(req, res)) return;

  try {
    logger.info(LOG_MESSAGES.PASSWORD_RESET.RESET_SUCCESS);
    const { token, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword)
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.PASSWORD_RESET.CONFIRM_MISMATCH));

    await authService.verifyResetPasswordToken(token);

    const user = await authService.getUserByResetPasswordToken(token);

    if (!user || user.resetPasswordExpires < Date.now())
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.PASSWORD_RESET.INVALID_TOKEN));

    const hashedPassword = await bcrypt.hash(newPassword, 8);

    await authService.updateUserPassword(user._id, hashedPassword);

    res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.PASSWORD_RESET.SUCCESS));
  } catch (error) {
    const { status: errorStatus, response } = handleError(
      error,
      LOG_MESSAGES.PASSWORD_RESET.ERROR_RESET_FAILED
    );
    res.status(errorStatus).json(response);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns {JSON}
 * @description Logout user
 * @route /api/auth/logout
 * @method POST
 */
export const logout = async (req, res) => {
  try {
    clearCookie(res, TOKEN_TYPES.ACCESS.KEY);
    clearCookie(res, TOKEN_TYPES.REFRESH.KEY);

    res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.AUTH.LOGOUT_SUCCESS));
  } catch (error) {
    const { status: errorStatus, response } = handleError(
      error,
      LOG_MESSAGES.AUTH.ERROR_LOGGING_OUT
    );
    res.status(errorStatus).json(response);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns {JSON}
 * @description Refresh access and refresh tokens
 * @route /api/auth/refresh-token
 * @method POST
 */
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    logger.info(LOG_MESSAGES.AUTH.REFRESHING_TOKEN);
    if (!token)
      return res
        .status(status.STATUS_CODE_UNAUTHORIZED)
        .json(errorResponse(CONSTANTS.REFRESH_TOKEN.REQUIRED));

    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);
    const user = await userService.getUserById(decoded.id);
    if (!user)
      return res
        .status(status.STATUS_CODE_UNAUTHORIZED)
        .json(errorResponse(CONSTANTS.USER.NOT_FOUND));

    const { accessToken, refreshToken: newToken } = createTokens(user);
    setSecureCookie(res, TOKEN_TYPES.ACCESS.KEY, accessToken);
    setSecureCookie(res, TOKEN_TYPES.REFRESH.KEY, newToken);

    res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.REFRESH_TOKEN.SUCCESS));
  } catch (error) {
    if (error.name === CONSTANTS.ERRORS.TOKEN_EXPIRED) {
      return res
        .status(status.STATUS_CODE_UNAUTHORIZED)
        .json(errorResponse(CONSTANTS.REFRESH_TOKEN.EXPIRED));
    }
    const { status: errorStatus, response } = handleError(
      error,
      LOG_MESSAGES.AUTH.REFRESH_ERROR
    );
    res.status(errorStatus).json(response);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns {JSON}
 * @description Get user profile
 * @route /api/auth/profile
 * @method GET
 */
export const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) {
      return res
        .status(status.STATUS_CODE_NOT_FOUND)
        .json(errorResponse(CONSTANTS.USER.NOT_FOUND));
    }
    res
      .status(status.STATUS_CODE_SUCCESS)
      .json(
        successResponse(CONSTANTS.USER.USER_INFO_RETRIEVED_SUCCESSFULLY, user)
      );
  } catch (error) {
    logger.error('Error getting user profile:', error);
    res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(CONSTANTS.USER.INTERNAL_SERVER_ERROR, error.message));
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns {JSON}
 * @description Update user profile
 * @route /api/auth/update-profile/:id
 * @method PUT
 */
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    const updatedUser = await userService.updateUser(id, userData);

    if (!updatedUser) {
      return res
        .status(status.STATUS_CODE_NOT_FOUND)
        .json(errorResponse(CONSTANTS.USER.NOT_FOUND));
    }

    res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.USER.UPDATED_SUCCESSFULLY, updatedUser));
  } catch (error) {
    const { status: errorStatus, response } = handleError(
      error,
      LOG_MESSAGES.USER.ERROR_UPDATING
    );
    res.status(errorStatus).json(response);
  }
};
