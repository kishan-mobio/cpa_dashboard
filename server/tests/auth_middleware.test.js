import jwt from 'jsonwebtoken';
import { createToken, verifyToken } from '../app/middleware/auth.middleware';
import * as constants from '../app/utils/constants.utils';
import * as status from '../app/utils/status_code.utils';
import { errorResponse } from '../app/utils/response.util';

import { userData } from './mocks/user.mock';

// Mocking dependencies
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createToken', () => {
    it('should create a token', () => {
      jwt.sign.mockReturnValue('mockToken');

      const token = createToken(userData);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userData._id, email: userData.email },
        process.env.JWT_SECRET || 'jwt_secret_key',
        { expiresIn: constants.TOKEN_EXPIRED }
      );
      expect(token).toBe('mockToken');
    });

    it('should handle errors when creating a token', () => {
      const error = new Error('Error creating token');
      jwt.sign.mockImplementation(() => {
        throw error;
      });

      expect(() => createToken(userData)).toThrow(error);
    });
  });

  describe('verifyToken', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        headers: {
          authorization: 'Bearer mockToken',
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should verify the token and call next', () => {
      const decoded = { id: userData._id, email: userData.email };
      jwt.verify.mockImplementation((token, secret, callback) =>
        callback(null, decoded)
      );

      verifyToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(
        'mockToken',
        process.env.JWT_SECRET || 'jwt_secret_key',
        expect.any(Function)
      );
      expect(req.user).toEqual(decoded);
      expect(next).toHaveBeenCalled();
    });

    it('should return error if authorization header is missing', () => {
      req.headers.authorization = undefined;

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(status.STATUS_CODE_UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(
        errorResponse(constants.TOKEN_REQUIRED)
      );
    });

    it('should return error if token is missing', () => {
      req.headers.authorization = 'Bearer ';

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(status.STATUS_CODE_UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(
        errorResponse(constants.TOKEN_REQUIRED)
      );
    });

    it('should return error if token verification fails', () => {
      const error = new Error('Token verification failed');
      jwt.verify.mockImplementation((token, secret, callback) =>
        callback(error, null)
      );

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(status.STATUS_CODE_UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(
        errorResponse(constants.INVALID_TOKEN)
      );
    });

    it('should return error if token is expired', () => {
      const error = new jwt.TokenExpiredError('jwt expired', new Date());
      jwt.verify.mockImplementation((token, secret, callback) =>
        callback(error, null)
      );

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(status.STATUS_CODE_UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(
        errorResponse(constants.INVALID_TOKEN)
      );
    });
  });
});
