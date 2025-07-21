import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../app/models/roles.model.js';
import logger from '../app/config/logger.config.js';

// Load environment variables from .env file
dotenv.config();

const adminId = '6672837e1f5a4d9c11bf0baa';

// Retrieve MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

const updateRoles = async () => {
  try {
    await mongoose.connect(uri, {
      connectTimeoutMS: 30000,
    });

    // Update roles
    const updatedRoles = await Role.updateMany(
      {},
      {
        $set: {
          createdBy: adminId,
          updatedBy: adminId,
        },
      }
    );

    logger.info(`Updated ${updatedRoles.nModified} roles successfully.`);
  } catch (error) {
    logger.error('Error updating roles:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding function
updateRoles();
