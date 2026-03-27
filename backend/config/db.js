// const { Sequelize, DataTypes } = require('sequelize');

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'postgres',
//     logging: false
//   }
// );

// const connectDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('PostgreSQL Connected');
//   } catch (error) {
//     console.error(`Database connection error: ${error.message}`);
//     throw error;
//   }
// };

// module.exports = { sequelize, connectDB, DataTypes };


const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: 'postgres',
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