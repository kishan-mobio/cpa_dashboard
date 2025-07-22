import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Register a new user
router.post('/signup', authController.signUp);

// Login user
router.post('/login', authController.login);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Get User Profile
router.get('/me', verifyAccessToken, authController.getProfile);

// Update User Profile
router.put('/profile/:id', verifyAccessToken, authController.updateProfile);

// Add logout route
router.post('/logout', verifyAccessToken, authController.logout);

// Add refresh token route
router.post('/refresh-token', authController.refreshToken);

export default router;
