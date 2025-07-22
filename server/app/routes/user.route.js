import express from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { updateUserSchema } from '../validators/user.validator.js';
import * as userController from '../controllers/user.controller.js';
import { checkRole, verifyAccessToken } from '../middleware/auth.middleware.js';
import { CONSTANTS } from '../utils/constants.utils.js';

const router = express.Router();

// Create a new user
router.post(
  '/create',
  verifyAccessToken,
  checkRole([CONSTANTS.ROLE.ADMIN]),
  userController.createUser
);

// Get all users
router.get(
  '/all',
  verifyAccessToken,
  checkRole([CONSTANTS.ROLE.ADMIN]),
  userController.getAllUsers
);

// Get user by ID
router.get(
  '/:id',
  verifyAccessToken,
  checkRole([CONSTANTS.ROLE.ADMIN]),
  userController.getUserById
);

// Update user by ID
router.put(
  '/:id',
  verifyAccessToken,
  checkRole([CONSTANTS.ROLE.ADMIN]),
  validate(updateUserSchema),
  userController.updateUser
);

// Delete user by ID
router.delete(
  '/:id',
  verifyAccessToken,
  checkRole([CONSTANTS.ROLE.ADMIN]),
  userController.deleteUser
);

export default router;
