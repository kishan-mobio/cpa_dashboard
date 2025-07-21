import { clearCache, clearAllCache } from '../utils/cache.util.js';
import * as status from '../utils/status_code.utils.js';
import { errorResponse, successResponse } from '../utils/response.util.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import logger from '../config/logger.config.js';

/**
 * @api /api/v1/cache/clear/:id
 * @method DELETE
 * @description Clear cache by ID
 * @param {string} id - The ID of the cache to clear
 * @returns {Object} - The response
 * @author Kishan Kalavadia
 */
export const clearCacheByID = async (req, res) => {
  try {
    const { id } = req.params;
    const key = `data:${id}`;
    await clearCache(key);

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.STORAGE.CACHE_CLEARED));
  } catch (error) {
    logger.error(error.message);
    return res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(CONSTANTS.STORAGE.CACHE_CLEAR_FAILED));
  }
};

/**
 * @api /api/v1/cache/clear-all
 * @method DELETE
 * @description Clear all cache
 * @returns {Object} - The response
 * @author Kishan Kalavadia
 */
export const clearAllCacheData = async (req, res) => {
  try {
    await clearAllCache();

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.STORAGE.CACHE_CLEARED));
  } catch (error) {
    logger.error(error.message);
    return res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(CONSTANTS.STORAGE.CACHE_CLEAR_FAILED));
  }
};
