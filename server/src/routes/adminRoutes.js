const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// Public admin authentication endpoint with brute-force rate limiter
router.post('/login', loginLimiter, adminController.login);

// Protected administrative operations
router.use(verifyAdmin);

router.get('/stats', adminController.getStats);
router.get('/orders', adminController.getOrders);
router.patch('/orders/:orderNumber/status', adminController.updateOrderStatus);

router.post('/menu', adminController.addMenuItem);
router.put('/menu/:id', adminController.updateMenuItem);
router.patch('/menu/:id/toggle-availability', adminController.toggleAvailability);
router.delete('/menu/:id', adminController.deleteMenuItem);

module.exports = router;
