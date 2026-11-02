const mongoose = require('mongoose');

const dbStatus = {
  isMongo: false,
  uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/canteenpulse',
  connectionError: null
};

async function connectDB() {
  try {
    const conn = await mongoose.connect(dbStatus.uri, {
      serverSelectionTimeoutMS: 2500
    });
    dbStatus.isMongo = true;
    console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return true;
  } catch (error) {
    dbStatus.isMongo = false;
    dbStatus.connectionError = error.message;
    console.log(`⚠️  [MongoDB Notice] Could not connect to MongoDB at: ${dbStatus.uri}`);
    console.log(`📋 [Demo Fallback Mode] Resilient local file storage active in server/data/ so you can preview all features.`);
    console.log(`💡 [MongoDB Atlas Setup] To use Cloud MongoDB: set MONGODB_URI=mongodb+srv://... in your .env file.`);
    return false;
  }
}

module.exports = {
  connectDB,
  dbStatus
};

