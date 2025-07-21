import { successResponse, errorResponse } from '../utils/response.util.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import * as status from '../utils/status_code.utils.js';
import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import {
  deleteFileFromCloudStorage,
  downloadFileFromCloudStorage,
  getFileInfoFromCloudStorage,
  listFilesFromCloudStorage,
  setFileHeaders,
  uploadFileToCloudStorage,
} from '../utils/storage.utils.js';

export const uploadFile = async (req, res, next) => {
  try {
    const file = req.files?.file?.[0] || req.files?.image?.[0];
    if (!file) {
      logger.error(LOG_MESSAGES.FILE.NO_FILE_UPLOADED);
      return res
        .status(status.STATUS_CODE_BAD_REQUEST)
        .json(errorResponse(CONSTANTS.STORAGE.NO_FILE_UPLOADED));
    }

    const fileUrl = await uploadFileToCloudStorage(file);

    logger.info(LOG_MESSAGES.FILE.UPLOADED_SUCCESSFULLY);
    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.STORAGE.FILE_UPLOADED, { fileUrl }));
  } catch (error) {
    logger.error(LOG_MESSAGES.FILE.ERROR_UPLOADING, {
      error: error.message,
    });
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    await deleteFileFromCloudStorage(fileId);

    logger.info(LOG_MESSAGES.FILE.FILE_DELETED);
    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.STORAGE.FILE_DELETED));
  } catch (error) {
    logger.error(LOG_MESSAGES.FILE.ERROR_DELETING, {
      error: error.message,
    });
    next(error);
  }
};

export const getFileInfo = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const fileInfo = await getFileInfoFromCloudStorage(fileId);

    logger.info(LOG_MESSAGES.FILE.FILE_INFO_RETRIEVED);
    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse({ fileInfo }));
  } catch (error) {
    logger.error(LOG_MESSAGES.FILE.ERROR_FETCHING_FILE_INFO, {
      error: error.message,
    });
    next(error);
  }
};

export const listFiles = async (req, res, next) => {
  try {
    const files = await listFilesFromCloudStorage();

    logger.info(LOG_MESSAGES.FILE.FILES_LISTED_SUCCESSFULLY);
    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse({ files }));
  } catch (error) {
    logger.error(LOG_MESSAGES.FILE.ERROR_LISTING_FILES, {
      error: error.message,
    });
    next(error);
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const { fileKey } = req.params;

    const file = await downloadFileFromCloudStorage(fileKey);
    setFileHeaders(res, file);

    logger.info(LOG_MESSAGES.FILE_DOWNLOADED_SUCCESSFULLY);
    return res.send(file.content);
  } catch (error) {
    logger.error(LOG_MESSAGES.FILE.ERROR_DOWNLOADING_FILE, {
      error: error.message,
    });
    next(error);
  }
};
