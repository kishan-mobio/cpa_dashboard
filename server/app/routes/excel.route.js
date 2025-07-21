import express from 'express';
import * as excelController from '../controllers/excel.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { importExcelFileSchema } from '../validators/excel.validator.js';
import { uploadSingleFile } from '../utils/file.utils.js';

const router = express.Router();

// import data
router.post(
  '/import-data',
  uploadSingleFile,
  validate(importExcelFileSchema),
  excelController.importData
);

// export data
router.post('/export-data', excelController.exportData);

export default router;
