import { Types } from 'mongoose';

const { ObjectId } = Types;

const userData = {
  _id: new ObjectId(),
  email: 'testuser@example.com',
  phoneNumber: '1234567890',
  firstName: 'Test',
  lastName: 'User',
  password: 'Password@12345',
};

const updatedData = {
  firstName: 'Updated',
  lastName: 'User',
};

const validUser = {
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '1234567890',
  password: 'Password@123',
  _id: new ObjectId(),
};

const loginUser = {
  email: 'test@example.com',
  password: 'Password@123',
};

const existingUser = {
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '1234567890',
  password: 'Password@123',
  _id: '123',
};

const invalidUserCredentials = {
  email: 'invalid@example.com',
  phoneNumber: '0987654321',
  password: 'Invalidpassword',
};

const resetPasswordData = {
  token: 'fake-reset-token',
  newPassword: 'New@password123',
  confirmPassword: 'New@password123',
};

const mismatchedPasswordsData = {
  token: 'fake-reset-token',
  newPassword: 'New@password123',
  confirmPassword: 'Different@password123',
};

const expiredTokenData = {
  token: 'expired-reset-token',
  newPassword: 'New@password123',
  confirmPassword: 'New@password123',
  expires: Date.now() - 3600000,
};

const logData = {
  userId: new ObjectId(),
  action: 'login',
  successful: true,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  ipAddress: '192.168.0.1',
};

const profileUser = {
  _id: new ObjectId(),
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '1234567890',
};

const updatedProfileUser = {
  _id: profileUser._id,
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  phoneNumber: '1234567890',
};

export {
  userData,
  validUser,
  loginUser,
  existingUser,
  updatedData,
  invalidUserCredentials,
  resetPasswordData,
  mismatchedPasswordsData,
  expiredTokenData,
  logData,
  profileUser,
  updatedProfileUser,
};
