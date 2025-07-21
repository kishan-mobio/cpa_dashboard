import * as authService from '../app/services/auth.service';
import User from '../app/models/user.model';
import * as constants from '../app/utils/constants.utils';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userData, existingUser } from './mocks/user.mock';
import { TOKEN_EXPIRED } from '../app/utils/auth_const.utils';

jest.mock('../app/models/user.model');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.setTimeout(20000);

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      User.create.mockResolvedValue(userData);

      const result = await authService.createUser(userData);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(userData);
    });

    it('should throw an error when user creation fails', async () => {
      const error = new Error('Failed to create user');

      User.create.mockRejectedValue(error);

      await expect(authService.createUser(userData)).rejects.toThrow(error);
    });
  });

  describe('checkUserExists', () => {
    it('should check if a user exists by email or phone number', async () => {
      User.findOne.mockResolvedValue(existingUser);

      const result = await authService.checkUserExists(
        existingUser.email,
        existingUser.phoneNumber
      );

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { email: existingUser.email },
          { phoneNumber: existingUser.phoneNumber },
        ],
      });
      expect(result).toEqual(existingUser);
    });

    it('should throw an error when checking user existence fails', async () => {
      const error = new Error('Failed to check user existence');

      User.findOne.mockRejectedValue(error);

      await expect(
        authService.checkUserExists(
          existingUser.email,
          existingUser.phoneNumber
        )
      ).rejects.toThrow(error);
    });
  });

  // Add test cases for other functions in authService

  describe('validatePassword', () => {
    it('should return true when passwords match', async () => {
      const password = 'Password@123';
      const hashedPassword = await bcrypt.hash(password, 8);

      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.validatePassword(
        password,
        hashedPassword
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      const password = 'Password@123';
      const incorrectPassword = 'IncorrectPassword@123';
      const hashedPassword = await bcrypt.hash(password, 8);

      bcrypt.compare.mockResolvedValue(false);

      const result = await authService.validatePassword(
        incorrectPassword,
        hashedPassword
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        incorrectPassword,
        hashedPassword
      );
      expect(result).toBe(false);
    });

    it('should throw an error when validation fails', async () => {
      const password = 'Password@123';
      const hashedPassword = await bcrypt.hash(password, 8);
      const error = new Error('Failed to validate password');

      bcrypt.compare.mockRejectedValue(error);

      await expect(
        authService.validatePassword(password, hashedPassword)
      ).rejects.toThrow(error);
    });
  });

  describe('updateUserPasswordAndToken', () => {
    it('should update user password and reset password token successfully', async () => {
      const userId = '123';
      const hashedPassword = 'hashedPassword';
      const resetPasswordToken = 'resetPasswordToken';
      const resetPasswordExpires = new Date();

      const updatedUser = {
        userId,
        hashedPassword,
        resetPasswordToken,
        resetPasswordExpires,
      };
      const findByIdAndUpdateMock = jest.fn().mockResolvedValue(updatedUser);
      jest
        .spyOn(User, 'findByIdAndUpdate')
        .mockImplementation(findByIdAndUpdateMock);

      const result = await authService.updateUserPasswordAndToken(
        userId,
        hashedPassword,
        resetPasswordToken,
        resetPasswordExpires
      );

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { password: hashedPassword, resetPasswordToken, resetPasswordExpires },
        { new: true }
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error when updating user password and token fails', async () => {
      const userId = '123';
      const hashedPassword = 'hashedPassword';
      const resetPasswordToken = 'resetPasswordToken';
      const resetPasswordExpires = new Date();
      const error = new Error('Failed to update user password and token');

      jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValue(error);

      await expect(
        authService.updateUserPasswordAndToken(
          userId,
          hashedPassword,
          resetPasswordToken,
          resetPasswordExpires
        )
      ).rejects.toThrow(error);
    });
  });

  describe('getUserByResetPasswordToken', () => {
    it('should retrieve user by reset password token successfully', async () => {
      const resetPasswordToken = 'resetPasswordToken';
      const user = { userId: '123', email: 'test@example.com' };
      const findOneMock = jest.fn().mockResolvedValue(user);
      jest.spyOn(User, 'findOne').mockImplementation(findOneMock);

      const result =
        await authService.getUserByResetPasswordToken(resetPasswordToken);

      expect(User.findOne).toHaveBeenCalledWith({ resetPasswordToken });
      expect(result).toEqual(user);
    });

    it('should return null when no user found by reset password token', async () => {
      const resetPasswordToken = 'resetPasswordToken';
      const findOneMock = jest.fn().mockResolvedValue(null);
      jest.spyOn(User, 'findOne').mockImplementation(findOneMock);

      const result =
        await authService.getUserByResetPasswordToken(resetPasswordToken);

      expect(User.findOne).toHaveBeenCalledWith({ resetPasswordToken });
      expect(result).toBeNull();
    });

    it('should throw an error when retrieving user by reset password token fails', async () => {
      const resetPasswordToken = 'resetPasswordToken';
      const error = new Error(
        'Failed to retrieve user by reset password token'
      );

      jest.spyOn(User, 'findOne').mockRejectedValue(error);

      await expect(
        authService.getUserByResetPasswordToken(resetPasswordToken)
      ).rejects.toThrow(error);
    });
  });

  describe('verifyResetPasswordToken', () => {
    it('should verify reset password token successfully', async () => {
      const token = 'resetPasswordToken';
      const decodedToken = { userId: '123' };
      const verifyMock = jest.fn().mockReturnValue(decodedToken);
      jest.spyOn(jwt, 'verify').mockImplementation(verifyMock);

      const result = await authService.verifyResetPasswordToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(result).toEqual(decodedToken);
    });

    it('should throw an error when reset password token verification fails', async () => {
      const token = 'resetPasswordToken';
      const error = new Error('Invalid reset token');

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw error;
      });

      await expect(authService.verifyResetPasswordToken(token)).rejects.toThrow(
        error
      );
    });

    it('should throw an error with INVALID_RESET_TOKEN message when token is invalid', async () => {
      const token = 'invalidToken';
      const invalidTokenError = { name: 'JsonWebTokenError' };

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw invalidTokenError;
      });

      await expect(authService.verifyResetPasswordToken(token)).rejects.toThrow(
        constants.INVALID_RESET_TOKEN
      );
    });

    it('should throw an error with RESET_PASSWORD_TOKEN_EXPIRED message when token is expired', async () => {
      const token = 'expiredToken';
      const expiredTokenError = { name: TOKEN_EXPIRED };

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw expiredTokenError;
      });

      await expect(authService.verifyResetPasswordToken(token)).rejects.toThrow(
        constants.RESET_PASSWORD_TOKEN_EXPIRED
      );
    });
  });

  describe('updateUserPassword', () => {
    it('should update user password successfully', async () => {
      const userId = '123';
      const newPassword = 'newPassword';
      const findByIdAndUpdateMock = jest.fn();
      jest
        .spyOn(User, 'findByIdAndUpdate')
        .mockImplementation(findByIdAndUpdateMock);

      await authService.updateUserPassword(userId, newPassword);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        password: newPassword,
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
      });
    });

    it('should throw an error when updating user password fails', async () => {
      const userId = '123';
      const newPassword = 'newPassword';
      const error = new Error('Failed to update user password');

      jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValue(error);

      await expect(
        authService.updateUserPassword(userId, newPassword)
      ).rejects.toThrow(error);
    });
  });

  describe('generateResetPasswordToken', () => {
    it('should generate reset password token successfully', async () => {
      const userId = '123';
      const token = 'resetPasswordToken';
      const expiresIn = constants.RESET_PASSWORD_TOKEN_EXPIRY;
      const signMock = jest.fn().mockReturnValue(token);
      jest.spyOn(jwt, 'sign').mockImplementation(signMock);

      const result = authService.generateResetPasswordToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn }
      );
      expect(result).toEqual(token);
    });

    it('should throw an error when generating reset password token fails', async () => {
      const userId = 'user123';
      const errorMessage = 'Failed to generate reset password token';
      jest.spyOn(jwt, 'sign').mockImplementation(() => {
        throw new Error(errorMessage);
      });

      try {
        authService.generateResetPasswordToken(userId);
      } catch (error) {
        expect(error.message).toEqual(errorMessage);
      }
    });
  });
});
