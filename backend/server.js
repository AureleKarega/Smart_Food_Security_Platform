const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, sequelize } = require('./config/db');
const { User, FoodListing, CommunityPost, Comment } = require('./models');

const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const communityRoutes = require('./routes/communityRoutes');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/community', communityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ALU FoodShare API is running' });
});

// Start server
const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });
  console.log('Database tables synced');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
