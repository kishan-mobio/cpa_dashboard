import mongoose from 'mongoose';
import '../app/config/db.config.js';
import Role from '../app/models/roles.model.js';
import logger from '../app/config/logger.config.js';

// Define roles to insert with additional fields
const roles = [
  {
    roleName: 'admin',
    description: 'Administrator role',
    createdBy: null,
    updatedBy: null,
  },
  {
    roleName: 'employee',
    description: 'Employee role',
    createdBy: null,
    updatedBy: null,
  },
];

// Function to seed roles
const seedRoles = async () => {
  try {
    // Wait for MongoDB to connect
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Insert roles if they don't already exist
    for (const role of roles) {
      const existingRole = await Role.findOne({ roleName: role.roleName });
      if (!existingRole) {
        await Role.create(role);
        logger.info(`Role ${role.roleName} inserted successfully`);
      } else {
        logger.info(`Role ${role.roleName} already exists`);
      }
    }
  } catch (error) {
    logger.error('Error inserting roles:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding function
seedRoles();
