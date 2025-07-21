import multer from 'multer';
import { BadRequestError } from '../utils/errors.utils.js';
import { CONSTANTS } from '../utils/constants.utils.js';

// Parse environment variables once during initialization
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE);

// Configure multer with memory storage
const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(
        new BadRequestError(CONSTANTS.STORAGE.INVALID_FILE_TYPE),
        false
      );
    }

    cb(null, true);
  },
  limits: {
    fileSize: MAX_FILE_SIZE, // Multer will automatically handle file size validation
  },
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 }, // Add support for image field name
]);

export { uploadMiddleware };
