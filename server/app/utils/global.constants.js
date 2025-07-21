// Basic Types and Values
export const BOOLEAN_VALUES = {
  TRUE: true,
  FALSE: false,
};

export const TYPE = {
  object: 'object',
  string: 'string',
};

// Time Related Constants
export const TIME = {
  MS_MULTIPLIER: 1000 * 60,
  COOKIE_AGE: 24 * 60 * 60 * 1000,
};

// Environment Constants
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging',
  TEST: 'test',
};

// API Related Constants
export const API = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

// Logging and Audit Constants
export const LOG_LEVELS = {
  INFO: 'info',
  ERROR: 'error',
  WARNING: 'warning',
  DEBUG: 'debug',
};

export const AUDIT_EVENTS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  TOKEN_REFRESH: 'tokenRefresh',
  FAILED_LOGIN: 'failedLogin',
  PASSWORD_CHANGE: 'passwordChange',
};

// Security Related Constants
export const POLICY_VALUES = {
  SAME_SITE: 'same-site',
  SAME_ORIGIN: 'same-origin',
  DENY: 'deny',
  NONE: 'none',
  STRICT_ORIGIN_CROSS_ORIGIN: 'strict-origin-when-cross-origin',
  STRICT: 'strict',
  NOSNIFF: 'nosniff',
  XSS_MODE_BLOCK: '1; mode=block',
  PERMISSIONS_NONE: 'geolocation=(), camera=(), microphone=()',
  REQUIRE_CORP: 'require-corp',
};

export const SECURITY = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 30,
    SALT_ROUNDS: 8,
    PREVIOUS_PASSWORDS: 3,
  },
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
  },
  TOKEN: {
    ACCESS_EXPIRY: '15m',
    REFRESH_EXPIRY: '7d',
  },
  COOKIE: {
    ACCESS_MAX_AGE: 15 * 60 * 1000,
    REFRESH_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
  },
  CSP_DIRECTIVES: {
    'default-src': "'self'",
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': "'self'",
    'font-src': "'self'",
    'object-src': "'none'",
    'media-src': "'self'",
    'frame-src': "'none'",
  },
  HELMET: {
    MAX_AGE: 31536000,
  },
  AUDIT: {
    RETENTION_DAYS: 30,
    LOG_LEVEL: LOG_LEVELS.INFO,
    EVENTS: AUDIT_EVENTS,
  },
};

export const SECURITY_AUDIT = {
  SEVERITY: {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
  },
};

// Authentication Related Constants
export const TOKEN_TYPES = {
  ACCESS: { KEY: 'accessToken', TYPE: 'access' },
  REFRESH: { KEY: 'refreshToken', TYPE: 'refresh' },
};

export const TOKEN = {
  REGEX: /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
  AUDIT_TYPE: 'tokenRefresh',
  SERVICE_NAME: 'token-refresh-service',
};

