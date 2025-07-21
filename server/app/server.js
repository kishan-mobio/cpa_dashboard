import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import helmet from 'helmet';
import { configureAuth0 } from './config/auth0.config.js';
import { initializeSSO } from './controllers/sso.controller.js';
import morganMiddleware from './middleware/morgan.middleware.js';
import mainRoutes from './routes/index.js';
import logger from './config/logger.config.js';
import { CONSTANTS } from './utils/constants.utils.js';
import * as status from './utils/status_code.utils.js';
import rateLimiter from './middleware/ratelimit.middleware.js';
import './config/db.config.js';
import {
  helmetConfig,
  corsConfig,
  sessionConfig,
} from './config/security.config.js';

const app = express();
const { PORT, PRODUCTION_URL, NODE_ENV } = process.env;

// Environment check
const isDev = NODE_ENV === CONSTANTS.ENV_TYPES.DEVELOPMENT;

// CORS configuration
const corsOptions = {
  origin: isDev ? [`http://localhost:${PORT || 3000}`] : [PRODUCTION_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

app.use(rateLimiter());

// Apply Global Middleware
app.use(cors(corsOptions));
app.use(cors(corsConfig));


// Update session configuration
const sessionOptions = {
  ...sessionConfig,
  cookie: {
    secure: !isDev,
    httpOnly: true,
    sameSite: 'strict',
    maxAge: CONSTANTS.TIME_CONSTANTS.COOKIE_AGE,
  },
};

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(morganMiddleware);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Initialize Auth
configureAuth0();
initializeSSO();

// Routes
app.use('/api', mainRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(status.STATUS_CODE_SUCCESS).send(CONSTANTS.AUTH.HELLO_WORLD);
});

// Error handling middleware
app.use((err, req, res, _next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ message: CONSTANTS.USER.INTERNAL_SERVER_ERROR });
});

export { app };
