require('./config/loadEnv');

const { connectDB, sequelize } = require('./config/db');
const app = require('./app');
require('./models');

// Start server
const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();
    // Avoid destructive/fragile schema ALTERs on every boot.
    // Set DB_SYNC_ALTER=true only when intentionally evolving schema locally.
    const shouldAlter = process.env.DB_SYNC_ALTER === 'true';
    await sequelize.sync(shouldAlter ? { alter: true } : {});
    console.log('Database tables synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

start();
