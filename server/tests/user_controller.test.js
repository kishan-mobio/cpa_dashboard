import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app/server';
import User from '../app/models/user.model';

import { userData, updatedData } from './mocks/user.mock';

jest.mock('../app/models/user.model');

describe('User API', () => {
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

  it('should create a new user', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      ...userData,
      _id: new mongoose.Types.ObjectId(),
    });

    const response = await request(app)
      .post('/api/v1/user/create')
      .send(userData)
      .expect(200);

    expect(response.body.status).toBe(true);
    expect(response.body.data.newUser.email).toBe(userData.email);

    userId = response.body.data.newUser._id;
  });

  it('should not create a new user if email already exists', async () => {
    User.findOne.mockResolvedValue(userData);

    const response = await request(app)
      .post('/api/v1/user/create')
      .send(userData)
      .expect(400);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe(
      'User with the same email or phone number already exists.'
    );
  });

  it('should get all users', async () => {
    User.find.mockResolvedValue([
      {
        ...userData,
        _id: userId,
      },
    ]);

    const response = await request(app).get('/api/v1/user/list').expect(200);

    expect(response.body.status).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].email).toBe(userData.email);
  });

  it('should return error if fetching all users fails', async () => {
    User.find.mockRejectedValue(new Error('Error fetching users'));

    const response = await request(app).get('/api/v1/user/list').expect(500);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe('Error fetching users');
  });

  it('should get user by ID', async () => {
    User.findById.mockResolvedValue({
      ...userData,
      _id: userId,
    });

    const response = await request(app)
      .get(`/api/v1/user/${userId}`)
      .expect(200);

    expect(response.body.status).toBe(true);
    expect(response.body.data.email).toBe(userData.email);
  });

  it('should return error if user by ID is not found', async () => {
    User.findById.mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/v1/user/${userId}`)
      .expect(400);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe('User not found');
  });

  it('should update user by ID', async () => {
    User.findByIdAndUpdate.mockResolvedValue({
      ...userData,
      ...updatedData,
      _id: userId,
    });

    const response = await request(app)
      .put(`/api/v1/user/${userId}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.status).toBe(true);
    expect(response.body.data.firstName).toBe(updatedData.firstName);
    expect(response.body.data.lastName).toBe(updatedData.lastName);
  });

  it('should return error if updating user by ID fails', async () => {
    User.findByIdAndUpdate.mockRejectedValue(new Error('Error updating user'));

    const response = await request(app)
      .put(`/api/v1/user/${userId}`)
      .send(updatedData)
      .expect(500);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe('Error updating user');
  });

  it('should delete user by ID', async () => {
    User.findByIdAndDelete.mockResolvedValue({
      ...userData,
      _id: userId,
    });

    const response = await request(app)
      .delete(`/api/v1/user/${userId}`)
      .expect(200);

    expect(response.body.status).toBe(true);
    expect(response.body.message).toBe('User deleted successfully');
  });

  it('should return error if deleting user by ID fails', async () => {
    User.findByIdAndDelete.mockRejectedValue(new Error('Error deleting user'));

    const response = await request(app)
      .delete(`/api/v1/user/${userId}`)
      .expect(500);

    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe('Error deleting user');
  });
});
