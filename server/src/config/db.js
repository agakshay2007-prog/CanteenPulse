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

// Automatically sanitize common user input mistakes in MongoDB Atlas URI
// E.g., accidental outer angle brackets <password>, quotes, whitespace, or unencoded characters
function sanitizeAtlasUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;

  // 1. Clean accidental surrounding quotes and whitespace from copy-pasting in dashboards
  let uri = rawUri.trim();
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }

  if (!uri.startsWith('mongodb')) return uri;

  try {
    const protoIndex = uri.indexOf('://');
    const proto = uri.slice(0, protoIndex + 3);
    const rest = uri.slice(protoIndex + 3);

    const firstColon = rest.indexOf(':');
    const lastAt = rest.lastIndexOf('@');

    if (firstColon !== -1 && lastAt !== -1 && firstColon < lastAt) {
      let user = rest.slice(0, firstColon);
      let pass = rest.slice(firstColon + 1, lastAt);
      let hostAndParams = rest.slice(lastAt + 1);

      // Strip accidental outer < and >
      if (user.startsWith('<') && user.endsWith('>') && user.length > 2) {
        user = user.slice(1, -1);
      }
      if (pass.startsWith('<') && pass.endsWith('>') && pass.length > 2) {
        pass = pass.slice(1, -1);
      }

      // Safe URL encoding: idempotent decode then encode
      try {
        user = encodeURIComponent(decodeURIComponent(user));
        pass = encodeURIComponent(decodeURIComponent(pass));
      } catch {
        // Fallback for isolated encoding characters
        pass = pass.replace(/@/g, '%40').replace(/#/g, '%23').replace(/\+/g, '%2B');
      }

      // Ensure database name is explicitly 'canteenpulse' in the connection path
      const slashIndex = hostAndParams.indexOf('/');
      if (slashIndex === -1) {
        hostAndParams = `${hostAndParams}/canteenpulse?retryWrites=true&w=majority`;
      } else {
        const host = hostAndParams.slice(0, slashIndex);
        const pathAndQuery = hostAndParams.slice(slashIndex + 1);
        const qIndex = pathAndQuery.indexOf('?');
        const query = qIndex !== -1 ? pathAndQuery.slice(qIndex) : '?retryWrites=true&w=majority';
        const currentDb = qIndex !== -1 ? pathAndQuery.slice(0, qIndex) : pathAndQuery;

        if (!currentDb || currentDb === 'test' || currentDb === 'myFirstDatabase') {
          hostAndParams = `${host}/canteenpulse${query}`;
        }
      }

      return `${proto}${user}:${pass}@${hostAndParams}`;
    }
  } catch {
    return rawUri;
  }
  return uri;
}

// Categorize MongoDB connection errors into safe, actionable diagnostic buckets
function categorizeMongoError(err) {
  const msg = (err && err.message) || '';
  const name = (err && err.name) || '';
  const code = (err && err.code) || '';

  // 1. IP Access Denied / Firewall / Whitelist / Network Timeout
  if (
    msg.includes('connection <monitor> to') ||
    msg.includes('closed') ||
    msg.includes('timed out') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ECONNREFUSED') ||
    name === 'MongoServerSelectionError' ||
    name === 'MongoTimeoutError'
  ) {
    return {
      category: 'IP_ACCESS_DENIED_OR_NETWORK_TIMEOUT',
      summary: 'Connection timed out or was rejected by the MongoDB Atlas cluster firewall.',
      recommendedAction: 'In MongoDB Atlas -> Network Access, add IP address 0.0.0.0/0 (Allow Access from Anywhere). Render uses dynamic cloud IPs that change with each deploy.'
    };
  }

  // 2. Authentication Failure
  if (
    msg.includes('bad auth') ||
    msg.includes('authentication failed') ||
    msg.includes('auth error') ||
    code === 8000
  ) {
    return {
      category: 'AUTHENTICATION_FAILED',
      summary: 'MongoDB Atlas rejected database user credentials.',
      recommendedAction: 'In Render Dashboard -> Environment, verify MONGODB_URI. In Atlas -> Database Access, ensure the user exists and has readWrite role on the canteenpulse database.'
    };
  }

  // 3. DNS / Host Resolution
  if (
    msg.includes('ENOTFOUND') ||
    msg.includes('querySrv') ||
    msg.includes('queryTxt') ||
    msg.includes('EAI_AGAIN')
  ) {
    return {
      category: 'DNS_RESOLUTION_FAILURE',
      summary: 'Could not resolve the MongoDB Atlas cluster hostname.',
      recommendedAction: 'Check the cluster domain in MONGODB_URI (e.g. cluster0.xxxx.mongodb.net). Ensure there are no typos, whitespace, or accidental quotes.'
    };
  }

  // 4. Invalid URI format / Scheme
  if (
    msg.includes('Invalid scheme') ||
    msg.includes('Invalid connection string') ||
    msg.includes('ERR_INVALID_URL')
  ) {
    return {
      category: 'INVALID_URI_FORMAT',
      summary: 'The MongoDB URI format is malformed.',
      recommendedAction: 'Ensure MONGODB_URI begins with mongodb+srv:// without surrounding quotes or unmatched angle brackets.'
    };
  }

  return {
    category: 'GENERAL_CONNECTION_ERROR',
    summary: 'Mongoose connection failed with driver notice.',
    recommendedAction: 'Verify that the MongoDB Atlas cluster is active, accessible, and not paused.'
  };
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
  const raw = customUri || process.env.MONGODB_URI || '';
  const uri = sanitizeAtlasUri(raw);
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
      serverSelectionTimeoutMS: 15000, // 15s timeout for resilient cloud handshake
      socketTimeoutMS: 45000,
      autoIndex: true
    });

    dbStatus.host = mongoose.connection.host;
    dbStatus.name = mongoose.connection.name;
    dbStatus.lastError = null;
    return true;
  } catch (error) {
    const errorCategory = categorizeMongoError(error);
    dbStatus.lastError = `${errorCategory.category}: ${error.message}`;

    console.error('\n╔══════════════════════════════════════════════════════════════════════╗');
    console.error('║               ❌ MONGODB ATLAS CONNECTION FAILURE                    ║');
    console.error('╠══════════════════════════════════════════════════════════════════════╣');
    console.error(`║ Category: ${errorCategory.category}`);
    console.error(`║ Target:   ${getMaskedUri(uri)}`);
    console.error(`║ Database: canteenpulse (enforced)`);
    console.error(`║ Detail:   ${error.message}`);
    console.error('╠══════════════════════════════════════════════════════════════════════╣');
    console.error(`║ Action Required:                                                     ║`);
    console.error(`║ 1. ${errorCategory.recommendedAction}`);
    console.error('╚══════════════════════════════════════════════════════════════════════╝\n');

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
