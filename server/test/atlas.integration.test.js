/**
 * CanteenPulse MongoDB Atlas Cloud Integration Test Suite
 * Connects to live MongoDB Atlas cluster, verifies connection readyState,
 * confirms all 4 collections, tests cloud read/write/reversion, and ensures zero data loss.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const { connectDB, isDbConnected, getDbStatus, getMaskedUri } = require('../src/config/db');
const MenuItem = require('../src/models/MenuItem');
const Order = require('../src/models/Order');
const CrowdFeedback = require('../src/models/CrowdFeedback');
const FoodReview = require('../src/models/FoodReview');
const dataService = require('../src/services/dataService');

async function runAtlasIntegrationTests() {
  console.log('================================================================');
  console.log('☁️  CANTEENPULSE MONGODB ATLAS CLOUD INTEGRATION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function record(id, name, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [INTEGRATION TEST ${id.toString().padStart(2, '0')}] PASS: ${name} ${details ? `(${details})` : ''}`);
    } else {
      console.error(`❌ [INTEGRATION TEST ${id.toString().padStart(2, '0')}] FAIL: ${name} ${details ? `(${details})` : ''}`);
    }
  }

  // 1. Establish Live MongoDB Atlas Connection
  const connected = await connectDB();
  record(1, 'Connect to MongoDB Atlas Cloud Cluster', connected && mongoose.connection.readyState === 1, `Host: ${mongoose.connection.host}`);

  // 2. Confirm Connection readyState === 1
  const isReady = mongoose.connection.readyState === 1;
  record(2, 'Confirm mongoose.connection.readyState === 1', isReady, `Live State: ${mongoose.connection.readyState} (Connected)`);

  // 3. Confirm Database Name is 'canteenpulse'
  const activeDbName = mongoose.connection.name;
  record(3, 'Verify Active Database Name', activeDbName === 'canteenpulse', `Database: ${activeDbName}`);

  // 4. Confirm Database Status Reports MongoDB Atlas
  const status = getDbStatus();
  record(4, 'Database Health Reporter Identifies Atlas', status.isAtlas && status.connected, `Type: ${status.type}`);

  // 5. Initialize & Check Collections in Atlas
  await dataService.initializeData();
  const collections = await mongoose.connection.db.listCollections().toArray();
  const colNames = collections.map(c => c.name);
  const requiredCols = ['menuitems', 'orders', 'crowdfeedbacks', 'foodreviews'];
  const allColsPresent = requiredCols.every(c => colNames.includes(c));
  record(5, 'Verify All 4 Collections in Cloud Database', allColsPresent, `Collections: [${colNames.join(', ')}]`);

  // 6. Verify Collection Document Counts (Non-empty)
  const menuCount = await MenuItem.countDocuments();
  const orderCount = await Order.countDocuments();
  const crowdCount = await CrowdFeedback.countDocuments();
  const reviewCount = await FoodReview.countDocuments();
  const countsValid = menuCount >= 14 && crowdCount >= 1 && reviewCount >= 1;
  record(6, 'Verify Existing Records Preserved in Cloud Collections', countsValid, `menu: ${menuCount}, orders: ${orderCount}, crowd: ${crowdCount}, reviews: ${reviewCount}`);

  // 7. Perform Safe Cloud Read
  const sampleDish = await MenuItem.findOne({ category: 'Breakfast' });
  const readSuccess = sampleDish && sampleDish.price > 0 && sampleDish.name;
  record(7, 'Safe Cloud Read (Query Document from Atlas)', readSuccess, `Retrieved: "${sampleDish?.name}" (₹${sampleDish?.price})`);

  // 8. Reversible Cloud Write & Isolation Check
  const probeIdentifier = 'reversible_test_' + Date.now();
  const probe = new CrowdFeedback({
    crowdLevel: 'QUIET',
    comment: 'Temporary Atlas Reversible Write Probe (Auto-Cleaned)',
    studentName: 'Atlas Integration Probe',
    studentIdentifier: probeIdentifier
  });
  const savedProbe = await probe.save();
  const writeSuccess = savedProbe && savedProbe._id;
  record(8, 'Reversible Cloud Write (Create Unique Test Record)', !!writeSuccess, `Saved Probe ID: ${savedProbe?._id}`);

  // 9. Read-back Written Cloud Record
  const readBackProbe = await CrowdFeedback.findById(savedProbe._id);
  const readBackSuccess = readBackProbe && readBackProbe.studentIdentifier === probeIdentifier;
  record(9, 'Verify Cloud Persistence (Read-Back by ObjectId)', readBackSuccess, `Matches Identifier: ${probeIdentifier}`);

  // 10. Reversible Cleanup (Delete ONLY probe record, preserve existing data)
  await CrowdFeedback.findByIdAndDelete(savedProbe._id);
  const probeAfterDelete = await CrowdFeedback.findById(savedProbe._id);
  const finalCrowdCount = await CrowdFeedback.countDocuments();
  const cleanSuccess = probeAfterDelete === null && finalCrowdCount === crowdCount;
  record(10, 'Reversible Cleanup (Delete ONLY Test Record, Zero Side-Effects)', cleanSuccess, `Deleted Probe ID: ${savedProbe._id}, Count Restored: ${finalCrowdCount}`);

  // Close connection cleanly
  await mongoose.connection.close();

  console.log('\n================================================================');
  console.log(`☁️  ATLAS INTEGRATION COMPLETE: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  return { passed, total };
}

if (require.main === module) {
  runAtlasIntegrationTests()
    .then(({ passed, total }) => {
      process.exit(passed === total ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal Integration Suite Error:', err.message);
      process.exit(1);
    });
}

module.exports = { runAtlasIntegrationTests };

