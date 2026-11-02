const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config(); // Local server/.env fallback

const { connectDB, dbStatus } = require('./config/db');
const dataService = require('./services/dataService');
const errorHandler = require('./middleware/errorHandler');

// Route Handlers
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const crowdRoutes = require('./routes/crowdRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// System Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'CanteenPulse',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: {
      type: dbStatus.isMongo ? 'MongoDB' : 'Demo Mode (Resilient Local Persistence)',
      connected: dbStatus.isMongo,
      uri: dbStatus.isMongo ? 'Protected URI' : 'Local Fallback'
    }
  });
});

// REST API Endpoints
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Serve built React client in production if client/dist exists
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) {
        // If client hasn't been built yet, show informative development message
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

// Boot function
async function startServer() {
  await connectDB();
  await dataService.initializeData();

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 CanteenPulse Server running on http://localhost:${PORT}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📦 Database: ${dbStatus.isMongo ? 'MongoDB' : 'Demo Local Mode (Atlas Not Configured)'}`);
      console.log('====================================================');
    });
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;

