import express from 'express';
import userRoutes from './user.route.js';
import authRoutes from './auth.route.js';
import storageRoutes from './storage.route.js';
import ssoRoutes from './sso.route.js';
import excelRoutes from './excel.route.js';
import fileRoutes from './file.route.js';
import cacheRoutes from './cache.route.js';
import queueRoutes from './queue.route.js';
import pdfRoutes from './pdf.route.js';

const router = express.Router();

// API Versions
const version1 = '/v1';

// User Routes
router.use(`${version1}/user`, userRoutes);

// Auth Routes
router.use(`${version1}/auth`, authRoutes);

// Storage Routes
router.use(`${version1}/storage`, storageRoutes);
// SSO Routes
router.use(`${version1}/sso`, ssoRoutes);
// Excel data Routes
router.use(`${version1}/excel`, excelRoutes);

// File Routes
router.use(`${version1}/file`, fileRoutes);

// Cache Routes
router.use(`${version1}/cache`, cacheRoutes);

// File Routes
router.use(`${version1}/queue`, queueRoutes);

// PDF Routes
router.use(`${version1}/pdf`, pdfRoutes);

export default router;
