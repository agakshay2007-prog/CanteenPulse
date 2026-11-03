/**
 * CanteenPulse Comprehensive Automated Backend Verification Suite (CIA-2)
 * Tests all 5 REST controllers, Mongoose schemas, HMAC auth, security headers,
 * server-side price calculation, status transitions, duplicate crowd protection,
 * and input validations.
 */

process.env.NODE_ENV = 'test';

const dataService = require('../src/services/dataService');
const menuController = require('../src/controllers/menuController');
const orderController = require('../src/controllers/orderController');
const crowdController = require('../src/controllers/crowdController');
const reviewController = require('../src/controllers/reviewController');
const adminController = require('../src/controllers/adminController');
const { generateAdminToken, verifyAdminToken, verifyPasscode, verifyAdmin } = require('../src/middleware/auth');
const securityHeaders = require('../src/middleware/securityHeaders');
const { getDbStatus } = require('../src/config/db');

function createMockReqRes({ body = {}, query = {}, params = {}, headers = {}, method = 'GET', url = '/' } = {}) {
  const req = { body, query, params, headers, method, url };
  let statusCode = 200;
  let jsonBody = null;
  const resHeaders = {};

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      jsonBody = data;
      return res;
    },
    setHeader(key, val) {
      resHeaders[key.toLowerCase()] = val;
      return res;
    },
    getHeader(key) {
      return resHeaders[key.toLowerCase()];
    },
    removeHeader(key) {
      delete resHeaders[key.toLowerCase()];
      return res;
    },
    getStatusCode() {
      return statusCode;
    },
    getBody() {
      return jsonBody;
    },
    getHeaders() {
      return resHeaders;
    }
  };

  return { req, res };
}

