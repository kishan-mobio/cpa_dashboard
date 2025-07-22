import express from 'express';
import userRoutes from './user.route.js';
import authRoutes from './auth.route.js';
import ssoRoutes from './sso.route.js';

const router = express.Router();

// API Versions
const version1 = '/v1';

// User Routes
router.use(`${version1}/users`, userRoutes);

// Auth Routes
router.use(`${version1}/auth`, authRoutes);

// SSO Routes
router.use(`${version1}/sso`, ssoRoutes);


export default router;
