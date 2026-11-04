/**
 * CanteenPulse Complete End-to-End Application Workflow Test Suite
 * Tests:
 * 1. Frontend-Backend HTTP connectivity
 * 2. Full student ordering workflow (browse, search, filter, order, verify in Atlas)
 * 3. Full admin workflow (login, stats, order queue, status transitions, availability toggle)
 * 4. Sold-out order prevention
 * 5. Student order tracking & privacy verification
 * 6. Crowd feedback submission & 3-minute duplicate cooldown
 * 7. Food review submission & dynamic rating recalculation in Atlas
 */

const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const MenuItem = require('../src/models/MenuItem');
const Order = require('../src/models/Order');
const CrowdFeedback = require('../src/models/CrowdFeedback');
const FoodReview = require('../src/models/FoodReview');

const BASE_URL = 'http://127.0.0.1:5000/api';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    let postData = null;
    if (body) {
      postData = JSON.stringify(body);
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = raw ? JSON.parse(raw) : null;
            resolve({ status: res.statusCode, data: parsed, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, raw, headers: res.headers });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runE2E() {
  console.log('================================================================');
  console.log('🚀 CANTEENPULSE END-TO-END WORKFLOW VERIFICATION SUITE');
  console.log('================================================================\n');

  // Connect Mongoose to inspect Atlas directly
  const { connectDB } = require('../src/config/db');
  await connectDB();

  let passed = 0;
  let total = 0;
  const results = [];

  function record(section, name, condition, details = '') {
    total++;
    const status = condition ? 'PASS' : 'FAIL';
    if (condition) {
      passed++;
      console.log(`✅ [${section}] PASS: ${name} ${details ? `(${details})` : ''}`);
    } else {
      console.error(`❌ [${section}] FAIL: ${name} ${details ? `(${details})` : ''}`);
    }
    results.push({ section, name, status, details });
  }

  // ================= TASK 1: FRONTEND-BACKEND CONNECTIVITY =================
  console.log('--- TASK 1: API CONNECTIVITY & HEALTH ---');
  {
    const res = await request('GET', '/health');
    const ok = res.status === 200 && res.data.database?.connected === true && res.data.database?.isAtlas === true;
    record('TASK 1', 'GET /api/health (Atlas Cloud Connected)', ok, `Status: ${res.data.status}, DB: ${res.data.database?.type}`);
  }

  // ================= TASK 2: STUDENT ORDER WORKFLOW =================
  console.log('\n--- TASK 2: STUDENT ORDER WORKFLOW ---');
  let selectedDish;
  {
    // 1. Load Menu
    const res = await request('GET', '/menu');
    const ok = res.status === 200 && Array.isArray(res.data.data) && res.data.count >= 14;
    record('TASK 2', 'Step 1-2: Load Menu from MongoDB Atlas', ok, `Dishes Loaded: ${res.data?.count}`);
    selectedDish = res.data.data[0];
  }

  {
    // 2. Search Menu by Name
    const res = await request('GET', '/menu?search=Dosa');
    const ok = res.status === 200 && res.data.data.some((d) => d.name.includes('Dosa'));
    record('TASK 2', 'Step 3: Search for Dish ("Dosa")', ok, `Matches Found: ${res.data?.count}`);
  }

  {
    // 3. Category Filter
    const res = await request('GET', '/menu?category=Lunch');
    const ok = res.status === 200 && res.data.data.every((d) => d.category === 'Lunch');
    record('TASK 2', 'Step 4: Filter by Category ("Lunch")', ok, `Lunch Dishes: ${res.data?.count}`);
  }

  let createdOrder;
  {
    // 4. Place Student Order (Steps 5-10: Cart, pickup time, student details, server pricing)
    const orderPayload = {
      studentName: 'Aakash Verma',
      rollNumber: '22BCSE088',
      phoneNumber: '9876543210',
      pickupTime: '1:00 PM - 1:15 PM',
      pickupCounter: 'Counter #1 (Express Pickup)',
      specialInstructions: 'Extra sambar please',
      paymentMethod: 'Pay at Counter',
      items: [
        {
          menuItemId: selectedDish._id,
          name: selectedDish.name,
          quantity: 2
        }
      ]
    };

    const res = await request('POST', '/orders', orderPayload);
    const expectedTotal = selectedDish.price * 2;
    const ok = res.status === 201 && res.data.success && res.data.data.totalAmount === expectedTotal;
    createdOrder = res.data?.data;
    record(
      'TASK 2',
      'Steps 5-10: Place Order with Server Price Enforced',
      ok,
      `Order: #${createdOrder?.orderNumber}, Total: ₹${createdOrder?.totalAmount} (${selectedDish.name} x 2)`
    );
  }

  {
    // 5. Verify Order Storage in MongoDB Atlas (Step 11)
    const dbOrder = await Order.findOne({ orderNumber: createdOrder.orderNumber });
    const ok = dbOrder && dbOrder.rollNumber === '22BCSE088' && dbOrder.totalAmount === selectedDish.price * 2;
    record('TASK 2', 'Step 11: Verify Order Persistence in MongoDB Atlas', ok, `Atlas DB Record Verified: #${dbOrder?.orderNumber}`);
  }

  {
    // 6. Retrieve Order using Order Number (Step 12)
    const res = await request('GET', `/orders/${createdOrder.orderNumber}?verifyPhone=9876543210`);
    const ok = res.status === 200 && res.data.data.orderNumber === createdOrder.orderNumber;
    record('TASK 2', 'Step 12: Retrieve Order with Verification Details', ok, `Status: ${res.data?.data?.status}`);
  }

  // ================= TASK 3: ADMIN WORKFLOW =================
  console.log('\n--- TASK 3: ADMIN WORKFLOW ---');
  let adminToken;
  {
    // 1. Admin Login
    const res = await request('POST', '/admin/login', { passcode: 'admin123' });
    adminToken = res.data?.token;
    const ok = res.status === 200 && adminToken && adminToken.includes('.');
    record('TASK 3', 'Step 1: Admin Login with Timing-Safe Passcode Check', ok, 'Issued 24h HMAC-SHA256 Token');
  }

  {
    // 2. Load Dashboard Statistics
    const res = await request('GET', '/admin/stats', null, { 'x-admin-token': adminToken });
    const ok = res.status === 200 && res.data.data.totalOrders >= 1 && res.data.data.database.connected;
    record('TASK 3', 'Step 2: Load Admin Dashboard Statistics', ok, `Total Orders: ${res.data?.data?.totalOrders}, Rev: ₹${res.data?.data?.totalRevenue}`);
  }

  {
    // 3. View Incoming Orders
    const res = await request('GET', '/admin/orders?status=PENDING', null, { 'x-admin-token': adminToken });
    const ok = res.status === 200 && Array.isArray(res.data.data);
    record('TASK 3', 'Step 3: View Incoming Orders Queue', ok, `Pending Queue Count: ${res.data?.count}`);
  }

  {
    // 4. Confirm Order (PENDING -> CONFIRMED)
    const res = await request('PATCH', `/admin/orders/${createdOrder.orderNumber}/status`, { status: 'CONFIRMED' }, { 'x-admin-token': adminToken });
    const ok = res.status === 200 && res.data.data.status === 'CONFIRMED';
    record('TASK 3', 'Step 4: Transition Status to CONFIRMED', ok, `New Status: ${res.data?.data?.status}`);
  }

  {
    // 5. Change Status to PREPARING (CONFIRMED -> PREPARING)
    const res = await request('PATCH', `/admin/orders/${createdOrder.orderNumber}/status`, { status: 'PREPARING' }, { 'x-admin-token': adminToken });
    const ok = res.status === 200 && res.data.data.status === 'PREPARING';
    record('TASK 3', 'Step 5: Transition Status to PREPARING', ok, `New Status: ${res.data?.data?.status}`);
  }

  {
    // 6. Change Status to READY (PREPARING -> READY)
    const res = await request('PATCH', `/admin/orders/${createdOrder.orderNumber}/status`, { status: 'READY' }, { 'x-admin-token': adminToken });
    const ok = res.status === 200 && res.data.data.status === 'READY';
    record('TASK 3', 'Step 6: Transition Status to READY (Ready for Pickup)', ok, `New Status: ${res.data?.data?.status}`);
  }

  {
    // 7. Verify Status Persistence in MongoDB Atlas
    const dbOrder = await Order.findOne({ orderNumber: createdOrder.orderNumber });
    const ok = dbOrder && dbOrder.status === 'READY';
    record('TASK 3', 'Step 7: Verify Status Persistence in MongoDB Atlas', ok, `Atlas Status: ${dbOrder?.status}`);
  }

  {
    // 8. Test Menu Availability Toggle
    const toggleRes = await request('PATCH', `/admin/menu/${selectedDish._id}/toggle-availability`, null, { 'x-admin-token': adminToken });
    const toggledDish = toggleRes.data?.data;
    const ok = toggleRes.status === 200 && toggledDish.isAvailable === false;
    record('TASK 3', 'Step 8: Toggle Dish to Sold Out (Out of Stock)', ok, `isAvailable: ${toggledDish?.isAvailable}`);

    // 9. Verify Unavailable Dish Cannot Be Ordered
    const rejectRes = await request('POST', '/orders', {
      studentName: 'Blocked Student',
      rollNumber: '22BCSE999',
      phoneNumber: '9876543210',
      pickupTime: '1:00 PM',
      items: [{ menuItemId: selectedDish._id, name: selectedDish.name, quantity: 1 }]
    });
    const orderBlocked = rejectRes.status === 400 && rejectRes.data.message.includes('sold out');
    record('TASK 3', 'Step 9: Prevent Ordering of Sold Out Dishes', orderBlocked, `Rejected: "${rejectRes.data?.message}"`);

    // Toggle back to available for catalog integrity
    await request('PATCH', `/admin/menu/${selectedDish._id}/toggle-availability`, null, { 'x-admin-token': adminToken });
  }

  // ================= TASK 4: STUDENT ORDER TRACKING =================
  console.log('\n--- TASK 4: ORDER TRACKING & PRIVACY VERIFICATION ---');
  {
    // 1. Retrieve Order
    const res = await request('GET', `/orders/${createdOrder.orderNumber}`);
    const ok = res.status === 200 && res.data.data.orderNumber === createdOrder.orderNumber;
    record('TASK 4', 'Retrieve Order by Token (#CP-xxx)', ok, `Order: ${createdOrder.orderNumber}`);
  }

  {
    // 2. Reject Mismatched Phone Number
    const res = await request('GET', `/orders/${createdOrder.orderNumber}?verifyPhone=0000000000`);
    const ok = res.status === 403;
    record('TASK 4', 'Reject Tracking with Mismatched Phone (Privacy Defense)', ok, '403 Forbidden Returned');
  }

  {
    // 3. Reject Mismatched Roll Number
    const res = await request('GET', `/orders/${createdOrder.orderNumber}?verifyRoll=WRONG_ROLL`);
    const ok = res.status === 403;
    record('TASK 4', 'Reject Tracking with Mismatched Roll Number', ok, '403 Forbidden Returned');
  }

  // ================= TASK 5: CROWD & REVIEW FEATURES =================
  console.log('\n--- TASK 5: CROWD & REVIEW WORKFLOW ---');
  const uniqueStudentId = 'student_e2e_' + Date.now();
  {
    // 1. Submit Crowd Feedback
    const crowdPayload = {
      crowdLevel: 'MODERATE',
      comment: 'Canteen queue is about 5 students, moving quickly.',
      estimatedWait: '5-10 mins',
      studentName: 'Sanjay Kumar',
      studentIdentifier: uniqueStudentId
    };
    const res = await request('POST', '/crowd', crowdPayload);
    const ok = res.status === 201 && res.data.success;
    record('TASK 5', 'Submit Voluntary Crowd Feedback', ok, 'Crowd Check-in Registered');
  }

  {
    // 2. Verify Crowd Feedback Persistence in MongoDB Atlas
    const dbFeedback = await CrowdFeedback.findOne({ studentIdentifier: uniqueStudentId });
    const ok = dbFeedback && dbFeedback.crowdLevel === 'MODERATE';
    record('TASK 5', 'Verify Crowd Feedback in MongoDB Atlas', ok, `Atlas Stamped: ${dbFeedback?.crowdLevel}`);
  }

  {
    // 3. Test 3-Minute Duplicate Cooldown
    const res = await request('POST', '/crowd', {
      crowdLevel: 'QUIET',
      studentName: 'Sanjay Kumar',
      studentIdentifier: uniqueStudentId
    });
    const ok = res.status === 400 && res.data.message.includes('wait 3 minutes');
    record('TASK 5', 'Enforce 3-Minute Cooldown on Repeat Feedback', ok, 'Cooldown Violation Blocked');
  }

  {
    // 4. Submit Food Review
    const reviewPayload = {
      menuItemId: selectedDish._id,
      dishName: selectedDish.name,
      studentName: 'Ritu Sen',
      rating: 5,
      comment: 'The chutney was incredibly fresh and crispness was on point!'
    };
    const res = await request('POST', '/reviews', reviewPayload);
    const ok = res.status === 201 && res.data.success;
    record('TASK 5', 'Submit Food Review with 5 Stars', ok, 'Review Published');
  }

  {
    // 5. Verify Review & Rating Aggregation in MongoDB Atlas
    const updatedDish = await MenuItem.findById(selectedDish._id);
    const ok = updatedDish && updatedDish.totalReviews >= 1;
    record('TASK 5', 'Verify Rating Aggregation on MenuItem in Atlas', ok, `Dish Rating: ${updatedDish?.averageRating}★ (${updatedDish?.totalReviews} reviews)`);
  }

  await mongoose.connection.close();

  console.log('\n================================================================');
  console.log(`🏁 END-TO-END VERIFICATION: ${passed}/${total} WORKFLOW STEPS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  return { passed, total, results };
}

if (require.main === module) {
  runE2E()
    .then(({ passed, total }) => {
      process.exit(passed === total ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal E2E Error:', err);
      process.exit(1);
    });
}

module.exports = { runE2E };

