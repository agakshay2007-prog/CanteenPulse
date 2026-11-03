const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyAdmin } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');

// Public student order routes
router.post('/', orderLimiter, orderController.createOrder);
router.get('/:orderNumber', orderController.getOrder);

// Protected order status updates (allowed via admin token)
router.patch('/:orderNumber/status', verifyAdmin, orderController.updateOrderStatus);

module.exports = router;
