import sequelizeConfig from '../config/sequelizeconnection.config.js';
import Role from './roles.model.js';
import User from './user.model.js';

const initDB = async () => {
  try {
    await sequelizeConfig.authenticate();
    await sequelizeConfig.sync(); // Ensure all models/tables are created
    console.log('✅ DB connection and sync successful');
  } catch (error) {
    console.error('❌ Error connecting to DB:', error);
  }
};

export { sequelizeConfig, Role, User, initDB };
