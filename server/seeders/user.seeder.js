import mongoose from 'mongoose';
import '../app/config/db.config.js';
import User from '../app/models/user.model.js';
import Role from '../app/models/roles.model.js';
import logger from '../app/config/logger.config.js';
import { hashPassword } from '../app/utils/password.utils.js';

// Function to seed users
const seedUsers = async () => {
  try {
    // Wait for MongoDB to connect
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Find roles for admin and employee
    const adminRole = await Role.findOne({ roleName: 'admin' });
    const employeeRole = await Role.findOne({ roleName: 'employee' });

    // Ensure roles exist
    if (!adminRole || !employeeRole) {
      logger.error('Admin or employee role not found.');
      return;
    }

    // Generate hashed passwords
    const adminPassword = await hashPassword('Admin@12345');
    const employeePassword = await hashPassword('Employee@12345');

    // Insert users if they don't already exist
    await User.create([
      {
        email: 'admin@example.com',
        phoneNumber: '1234567890',
        firstName: 'Kiran',
        lastName: 'Kumar',
        password: adminPassword,
        roleId: '667283443756e17db0bf9b09',
      },
      {
        email: 'employee@example.com',
        phoneNumber: '9876543210',
        firstName: 'Neel',
        lastName: 'Mehta',
        password: employeePassword,
        roleId: '667283443756e17db0bf9b0d',
      },
    ]);

    logger.info('Users inserted successfully.');
  } catch (error) {
    logger.error('Error inserting users:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding function
seedUsers();
