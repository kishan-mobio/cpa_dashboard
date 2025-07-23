import dotenv from 'dotenv';
dotenv.config();

const config = {
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  migrationStorage: 'sequelize',
  migrationStorageTableName: 'sequelize_meta',
  migrationsPath: 'migrations', // Directory for migration files
  seederStorage: 'sequelize',
  seederStorageTableName: 'sequelize_data',
  seedersPath: 'seeders', // Directory for seed files
  logging: false,
};

export default config;
