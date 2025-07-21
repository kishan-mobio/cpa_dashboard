import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import * as status from '../utils/status_code.utils.js';
import { errorResponse, successResponse } from '../utils/response.util.js';
import { getPDFUrl } from '../utils/pdf.utils.js';
import logger from '../config/logger.config.js';
import { CONSTANTS } from '../utils/constants.utils.js';

/**
 * @param {*} req
 * @param {*} res
 * @returns {JSON}
 * @description Generate PDF from provided data
 * @route /api/pdf/generate
 * @method POST
 * @author Kishan Kalavadia
 */
export const generatePDF = async (req, res) => {
  try {
    logger.info(LOG_MESSAGES.PDF.GENERATION_STARTED);
    const downloadUrl = await getPDFUrl(req.body);

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.PDF.GENERATION_SUCCESS, downloadUrl));
  } catch (error) {
    logger.error(LOG_MESSAGES.PDF.GENERATION_FAILED, error);
    res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(CONSTANTS.PDF.GENERATION_FAILED));
  }
};
