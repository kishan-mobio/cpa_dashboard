import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

// Use PG_URI from environment variables, fallback to a default if not set
const connectionString = process.env.PG_URI;
const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false, // or true for SQL logs
});

export default sequelize;
