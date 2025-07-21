import express from 'express';
import * as queueController from '../controllers/queue.controller.js';

const router = express.Router();

router.get('/status', queueController.getQueueStatus);

router.get('/job/:jobId', queueController.getJobStatus);

export default router;
