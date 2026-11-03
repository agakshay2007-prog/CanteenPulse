const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const { connectDB, isDbConnected, getDbStatus, getMaskedUri } = require('../src/config/db');
const MenuItem = require('../src/models/MenuItem');
const Order = require('../src/models/Order');
const CrowdFeedback = require('../src/models/CrowdFeedback');
const FoodReview = require('../src/models/FoodReview');
const dataService = require('../src/services/dataService');

async function testAtlas() {
  console.log('1. Attempting MongoDB Atlas Connection...');
  const connected = await connectDB();
  const status = getDbStatus();

  console.log(' - Connection Successful:', connected);
  console.log(' - readyState:', mongoose.connection.readyState);
  console.log(' - Target Host:', status.host);
  console.log(' - Target Database:', mongoose.connection.name);
  console.log(' - Target URI (Masked):', status.uri);
  console.log(' - Last Error:', status.lastError);

  if (!connected || mongoose.connection.readyState !== 1) {
    console.error('FATAL: Could not connect to MongoDB Atlas.');
    process.exit(1);
  }

  console.log('\n2. Initializing & Verifying Collections in MongoDB Atlas...');
  await dataService.initializeData();

  const collections = await mongoose.connection.db.listCollections().toArray();
  const colNames = collections.map(c => c.name);
  console.log(' - Detected Collections in Database:', colNames);

  const menuCount = await MenuItem.countDocuments();
  const orderCount = await Order.countDocuments();
  const crowdCount = await CrowdFeedback.countDocuments();
  const reviewCount = await FoodReview.countDocuments();

  console.log(' - Collection document counts:');
  console.log('   * menuitems:      ', menuCount);
  console.log('   * orders:         ', orderCount);
  console.log('   * crowdfeedbacks: ', crowdCount);
  console.log('   * foodreviews:    ', reviewCount);

  console.log('\n3. Testing Database Read Operations...');
  const firstDish = await MenuItem.findOne();
  console.log(' - Read success: Found dish:', firstDish ? firstDish.name : 'none');

  console.log('\n4. Testing Database Write Operations (Safe non-destructive probe)...');
  const probeReview = new FoodReview({
    dishName: firstDish ? firstDish.name : 'Atlas Probe Dish',
    studentName: 'Atlas Verification System',
    rating: 5,
    comment: 'Atlas read-write connectivity probe',
    menuItem: firstDish ? firstDish._id : null
  });
  const saved = await probeReview.save();
  console.log(' - Write success: Created document with ID:', saved._id);

  const readBack = await FoodReview.findById(saved._id);
  console.log(' - Read-back verification:', readBack && readBack._id.toString() === saved._id.toString() ? 'CONFIRMED' : 'FAILED');

  await mongoose.connection.close();
  console.log('\nMongoDB Atlas Direct Verification PASSED.');
}

testAtlas().catch(err => {
  console.error('Atlas Test Exception:', err.message);
  process.exit(1);
});
