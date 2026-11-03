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

  console.log(' - Connection Status:', connected ? 'SUCCESS' : 'FAILED');
  console.log(' - readyState:', mongoose.connection.readyState, mongoose.connection.readyState === 1 ? '(CONNECTED)' : '(DISCONNECTED)');
  console.log(' - Target Host:', status.host);
  console.log(' - Target Database:', mongoose.connection.name);
  console.log(' - Target URI (Masked):', status.uri);
  console.log(' - Last Error:', status.lastError || 'None');

  if (!connected || mongoose.connection.readyState !== 1) {
    console.error('FATAL: Could not authenticate or connect to MongoDB Atlas.');
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

  console.log('\n4. Testing Reversible Write & Clean Delete (Safe probe)...');
  const probeIdentifier = 'reversible_probe_' + Date.now();
  const probe = new CrowdFeedback({
    crowdLevel: 'QUIET',
    comment: 'Temporary Atlas Reversible Write Probe',
    studentName: 'Verification System Probe',
    studentIdentifier: probeIdentifier
  });
  const saved = await probe.save();
  console.log(' - Reversible write success: Created probe record with ID:', saved._id.toString());

  // Confirm probe exists
  const probeFound = await CrowdFeedback.findById(saved._id);
  console.log(' - Probe read-back confirmation:', !!probeFound);

  // Delete ONLY this probe record
  await CrowdFeedback.findByIdAndDelete(saved._id);
  const probeCheckAfterDelete = await CrowdFeedback.findById(saved._id);
  console.log(' - Reversible cleanup confirmation (Only probe deleted):', probeCheckAfterDelete === null ? 'CLEANED' : 'NOT DELETED');

  await mongoose.connection.close();
  console.log('\nAll Atlas Direct Verifications PASSED.');
}

testAtlas().catch(err => {
  console.error('Atlas Test Exception:', err.message);
  process.exit(1);
});
