const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const communityRoutes = require('./routes/communityRoutes');
const FoodRequestRoutes = require('./routes/FoodRequestRoutes');
const NotificationRoutes = require('./routes/NotificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4200', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/requests', FoodRequestRoutes);
app.use('/api/notifications', NotificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ALU FoodShare API is running' });
});

module.exports = app;
