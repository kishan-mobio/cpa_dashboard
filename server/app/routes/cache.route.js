import express from 'express';
import {
  clearCacheByID,
  clearAllCacheData,
} from '../controllers/cache.controller.js';

const router = express.Router();

//Clear cache by id
router.delete('/clear/:id', clearCacheByID);

//Clear all cache
router.delete('/clear-all', clearAllCacheData);

export default router;
