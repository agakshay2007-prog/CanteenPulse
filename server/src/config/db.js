/**
 * Database Configuration & Connection Manager
 * Manages Mongoose connection lifecycle, events, error handling, and readiness checks.
 */

const mongoose = require('mongoose');

const dbStatus = {
  connected: false,
  uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/canteenpulse',
  host: null,
  name: null,
  lastError: null,
  connectionAttempts: 0
};

// Mask sensitive credentials in URI for safe logging
function getMaskedUri(uri) {
  if (!uri) return 'undefined';
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  } catch {
    return 'protected-uri';
  }
}

// Setup Mongoose Connection Lifecycle Event Listeners
mongoose.connection.on('connected', () => {
  dbStatus.connected = true;
  dbStatus.host = mongoose.connection.host;
  dbStatus.name = mongoose.connection.name;
  dbStatus.lastError = null;
  console.log(`✅ [MongoDB Connected] Host: ${dbStatus.host} | Database: ${dbStatus.name}`);
});

mongoose.connection.on('error', (err) => {
  dbStatus.connected = false;
  dbStatus.lastError = err.message;
  console.error(`❌ [MongoDB Connection Error]`, err.message);
});

mongoose.connection.on('disconnected', () => {
  dbStatus.connected = false;
  console.warn(`⚠️  [MongoDB Disconnected] Database connection lost.`);
});

mongoose.connection.on('reconnected', () => {
  dbStatus.connected = true;
  console.log(`🔄 [MongoDB Reconnected] Successfully restored database connection.`);
});

// Graceful application shutdown
async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Closing MongoDB connection gracefully...`);
  try {
    await mongoose.connection.close(false);
    console.log('📦 MongoDB connection closed. Exiting process.');
    process.exit(0);
  } catch (err) {
    console.error('Error during database disconnection:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

/**
 * Connect to MongoDB Atlas or Local MongoDB
 * @param {string} [customUri]
 * @returns {Promise<boolean>}
 */
async function connectDB(customUri) {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/canteenpulse';
  dbStatus.uri = uri;
  dbStatus.connectionAttempts += 1;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 45000,
      autoIndex: true
    });

    dbStatus.connected = true;
    dbStatus.host = mongoose.connection.host;
    dbStatus.name = mongoose.connection.name;
    return true;
  } catch (error) {
    dbStatus.connected = false;
    dbStatus.lastError = error.message;

    console.warn(`⚠️  [MongoDB Connection Notice] Unable to connect to: ${getMaskedUri(uri)}`);
    console.warn(`   Reason: ${error.message}`);
    console.warn(`💡 [Atlas Setup Guide] Set MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/canteenpulse in your .env file.`);

    // If explicit demo mode is allowed, let the service know
    return false;
  }
}

/**
 * Check if MongoDB connection is active
 * @returns {boolean}
 */
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Get current database status summary
 */
function getDbStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const readyState = mongoose.connection.readyState;
  const isMongo = readyState === 1;
  const isAtlas = dbStatus.uri.includes('mongodb+srv://') || dbStatus.uri.includes('mongodb.net');

  return {
    connected: isMongo,
    state: states[readyState] || 'unknown',
    type: isMongo ? (isAtlas ? 'MongoDB Atlas' : 'Local MongoDB') : 'Resilient Offline Demo Mode',
    uri: getMaskedUri(dbStatus.uri),
    host: dbStatus.host || (isMongo ? mongoose.connection.host : null),
    database: dbStatus.name || (isMongo ? mongoose.connection.name : null),
    lastError: dbStatus.lastError,
    isAtlas
  };
}

/**
 * Middleware: Verify database readiness for database-dependent operations
 */
function requireDbConnection(req, res, next) {
  if (isDbConnected()) {
    return next();
  }

  // If local fallback / demo mode is active and allowed
  if (process.env.ALLOW_OFFLINE_DEMO === 'true' || !process.env.STRICT_DB) {
    req.isFallbackMode = true;
    return next();
  }

  return res.status(503).json({
    success: false,
    message: 'Database service unavailable. Please ensure MongoDB or MongoDB Atlas is running.',
    error: dbStatus.lastError || 'MongoDB disconnected'
  });
}

module.exports = {
  connectDB,
  isDbConnected,
  getDbStatus,
  requireDbConnection,
  dbStatus
};
