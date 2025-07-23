import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    use_env_variable: 'PG_URI',
    dialect: 'postgres'
  },
  test: {
    use_env_variable: 'PG_URI',
    dialect: 'postgres'
  },
  production: {
    use_env_variable: 'PG_URI',
    dialect: 'postgres'
  }
};