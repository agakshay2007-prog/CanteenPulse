const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

// Public menu browsing routes
router.get('/', menuController.getMenu);
router.get('/:id', menuController.getMenuItem);

// Administrative menu management (requires admin auth)
router.post('/', verifyAdmin, adminController.addMenuItem);
router.put('/:id', verifyAdmin, adminController.updateMenuItem);
router.patch('/:id/toggle-availability', verifyAdmin, adminController.toggleAvailability);
router.delete('/:id', verifyAdmin, adminController.deleteMenuItem);

module.exports = router;