// SSO Related Constants
export const SSO = {
  PROVIDERS: {
    AUTH0: 'auth0',
    AZURE_AD: 'azure-ad',
    AZURE_MSAL: 'azure-ad-msal',
    MSAL: 'MSALStrategy',
    GOOGLE: 'google',
    MICROSOFT: 'microsoft',
  },
  OPTIONS: {
    AUTH0: {
      strategy: 'auth0',
      options: { scope: 'openid email profile', prompt: 'login' },
    },
    AZURE: {
      strategy: 'azure-ad-openidconnect',
      options: { prompt: 'login' },
    },
    CALLBACK: {
      common: { failureRedirect: '/login', session: false },
    },
  },
  URLS: {
    AUTH0_LOGOUT: `${process.env.SSO_ISSUER}/v2/logout?client_id=${process.env.SSO_CLIENT_ID}&returnTo=${process.env.FRONTEND_URL}`,
    AZURE: {
      LOGOUT: `${process.env.AZURE_BASE_URL}/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/logout?post_logout_redirect_uri=${process.env.FRONTEND_URL}`,
      METADATA: `${process.env.AZURE_BASE_URL}/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      ISSUER: `${process.env.AZURE_BASE_URL}/${process.env.AZURE_TENANT_ID}/v2.0`,
    },
  },
};

// HTTP Related Constants
export const HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  X_REQUESTED_WITH: 'X-Requested-With',
  CONTENT_RANGE: 'Content-Range',
  X_CONTENT_RANGE: 'X-Content-Range',
  STRICT_TRANSPORT_SECURITY: 'Strict-Transport-Security',
  X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  X_FRAME_OPTIONS: 'X-Frame-Options',
  X_XSS_PROTECTION: 'X-XSS-Protection',
  PERMISSIONS_POLICY: 'Permissions-Policy',
  CROSS_ORIGIN_EMBEDDER_POLICY: 'Cross-Origin-Embedder-Policy',
  CROSS_ORIGIN_OPENER_POLICY: 'Cross-Origin-Opener-Policy',
  CROSS_ORIGIN_RESOURCE_POLICY: 'Cross-Origin-Resource-Policy',
};

export const SECURITY_HEADERS = {
  CSP: 'content-security-policy',
  HSTS: 'strict-transport-security',
  FRAME_OPTIONS: 'x-frame-options',
  CONTENT_TYPE_OPTIONS: 'x-content-type-options',
  XSS_PROTECTION: 'x-xss-protection',
  REFERRER_POLICY: 'referrer-policy',
  PERMISSIONS_POLICY: 'permissions-policy',
  FEATURE_POLICY: 'feature-policy',
  EXPECT_CT: 'expect-ct',
  MAX_AGE: 'max-age',
  ENFORCE: 'enforce',
};

export const RESTRICTED_FEATURES = {
  MICROPHONE: 'MICROPHONE',
  GEOLOCATION: 'GEOLOCATION',
  CAMERA: 'CAMERA',
};

export const HEADER_VALUES = {
  NO_REFERRER: 'no-referrer',
  MAX_AGE_86400: '86400',
};

// Cookie Related Constants
export const COOKIE = {
  HTTP_ONLY: true,
  SECURE: process.env.NODE_ENV !== 'development',
  SAME_SITE: process.env.NODE_ENV === 'development' ? 'lax' : 'strict',
  MAX_AGE: parseInt(process.env.COOKIE_MAX_AGE || '3600000'),
  PATH: '/',
  DOMAIN: process.env.COOKIE_DOMAIN,
  strict: 'strict',
  maxAge: 15 * 60 * 1000,
  severndaysmaxage: 7 * 24 * 60 * 60 * 1000,
};

// System Related Constants
export const SYSTEM = {
  SESSION: { DEFAULT_SECRET: 'your_secret_key' },
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
  SCOPES: { USER_READ: 'user.read' },
};

// File Related Constants
// Excel Constants
export const EXCEL_FILE_EXTENSIONS = ['csv', 'xlsx', 'xls'];

// File Related Constants
export const FILE_CONSTANTS = {
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif'],
    DOCUMENT: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  FIELD_NAME: 'file',
  FILENAME: 'filename',
};

export const STORAGE_TYPES = {
  AWS: 'aws',
  AZURE: 'azure',
  CLOUDINARY: 'cloudinary',
  SUPABASE: 'supabase',
};

// Rate Limit Constants
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
};

// Request Constants
export const REQUEST_BODY = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  PHONE_NUMBER: 'phoneNumber',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
  TOKEN: 'token',
  NEW_PASSWORD: 'newPassword',
  FILE: 'file',
  FILENAME: 'filename',
  TYPE: 'type',
  NAME: 'name',
  ID: 'id',
  URL: 'url',
  ROLE_ID: 'roleId',
  HEADER: 'header',
  BODY: 'body',
};

// Password Constants
export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 15,
};

// Phone Number Constants
export const PHONE_NUMBER = {
  MIN_LENGTH: 10,
};

export const STREAM_EVENTS = {
  DATA: 'data',
  END: 'end',
  ERROR: 'error',
};

export const PDF = {
  MIME_TYPE: 'application/pdf',
  FONT_SIZE: {
    HEADER: 20,
    BODY: 12,
  },
  ALIGN: {
    CENTER: 'center',
    LEFT: 'left',
  },
};

// Storage Constants
export const STORAGE = {
  PATHS: {
    UPLOADS: 'uploads',
  },
  FORMATS: {
    BASE64: 'base64',
  },
  SORT: {
    CREATED_AT: 'created_at',
    DESC: 'desc',
  },
  MAX_RESULTS: 30,
  SECURE: true,
  PROVIDERS: {
    AWS: 'aws',
    AZURE: 'azure',
    CLOUDINARY: 'cloudinary',
  },
};

// Cache Related Constants
export const CACHE = {
  EXPIRY: 5 * 60, // 5 minutes
  KEY: 'cache',
};

// AWS Related Constants
export const AWS_CONFIG = {
  REQUIRED_ENV_VARS: [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_BUCKET_NAME',
  ],
};

// Content Related Constants
export const CONTENT = {
  HEADERS: {
    TYPE: 'Content-Type',
    DISPOSITION: 'Content-Disposition',
    ATTACHMENT: 'attachment',
    FILENAME: 'filename',
  },
  STREAM_EVENTS: {
    DATA: 'data',
    END: 'end',
    ERROR: 'error',
  },
};

// Excel Related Constants
export const EXCEL = {
  TYPES: {
    CSV: 'csv',
    XLS: 'xls',
    XLSX: 'xlsx',
  },
  OPERATORS: {
    AND: ' and ',
  },
  EVENTS: {
    DATA: 'data',
    END: 'end',
    ERROR: 'error',
  },
  VALUE_TYPE: {
    FUNCTION: 'function',
    VALUE: 'value',
  },
};

// Common Constants
export const COMMON = {
  AND: ' and ',
  FUNCTION: 'function',
  VALUE: 'value',
  DATA: 'data',
  END: 'end',
  ERROR: 'error',
  folder: 'folder',
  getObject: 'getObject',
  FIELD_NAME: 'fieldName',
  suspiciousActivity: 'suspiciousActivity',
  validationError: 'validationError',
  securityHeaders: 'security-headers', // Add this line
};

// Logging Security Events
export const LOGSECURITYEVENT = {
  REQUEST: 'request',
  USER_AGENT: 'user-agent',
  REFERER: 'referer',
  finish: 'finish',
  response: 'response',
  content_length: 'content-length',
};

export const CSP_DIRECTIVES_VALUES = {
  SELF: "'self'",
  NONE: "'none'",
  UNSAFE_INLINE: "'unsafe-inline'",
  UNSAFE_EVAL: "'unsafe-eval'",
  DATA: 'data:',
  HTTPS: 'https:',
  NO_REFERRER: 'no-referrer',
};

export const CSP_DIRECTIVE_KEYS = {
  DEFAULT_SRC: 'default-src',
  SCRIPT_SRC: 'script-src',
  STYLE_SRC: 'style-src',
  IMG_SRC: 'img-src',
  FONT_SRC: 'font-src',
  CONNECT_SRC: 'connect-src',
  OBJECT_SRC: 'object-src',
  MEDIA_SRC: 'media-src',
  FRAME_SRC: 'frame-src',
  BASE_URI: 'base-uri',
  FORM_ACTION: 'form-action',
  FRAME_ANCESTORS: 'frame-ancestors',
  UPGRADE_INSECURE_REQUESTS: 'upgrade-insecure-requests',
  BLOCK_ALL_MIXED_CONTENT: 'block-all-mixed-content',
  REPORT_URI: 'report-uri',
};

export const FEATURE_POLICY_VALUES = {
  NONE: "'none'",
  SELF: "'self'",
  EMPTY_RESTRICTION: '()',
};

export const FEATURE_POLICY_KEYS = {
  MICROPHONE: 'microphone',
  GEOLOCATION: 'geolocation',
  CAMERA: 'camera',
  PAYMENT: 'payment',
  USB: 'usb',
  MAGNETOMETER: 'magnetometer',
  ACCELEROMETER: 'accelerometer',
  GYROSCOPE: 'gyroscope',
};

export const CONTROLLER_NAMES = {
  FILE: 'file-controller',
  QUEUE: 'queue-controller',
};

export const QUEUE_CONFIG = {
  NAMES: {
    FILE_UPLOAD: 'file-upload-queue',
    FILE_DOWNLOAD: 'file-download-queue',
    DEAD_LETTER: 'dead-letter-queue',
  },
  RABBITMQ: {
    DEFAULT_URL: 'amqp://localhost',
    OPTIONS: {
      HEARTBEAT: 60,
      CONNECTION_TIMEOUT: 5000,
    },
    EXCHANGE: {
      DEAD_LETTER: 'dlx',
      TYPE: {
        DIRECT: 'direct',
        TOPIC: 'topic',
        FANOUT: 'fanout',
      },
    },
    QUEUE_OPTIONS: {
      DURABLE: true,
      MESSAGE_TTL: 3600000, // 1 hour in milliseconds
      ARGUMENTS: {
        'x-message-ttl': 3600000,
        'x-dead-letter-exchange': 'dlx',
        'x-dead-letter-routing-key': 'dead-letter',
      },
    },
    DEAD_LETTER_QUEUE_OPTIONS: {
      DURABLE: true,
      ARGUMENTS: {
        'x-message-ttl': 604800000, // 7 days in milliseconds
      },
    },
  },
  JOB: {
    DEFAULT_ATTEMPTS: 3,
    BACKOFF: {
      TYPE: 'exponential',
      DEFAULT_DELAY: 5000,
    },
  },
};

// Remove duplicate QUEUE constant since it's now part of QUEUE_CONFIG
export const QUEUE = {
  EXCHANGE: {
    DEAD_LETTER: 'dlx',
    TYPE: {
      DIRECT: 'direct',
    },
  },
  NAMES: {
    DEAD_LETTER: 'dead-letter-queue',
  },
};

export const PROCESS_SIGNALS = {
  TERMINATION: 'SIGTERM',
  INTERRUPT: 'SIGINT',
  HANG_UP: 'SIGHUP',
};

export const EVENTS = {
  ERROR: 'error',
  CLOSE: 'close',
  DATA: 'data',
  END: 'end',
};

export const TIME_CONSTANTS = {
  MS_MULTIPLIER: 1000 * 60,
  COOKIE_AGE: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};
