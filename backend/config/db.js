const { Sequelize, DataTypes } = require('sequelize');
const pg = require('pg');

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: 'postgres',
  // Explicitly provide pg so Vercel bundles the postgres driver.
  dialectModule: pg,
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    throw error;
  }
};

module.exports = { sequelize, connectDB, DataTypes };