import express from 'express';
import { validate } from '../middleware/validate.middleware.js';
import {
  signUpSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from '../validators/auth.validator.js';
import { updateUserSchema } from '../validators/user.validator.js';
import * as authController from '../controllers/auth.controller.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Register a new user
router.post('/signup', validate(signUpSchema), authController.signUp);

// Login user
router.post('/login', validate(loginSchema), authController.login);

// Forgot password
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Get User Profile
router.get('/me', verifyAccessToken, authController.getProfile);

// Update User Profile
router.put(
  '/profile/:id',
  verifyAccessToken,
  validate(updateUserSchema),
  authController.updateProfile
);

// Add logout route
router.post('/logout', verifyAccessToken, authController.logout);

// Add refresh token route
router.post('/refresh-token', authController.refreshToken);

export default router;
