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

// Comma-separated origins, e.g. "https://my-app.vercel.app,http://localhost:4200"
const corsAllowList = (process.env.CORS_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowVercelSubdomains = process.env.CORS_ALLOW_VERCEL_SUBDOMAINS === 'true';

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (corsAllowList.includes(origin)) return callback(null, true);
      if (allowVercelSubdomains) {
        try {
          const { hostname } = new URL(origin);
          if (hostname.endsWith('.vercel.app')) return callback(null, true);
        } catch {
          // ignore bad Origin
        }
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ALU FoodShare backend is running',
    health: '/api/health'
  });
});

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
