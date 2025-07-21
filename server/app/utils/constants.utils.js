export const CONSTANTS = {
  USER: {
    INTERNAL_SERVER_ERROR: 'Internal server error',
    EXIST_EMAIL: 'User with this email already exists',
    EXIST_PHONE: 'User with this phone number already exists',
    NOT_FOUND: 'User not found',
    FETCHED_SUCCESSFULLY: 'Users fetched successfully',
    USER_FETCHED_SUCCESSFULLY: 'User fetched successfully',
    CREATED_SUCCESSFULLY: 'User created successfully',
    UPDATED_SUCCESSFULLY: 'User updated successfully',
    DELETED_SUCCESSFULLY: 'User deleted successfully',
    DOES_NOT_EXIST: 'User does not exist',
    ALREADY_EXISTS_ERROR:
      'User with the same email or phone number already exists.',
    USER_INFO_RETRIEVED_SUCCESSFULLY: 'User info retrieved successfully',
    INVALID_ROLE_ID: 'Invalid role ID',
  },

  TOKEN: {
    REQUIRED: 'Token Required',
    INVALID: 'Invalid token.',
    EXPIRY: '1h',
    EXPIRED: 'Token Expired',
  },

  REFRESH_TOKEN: {
    REQUIRED: 'Refresh token required',
    EXPIRED: 'Refresh token expired',
    SUCCESS: 'Tokens refreshed successfully',
    ERROR: 'Error refreshing token',
  },

  VALIDATION: {
    TOKEN_VALIDATION_ERROR: 'Token validation error',
    FIELD_REQUIRED: 'Field is required',
    FIRST_NAME_REQUIRED: 'First name is required',
    LAST_NAME_REQUIRED: 'Last name is required',
    INVALID_EMAIL: 'Invalid email address',
    INVALID_PHONE_NUMBER: 'Invalid phone number',
    INVALID_URL: 'Invalid URL',
    INVALID_TOKEN: 'Invalid token',
    INVALID_STRING: 'Invalid string',
    INVALID_BOOLEAN: 'Invalid boolean',
    INVALID_NUMBER: 'Invalid number',
    PHONE_NUMBER_MIN_LENGTH: 'Phone number must be at least 10 digits',
    INVALID_PASSWORD_LENGTH: 'Password must be between 8 and 15 characters',
    INVALID_PASSWORD_FORMAT:
      'Password must contain at least one alphabet, one number, and one special character',
    INVALID_ROLE_ID: 'Invalid role ID provided',
  },

  DATE: {
    FORMAT: 'DD-MM-YYYY',
    LOG_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  },

  AUTH: {
    HELLO_WORLD: 'Hello, World!',
    SIGNUP_SUCCESSFULLY: 'Signup successfully',
    LOGIN_SUCCESSFULLY: 'Login successfully',
    PASSWORD_INCORRECT: 'Incorrect Password',
    ACCESS_DENIED: 'Access denied. User does not have sufficient permissions.',
    ERROR_LOGGING_OUT: 'Error logging out',
    TOKENS_REFRESHED_SUCCESSFULLY: 'Tokens refreshed successfully',
    REFRESH_TOKEN_REQUIRED: 'Refresh token required',
    REFRESH_TOKEN_EXPIRED: 'Refresh token expired',
    ERROR_REFRESHING_TOKEN: 'Error refreshing token',
  },

  PASSWORD_RESET: {
    ERROR_GENERATING_TOKEN: 'Error generating reset password token',
    ERROR_EMAIL_SENT: 'Error sending password reset email',
    ERROR_FAILED: 'Failed to reset password.',
    ERROR_VERIFYING_TOKEN: 'Error in verifying the reset token',
    EMAIL_SENT: 'Password reset instructions sent to your email.',
    INVALID_TOKEN: 'Invalid reset token',
    TOKEN_EXPIRY: '1h',
    TOKEN_EXPIRED: 'Reset password token expired',
    SUCCESS: 'Password reset successfully',
    CONFIRM_MISMATCH: 'New password and Confirm password do not match.',
  },

  ROLE: {
    FIELD_NAME: 'roles',
    USER: 'user',
    USERS: 'users',
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
    INVALID_PROVIDED: 'Invalid role provided',
    NOT_FOUND: 'Role not found',
    FETCHED_SUCCESSFULLY: 'Role fetched successfully',
    ERROR_FETCHING: 'Error fetching role',
  },

  PDF: {
    GENERATION_SUCCESS: 'PDF generated successfully',
    GENERATION_FAILED: 'Error generating PDF',
  },

  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
    MESSAGE: 'Too many requests, please try again later.',
  },

  EXCEL: {
    NO_FILE_UPLOADED: 'No file uploaded',
    FILE_SIZE_EXCEEDS: 'File size exceeds the limit of 1MB',
    INVALID_FILE_TYPE: 'Invalid file type',
    NO_DATA_FOUND: 'No data found in the file',
    FILE_NOT_FOUND: 'File not found',
    DATA_EXCEEDS_LIMIT: 'Data exceeds the limit of 1000 rows',
    FILE_UPLOADED_SUCCESSFULLY:
      'Excel File uploaded successfully in the database!',
    NO_DATA_FOUND_IN_DATABASE: 'No data found for this batch',
    ERROR_EXPORTING_CSV: 'Error exporting CSV',
    NO_DATA_FOR_CONVERSION: 'No data available for conversion',
    CSV_CONVERSION_ERROR: 'Error converting data to CSV',
    XLSX_CONVERSION_ERROR: 'Error converting data to XLSX',
    MISSING_HEADERS: 'Missing required headers',
    EXCEL_EXPORTED_SUCCESSFULLY: 'Excel File exported successfully',
    ERROR_SAVING_DATA: 'Error saving Excel data to the database',
    VALIDATION_MESSAGES: {
      MISSING_VALUE: (row, column) =>
        `Row ${row} is missing a value for column ${column}.`,
      INVALID_VALUE: (row, column, value, type) =>
        `Row ${row}: Invalid ${type} found in column ${column}, Got ${value}.`,
      DUPLICATE_VALUE: (value, field, rows) =>
        `Duplicate value '${value}' found in column '${field}' at rows ${rows}.`,
    },
    VALIDATION_SUCCESS: 'Data validation successful',
  },

  FILE: {
    UPLOAD_QUEUED: 'File upload has been queued for processing',
    DOWNLOAD_QUEUED: 'File download has been queued',
    INVALID_OPERATION: 'Invalid file operation',
    FILE_NOT_FOUND: 'File not found',
    FETCHED_SUCCESSFULLY: 'File fetched successfully',
    PROCESSED_SUCCESSFULLY: 'File processed successfully',
    OPERATION_FAILED: 'File operation failed',
  },

  STORAGE: {
    NO_FILE_UPLOADED: 'No file was provided for upload',
    BUFFER_REQUIRED: 'File buffer is required',
    INVALID_FILE_PROVIDED: 'Invalid file provided',
    FILE_SIZE_EXCEEDED: 'File size exceeds limit',
    FILE_TOO_LARGE: 'File size exceeds the limit of 10MB',
    INVALID_FILE_TYPE: 'Invalid file type',
    FILE_NOT_FOUND: 'Requested file not found',
    FILE_FETCHED_SUCCESSFULLY: 'File URL generated successfully',
    FILE_DELETED: 'File deleted successfully',
    FILE_UPLOADED: 'File uploaded successfully',
    FILE_UPDATED: 'File updated successfully',
    UNSUPPORTED_TYPE: 'Unsupported storage type:',
    CACHE_CLEARED: 'Cache cleared successfully',
    CACHE_CLEAR_FAILED: 'Failed to clear cache',
  },

  // Remove duplicate sections that were moved to global.constants.js
  // Remove STORAGE_PROVIDERS, AWS_STORAGE_MESSAGES, CLOUDINARY_STORAGE_MESSAGES, AZURE_STORAGE_MESSAGES

  AUTH0: {
    LOGIN_SUCCESS: 'Login successful via Auth0',
    LOGIN_FAILED: 'Login failed via Auth0',
    LOGOUT_SUCCESS: 'Logout successful from Auth0',
    LOGOUT_FAILED: 'Logout failed from Auth0',
    AUTH_CONFIG_SUCCESS: 'Auth0 strategy configured successfully',
    AUTH_CONFIG_ERROR: 'Error configuring Auth0 strategy',
  },

  AZURE: {
    TOKEN_SUCCESS: 'Azure token retrieved successfully',
    AUTH_ERROR: 'azure_auth_error',
    CONFIG_UPDATED: 'Azure configuration updated successfully',
    USER_INFO_SUCCESS: 'User info retrieved successfully',
    LOGIN_ERROR: 'Error initiating Azure login',
    CALLBACK_ERROR: 'Error in Azure callback',
    CONFIG_ERROR: 'Error configuring Azure AD strategy',
    STRATEGY_SUCCESS: 'Azure AD strategy configured successfully',
    STORAGE_INITIALIZED: 'Azure Blob Storage initialized successfully',
    STORAGE_SETUP_SKIPPED: 'Azure Blob Storage setup skipped',
    CONFIG_UPDATE_SUCCESS: 'Azure configuration updated successfully',
    MISSING_STORAGE_CONFIG: 'Missing required Azure storage configuration',
  },

  SSO: {
    MESSAGES: {
      REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
      INVALID_REFRESH_TOKEN: 'Invalid refresh token',
      ERROR_REFRESHING_TOKEN: 'Error refreshing token:',
      MISSING_ENV_VARS: 'Missing required environment variables:',
      ADMIN_ACCESS_GRANTED: 'Admin access granted',
      NO_PROVIDER: 'No SSO provider configured',
    },
    ROUTES: {
      REFRESH_TOKEN: '/token/refresh',
      USER_PROFILE: '/profile',
    },
    CONFIG: {
      DEFAULT_ROLE: 'user',
      AZURE: {
        RESPONSE_TYPE: 'code id_token',
        RESPONSE_MODE: 'form_post',
        ALLOW_HTTP_REDIRECT: true,
        VALIDATE_ISSUER: true,
        PASS_REQ_CALLBACK: false,
      },
    },
  },

  EMAIL: {
    SEND_FAILED: 'Email send failed',
    SENT_SUCCESS: 'Email sent successfully',
    WELCOME_EMAIL_SUBJECT: 'Welcome to the team',
  },

  TIME_CONSTANTS: {
    MILLISECONDS_MULTIPLIER: 1000 * 60,
    COOKIE_AGE: 24 * 60 * 60 * 1000,
  },

  ENV_TYPES: {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    STAGING: 'staging',
    TEST: 'test',
  },

  SESSION_CONSTANTS: {
    DEFAULT_SECRET: 'your_secret_key',
  },

  LOG_LEVELS: {
    INFO: 'Info',
    ERROR: 'Error',
    WARN: 'Warn',
    DEBUG: 'Debug',
  },

  FUNCTION_TYPES: {
    FUNCTION: 'function',
    CLASS: 'class',
  },

  SCOPES: {
    USER_READ: 'user.read',
  },

  ERRORS: {
    TOKEN_EXPIRED: 'TokenExpiredError',
    SSO_NOT_CONFIGURED: 'No SSO provider configured',
    SSO_PROFILE_INVALID: 'SSO profile does not contain a valid email',
    GENERAL: 'Something went wrong!',
    TIMEOUT: 'Request timeout exceeded',
    TIMEOUT_ERROR: 'Request timed out',
  },

  MIDDLEWARE: {
    COMBINED_LOG_FORMAT: 'combined',
  },

  DB: {
    ERROR_LOADING_CONFIG: 'Error loading database configuration:',
    CONNECTED: 'Connected to database',
    ERROR_CONNECTING: 'Error connecting to database:',
  },

  DB_OPERATIONS_MESSAGES: {
    QUERY_ERROR: 'Unsupported operation:',
    DB_ERROR: 'Database operation failed:',
  },

  STORAGE_LOGS: {
    CLOUDINARY_DELETE: 'Cloudinary delete error:',
    CLOUDINARY_LIST: 'Cloudinary list error:',
    CLOUDINARY_UPLOAD: 'Cloudinary upload error:',
    CLOUDINARY_UPLOAD_DEBUG: 'Error at cloudinary upload:',
    AZURE_DELETE: 'Azure delete error:',
    AZURE_LIST: 'Azure list error:',
    AWS_UPLOAD: 'AWS upload error:',
    AWS_DELETE: 'AWS delete error:',
    AWS_LIST: 'AWS list error:',
  },

  SECURITY: {
    MESSAGES: {
      TOKEN_INVALID_FORMAT: 'Invalid token format',
      TOKEN_REQUIRED: 'No token provided',
      TOKEN_INVALID: 'Invalid token',
      TOKEN_EXPIRED: 'Token expired and no refresh token provided',
      PASSWORD_LENGTH: (min, max) =>
        `Password must be between ${min} and ${max} characters`,
      PASSWORD_UPPERCASE: 'Password must contain at least one uppercase letter',
      PASSWORD_LOWERCASE: 'Password must contain at least one lowercase letter',
      PASSWORD_NUMBER: 'Password must contain at least one number',
      PASSWORD_SPECIAL: 'Password must contain at least one special character',
      TOO_MANY_REQUESTS:
        'Too many requests from this IP, please try again later.',
    },
    HEADERS: {
      AUTHORIZATION: 'Authorization',
      CONTENT_TYPE: 'Content-Type',
      X_REQUESTED_WITH: 'X-Requested-With',
    },
    MISSING_HEADERS: 'Missing security headers:',
    SECURITY_HEADERS_DEBUG: 'Security headers:',
  },
  QUEUE: {
    MESSAGES: {
      STATUS_FETCHED: 'Queue status fetched successfully',
      JOB_STATUS_FETCHED: 'Job status fetched successfully',
      JOB_NOT_FOUND: 'Job not found',
      MONITOR_INITIALIZED: 'Queue monitor initialized successfully',
    },
  },
};
