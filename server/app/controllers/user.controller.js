import * as userService from '../services/user.service.js';
import * as authService from '../services/auth.service.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import * as status from '../utils/status_code.utils.js';
import { errorResponse, successResponse } from '../utils/response.util.js';
import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js'; // Corrected path for LOG_MESSAGES
import { validateRequest, handleError } from '../utils/validation.utils.js';
import { hashPassword } from '../utils/password.utils.js';

/**
 * @param {*} req
 * @param {*} res
 * @returns
 * @description Create a new user
 * @api /api/users
 * @method POST
 */
export const createUser = async (req, res) => {
  try {
    if (validateRequest(req)) {
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(validateRequest(req)));
    }

    logger.info(LOG_MESSAGES.USER.CREATING);

    const { role, ...userData } = req.body;

    userData.role_id = role;

    if (!(await authService.checkRoleExistsById(role))) {
      logger.warn(LOG_MESSAGES.ROLE.INVALID_ROLE);

      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.ROLE.INVALID_PROVIDED));
    }

    if (
      await authService.checkUserExists(userData.email, userData.phoneNumber)
    ) {
      logger.warn(LOG_MESSAGES.USER.ALREADY_EXISTS);

      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.USER.ALREADY_EXISTS_ERROR));
    }

    userData.password = await hashPassword(userData.password);

    // Define `newUser` by calling the user creation service
    const newUser = await userService.createUser(userData);

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.USER.CREATED_SUCCESSFULLY, { newUser }));
  } catch (error) {
    const { status: errorStatus, response } = handleError(
      error,
      LOG_MESSAGES.USER.ERROR_CREATING
    );

    return res.status(errorStatus).json(response);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns
 * @description Get all users
 * @api /api/users
 * @method GET
 */
export const getAllUsers = async (req, res) => {
  console.log('getAllUsers');
  try {
    if (validateRequest(req)) {
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(validateRequest(req)));
    }

    logger.info(LOG_MESSAGES.USER.FETCHING_ALL);

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(
        successResponse(
          CONSTANTS.USER.FETCHED_SUCCESSFULLY,
          await userService.getAllUsers()
        )
      );
  } catch (error) {
    const { status: errorStatus, response } = handleError(
      error,
      LOG_MESSAGES.USER.ERROR.FETCHING_ALL
    );

    return res.status(errorStatus).json(response);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns
 * @description Get user by ID
 * @api /api/users/:id
 * @method GET
 */
export const getUserById = async (req, res) => {
  try {
    if (validateRequest(req)) {
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(validateRequest(req)));
    }

    logger.info(LOG_MESSAGES.USER.FETCHING_BY_ID);

    const user = await userService.getUserById(req.params.id);

    if (!user) {
      logger.info(LOG_MESSAGES.USER.NOT_FOUND);

      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.USER.NOT_FOUND));
    }

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.USER.USER_FETCHED_SUCCESSFULLY, user));
  } catch (error) {
    const { status: errorStatus, response } = handleError(
      error,
      LOG_MESSAGES.USER.ERROR_FETCHING_BY_ID
    );

    return res.status(errorStatus).json(response);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns
 * @description Update user by ID
 * @api /api/users/:id
 * @method PUT
 */
export const updateUser = async (req, res) => {
  try {
    if (validateRequest(req)) {
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(validateRequest(req)));
    }

    logger.info(LOG_MESSAGES.USER.UPDATING);

    const userData = req.body;

    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }

    const updatedUser = await userService.updateUser(req.params.id, userData);

    if (!updatedUser) {
      logger.info(LOG_MESSAGES.USER.NOT_FOUND);

      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.USER.NOT_FOUND));
    }

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.USER.UPDATED_SUCCESSFULLY, updatedUser));
  } catch (error) {
    const { status: errorStatus, response } = handleError(
      error,
      LOG_MESSAGES.USER.ERROR_UPDATING
    );

    return res.status(errorStatus).json(response);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns
 * @description Delete user by ID
 * @api /api/users/:id
 * @method DELETE
 */
export const deleteUser = async (req, res) => {
  try {
    if (validateRequest(req)) {
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(validateRequest(req)));
    }

    logger.info(LOG_MESSAGES.USER.DELETING);

    const deletedUser = await userService.deleteUser(req.params.id);

    if (!deletedUser) {
      logger.info(LOG_MESSAGES.USER.NOT_FOUND);

      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.USER.NOT_FOUND));
    }

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.USER.DELETED_SUCCESSFULLY));
  } catch (error) {
    const { status: errorStatus, response } = handleError(
      error,
      LOG_MESSAGES.USER.ERROR_DELETING
    );

    return res.status(errorStatus).json(response);
  }
};
