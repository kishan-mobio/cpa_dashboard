import { createLogger } from '../utils/logger.utils.js';
import { CONTROLLER_NAMES } from '../utils/global.constants.js';
import { errorResponse, successResponse } from '../utils/response.util.js';
import * as status from '../utils/status_code.utils.js';
import { queueUtils } from '../utils/queue.utils.js';
import { QUEUE_NAMES } from '../config/queue.config.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';

const logger = createLogger(CONTROLLER_NAMES.QUEUE);

export const getQueueStatus = async (req, res) => {
  try {
    const queueStatus = {};

    for (const queueName of Object.values(QUEUE_NAMES)) {
      const info = await queueUtils.getQueueInfo(queueName);
      queueStatus[queueName] = {
        messages: info.messageCount,
        consumers: info.consumerCount,
      };
    }

    return res.status(status.STATUS_CODE_SUCCESS).json(
      successResponse(CONSTANTS.QUEUE.MESSAGES.STATUS_FETCHED, {
        queues: queueStatus,
      })
    );
  } catch (error) {
    logger.error(LOG_MESSAGES.QUEUE.STATUS_ERROR, error);
    return res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(error.message));
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const jobStatus = await queueUtils.getJobStatus(req.params.jobId);

    if (!jobStatus) {
      return res
        .status(status.STATUS_CODE_NOT_FOUND)
        .json(errorResponse(CONSTANTS.QUEUE.MESSAGES.JOB_NOT_FOUND));
    }

    return res.status(status.STATUS_CODE_SUCCESS).json(
      successResponse(CONSTANTS.QUEUE.MESSAGES.JOB_STATUS_FETCHED, {
        job: jobStatus,
      })
    );
  } catch (error) {
    logger.error(LOG_MESSAGES.QUEUE.JOB_STATUS_ERROR, error);
    return res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(error.message));
  }
};
