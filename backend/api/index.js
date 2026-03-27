const app = require('../app');
require('../models');
const { connectDB } = require('../config/db');

let dbInitPromise;

const ensureDatabaseConnection = async () => {
  if (!dbInitPromise) {
    dbInitPromise = connectDB().catch((error) => {
      dbInitPromise = undefined;
      throw error;
    });
  }
  return dbInitPromise;
};

module.exports = async (req, res) => {
  try {
    await ensureDatabaseConnection();
    return app(req, res);
  } catch (error) {
    console.error(`Serverless initialization failed: ${error.message}`);
    return res.status(500).json({
      message: 'Backend initialization failed',
      error: error.message
    });
  }
};
