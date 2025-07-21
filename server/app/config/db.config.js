// server.js

import 'dotenv/config';
import { CONSTANTS } from '../utils/constants.utils.js';

// Dynamically import the db configuration based on the DB_TYPE environment variable
import(`./${process.env.DB_TYPE}.config.js`)
  .then((db) => {
    db.connectDB();
  })
  .catch((error) => {
    console.error(CONSTANTS.DB.ERROR_LOADING_CONFIG, error);
  });
