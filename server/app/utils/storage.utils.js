import { StorageError } from './errors.utils.js';
import logger from '../config/logger.config.js';
import cloudinary from '../config/cloundinary.config.js';
import { createS3Client } from '../config/aws.config.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import { azureBlob } from '../config/azure.config.js';
import { LOG_MESSAGES } from './log_messages.utils.js';
import { COMMON, FILE_CONSTANTS, STORAGE } from './global.constants.js';

export const uploadFileToCloudStorage = async (file) =>
  getProvider().uploadFile(file);

export const deleteFileFromCloudStorage = async (file) =>
  getProvider().deleteFile(file);

export const downloadFileFromCloudStorage = async (fileKey) =>
  getProvider().downloadFile(fileKey);

export const getFileInfoFromCloudStorage = async (fileKey) =>
  getProvider().getFileInfo(fileKey);

export const listFilesFromCloudStorage = async () => getProvider().listFiles();

const getProvider = () => {
  const providers = {
    [STORAGE.PROVIDERS.AWS]: awsProvider,
    [STORAGE.PROVIDERS.AZURE]: azureProvider,
    [STORAGE.PROVIDERS.CLOUDINARY]: cloudinaryProvider,
  };

  const type = process.env.STORAGE_TYPE?.toLowerCase();
  const provider = providers[type];

  if (!provider) {
    throw new StorageError(`${CONSTANTS.STORAGE.UNSUPPORTED_TYPE} ${type}`);
  }

  return provider;
};

