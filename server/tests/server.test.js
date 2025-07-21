import mongoose from 'mongoose';
import { connectDB } from '../app/config/mongodb.config';

jest.mock('mongoose');

describe('Server Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the database', async () => {
    mongoose.connect.mockResolvedValueOnce(true);
    await connectDB();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.TEST_DB_URL);
  });

  it('should fail to connect to the database', async () => {
    const errorMessage = 'Connection failed';
    mongoose.connect.mockRejectedValueOnce(new Error(errorMessage));
    try {
      await connectDB();
    } catch (error) {
      expect(error.message).toBe(errorMessage);
    }
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.TEST_DB_URL);
  });
});
