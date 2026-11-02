/**
 * Comprehensive Automated Backend Verification Suite
 * Validates all REST Endpoints, Schema Validations, Server-Side Price Calculation,
 * Duplicate Crowd Protection, and Admin Authorization.
 */

const dataService = require('../src/services/dataService');
const menuController = require('../src/controllers/menuController');
const orderController = require('../src/controllers/orderController');
const crowdController = require('../src/controllers/crowdController');
const reviewController = require('../src/controllers/reviewController');
const adminController = require('../src/controllers/adminController');

function createMockReqRes({ body = {}, query = {}, params = {}, headers = {} } = {}) {
  const req = { body, query, params, headers };
  let statusCode = 200;
  let jsonBody = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      jsonBody = data;
      return res;
    },
    getStatusCode() {
      return statusCode;
    },
    getBody() {
      return jsonBody;
    }
  };

  return { req, res };
}

async function runVerification() {
  console.log('🧪 Starting CanteenPulse Backend Verification Suite...\n');
  await dataService.initializeData();

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // 1. Menu Retrieval
  {
    const { req, res } = createMockReqRes();
    await menuController.getMenu(req, res, (e) => console.error(e));
    const b = res.getBody();
    assert(res.getStatusCode() === 200 && b.success && b.count >= 14, `1. GET /api/menu (${b?.count} verified dishes)`);
  }

  // 2. Dish Lookup by ID
  let sampleDishId;
  {
    const all = await dataService.getAllMenuItems();
    sampleDishId = all[0]._id.toString();
    const { req, res } = createMockReqRes({ params: { id: sampleDishId } });
    await menuController.getMenuItem(req, res, (e) => console.error(e));
    const b = res.getBody();
    assert(res.getStatusCode() === 200 && b.data.name, `2. GET /api/menu/:id (Fetched: ${b?.data?.name})`);
  }

  // 3. Server-Side Price Calculation Verification
  // Intentionally pass an incorrect client price (e.g. ₹1 instead of real price ₹60)
  // The server MUST enforce the real DB price and calculate total = 2 * 60 = ₹120!
  let createdOrderNumber;
  {
    const { req, res } = createMockReqRes({
      body: {
        student: {
          name: 'Vikram Malhotra',
          studentId: '22BCSE015',
          phone: '9876500001'
        },
        items: [
          {
            menuItemId: sampleDishId,
            name: 'Crispy Masala Dosa',
            price: 1, // Tampered client price!
            quantity: 2
          }
        ],
        pickupTime: '1:00 PM - 1:15 PM'
      }
    });

    await orderController.createOrder(req, res, (e) => console.error(e));
    const b = res.getBody();
    const isServerPriceEnforced = b.data?.total === 120 && b.data?.items[0]?.price === 60;
    assert(res.getStatusCode() === 201 && isServerPriceEnforced, `3. Server-Side Price Calculation (Tampered ₹1 price rejected, DB ₹60 enforced -> Total: ₹${b.data?.total})`);
    createdOrderNumber = b.data?.orderNumber;
  }

  // 4. Test Invalid Quantity Rejection
  {
    const { req, res } = createMockReqRes({
      body: {
        student: { name: 'Test', studentId: 'TEST01', phone: '9999999999' },
        items: [{ menuItemId: sampleDishId, quantity: -5 }],
        pickupTime: 'Immediate'
      }
    });
    await orderController.createOrder(req, res, (e) => console.error(e));
    assert(res.getStatusCode() === 400 && !res.getBody().success, '4. Reject Invalid Item Quantity (Negative quantity blocked)');
  }

  // 5. Order Tracking by Order Number
  {
    const { req, res } = createMockReqRes({ params: { orderNumber: createdOrderNumber } });
    await orderController.getOrder(req, res, (e) => console.error(e));
    const b = res.getBody();
    assert(res.getStatusCode() === 200 && b.data.orderNumber === createdOrderNumber && b.data.status === 'Pending', `5. GET /api/orders/:orderNumber (Live Status: ${b.data?.status})`);
  }

  // 6. Voluntary Crowd Feedback (Quiet / Moderate / Busy)
  const uniqueTestStudentId = 'aman_verify_test_' + Date.now();
  {
    const { req, res } = createMockReqRes({
      body: {
        crowdLevel: 'Busy',
        comment: 'Meal counter queue is 8 people long',
        estimatedWait: '15+ mins',
        studentName: 'Aman Deep',
        studentIdentifier: uniqueTestStudentId
      }
    });
    await crowdController.submitCrowd(req, res, (e) => console.error(e));
    const b = res.getBody();
    assert(res.getStatusCode() === 201 && b.success, '6. POST /api/crowd (Voluntary Crowd Feedback Registered)');
  }

  // 7. Duplicate Crowd Feedback Protection within 3 mins
  {
    const { req, res } = createMockReqRes({
      body: {
        crowdLevel: 'Quiet',
        studentName: 'Aman Deep',
        studentIdentifier: uniqueTestStudentId
      }
    });
    await crowdController.submitCrowd(req, res, (e) => console.error(e));
    assert(res.getStatusCode() === 400 && res.getBody().message.includes('wait 3 minutes'), '7. Duplicate Crowd Protection (Repeated submissions within 3 mins blocked)');
  }

  // 8. Crowd Pulse Trends & Disclaimer
  {
    const { req, res } = createMockReqRes();
    await crowdController.getCrowd(req, res, (e) => console.error(e));
    const b = res.getBody();
    assert(res.getStatusCode() === 200 && b.data.scheduleTrends.length === 7 && b.data.disclaimer.includes('voluntary student check-ins'), '8. GET /api/crowd (Vibe trends and transparency disclaimer verified)');
  }

  // 9. Food Ratings & Reviews
  {
    const { req, res } = createMockReqRes({
      body: {
        menuItemId: sampleDishId,
        dishName: 'Crispy Masala Dosa',
        studentName: 'Vikram Malhotra',
        rating: 5,
        comment: 'Crispy golden crepe, fresh coconut chutney!'
      }
    });
    await reviewController.submitReview(req, res, (e) => console.error(e));
    assert(res.getStatusCode() === 201 && res.getBody().success, '9. POST /api/reviews (Food rating & review saved)');
  }

  // 10. Admin Authentication (Demo Passcode)
  {
    const { req, res } = createMockReqRes({ body: { passcode: 'admin123' } });
    adminController.login(req, res);
    assert(res.getStatusCode() === 200 && res.getBody().token === 'admin123', '10. POST /api/admin/login (Verified demo admin credentials)');
  }

  // 11. Admin Order Kitchen Status Progression
  {
    const { req, res } = createMockReqRes({
      params: { orderNumber: createdOrderNumber },
      body: { status: 'Preparing' }
    });
    await adminController.updateOrderStatus(req, res, (e) => console.error(e));
    const b = res.getBody();
    assert(res.getStatusCode() === 200 && b.data.status === 'Preparing', `11. PATCH /api/admin/orders/:id/status (Progressed to 'Preparing')`);
  }

  // 12. Admin Toggle Dish Availability (Sold Out Prevention)
  {
    const { req, res } = createMockReqRes({ params: { id: sampleDishId } });
    await adminController.toggleAvailability(req, res, (e) => console.error(e));
    const b = res.getBody();
    assert(res.getStatusCode() === 200 && b.data.isAvailable === false, '12. PATCH /api/admin/menu/:id/toggle-availability (Marked Sold Out)');

    // Attempting to order a Sold Out dish MUST now fail with a 400 error!
    const { req: orderReq, res: orderRes } = createMockReqRes({
      body: {
        student: { name: 'Test', studentId: 'TEST02', phone: '9999900000' },
        items: [{ menuItemId: sampleDishId, quantity: 1 }],
        pickupTime: 'Immediate'
      }
    });
    await orderController.createOrder(orderReq, orderRes, (e) => console.error(e));
    assert(orderRes.getStatusCode() === 400 && orderRes.getBody().message.includes('sold out'), '13. Sold-out Prevention (Orders for out-of-stock items blocked)');

    // Restore availability back to In Stock
    await adminController.toggleAvailability(req, res, (e) => console.error(e));
  }

  // 14. Admin Add, Update, and Delete Menu Item
  let testDishId;
  {
    const { req, res } = createMockReqRes({
      body: {
        name: 'Peri Peri French Fries',
        category: 'Snacks',
        price: 70,
        preparationTime: 7,
        isVeg: true,
        description: 'Crispy potato fries tossed with peri-peri spice'
      }
    });
    await adminController.addMenuItem(req, res, (e) => console.error(e));
    const b = res.getBody();
    assert(res.getStatusCode() === 201 && b.data.name === 'Peri Peri French Fries', '14. POST /api/admin/menu (Admin added new dish)');
    testDishId = b.data._id;
  }

  {
    const { req, res } = createMockReqRes({
      params: { id: testDishId },
      body: { price: 75 }
    });
    await adminController.updateMenuItem(req, res, (e) => console.error(e));
    assert(res.getStatusCode() === 200 && res.getBody().data.price === 75, '15. PUT /api/admin/menu/:id (Admin updated dish price)');
  }

  {
    const { req, res } = createMockReqRes({ params: { id: testDishId } });
    await adminController.deleteMenuItem(req, res, (e) => console.error(e));
    assert(res.getStatusCode() === 200 && res.getBody().success, '16. DELETE /api/admin/menu/:id (Admin deleted dish)');
  }

  console.log(`\n========================================`);
  console.log(`📊 Total Tests: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================\n`);

  process.exit(passed === total ? 0 : 1);
}

runVerification();
