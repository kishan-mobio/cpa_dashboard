import 'dotenv/config';
import { app } from './app/server.js';
import { setupFileProcessor } from './app/processors/file.processor.js';
import { queueUtils } from './app/utils/queue.utils.js';
import { LOG_MESSAGES } from './app/utils/log_messages.utils.js';
import { createLogger } from './app/utils/logger.utils.js';

const logger = createLogger('server');

// Required environment variables
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGODB_URI',
  'NODE_ENV',
  'SSO_CLIENT_ID',
  'SSO_CLIENT_SECRET',
  'SSO_REDIRECT_URI',
  'SSO_ISSUER',
  'FRONTEND_URL',
  'SESSION_SECRET',
  'SECURE_COOKIES',
  'RATE_LIMIT_WINDOW_MINUTES',
  'RATE_LIMIT_MAX_REQUESTS',
  'PRODUCTION_URL',
  'MAX_REQUEST_SIZE',
  'SESSION_COOKIE_NAME',
  'SESSION_COOKIE_MAX_AGE',
];

// Validate required environment variables
const validateEnvVars = (envVars) => {
  const missingEnvVars = envVars.filter((envVar) => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    console.error(
      'Missing required environment variables:',
      missingEnvVars.join(', ')
    );
    process.exit(1);
  }
};

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(
    'Missing required environment variables:',
    missingEnvVars.join(', ')
  );
  process.exit(1);
}

// Define the port from environment variable or use a default port
const PORT = process.env.PORT || 3000;

/**
 * Start the server and listen on the defined port
 * @author neelmehta
 */
const startServer = async () => {
  try {
    validateEnvVars(requiredEnvVars);

    // Initialize queue service first
    await queueUtils.initialize();

    // Initialize processor
    await setupFileProcessor();

    // Start the server
    app.listen(PORT, () => {
      logger.info(LOG_MESSAGES.SERVER.STARTED(PORT, process.env.NODE_ENV));
    });
  } catch (error) {
    logger.error(LOG_MESSAGES.SERVER.START_FAILED, error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  await queueUtils.cleanup();
  process.exit(0);
});

startServer();
