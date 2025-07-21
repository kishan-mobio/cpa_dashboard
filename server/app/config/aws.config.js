import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { CONSTANTS } from '../utils/constants.utils.js';
import { AWS_CONFIG, COMMON, STORAGE } from '../utils/global.constants.js';

// Create and configure S3 client with environment variables
export function createS3Client() {
  // Check for missing AWS configuration variables
  const missingVars = AWS_CONFIG.filter((key) => !process.env[key]);
  if (missingVars.length) {
    throw new Error(
      `${CONSTANTS.AWS.MISSING_STORAGE_CONFIG}: ${missingVars.join(', ')}`
    );
  }

  // Return configured S3 client
  return new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
}

// Create multer middleware for S3 file uploads
export function createMulterUpload(s3, bucketName) {
  if (!s3 || !bucketName) {
    throw new Error(CONSTANTS.AWS_STORAGE_MESSAGES.BUCKET_NAME_REQUIRED);
  }

  return multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      metadata: (_, file, cb) =>
        cb(null, { [COMMON.FIELD_NAME]: file.fieldname }),
      key: (_, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, `${STORAGE.PATHS.UPLOADS}/${filename}`);
      },
    }),
  });
}
