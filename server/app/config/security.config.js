import {
  SECURITY,
  HEADERS,
  POLICY_VALUES,
  ENV,
  TIME,
  API,
  BOOLEAN_VALUES,
  CSP_DIRECTIVES_VALUES,
  CSP_DIRECTIVE_KEYS,
  FEATURE_POLICY_VALUES,
  FEATURE_POLICY_KEYS,
  SECURITY_HEADERS,
  RESTRICTED_FEATURES,
  HEADER_VALUES,
} from '../utils/global.constants.js';
import { CONSTANTS } from '../utils/constants.utils.js';

// JWT Configuration
export const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: SECURITY.TOKEN.ACCESS_EXPIRY,
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: SECURITY.TOKEN.REFRESH_EXPIRY,
  },
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
};

// Rate Limiting Configuration
export const rateLimitConfig = {
  windowMs: SECURITY.RATE_LIMIT.WINDOW_MS,
  max: SECURITY.RATE_LIMIT.MAX_REQUESTS,
  message: CONSTANTS.SECURITY.MESSAGES.TOO_MANY_REQUESTS,
  standardHeaders: BOOLEAN_VALUES.TRUE,
  legacyHeaders: BOOLEAN_VALUES.FALSE,
};

// Enhanced CSP Configuration
const enhancedCSPDirectives = {
  [CSP_DIRECTIVE_KEYS.DEFAULT_SRC]: [CSP_DIRECTIVES_VALUES.SELF],
  [CSP_DIRECTIVE_KEYS.SCRIPT_SRC]: [
    CSP_DIRECTIVES_VALUES.SELF,
    CSP_DIRECTIVES_VALUES.UNSAFE_INLINE,
    CSP_DIRECTIVES_VALUES.UNSAFE_EVAL,
  ],
  [CSP_DIRECTIVE_KEYS.STYLE_SRC]: [
    CSP_DIRECTIVES_VALUES.SELF,
    CSP_DIRECTIVES_VALUES.UNSAFE_INLINE,
  ],
  [CSP_DIRECTIVE_KEYS.IMG_SRC]: [
    CSP_DIRECTIVES_VALUES.SELF,
    CSP_DIRECTIVES_VALUES.DATA,
    CSP_DIRECTIVES_VALUES.HTTPS,
  ],
  [CSP_DIRECTIVE_KEYS.FONT_SRC]: [
    CSP_DIRECTIVES_VALUES.SELF,
    CSP_DIRECTIVES_VALUES.HTTPS,
    CSP_DIRECTIVES_VALUES.DATA,
  ],
  [CSP_DIRECTIVE_KEYS.CONNECT_SRC]: [
    CSP_DIRECTIVES_VALUES.SELF,
    process.env.FRONTEND_URL,
  ],
  [CSP_DIRECTIVE_KEYS.OBJECT_SRC]: [CSP_DIRECTIVES_VALUES.NONE],
  [CSP_DIRECTIVE_KEYS.MEDIA_SRC]: [CSP_DIRECTIVES_VALUES.SELF],
  [CSP_DIRECTIVE_KEYS.FRAME_SRC]: [CSP_DIRECTIVES_VALUES.NONE],
  [CSP_DIRECTIVE_KEYS.BASE_URI]: [CSP_DIRECTIVES_VALUES.SELF],
  [CSP_DIRECTIVE_KEYS.FORM_ACTION]: [CSP_DIRECTIVES_VALUES.SELF],
  [CSP_DIRECTIVE_KEYS.FRAME_ANCESTORS]: [CSP_DIRECTIVES_VALUES.NONE],
  [CSP_DIRECTIVE_KEYS.UPGRADE_INSECURE_REQUESTS]: [],
  [CSP_DIRECTIVE_KEYS.BLOCK_ALL_MIXED_CONTENT]: [],
  [CSP_DIRECTIVE_KEYS.REPORT_URI]: [process.env.CSP_REPORT_URI],
};

