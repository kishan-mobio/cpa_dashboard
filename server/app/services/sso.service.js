import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { TOKEN_TYPES, SSO } from '../utils/global.constants.js';
import { CONSTANTS } from '../utils/constants.utils.js';

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  AZURE_CLIENT_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
} = process.env;

const getSecret = (
  provider = SSO.PROVIDERS.AUTH0,
  type = TOKEN_TYPES.ACCESS.TYPE
) => {
  if (provider === SSO.PROVIDERS.AUTH0) {
    return type === TOKEN_TYPES.ACCESS.TYPE
      ? JWT_ACCESS_SECRET
      : JWT_REFRESH_SECRET;
  }

  return AZURE_CLIENT_SECRET;
};

/**
 * Decode a JWT token without verification
 * @param {string} token
 * @returns {Object|null} - Decoded payload or null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
};

/**
 * Verify a JWT token
 * @param {string} token
 * @param {string} secret
 * @returns {Object} - Verified payload
 * @throws {Error}
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    throw new Error(CONSTANTS.SSO.MESSAGES.INVALID_REFRESH_TOKEN);
  }
};

/**
 * Generate access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} - { accessToken, refreshToken }
 */
const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    ssoProvider: user.ssoProvider,
  };

  const provider = user.ssoProvider || SSO.PROVIDERS.AUTH0;

  return {
    accessToken: jwt.sign(
      payload,
      getSecret(provider, TOKEN_TYPES.ACCESS.TYPE),
      {
        expiresIn: JWT_ACCESS_EXPIRY,
      }
    ),
    refreshToken: jwt.sign(
      { userId: user._id, ssoProvider: provider },
      getSecret(provider, TOKEN_TYPES.REFRESH.TYPE),
      { expiresIn: JWT_REFRESH_EXPIRY }
    ),
  };
};

/**
 * Refresh JWT tokens using refresh token
 * @param {string} token - Refresh token
 * @returns {Promise<Object>} - { accessToken, refreshToken }
 */
export const refreshToken = async (token) => {
  if (!token) {
    throw new Error(CONSTANTS.SSO.MESSAGES.REFRESH_TOKEN_REQUIRED);
  }

  const decoded = decodeToken(token);
  const provider = decoded?.ssoProvider || SSO.PROVIDERS.AUTH0;
  const secret = getSecret(provider, TOKEN_TYPES.REFRESH.TYPE);

  const verified = verifyToken(token, secret);
  const user = await User.findById(verified.userId);

  if (!user) {
    throw new Error(CONSTANTS.USER.NOT_FOUND);
  }

  const tokens = generateTokens(user);

  user.accessToken = tokens.accessToken;
  user.refreshToken = tokens.refreshToken;

  await user.save();

  return tokens;
};