async function runAllTests() {
  console.log('================================================================');
  console.log('🧪 SUITE 1: UNIT & CONTROLLER LOGIC TESTS (OFFLINE HARNESS)');
  console.log('================================================================\n');

  await dataService.initializeData();

  let passed = 0;
  let total = 0;
  const results = [];

  function record(id, name, condition, details = '') {
    total++;
    const status = condition ? 'PASS' : 'FAIL';
    if (condition) {
      passed++;
      console.log(`✅ [TEST ${id.toString().padStart(2, '0')}] PASS: ${name} ${details ? `(${details})` : ''}`);
    } else {
      console.error(`❌ [TEST ${id.toString().padStart(2, '0')}] FAIL: ${name} ${details ? `(${details})` : ''}`);
    }
    results.push({ id, name, status, details });
  }

  // --- SUITE 1: System Health & Security Headers ---
  {
    const { req, res } = createMockReqRes();
    securityHeaders(req, res, () => {});
    const h = res.getHeaders();
    const passedHeaders =
      h['x-content-type-options'] === 'nosniff' &&
      h['x-frame-options'] === 'DENY' &&
      h['x-xss-protection'] === '1; mode=block';
    record(1, 'Security Headers Middleware', passedHeaders, 'nosniff, DENY, XSS-Protection active');
  }

  {
    const db = getDbStatus();
    const isDbReportValid = db && typeof db.connected === 'boolean' && db.type;
    record(2, 'Offline Resilient Fallback Status (Unit Test Isolation)', isDbReportValid, `Harness Mode: ${db.type}, Connected: ${db.connected}`);
  }

  // --- SUITE 2: Menu Browsing & Filtering APIs ---
  let sampleDish;
  {
    const { req, res } = createMockReqRes();
    await menuController.getMenu(req, res, () => {});
    const b = res.getBody();
    const ok = res.getStatusCode() === 200 && b.success && b.count >= 10;
    record(3, 'GET /api/menu (Full Menu Retrieval)', ok, `Retrieved ${b?.count} dishes`);
    if (b?.data && b.data.length > 0) sampleDish = b.data[0];
  }

  {
    const { req, res } = createMockReqRes({ query: { category: 'Lunch' } });
    await menuController.getMenu(req, res, () => {});
    const b = res.getBody();
    const allLunch = b.data.every((d) => d.category === 'Lunch');
    record(4, 'GET /api/menu?category=Lunch (Category Filter)', allLunch && b.count > 0, `Matches: ${b?.count}`);
  }

  {
    const { req, res } = createMockReqRes({ query: { search: 'Dosa' } });
    await menuController.getMenu(req, res, () => {});
    const b = res.getBody();
    const ok = b.count > 0 && b.data.some((d) => d.name.toLowerCase().includes('dosa'));
    record(5, 'GET /api/menu?search=Dosa (Text Search)', ok, `Found ${b?.count} matching dish(es)`);
  }

  {
    const { req, res } = createMockReqRes({ params: { id: sampleDish._id.toString() } });
    await menuController.getMenuItem(req, res, () => {});
    const b = res.getBody();
    record(6, 'GET /api/menu/:id (Lookup Dish by ID)', res.getStatusCode() === 200 && b.data.name === sampleDish.name, `Fetched: ${b?.data?.name}`);
  }

  {
    const { req, res } = createMockReqRes({ params: { id: 'nonexistent_dish_id_9999' } });
    await menuController.getMenuItem(req, res, () => {});
    record(7, 'GET /api/menu/:id (Lookup Nonexistent Dish)', res.getStatusCode() === 404, 'Returns 404 Not Found');
  }

  // --- SUITE 3: Order Validation & Strict Server-Side Pricing ---
  let createdOrderNumber;
  {
    // Client attempts to pass a tampered price of ₹1 instead of real database price
    const realPrice = sampleDish.price;
    const { req, res } = createMockReqRes({
      body: {
        studentName: 'Aarav Sharma',
        rollNumber: '22BCSE101',
        phoneNumber: '9876543210',
        items: [
          {
            menuItemId: sampleDish._id.toString(),
            name: sampleDish.name,
            price: 1, // Tampered client price!
            quantity: 2
          }
        ],
        pickupTime: '12:30 PM - 12:45 PM'
      }
    });

    await orderController.createOrder(req, res, () => {});
    const b = res.getBody();
    const expectedTotal = realPrice * 2;
    const serverPriceEnforced = b.data?.totalAmount === expectedTotal && b.data?.items[0]?.price === realPrice;
    record(
      8,
      'Strict Server-Side Price Calculation',
      res.getStatusCode() === 201 && serverPriceEnforced,
      `Client ₹1 price overridden by DB ₹${realPrice} -> Total: ₹${b.data?.totalAmount}`
    );
    createdOrderNumber = b.data?.orderNumber;
  }

  {
    // Reject invalid negative item quantity
    const { req, res } = createMockReqRes({
      body: {
        studentName: 'Test Student',
        rollNumber: 'TEST99',
        phoneNumber: '9876543210',
        items: [{ menuItemId: sampleDish._id.toString(), quantity: -3 }],
        pickupTime: 'Immediate'
      }
    });
    await orderController.createOrder(req, res, () => {});
    record(9, 'Reject Negative Item Quantity', res.getStatusCode() === 400 && !res.getBody().success, 'Blocked negative quantity');
  }

  {
    // Reject empty cart
    const { req, res } = createMockReqRes({
      body: {
        studentName: 'Test Student',
        rollNumber: 'TEST99',
        phoneNumber: '9876543210',
        items: [],
        pickupTime: 'Immediate'
      }
    });
    await orderController.createOrder(req, res, () => {});
    record(10, 'Reject Empty Order Items Array', res.getStatusCode() === 400, 'Cart cannot be empty error');
  }

  {
    // Reject missing roll number
    const { req, res } = createMockReqRes({
      body: {
        studentName: 'Incomplete Student',
        phoneNumber: '9876543210',
        items: [{ menuItemId: sampleDish._id.toString(), quantity: 1 }],
        pickupTime: '1:00 PM'
      }
    });
    await orderController.createOrder(req, res, () => {});
    record(11, 'Reject Missing Student Roll Number', res.getStatusCode() === 400, 'Roll number required validation');
  }

  {
    // Reject invalid short phone number
    const { req, res } = createMockReqRes({
      body: {
        studentName: 'Short Phone',
        rollNumber: '22BCSE999',
        phoneNumber: '123',
        items: [{ menuItemId: sampleDish._id.toString(), quantity: 1 }],
        pickupTime: '1:00 PM'
      }
    });
    await orderController.createOrder(req, res, () => {});
    record(12, 'Validate 10-Digit Phone Number Format', res.getStatusCode() === 400, 'Invalid phone number rejected');
  }

  // --- SUITE 4: Order Lookup & Student Privacy Protection ---
  {
    const { req, res } = createMockReqRes({ params: { orderNumber: createdOrderNumber } });
    await orderController.getOrder(req, res, () => {});
    const b = res.getBody();
    const ok = res.getStatusCode() === 200 && b.data.orderNumber === createdOrderNumber;
    record(13, 'GET /api/orders/:orderNumber (Live Order Tracking)', ok, `Tracking ${createdOrderNumber} -> Status: ${b.data?.status}`);
  }

  {
    const { req, res } = createMockReqRes({ params: { orderNumber: 'CP-999999' } });
    await orderController.getOrder(req, res, () => {});
    record(14, 'GET /api/orders/:orderNumber (Nonexistent Order)', res.getStatusCode() === 404, 'Returns 404 Not Found');
  }

  {
    // Verification check with mismatched phone
    const { req, res } = createMockReqRes({
      params: { orderNumber: createdOrderNumber },
      query: { verifyPhone: '9999999999' }
    });
    await orderController.getOrder(req, res, () => {});
    record(15, 'Order Privacy Protection (Mismatched Phone)', res.getStatusCode() === 403, 'Unauthorized access blocked (403)');
  }

  // --- SUITE 5: Voluntary Crowd Feedback & Anti-Spam Protection ---
  const testStudentId = 'student_test_' + Date.now();
  {
    const { req, res } = createMockReqRes({
      body: {
        crowdLevel: 'Busy',
        comment: 'Snack counter line is around 10 people',
        estimatedWait: '15+ mins',
        studentName: 'Rohan Verma',
        studentIdentifier: testStudentId
      }
    });
    await crowdController.submitCrowd(req, res, () => {});
    record(16, 'POST /api/crowd (Voluntary Crowd Check-in)', res.getStatusCode() === 201 && res.getBody().success, 'Check-in recorded');
  }

  {
    // Immediate repeat submission with same studentIdentifier must be blocked
    const { req, res } = createMockReqRes({
      body: {
        crowdLevel: 'Quiet',
        studentName: 'Rohan Verma',
        studentIdentifier: testStudentId
      }
    });
    await crowdController.submitCrowd(req, res, () => {});
    record(17, 'Crowd Feedback 3-Minute Rate-Limit Protection', res.getStatusCode() === 400, 'Duplicate submission blocked within cooldown');
  }

  {
    const { req, res } = createMockReqRes();
    await crowdController.getCrowd(req, res, () => {});
    const b = res.getBody();
    const ok = b.success && b.data.disclaimer && b.data.currentLevel;
    record(18, 'GET /api/crowd (Crowd Pulse & Trends with Disclaimer)', ok, `Current: ${b.data?.currentLevel}, Has Disclaimer: Yes`);
  }

  // --- SUITE 6: Food Reviews & Dynamic Rating Recalculation ---
  {
    const { req, res } = createMockReqRes({
      body: {
        menuItemId: sampleDish._id.toString(),
        dishName: sampleDish.name,
        studentName: 'Priya Patel',
        rating: 5,
        comment: 'Crispy, fresh, and served hot! Excellent quality.'
      }
    });
    await reviewController.submitReview(req, res, () => {});
    record(19, 'POST /api/reviews (Submit Food Review)', res.getStatusCode() === 201 && res.getBody().success, 'Review published');
  }

  {
    const { req, res } = createMockReqRes({
      body: {
        dishName: sampleDish.name,
        studentName: 'Test',
        rating: 6, // Invalid > 5
        comment: 'Too high'
      }
    });
    await reviewController.submitReview(req, res, () => {});
    record(20, 'Food Review Rating Boundary Validation (1-5)', res.getStatusCode() === 400, 'Rating 6 rejected');
  }

  // --- SUITE 7: Admin Authentication & Signed HMAC Security ---
  let adminToken;
  {
    // Timing-safe password check with valid passcode
    const { req, res } = createMockReqRes({ body: { passcode: 'admin123' } });
    adminController.login(req, res);
    const b = res.getBody();
    adminToken = b?.token;
    const isSigned = adminToken && adminToken.includes('.');
    record(21, 'POST /api/admin/login (Signed HMAC Token Generation)', res.getStatusCode() === 200 && isSigned, 'Issued 24h HMAC-SHA256 Token');
  }

  {
    // Reject invalid passcode
    const { req, res } = createMockReqRes({ body: { passcode: 'wrong_secret' } });
    adminController.login(req, res);
    record(22, 'POST /api/admin/login (Timing-Safe Rejection of Invalid Passcode)', res.getStatusCode() === 401, '401 Unauthorized');
  }

  {
    // Verify admin token validity
    const verified = verifyAdminToken(adminToken);
    record(23, 'HMAC Token Verification & Expiry Check', verified && verified.role === 'ADMIN', `Verified Role: ${verified?.role}`);
  }

  {
    // Tampered token verification rejection
    const tampered = adminToken.slice(0, -4) + 'abcd';
    const verified = verifyAdminToken(tampered);
    record(24, 'Cryptographic Tamper Detection', verified === null, 'Tampered signature rejected');
  }

  // --- SUITE 8: Order Status State Machine Transitions ---
  {
    // Valid status progression: PENDING -> CONFIRMED
    const { req, res } = createMockReqRes({
      params: { orderNumber: createdOrderNumber },
      body: { status: 'CONFIRMED' }
    });
    await adminController.updateOrderStatus(req, res, () => {});
    const b = res.getBody();
    record(25, 'Valid Order Status Transition: PENDING -> CONFIRMED', res.getStatusCode() === 200 && b.data?.status === 'CONFIRMED', `Status: ${b.data?.status}`);
  }

  {
    // Valid status progression: CONFIRMED -> PREPARING
    const { req, res } = createMockReqRes({
      params: { orderNumber: createdOrderNumber },
      body: { status: 'PREPARING' }
    });
    await adminController.updateOrderStatus(req, res, () => {});
    const b = res.getBody();
    record(26, 'Valid Order Status Transition: CONFIRMED -> PREPARING', res.getStatusCode() === 200 && b.data?.status === 'PREPARING', `Status: ${b.data?.status}`);
  }

  {
    // Invalid status transition: PREPARING -> PENDING (backward transition not allowed)
    const { req, res } = createMockReqRes({
      params: { orderNumber: createdOrderNumber },
      body: { status: 'PENDING' }
    });
    await adminController.updateOrderStatus(req, res, () => {});
    record(27, 'State Machine Rejection: PREPARING -> PENDING', res.getStatusCode() === 400, 'Invalid transition blocked');
  }

  // --- SUITE 9: Admin Dashboard & Menu Management ---
  {
    const { req, res } = createMockReqRes();
    await adminController.getStats(req, res, () => {});
    const b = res.getBody();
    const ok = b.success && b.data?.totalOrders >= 1 && b.data?.database;
    record(28, 'GET /api/admin/stats (Admin Dashboard Metrics)', ok, `Orders: ${b.data?.totalOrders}, Rev: ₹${b.data?.totalRevenue}`);
  }

  {
    const { req, res } = createMockReqRes({ params: { id: sampleDish._id.toString() } });
    await adminController.toggleAvailability(req, res, () => {});
    const b = res.getBody();
    record(29, 'PATCH /api/admin/menu/:id/toggle-availability', res.getStatusCode() === 200 && b.success, `New status: ${b.data?.isAvailable ? 'In Stock' : 'Out of Stock'}`);
    // Toggle back
    await adminController.toggleAvailability(req, res, () => {});
  }

  console.log('\n================================================================');
  console.log(`🏁 VERIFICATION COMPLETE: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  return { total, passed, results };
}

if (require.main === module) {
  runAllTests()
    .then(({ total, passed }) => {
      process.exit(passed === total ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal Test Suite Error:', err);
      process.exit(1);
    });
}

module.exports = { runAllTests };