// Additional Security Headers
export const securityHeaders = {
  [HEADERS.STRICT_TRANSPORT_SECURITY]: `${SECURITY_HEADERS.MAX_AGE}=${SECURITY.HELMET.MAX_AGE}; includeSubDomains; preload`,
  [HEADERS.X_CONTENT_TYPE_OPTIONS]: POLICY_VALUES.NOSNIFF,
  [HEADERS.X_FRAME_OPTIONS]: POLICY_VALUES.DENY,
  [HEADERS.X_XSS_PROTECTION]: POLICY_VALUES.XSS_MODE_BLOCK,
  [HEADERS.PERMISSIONS_POLICY]: Object.entries(FEATURE_POLICY_KEYS)
    .map(([_, value]) => `${value}=${FEATURE_POLICY_VALUES.EMPTY_RESTRICTION}`)
    .join(', '),
  [HEADERS.CROSS_ORIGIN_EMBEDDER_POLICY]: POLICY_VALUES.REQUIRE_CORP,
  [HEADERS.CROSS_ORIGIN_OPENER_POLICY]: POLICY_VALUES.SAME_ORIGIN,
  [HEADERS.CROSS_ORIGIN_RESOURCE_POLICY]: POLICY_VALUES.SAME_ORIGIN,
  [SECURITY_HEADERS.FEATURE_POLICY]: Object.entries(FEATURE_POLICY_KEYS)
    .filter(([key]) => Object.values(RESTRICTED_FEATURES).includes(key))
    .map(([_, value]) => `${value} ${FEATURE_POLICY_VALUES.NONE}`)
    .join('; '),
  [SECURITY_HEADERS.EXPECT_CT]: `${SECURITY_HEADERS.MAX_AGE}=${HEADER_VALUES.MAX_AGE_86400}, ${SECURITY_HEADERS.ENFORCE}`,
};

// Enhanced Helmet Configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: enhancedCSPDirectives,
    reportOnly: process.env.NODE_ENV === ENV.DEVELOPMENT,
  },
  crossOriginEmbedderPolicy: BOOLEAN_VALUES.TRUE,
  crossOriginOpenerPolicy: BOOLEAN_VALUES.TRUE,
  crossOriginResourcePolicy: { policy: POLICY_VALUES.SAME_ORIGIN },
  dnsPrefetchControl: BOOLEAN_VALUES.TRUE,
  frameguard: { action: POLICY_VALUES.DENY },
  hidePoweredBy: BOOLEAN_VALUES.TRUE,
  hsts: {
    maxAge: SECURITY.HELMET.MAX_AGE,
    includeSubDomains: BOOLEAN_VALUES.TRUE,
    preload: BOOLEAN_VALUES.TRUE,
  },
  ieNoOpen: BOOLEAN_VALUES.TRUE,
  noSniff: BOOLEAN_VALUES.TRUE,
  originAgentCluster: BOOLEAN_VALUES.TRUE,
  permittedCrossDomainPolicies: { permittedPolicies: POLICY_VALUES.NONE },
  referrerPolicy: {
    policy: [
      POLICY_VALUES.STRICT_ORIGIN_CROSS_ORIGIN,
      HEADER_VALUES.NO_REFERRER,
    ],
  },
  xssFilter: BOOLEAN_VALUES.TRUE,
};

// Security Audit Configuration
export const securityAuditConfig = {
  enabled: BOOLEAN_VALUES.TRUE,
  retentionDays: SECURITY.AUDIT.RETENTION_DAYS,
  logLevel: SECURITY.AUDIT.LOG_LEVEL,
  auditEvents: SECURITY.AUDIT.EVENTS,
};

// Password Policy
export const passwordPolicy = {
  minLength: SECURITY.PASSWORD.MIN_LENGTH,
  maxLength: SECURITY.PASSWORD.MAX_LENGTH,
  requireUppercase: BOOLEAN_VALUES.TRUE,
  requireLowercase: BOOLEAN_VALUES.TRUE,
  requireNumbers: BOOLEAN_VALUES.TRUE,
  requireSpecialChars: BOOLEAN_VALUES.TRUE,
  preventReuse: SECURITY.PASSWORD.PREVIOUS_PASSWORDS,
};

// Session Configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: BOOLEAN_VALUES.FALSE,
  saveUninitialized: BOOLEAN_VALUES.FALSE,
  cookie: {
    secure: process.env.NODE_ENV === ENV.PRODUCTION,
    httpOnly: BOOLEAN_VALUES.TRUE,
    sameSite: POLICY_VALUES.STRICT,
    maxAge: TIME.COOKIE_AGE,
  },
};

// CORS Configuration
export const corsConfig = {
  origin:
    process.env.NODE_ENV === ENV.DEVELOPMENT
      ? process.env.FRONTEND_URL
      : process.env.PRODUCTION_URL,
  methods: Object.values(API),
  allowedHeaders: [
    HEADERS.CONTENT_TYPE,
    HEADERS.AUTHORIZATION,
    HEADERS.X_REQUESTED_WITH,
  ],
  exposedHeaders: [HEADERS.CONTENT_RANGE, HEADERS.X_CONTENT_RANGE],
  credentials: BOOLEAN_VALUES.TRUE,
  maxAge: TIME.COOKIE_AGE,
  preflightContinue: BOOLEAN_VALUES.FALSE,
};
