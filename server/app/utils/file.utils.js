import supabase from '../config/supabase.config.js';
import { FILE_CONSTANTS } from '../utils/global.constants.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import logger from '../config/logger.config.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadSingleFile = upload.single('file');

export const isValidFileType = (mimeType) =>
  Object.values(FILE_CONSTANTS.ALLOWED_TYPES).some((types) =>
    types.includes(mimeType)
  );

export const validateFileInput = (file) => {
  if (!file) {
    throw new Error(CONSTANTS.STORAGE.NO_FILE_UPLOADED);
  }

  if (!isValidFileType(file.mimetype)) {
    throw new Error(CONSTANTS.STORAGE.INVALID_FILE_TYPE);
  }

  if (file.size > FILE_CONSTANTS.MAX_SIZE) {
    throw new Error(CONSTANTS.STORAGE.FILE_TOO_LARGE);
  }

  return true;
};

/**
 * Upload a file to Supabase storage and get the public URL
 * @param {Object} file - The file object
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export async function uploadFileAndGetPublicUrl(file) {
  const {
    originalname: fileName,
    buffer: fileBuffer,
    mimetype: mimeType,
  } = file;

  try {
    const bucketName = process.env.SUPABASE_BUCKET_NAME;
    const filePath = `${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, { contentType: mimeType, upsert: false });

    if (uploadError) throw new Error(uploadError.message);

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error(CONSTANTS.STORAGE.FILE_NOT_FOUND);
    }

    return publicUrl;
  } catch (err) {
    logger.error(LOG_MESSAGES.FILE.ERROR_UPLOADING);
    throw err;
  }
}

/**
 * Get the download URL of a file
 * @param {Object} file - The file object
 * @returns {string} - The download URL of the file
 */
export const getDownloadUrl = (file) => {
  const { name, downloadUrl } = file;
  return `${downloadUrl}?download=${encodeURIComponent(name)}`;
};
