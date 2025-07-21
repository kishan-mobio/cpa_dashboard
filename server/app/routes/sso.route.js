import express from 'express';
import * as ssoController from '../controllers/sso.controller.js';
import {
  authenticateSSO,
  authorizeRole,
} from '../middleware/sso.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { ssoTokenRefreshSchema } from '../validators/sso.validator.js';
import { CONSTANTS } from '../utils/constants.utils.js';

const router = express.Router();

// Authentication routes
router.get('/login', ssoController.login);
router.get('/callback', ssoController.callback);
router.get('/logout', ssoController.logout);
router.post(
  '/token/refresh',
  validate(ssoTokenRefreshSchema),
  ssoController.handleTokenRefresh
);

// SSO User profile route - renamed to avoid conflict with user.route.js
router.get('/profile/:userId', authenticateSSO, ssoController.getUserInfo);

// Admin routes
router.get(
  '/admin/verify',
  authenticateSSO,
  authorizeRole([CONSTANTS.ROLE.ADMIN]),
  (req, res) => {
    res.json({ message: CONSTANTS.SSO.MESSAGES.ADMIN_ACCESS_GRANTED });
  }
);

export default router;
