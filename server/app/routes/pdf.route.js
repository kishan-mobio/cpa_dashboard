import express from 'express';
import { generatePDFSchema } from '../validators/pdf.validator.js';
import { generatePDF } from '../controllers/pdf.controller.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// Route to generate PDF
router.get('/generate-pdf', validate(generatePDFSchema), generatePDF);

export default router;
