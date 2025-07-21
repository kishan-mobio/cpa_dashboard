import { createLogger } from '../utils/logger.utils.js';
import { errorResponse, successResponse } from '../utils/response.util.js';
import * as status from '../utils/status_code.utils.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import { CONTROLLER_NAMES } from '../utils/global.constants.js';
import { queueUtils } from '../utils/queue.utils.js';
import { QUEUE_NAMES } from '../config/queue.config.js';
import {
  getDownloadUrl,
  uploadFileAndGetPublicUrl,
  validateFileInput,
} from '../utils/file.utils.js';
import { getFileByName, saveUploadedFile } from '../services/file.service.js';

const logger = createLogger(CONTROLLER_NAMES.FILE);

const handleFileOperation = async (operation) => {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    logger.error(LOG_MESSAGES.FILE.OPERATION_FAILED, error);
    throw new Error(error.message || CONSTANTS.FILE.INVALID_OPERATION);
  }
};

export const uploadFile = async (req, res) => {
  try {
    validateFileInput(req.file);

    const fileData = await handleFileOperation(async () => {
      const publicUrl = await uploadFileAndGetPublicUrl(req.file);
      await saveUploadedFile(req.file.originalname, publicUrl);
      return { publicUrl };
    });

    const job = await queueUtils.addJob(QUEUE_NAMES.FILE_UPLOAD, {
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      userId: req.user.id,
      publicUrl: fileData.publicUrl,
    });

    return res.status(status.STATUS_CODE_ACCEPTED).json(
      successResponse(CONSTANTS.FILE.UPLOAD_QUEUED, {
        jobId: job.jobId,
        publicUrl: fileData.publicUrl,
      })
    );
  } catch (error) {
    return res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(error.message));
  }
};

export const downloadFile = async (req, res) => {
  try {
    if (!req.body.filename) {
      throw new Error(CONSTANTS.FILE.FILE_NOT_FOUND);
    }

    const fileData = await handleFileOperation(async () => {
      const fileInfo = await getFileByName(req.body.filename);
      const downloadUrl = getDownloadUrl(fileInfo);
      return { fileInfo, downloadUrl };
    });

    const job = await queueUtils.addJob(QUEUE_NAMES.FILE_DOWNLOAD, {
      filename: req.body.filename,
      userId: req.user.id,
      fileData: fileData.fileInfo,
      downloadUrl: fileData.downloadUrl,
    });

    return res.status(status.STATUS_CODE_ACCEPTED).json(
      successResponse(CONSTANTS.FILE.DOWNLOAD_QUEUED, {
        jobId: job.jobId,
        downloadUrl: fileData.downloadUrl,
      })
    );
  } catch (error) {
    return res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(error.message));
  }
};
