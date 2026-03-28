require('./config/loadEnv');

const express = require('express');
const cors = require('cors');
const { isAdminSignupCodeConfigured } = require('./utils/adminSignupEnv');

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
// When the API itself runs on Vercel, allow any *.vercel.app frontend unless CORS_STRICT=true.
// (Otherwise production login/register fails until CORS_ORIGIN is set in the dashboard.)
const onVercel = !!(process.env.VERCEL || process.env.VERCEL_ENV);
const corsStrict = process.env.CORS_STRICT === 'true';
const autoAllowVercelFrontends = onVercel && !corsStrict;

function isVercelAppOrigin(origin) {
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (corsAllowList.includes(origin)) return callback(null, true);
      if (
        isVercelAppOrigin(origin) &&
        (allowVercelSubdomains || autoAllowVercelFrontends)
      ) {
        return callback(null, true);
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
  res.json({
    status: 'OK',
    message: 'ALU FoodShare API is running',
    checks: {
      // Helps verify Vercel env: must be true for administrator self-registration.
      adminSignupCodeConfigured: isAdminSignupCodeConfigured()
    }
  });
});

module.exports = app;