const cloudinaryProvider = {
  uploadFile: async (file) => {
    try {
      console.log(LOG_MESSAGES.STORAGE.FILE_PATH, file.buffer);
      const base64 = file.buffer.toString(STORAGE.FORMATS.BASE64);
      const dataURI = `${COMMON.DATA}:${file.mimetype};${STORAGE.FORMATS.BASE64}${base64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: STORAGE.PATHS.UPLOADS,
      });

      return result.secure_url;
    } catch (error) {
      console.log(LOG_MESSAGES.STORAGE.CLOUDINARY_UPLOAD_ERROR, error);
      logger.error(LOG_MESSAGES.STORAGE.CLOUDINARY_UPLOAD_ERROR, error);
      throw new StorageError(
        CONSTANTS.CLOUDINARY_STORAGE_MESSAGES.UPLOAD_ERROR
      );
    }
  },

  deleteFile: async (file) => {
    try {
      await cloudinary.uploader.destroy(file.public_id);
    } catch (error) {
      logger.error(LOG_MESSAGES.STORAGE.CLOUDINARY_DELETE_ERROR, error);
      throw new StorageError(
        CONSTANTS.CLOUDINARY_STORAGE_MESSAGES.DELETE_ERROR
      );
    }
  },

  downloadFile: async (fileKey) => {
    try {
      return cloudinary.url(fileKey, { secure: STORAGE.SECURE });
    } catch (error) {
      throw new StorageError(
        CONSTANTS.CLOUDINARY_STORAGE_MESSAGES.SAS_URL_ERROR,
        error
      );
    }
  },

  getFileInfo: async (publicId) => {
    try {
      const result = await cloudinary.api.resource(publicId);

      return {
        public_id: result.public_id,
        size: result.bytes,
        format: result.format,
        created_at: result.created_at,
      };
    } catch (error) {
      throw new StorageError(
        CONSTANTS.CLOUDINARY_STORAGE_MESSAGES.GET_FILE_INFO_ERROR,
        error
      );
    }
  },

  listFiles: async () => {
    try {
      const result = await cloudinary.search
        .expression(`${COMMON.folder}:${STORAGE.PATHS.UPLOADS}`)
        .sort_by(STORAGE.SORT.CREATED_AT, STORAGE.SORT.DESC)
        .max_results(STORAGE.MAX_RESULTS)
        .execute();

      return result.resources.map((r) => ({
        public_id: r.public_id,
        url: r.secure_url,
        size: r.bytes,
        created_at: r.created_at,
      }));
    } catch (err) {
      logger.error(LOG_MESSAGES.STORAGE.CLOUDINARY_LIST_ERROR, err);
      throw new StorageError(
        CONSTANTS.CLOUDINARY_STORAGE_MESSAGES.LIST_FILES_ERROR
      );
    }
  },
};

const azureProvider = {
  uploadFile: async (file) => {
    if (!file?.originalname || !file?.buffer) {
      throw new StorageError(CONSTANTS.STORAGE.INVALID_FILE_PROVIDED);
    }

    validateFile(file);

    const blobName = `${STORAGE.PATHS.UPLOADS}/${Date.now()}-${file.originalname}`;
    const blockBlobClient =
      azureBlob.containerClient.getBlockBlobClient(blobName);

    try {
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });

      return blockBlobClient.url;
    } catch (error) {
      throw new StorageError(
        CONSTANTS.AZURE_STORAGE_MESSAGES.UPLOAD_ERROR,
        error
      );
    }
  },

  deleteFile: async (file) => {
    try {
      await azureBlob.containerClient.deleteBlob(file.blobName);
    } catch (error) {
      logger.error(LOG_MESSAGES.STORAGE.AZURE_DELETE_ERROR, error);
      throw new StorageError(
        CONSTANTS.AZURE_STORAGE_MESSAGES.DELETE_ERROR,
        error
      );
    }
  },
  downloadFile: async (fileKey) => {
    try {
      const blobServiceClient =
        azureBlob.blobServiceClient.fromConnectionString(
          process.env.AZURE_STORAGE_CONNECTION_STRING
        );

      const containerClient = blobServiceClient.getContainerClient(
        process.env.AZURE_CONTAINER_NAME
      );

      const blobClient = containerClient.getBlobClient(fileKey);
      return blobClient.url;
    } catch (error) {
      throw new StorageError(
        CONSTANTS.AZURE_STORAGE_MESSAGES.DOWNLOAD_ERROR,
        error
      );
    }
  },

  getFileInfo: async (blobName) => {
    try {
      const blobClient = azureBlob.containerClient.getBlobClient(blobName);
      const props = await blobClient.getProperties();

      return {
        blobName,
        size: props.contentLength,
        contentType: props.contentType,
        lastModified: props.lastModified,
      };
    } catch (error) {
      throw new StorageError(
        CONSTANTS.AZURE_STORAGE_MESSAGES.GET_FILE_INFO_ERROR,
        error
      );
    }
  },

  listFiles: async () => {
    try {
      const blobs = [];
      for await (const blob of azureBlob.containerClient.listBlobsFlat()) {
        blobs.push({
          name: blob.name,
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified,
        });
      }

      return blobs;
    } catch (err) {
      logger.error(LOG_MESSAGES.STORAGE.AZURE_LIST_ERROR, err);
      throw new StorageError(CONSTANTS.AZURE_STORAGE_MESSAGES.LIST_FILES_ERROR);
    }
  },
};

const awsProvider = {
  uploadFile: async (file) => {
    if (file.location) return file.location;

    validateFile(file);
    const key = `${STORAGE.PATHS.UPLOADS}${Date.now()}-${file.originalname}`;

    try {
      const result = await createS3Client()
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();

      return result.Location;
    } catch (err) {
      logger.error(LOG_MESSAGES.STORAGE.AWS_UPLOAD_ERROR, err);
      throw new StorageError(CONSTANTS.AWS_STORAGE_MESSAGES.UPLOAD_ERROR);
    }
  },

  deleteFile: async (file) => {
    try {
      await createS3Client().deleteObject(file).promise();
    } catch (err) {
      logger.error(LOG_MESSAGES.STORAGE.AWS_DELETE_ERROR, err);
      throw new StorageError(CONSTANTS.AWS_STORAGE_MESSAGES.DELETE_ERROR);
    }
  },
  downloadFile: async (fileKey) => {
    try {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Expires: FILE_CONSTANTS.DOWNLOAD_EXPIRES, // URL expires in 5 minutes
      };

      return createS3Client().getSignedUrlPromise(COMMON.getObject, params);
    } catch (err) {
      throw new StorageError(
        CONSTANTS.AWS_STORAGE_MESSAGES.DOWNLOAD_ERROR,
        err
      );
    }
  },

  getFileInfo: async (key) => {
    try {
      const result = await createS3Client()
        .headObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
        })
        .promise();

      return {
        key,
        size: result.ContentLength,
        contentType: result.ContentType,
        lastModified: result.LastModified,
      };
    } catch (err) {
      throw new StorageError(
        CONSTANTS.AWS_STORAGE_MESSAGES.GET_FILE_INFO_ERROR,
        err
      );
    }
  },

  listFiles: async () => {
    try {
      const { Contents } = await createS3Client()
        .listObjectsV2({ Bucket: process.env.AWS_BUCKET_NAME })
        .promise();

      return Contents.map(({ Key, Size, LastModified }) => ({
        key: Key,
        size: Size,
        lastModified: LastModified,
      }));
    } catch (err) {
      logger.error(LOG_MESSAGES.STORAGE.AWS_LIST_ERROR, err);
      throw new StorageError(CONSTANTS.AWS_STORAGE_MESSAGES.LIST_FILES_ERROR);
    }
  },
};

/**
 * Convert a readable stream to a buffer
 * @param {ReadableStream} readableStream - Stream to convert
 * @returns {Promise<Buffer>} Converted bufferq
 */
export const streamToBuffer = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
};

/**
 * Validate file object
 * @param {Object} file - File object to validate
 * @param {boolean} requireBuffer - Whether to require buffer
 * @throws {StorageError} If file is invalid
 */
export const validateFile = (file, requireBuffer = true) => {
  if (!file) {
    throw new StorageError(CONSTANTS.STORAGE.NO_FILE_UPLOADED);
  }

  if (requireBuffer && (!file.buffer || !file.size)) {
    throw new StorageError(CONSTANTS.STORAGE.BUFFER_REQUIRED);
  }

  if (!file.mimetype) {
    throw new StorageError(CONSTANTS.STORAGE.INVALID_FILE_PROVIDED);
  }
};

export const setFileHeaders = (res, file) => {
  res.setHeader('Content-Type', file.contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${file.blobName}`);
};

/**
 * Utility functions for handling API responses
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = (
  res,
  data,
  message = 'Success',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {Object} error - Error details (optional)
 */
export const errorResponse = (
  res,
  message = 'Internal Server Error',
  statusCode = 500,
  error = null
) => {
  const response = {
    success: false,
    message,
  };

  if (error) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};
