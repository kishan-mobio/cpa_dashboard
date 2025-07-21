import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { app } from '../app/server';
import User from '../app/models/user.model';
import * as status from '../app/utils/status_code.utils';
import * as constants from '../app/utils/constants.utils';
import { createToken } from '../app/middleware/auth.middleware';

import {
  validUser,
  existingUser,
  loginUser,
  invalidUserCredentials,
  resetPasswordData,
  mismatchedPasswordsData,
  expiredTokenData,
  profileUser,
  updatedProfileUser,
} from './mocks/user.mock';
jest.mock('../app/models/user.model');
jest.mock('bcryptjs');
jest.mock('../app/middleware/auth.middleware');

describe('Auth Controller', () => {
  let userId;

  beforeAll(async () => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should sign up a new user successfully', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      ...validUser,
      _id: new mongoose.Types.ObjectId(),
    });

    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send(validUser)
      .expect(status.STATUS_CODE_SUCCESS);

    expect(response.body.status).toBe(true);
    expect(response.body.data.newUser.email).toBe(validUser.email);
    expect(response.body.message).toBe(constants.SIGNUP_SUCCESSFULLY);

    userId = response.body.data.newUser._id;
  });

  it('should return an error if the user already exists', async () => {
    User.findOne.mockResolvedValue(existingUser);

    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send(existingUser)
      .expect(status.STATUS_CODE_BAD_REQUEST);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.USER_ALREADY_EXISTS_ERROR);
  });

  it('should log in a user successfully', async () => {
    User.findOne.mockResolvedValue(loginUser);
    bcrypt.compare.mockResolvedValue(true);
    createToken.mockReturnValue('fake-jwt-token');

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(loginUser)
      .expect(status.STATUS_CODE_SUCCESS);

    expect(response.body.status).toBe(true);
    expect(response.body.data.token).toBe('fake-jwt-token');
  }, 10000);

  it('should return an error if the user already exists', async () => {
    User.findOne.mockResolvedValue(existingUser);

    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send(existingUser)
      .expect(status.STATUS_CODE_BAD_REQUEST);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.USER_ALREADY_EXISTS_ERROR);
  });

  it('should return an error if the user does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(invalidUserCredentials)
      .expect(status.STATUS_CODE_BAD_REQUEST);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.USER_DOES_NOT_EXIST);
  }, 10000);

  it('should return an error if the password is incorrect', async () => {
    User.findOne.mockResolvedValue(validUser);
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ ...validUser, password: 'incorrectpassword' })
      .expect(status.STATUS_CODE_BAD_REQUEST);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.PASSWORD_INCORRECT);
  }, 10000);

  it('should send a reset password email if the user exists', async () => {
    User.findOne.mockResolvedValue(validUser);

    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: validUser.email })
      .expect(status.STATUS_CODE_SUCCESS);

    expect(response.body.status).toBe(true);
    expect(response.body.message).toBe(constants.PASSWORD_RESET_EMAIL_SENT);
  });

  it('should return an error if the user does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' })
      .expect(status.STATUS_CODE_BAD_REQUEST);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.USER_DOES_NOT_EXIST);
  });

  it('should return an error if an error occurs during processing', async () => {
    User.findOne.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'test@example.com' })
      .expect(status.STATUS_CODE_INTERNAL_SERVER_STATUS);

    expect(response.body.status).toBe(false);
  });

  it('should reset password successfully if token is valid and passwords match', async () => {
    User.findOne.mockResolvedValue({
      _id: 'fake-user-id',
      resetPasswordExpires: Date.now() + 3600000,
    });
    bcrypt.hash.mockResolvedValue('hashedPassword');

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send(resetPasswordData);

    console.log('Reset password response:', response.body);
    console.log('Reset password status code:', response.status);
    // Asserting the response status code
    expect(response.status).toBe(status.STATUS_CODE_SUCCESS);

    // Asserting the response body
    expect(response.body.status).toBe(true);
    expect(response.body.message).toBe(constants.PASSWORD_RESET_SUCCESSFULLY);
  });

  it('should return an error if newPassword and confirmPassword do not match', async () => {
    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send(mismatchedPasswordsData)
      .expect(status.STATUS_CODE_BAD_REQUEST);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(
      constants.PASSWORD_CONFIRM_PASSWORD_MISMATCH
    );
  });

  it('should return an error if the reset password token has expired', async () => {
    User.findOne.mockResolvedValue({
      _id: 'fake-user-id',
      resetPasswordExpires: Date.now() - 3600000,
    });

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send(expiredTokenData)
      .expect(status.STATUS_CODE_BAD_REQUEST);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.RESET_PASSWORD_TOKEN_EXPIRED);
  });

  it('should return an error if the reset password token is invalid', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send(resetPasswordData)
      .expect(status.STATUS_CODE_BAD_REQUEST);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.INVALID_RESET_TOKEN);
  });

  it('should return an error if an error occurs during processing', async () => {
    User.findOne.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send(resetPasswordData)
      .expect(status.STATUS_CODE_INTERNAL_SERVER_STATUS);

    expect(response.body.status).toBe(false);
  });

  it('should get user profile by ID successfully', async () => {
    // Mocking the User.findById call
    User.findById.mockResolvedValue(profileUser);

    // Performing the request and expecting a response
    const response = await request(app)
      .get(`/api/v1/auth/${profileUser._id}`)
      .expect(status.STATUS_CODE_SUCCESS);
    // Assertions on the response
    expect(response.body.status).toBe(true);
    expect(response.body.data).toEqual(profileUser);
  }, 10000);

  it('should return an error if the user profile does not exist', async () => {
    User.findById.mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/v1/auth/${new mongoose.Types.ObjectId()}`)
      .expect(status.STATUS_CODE_BAD_REQUEST);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.USER_NOT_FOUND);
  });

  it('should update user profile successfully', async () => {
    User.findById.mockResolvedValue(existingUser);
    User.findOne.mockResolvedValue(null);
    User.findByIdAndUpdate.mockResolvedValue(updatedProfileUser);
    bcrypt.hash.mockResolvedValue('hashedPassword');

    const response = await request(app)
      .put(`/api/v1/auth/${userId}`)
      .send({ ...updatedProfileUser, password: 'newpassword' })
      .expect(status.STATUS_CODE_SUCCESS);

    expect(response.body.status).toBe(true);
    expect(response.body.data).toEqual(updatedProfileUser);
    expect(response.body.message).toBe(constants.PROFILE_UPDATED_SUCCESSFULLY);
  });

  it('should return an error if another user with the same email or phone number exists', async () => {
    User.findOne.mockResolvedValue(existingUser);

    const response = await request(app)
      .put(`/api/v1/auth/${userId}`)
      .send({ ...updatedProfileUser, email: existingUser.email })
      .expect(status.STATUS_CODE_BAD_REQUEST);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.USER_ALREADY_EXISTS_ERROR);
  });

  it('should return an error if the user profile to update does not exist', async () => {
    User.findById.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/v1/auth/${new mongoose.Types.ObjectId()}`)
      .send(updatedProfileUser)
      .expect(status.STATUS_CODE_BAD_REQUEST);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.USER_NOT_FOUND);
  });

  it('should return an error if an error occurs during profile fetching', async () => {
    User.findById.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get(`/api/v1/auth/${userId}`)
      .expect(status.STATUS_CODE_INTERNAL_SERVER_STATUS);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.INTERNAL_SERVER_ERROR);
  });

  it('should return an error if an error occurs during profile updating', async () => {
    User.findById.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .put(`/api/v1/auth/${userId}`)
      .send(updatedProfileUser)
      .expect(status.STATUS_CODE_INTERNAL_SERVER_STATUS);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(constants.INTERNAL_SERVER_ERROR);
  });
});
