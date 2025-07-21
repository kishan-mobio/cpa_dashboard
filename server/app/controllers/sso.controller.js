import passport from 'passport';
import { setSecureCookie, clearCookie } from '../utils/cookie.utils.js';
import logger from '../config/logger.config.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import * as status from '../utils/status_code.utils.js';
import { errorResponse, successResponse } from '../utils/response.util.js';
import { LOG_MESSAGES } from '../utils/log_messages.utils.js';
import { TOKEN_TYPES, SSO } from '../utils/global.constants.js';
import { initializeConfiguredProviders } from '../config/sso-providers.config.js';
import { refreshToken as refreshUserToken } from '../services/sso.service.js';

export const initializeSSO = () => {
  initializeConfiguredProviders(passport);
};

export const getActiveSSOProvider = () => {
  if (process.env.SSO_CLIENT_ID && process.env.SSO_CLIENT_SECRET) {
    return SSO.PROVIDERS.AUTH0;
  }

  if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET) {
    return SSO.PROVIDERS.AZURE_AD;
  }

  return null;
};

// SSO Helper Functions
const handleSSOLogin = (provider) => {
  if (!provider) throw new Error(CONSTANTS.SSO.MESSAGES.NO_PROVIDER);
  return provider === SSO.PROVIDERS.AUTH0
    ? SSO.OPTIONS.AUTH0
    : SSO.OPTIONS.AZURE;
};

const handleSSOCallback = (provider) => {
  if (!provider) {
    const error = new Error(CONSTANTS.SSO.MESSAGES.NO_PROVIDER);
    logger.error(LOG_MESSAGES.SSO.CALLBACK.ERROR, error);
    throw error;
  }

  return provider === SSO.PROVIDERS.AUTH0
    ? SSO.OPTIONS.AUTH0
    : SSO.OPTIONS.AZURE;
};

const handleSSOLogout = (provider) => {
  if (!provider) throw new Error(CONSTANTS.SSO.MESSAGES.NO_PROVIDER);
  return provider === SSO.PROVIDERS.AUTH0
    ? SSO.URLS.AUTH0_LOGOUT
    : SSO.URLS.AZURE.LOGOUT;
};

// API Route Handlers
/**
 * @api /api/v1/auth/sso/login
 * @method GET
 * @description Initiate SSO login
 */
export const login = (req, res) => {
  try {
    const { strategy, options } = handleSSOLogin(getActiveSSOProvider());
    return passport.authenticate(strategy, options)(req, res);
  } catch (error) {
    logger.error(LOG_MESSAGES.SSO.AUTH.ERROR_AUTH0, error);
    return res
      .status(status.STATUS_CODE_BAD_REQUEST)
      .json(errorResponse(error.message));
  }
};

/**
 * @api /api/v1/auth/sso/callback
 * @method GET
 * @description Handle SSO callback from provider
 */
export const callback = (req, res) => {
  try {
    const { strategy, options } = handleSSOCallback(getActiveSSOProvider());

    passport.authenticate(strategy, options)(req, res, async (err, user) => {
      if (err || !user) {
        logger.error(
          LOG_MESSAGES.SSO.CALLBACK.ERROR,
          err || CONSTANTS.USER.NOT_FOUND
        );
        return res
          .status(status.STATUS_CODE_UNAUTHORIZED)
          .json(errorResponse(CONSTANTS.AUTH.ACCESS_DENIED));
      }

      setSecureCookie(res, TOKEN_TYPES.ACCESS.KEY, user.accessToken);
      setSecureCookie(res, TOKEN_TYPES.REFRESH.KEY, user.refreshToken);

      return res.status(status.STATUS_CODE_SUCCESS).json(
        successResponse(CONSTANTS.SSO.MESSAGES.ADMIN_ACCESS_GRANTED, {
          user: {
            id: user.userId,
            email: user.email,
            role: user.role,
            ssoProvider: user.ssoProvider,
          },
        })
      );
    });
  } catch (error) {
    logger.error(LOG_MESSAGES.SSO.CALLBACK.ERROR, error);
    return res
      .status(status.STATUS_CODE_BAD_REQUEST)
      .json(errorResponse(error.message));
  }
};

/**
 * @api /api/v1/auth/sso/logout
 * @method GET
 * @description Handle user logout and return SSO logout URL
 */
export const logout = (req, res) => {
  try {
    clearCookie(res, TOKEN_TYPES.ACCESS.KEY);
    clearCookie(res, TOKEN_TYPES.REFRESH.KEY);

    const logoutUrl = handleSSOLogout(getActiveSSOProvider());

    req.logout(() => {
      return res.status(status.STATUS_CODE_SUCCESS).json(
        successResponse(CONSTANTS.SSO.MESSAGES.ADMIN_ACCESS_GRANTED, {
          logoutUrl,
        })
      );
    });
  } catch (error) {
    logger.error(LOG_MESSAGES.SSO.CALLBACK.LOGOUT, error);
    return res
      .status(status.STATUS_CODE_BAD_REQUEST)
      .json(errorResponse(error.message));
  }
};

/**
 * @api /api/v1/auth/user
 * @method GET
 * @description Get authenticated user's information
 */
export const getUserInfo = (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(status.STATUS_CODE_UNAUTHORIZED)
        .json(errorResponse(CONSTANTS.AUTH.ACCESS_DENIED));
    }

    return res.status(status.STATUS_CODE_SUCCESS).json(
      successResponse(CONSTANTS.SSO.MESSAGES.ADMIN_ACCESS_GRANTED, {
        user: {
          id: req.user.userId,
          email: req.user.email,
          role: req.user.role,
          ssoProvider: req.user.ssoProvider,
        },
      })
    );
  } catch (error) {
    logger.error(LOG_MESSAGES.SSO.AUTH.ERROR_AUTH0, error);
    return res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(CONSTANTS.AUTH.INTERNAL_SERVER_ERROR));
  }
};

/**
 * @api /api/v1/auth/token/refresh
 * @method POST
 * @description Refresh access and refresh tokens using old refresh token
 */
export const handleTokenRefresh = async (req, res) => {
  try {
    const tokens = await refreshUserToken(req.body.refreshToken);

    setSecureCookie(res, TOKEN_TYPES.ACCESS.KEY, tokens.accessToken);
    setSecureCookie(res, TOKEN_TYPES.REFRESH.KEY, tokens.refreshToken);

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.REFRESH_TOKEN.SUCCESS, tokens));
  } catch (error) {
    logger.error(LOG_MESSAGES.SSO.CALLBACK.TOKEN_REFRESH, error);
    return res
      .status(
        error.message === CONSTANTS.USER.NOT_FOUND
          ? status.STATUS_CODE_NOT_FOUND
          : status.STATUS_CODE_UNAUTHORIZED
      )
      .json(errorResponse(error.message));
  }
};
