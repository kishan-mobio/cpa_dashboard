import express from 'express';
import * as fileController from '../controllers/file.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  uploadFileSchema,
  downloadFileSchema,
} from '../validators/file.validator.js';
import { uploadSingleFile } from '../utils/file.utils.js';

const router = express.Router();

// Upload a file
router.post(
  '/upload',
  uploadSingleFile,
  validate(uploadFileSchema),
  fileController.uploadFile
);

// Download a file
router.get(
  '/download',
  validate(downloadFileSchema),
  fileController.downloadFile
);

export default router;
