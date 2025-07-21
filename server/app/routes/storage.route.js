import express from 'express';
import * as storageController from '../controllers/storage.controller.js';
import { verifyAccessToken, checkRole } from '../middleware/auth.middleware.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadFileSchema } from '../validators/file.validator.js';

const router = express.Router();

// Upload file
router.post(
  '/upload',
  verifyAccessToken,
  uploadMiddleware,
  validate(uploadFileSchema),
  storageController.uploadFile
);

// Get fileInfo by ID
router.get('/:fileId', verifyAccessToken, storageController.getFileInfo);

// Delete file
router.delete(
  '/:fileId',
  verifyAccessToken,
  checkRole([CONSTANTS.ROLE.ADMIN]),
  storageController.deleteFile
);

// List all files
router.get('/list', verifyAccessToken, storageController.listFiles);

// Add download route
router.get(
  '/download/:fileKey',
  verifyAccessToken,
  storageController.downloadFile
);

export default router;
