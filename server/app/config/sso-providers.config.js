// Update the imports at the top
import { Strategy as Auth0Strategy } from 'passport-auth0';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { SSO } from '../utils/global.constants.js';
import logger from './logger.config.js';
import * as userService from '../services/user.service.js';
import passport from 'passport';
import { CONSTANTS } from '../utils/constants.utils.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';

const {
  AZURE_REDIRECT_URI,
  SSO_ISSUER,
  SSO_REDIRECT_URI,
  AZURE_CLIENT_ID,
  AZURE_BASE_URL,
  AZURE_TENANT_ID,
  AZURE_CLIENT_SECRET,
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
} = process.env;

/**
 * Initializes the appropriate SSO provider based on the strategy
 * @module initializeSSOProvider
 * @param {Function|Object} strategy - The passport strategy or configuration object
 * @param {Object} config - Configuration for the authentication provider
 * @param {Function} profileHandler - Callback function to handle user profile data
 * @throws {Error} If the provided strategy is invalid
 * @returns {void}
 * @author neelmehta
 */
const initializeSSOProvider = (strategy, config, profileHandler) => {
  if (strategy?.name === SSO.PROVIDERS.MSAL) {
    return initializeMSAL(config);
  }

  if (typeof strategy === CONSTANTS.FUNCTION_TYPES.FUNCTION) {
    passport.use(new strategy(config, profileHandler));
  } else {
    logger.error(LOG_MESSAGES.GENERAL.INVALID_PASSPORT_STRATEGY);
    throw new Error(LOG_MESSAGES.GENERAL.INVALID_PASSPORT_STRATEGY);
  }
};

/**
 * Initializes MSAL (Microsoft Authentication Library) for Azure AD authentication
 * @module initializeMSAL
 * @param {Object} config - Configuration for MSAL authentication
 * @returns {Promise<void>}
 * @throws {Error} If authentication fails during redirect URL generation
 * @author neelmehta
 */
const initializeMSAL = async (config) => {
  const msalInstance = new ConfidentialClientApplication(config);

  const MSALStrategy = () => ({
    name: SSO.PROVIDERS.AZURE_MSAL,
    authenticate: async (req) => {
      try {
        const authCodeUrlParameters = {
          scopes: [CONSTANTS.SCOPES.USER_READ],
          redirectUri: AZURE_REDIRECT_URI,
        };

        const response = await msalInstance.getAuthCodeUrl(
          authCodeUrlParameters
        );
        req.res.redirect(response);
      } catch (error) {
        logger.error(LOG_MESSAGES.SSO.AUTH.ERROR_AZURE, error);
        throw error;
      }
    },
  });

  passport.use(MSALStrategy());
};

/**
 * Auth0 SSO Provider Configuration
 * @module auth0Provider
 * @returns {Object} Auth0 strategy initializer
 * @author neelmehta
 */
export const auth0Provider = {
  initialize: () =>
    initializeSSOProvider(
      Auth0Strategy,
      {
        domain: SSO_ISSUER,
        clientID: SSO_CLIENT_ID,
        clientSecret: SSO_CLIENT_SECRET,
        callbackURL: SSO_REDIRECT_URI,
      },
      async (accessToken, refreshToken, extraParams, profile, done) => {
        try {
          const user = await userService.createOrFindSSOUser(
            profile,
            SSO.PROVIDERS.AUTH0
          );
          return done(null, user);
        } catch (error) {
          logger.error(LOG_MESSAGES.SSO.AUTH.ERROR_AUTH0, error);
          return done(error, null);
        }
      }
    ),
};

/**
 * Azure AD SSO Provider Configuration
 * @module azureADProvider
 * @returns {Object} Azure AD strategy initializer using MSAL.js client credentials flow
 * @author neelmehta
 */
export const azureADProvider = {
  initialize: () =>
    initializeSSOProvider(
      { name: SSO.PROVIDERS.MSAL },
      {
        auth: {
          clientId: AZURE_CLIENT_ID,
          authority: `${AZURE_BASE_URL}/${AZURE_TENANT_ID}`,
          clientSecret: AZURE_CLIENT_SECRET,
        },
        system: {
          loggerOptions: {
            loggerCallback: (loglevel, message) => {
              logger.info(message);
            },
            piiLoggingEnabled: false,
            logLevel: CONSTANTS.LOG_LEVELS.INFO,
          },
        },
      },
      async (profile, done) => {
        try {
          const user = await userService.createOrFindSSOUser(
            profile,
            SSO.PROVIDERS.AZURE_AD
          );
          return done(null, user);
        } catch (error) {
          logger.error(LOG_MESSAGES.SSO.AUTH.ERROR_AZURE, error);
          return done(error, null);
        }
      }
    ),
};

/**
 * Mapping of available SSO providers
 * @module ssoProviders
 * @type {Object}
 * @property {Object} AUTH0 - Auth0 SSO provider
 * @property {Object} AZURE_AD - Azure AD SSO provider
 * @author neelmehta
 */
export const ssoProviders = {
  [SSO.PROVIDERS.AUTH0]: auth0Provider,
  [SSO.PROVIDERS.AZURE_AD]: azureADProvider,
};

/**
 * Initializes and configures available SSO providers
 * @module initializeConfiguredProviders
 * @returns {boolean} True if at least one provider is initialized
 * @throws {Error} If no valid SSO strategy is configured in environment
 * @author neelmehta
 */
export const initializeConfiguredProviders = () => {
  let initialized = false;

  if (SSO_CLIENT_ID && SSO_CLIENT_SECRET) {
    ssoProviders[SSO.PROVIDERS.AUTH0].initialize();
    logger.info(LOG_MESSAGES.SSO.STRATEGY.AUTH0_CONFIGURED);
    initialized = true;
  }

  if (!initialized && AZURE_CLIENT_ID && AZURE_CLIENT_SECRET) {
    ssoProviders[SSO.PROVIDERS.AZURE_AD].initialize();
    logger.info(LOG_MESSAGES.SSO.STRATEGY.AZURE_CONFIGURED);
    initialized = true;
  }

  if (!initialized) {
    logger.error(LOG_MESSAGES.SSO.CONFIG.NO_STRATEGY);
    throw new Error(LOG_MESSAGES.SSO.CONFIG.NO_STRATEGY);
  }

  return initialized;
};
