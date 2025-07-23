import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize';

// const sequelizeConfig = new Sequelize(
//   'CPA-Test',
//   'postgres',
//   'kp-mobio',
//   {
//     host: 'localhost',
//     port: process.env.POSTGRES_PORT || 5432,
//     dialect: 'postgres',
//     logging: false,
//   }
// );

const sequelizeConfig = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);
console.log('Sequelize DB password from env:', process.env.POSTGRES_PASSWORD);
export default sequelizeConfig;
