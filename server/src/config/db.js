/**
 * Database Configuration & MongoDB Atlas Connection Manager
 * Manages Mongoose connection lifecycle, event logging, credential masking,
 * error handling, and database readiness checks.
 */

const path = require('path');
// Ensure root .env is loaded regardless of how this file is imported
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config();

const mongoose = require('mongoose');

// Mask sensitive credentials in URI for safe terminal and health logging
function getMaskedUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return 'not_configured';
  try {
    return rawUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  } catch {
    return 'protected_uri';
  }
}

// Check if URI is still an unconfigured placeholder
function isPlaceholderUri(uri) {
  if (!uri) return true;
  return (
    uri.includes('<username>') ||
    uri.includes('<password>') ||
    uri.includes('<cluster-url>') ||
    uri.includes('username:password')
  );
}

const dbStatus = {
  uri: process.env.MONGODB_URI || '',
  host: null,
  name: null,
  lastError: null,
  connectionAttempts: 0,
  // Dynamic getters tied directly to Mongoose connection readyState
  get connected() {
    return mongoose.connection.readyState === 1;
  },
  get isMongo() {
    return mongoose.connection.readyState === 1;
  }
};

// ================= MONGOOSE EVENT LISTENERS =================
mongoose.connection.on('connected', () => {
  dbStatus.host = mongoose.connection.host;
  dbStatus.name = mongoose.connection.name;
  dbStatus.lastError = null;
  console.log('----------------------------------------------------');
  console.log(`✅ [MongoDB Atlas Connected]`);
  console.log(`   Host:     ${dbStatus.host}`);
  console.log(`   Database: ${dbStatus.name}`);
  console.log(`   Cluster:  ${dbStatus.host}`);
  console.log('----------------------------------------------------');
});

mongoose.connection.on('error', (err) => {
  dbStatus.lastError = err.message;
  console.error(`❌ [MongoDB Connection Error]`, err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn(`⚠️  [MongoDB Disconnected] Database connection closed.`);
});

mongoose.connection.on('reconnected', () => {
  dbStatus.lastError = null;
  console.log(`🔄 [MongoDB Reconnected] Successfully restored database connection.`);
});

// Graceful application shutdown
async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Closing MongoDB connection gracefully...`);
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
      console.log('📦 MongoDB connection closed. Exiting process.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error during database disconnection:', err.message);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

/**
 * Connect to MongoDB Atlas
 * @param {string} [customUri]
 * @returns {Promise<boolean>}
 */
async function connectDB(customUri) {
  const uri = customUri || process.env.MONGODB_URI || '';
  dbStatus.uri = uri;
  dbStatus.connectionAttempts += 1;

  // 1. Guard against unconfigured or placeholder credentials
  if (!uri || isPlaceholderUri(uri)) {
    console.warn('\n╔══════════════════════════════════════════════════════════════════════╗');
    console.warn('║              🌿 CANTEENPULSE - MONGODB ATLAS SETUP GUIDE             ║');
    console.warn('╠══════════════════════════════════════════════════════════════════════╣');
    console.warn('║  Your .env file requires your real MongoDB Atlas connection string.  ║');
    console.warn('║                                                                      ║');
    console.warn('║  👉 Step 1: Open C:\\Canteenplus\\.env                                  ║');
    console.warn('║  👉 Step 2: Set your Atlas URI:                                      ║');
    console.warn('║     MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xyz.mongodb.net/canteenpulse?retryWrites=true&w=majority ║');
    console.warn('║                                                                      ║');
    console.warn('║  Status: Resilient Demo Mode is active until Atlas credentials       ║');
    console.warn('║          are saved in your local .env file.                          ║');
    console.warn('╚══════════════════════════════════════════════════════════════════════╝\n');
    dbStatus.lastError = 'MongoDB Atlas URI not configured or contains placeholder';
    return false;
  }

  // 2. Attempt real MongoDB connection
  try {
    console.log(`⏳ Connecting to MongoDB Atlas: ${getMaskedUri(uri)} ...`);
    await mongoose.connect(uri, {
      dbName: 'canteenpulse', // Enforce 'canteenpulse' database
      serverSelectionTimeoutMS: 5000, // 5s timeout to avoid blocking server boot
      socketTimeoutMS: 45000,
      autoIndex: true
    });

    dbStatus.host = mongoose.connection.host;
    dbStatus.name = mongoose.connection.name;
    dbStatus.lastError = null;
    return true;
  } catch (error) {
    dbStatus.lastError = error.message;

    console.warn(`\n⚠️  [MongoDB Atlas Connection Notice]`);
    console.warn(`   Target: ${getMaskedUri(uri)}`);
    console.warn(`   Reason: ${error.message}`);
    console.warn(`💡 [Troubleshooting Checklist]:`);
    console.warn(`   1. Check username and password in .env (special chars must be URL-encoded).`);
    console.warn(`   2. In MongoDB Atlas Network Access, ensure IP 0.0.0.0/0 (allow from anywhere) is whitelisted.`);
    console.warn(`   3. Ensure Database Name is 'canteenpulse'.`);
    console.warn(`   Application will operate in Resilient Demo Mode until Atlas is connected.\n`);

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
 * Get current database status summary (for /api/health and stats)
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
  const isAtlas =
    dbStatus.uri.startsWith('mongodb+srv://') ||
    dbStatus.uri.includes('.mongodb.net');

  let dbType = 'Resilient Offline Demo Mode';
  if (isMongo) {
    dbType = isAtlas ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB';
  }

  return {
    connected: isMongo,
    state: states[readyState] || 'disconnected',
    type: dbType,
    database: isMongo ? (mongoose.connection.name || 'canteenpulse') : 'canteenpulse (local)',
    host: isMongo ? mongoose.connection.host : null,
    uri: getMaskedUri(dbStatus.uri),
    isAtlas,
    lastError: isMongo ? null : dbStatus.lastError
  };
}

/**
 * Middleware: Verify database readiness for database-dependent operations
 */
function requireDbConnection(req, res, next) {
  if (isDbConnected()) {
    return next();
  }

  if (process.env.STRICT_DB === 'true') {
    return res.status(503).json({
      success: false,
      message: 'MongoDB Atlas is not currently connected. Please configure MONGODB_URI in .env.',
      error: dbStatus.lastError || 'Database disconnected'
    });
  }

  req.isFallbackMode = true;
  next();
}

module.exports = {
  connectDB,
  isDbConnected,
  getDbStatus,
  requireDbConnection,
  getMaskedUri,
  dbStatus
};
