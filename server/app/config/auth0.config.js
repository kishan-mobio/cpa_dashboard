import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import logger from './logger.config.js';
import { CONSTANTS } from '../utils/constants.utils.js';

/**
 * Configure Auth0 Strategy for Passport
 * @author neelmehta
 */
export const configureAuth0 = () => {
  try {
    // Configure Auth0 strategy
    passport.use(
      new Auth0Strategy(
        {
          domain: process.env.SSO_ISSUER.replace('https://', ''),
          clientID: process.env.SSO_CLIENT_ID,
          clientSecret: process.env.SSO_CLIENT_SECRET,
          callbackURL: process.env.SSO_REDIRECT_URI,
        },
        (accessToken, refreshToken, extraParams, profile, done) => {
          return done(null, profile);
        }
      )
    );

    // Configure session serialization
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    logger.info(CONSTANTS.AUTH0.AUTH_CONFIG_SUCCESS);
  } catch (error) {
    logger.error(CONSTANTS.AUTH0.AUTH_CONFIG_ERROR, error);
    throw error;
  }
};
