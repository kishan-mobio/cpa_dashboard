import mongoose from 'mongoose';
import User from '../app/models/user.model';
import * as userService from '../app/services/user.service';
import { userData, updatedData } from './mocks/user.mock';

jest.mock('../app/models/user.model');

describe('User Service', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should fetch all users', async () => {
      User.find.mockResolvedValue([userData]);

      const users = await userService.getAllUsers();

      expect(User.find).toHaveBeenCalled();
      expect(users).toEqual([userData]);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Error fetching users';
      User.find.mockRejectedValue(new Error(errorMessage));

      await expect(userService.getAllUsers()).rejects.toThrow(errorMessage);
    });
  });

  describe('getUserById', () => {
    it('should fetch a user by ID', async () => {
      User.findById.mockResolvedValue(userData);

      const user = await userService.getUserById(userId);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(user).toEqual(userData);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Error fetching user by ID';
      User.findById.mockRejectedValue(new Error(errorMessage));

      await expect(userService.getUserById(userId)).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user by ID', async () => {
      User.findByIdAndUpdate.mockResolvedValue({ ...userData, ...updatedData });

      const updatedUser = await userService.updateUser(userId, updatedData);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, updatedData, {
        new: true,
      });
      expect(updatedUser).toEqual({ ...userData, ...updatedData });
    });

    it('should handle errors', async () => {
      const errorMessage = 'Error updating user';
      User.findByIdAndUpdate.mockRejectedValue(new Error(errorMessage));

      await expect(userService.updateUser(userId, {})).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      User.findByIdAndDelete.mockResolvedValue(userData);

      const deletedUser = await userService.deleteUser(userId);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(deletedUser).toEqual(userData);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Error deleting user';
      User.findByIdAndDelete.mockRejectedValue(new Error(errorMessage));

      await expect(userService.deleteUser(userId)).rejects.toThrow(
        errorMessage
      );
    });
  });
});
