import { createLogger } from '../utils/logger.utils.js';
import { queueUtils } from '../utils/queue.utils.js';
import { QUEUE_NAMES } from '../config/queue.config.js';
import {
  uploadFileToCloudStorage,
  downloadFileFromCloudStorage,
} from '../utils/storage.utils.js';
import { PROCESS_SIGNALS } from '../utils/global.constants.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';

const logger = createLogger('file-processor');

export const setupFileProcessor = async () => {
  try {
    logger.info(LOG_MESSAGES.SERVER.FILE_PROCESSOR.INITIALIZING);

    // File upload processor
    await queueUtils.processQueue(QUEUE_NAMES.FILE_UPLOAD, async (data) => {
      try {
        logger.info(LOG_MESSAGES.SERVER.FILE_PROCESSOR.UPLOAD.PROCESSING);
        const fileUrl = await uploadFileToCloudStorage(data.file);
        logger.info(LOG_MESSAGES.SERVER.FILE_PROCESSOR.UPLOAD.COMPLETED);
        return { success: true, url: fileUrl };
      } catch (error) {
        logger.error(LOG_MESSAGES.SERVER.FILE_PROCESSOR.UPLOAD.FAILED, error);
        throw error;
      }
    });

    // File download processor
    await queueUtils.processQueue(QUEUE_NAMES.FILE_DOWNLOAD, async (data) => {
      try {
        logger.info(LOG_MESSAGES.SERVER.FILE_PROCESSOR.DOWNLOAD.PROCESSING);
        const downloadUrl = await downloadFileFromCloudStorage(data.fileKey);
        logger.info(LOG_MESSAGES.SERVER.FILE_PROCESSOR.DOWNLOAD.COMPLETED);
        return { success: true, url: downloadUrl };
      } catch (error) {
        logger.error(LOG_MESSAGES.SERVER.FILE_PROCESSOR.DOWNLOAD.FAILED, error);
        throw error;
      }
    });

    logger.info(LOG_MESSAGES.SERVER.FILE_PROCESSOR.INITIALIZED);
  } catch (error) {
    logger.error(LOG_MESSAGES.SERVER.FILE_PROCESSOR.INIT_FAILED, error);
    throw error;
  }
};

// Update process termination handler
process.on(PROCESS_SIGNALS.TERMINATION, async () => {
  try {
    logger.info(LOG_MESSAGES.SERVER.FILE_PROCESSOR.CLEANUP.STARTED);
    await queueUtils.cleanup();
    logger.info(LOG_MESSAGES.SERVER.FILE_PROCESSOR.CLEANUP.COMPLETED);
    process.exit(0);
  } catch (error) {
    logger.error(LOG_MESSAGES.SERVER.FILE_PROCESSOR.CLEANUP.FAILED, error);
    process.exit(1);
  }
});
