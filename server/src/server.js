const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config(); // Local server/.env fallback

const { connectDB, dbStatus, getDbStatus } = require('./config/db');
const dataService = require('./services/dataService');
const securityHeaders = require('./middleware/securityHeaders');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route Handlers
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const crowdRoutes = require('./routes/crowdRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers Middleware
app.use(securityHeaders);

// CORS configuration
app.use(cors());

// Body Parsers with 1MB Payload Limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// General API Rate Limiter
app.use('/api', generalLimiter);

// Comprehensive System Health Endpoint
app.get('/api/health', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'online',
    app: 'CanteenPulse',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024)
    },
    database: getDbStatus()
  });
});

// REST API Endpoints
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Unmatched /api routes return structured 404 JSON instead of HTML
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Serve built React client in production if client/dist exists
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) {
        res.status(200).send(`
          <html>
            <head><title>CanteenPulse API Server</title></head>
            <body style="font-family: system-ui, sans-serif; padding: 40px; text-align: center; background: #FAF9F6; color: #166534;">
              <h2>🌿 CanteenPulse Backend API Server Active</h2>
              <p>Backend REST API running on port ${PORT}.</p>
              <p>Run <code>npm run dev</code> or <code>cd client && npm run dev</code> to start the React + Vite frontend.</p>
              <p><a href="/api/health" style="color: #15803D; font-weight: bold;">Check Health Status &rarr;</a></p>
            </body>
          </html>
        `);
      }
    });
  }
  next();
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Production pre-flight environment security validator
function validateProductionEnv() {
  if (process.env.NODE_ENV === 'production') {
    const missing = [];
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('<username>') || uri.includes('<password>') || uri.includes('<cluster-url>')) {
      missing.push('MONGODB_URI (Valid MongoDB Atlas connection string required in production)');
    }
    const passcode = process.env.ADMIN_PASSCODE;
    if (!passcode || passcode === 'admin123') {
      missing.push('ADMIN_PASSCODE (Strong environment-based admin passcode required; default demo passcode rejected in production)');
    }
    const secret = process.env.ADMIN_SECRET;
    if (!secret || secret === 'canteenpulse_secure_admin_hmac_secret_2026' || secret === 'canteenpulse_secret_key_2026') {
      missing.push('ADMIN_SECRET (Strong environment-based HMAC secret key required in production)');
    }

    if (missing.length > 0) {
      console.error('\n🚨 [FATAL CONFIGURATION ERROR - PRODUCTION STARTUP ABORTED]');
      console.error('The application cannot start in production mode because the following required environment variables are missing or insecure:');
      missing.forEach((err) => console.error(`  ❌ ${err}`));
      console.error('\nPlease configure these environment variables securely in your hosting dashboard (e.g. Render Environment settings).\n');
      process.exit(1);
    }
  }
}

// Boot function
async function startServer() {
  validateProductionEnv();
  const dbConnected = await connectDB();

  if (process.env.NODE_ENV === 'production' && !dbConnected) {
    console.error('🚨 [FATAL ERROR] MongoDB Atlas connection failed in production mode. Aborting startup.');
    process.exit(1);
  }

  await dataService.initializeData();

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`🚀 CanteenPulse Server running on http://0.0.0.0:${PORT}`);
      console.log(`🩺 Health check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`📦 Database State: ${dbStatus.isMongo ? 'MongoDB Atlas Connected' : 'Resilient Demo Mode'}`);
      console.log('====================================================');
    });
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
