const dataService = require('../services/dataService');

// @desc    Admin login & verify credentials
// @route   POST /api/admin/login
exports.login = (req, res) => {
  const { passcode } = req.body;
  const configuredPasscode = process.env.ADMIN_PASSCODE || 'admin123';
  const customSecret = process.env.ADMIN_SECRET || 'canteenpulse_secret_key_2026';

  if (passcode === configuredPasscode || passcode === customSecret) {
    return res.json({
      success: true,
      message: 'Admin authorization successful',
      token: configuredPasscode
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid administrative passcode. Default demo passcode is admin123'
  });
};

// @desc    Get dashboard metrics & summary
// @route   GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const stats = await dataService.getAdminDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders for admin review
// @route   GET /api/admin/orders
exports.getOrders = async (req, res, next) => {
  try {
    const { status, studentId, search } = req.query;
    const orders = await dataService.getAllOrders({ status, studentId, search });
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order kitchen status
// @route   PATCH /api/admin/orders/:orderNumber/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { status, paymentStatus } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updated = await dataService.updateOrderStatus(orderNumber, status, paymentStatus);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      message: `Order ${updated.orderNumber} updated to '${status}'`,
      data: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Add dish to menu
// @route   POST /api/admin/menu
exports.addMenuItem = async (req, res, next) => {
  try {
    const { name, category, price, description, preparationTime, isVeg, image, isPopular, tags } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Dish name and price are required' });
    }

    const item = await dataService.createMenuItem({
      name,
      category,
      price: Number(price),
      description,
      preparationTime: Number(preparationTime) || 10,
      isVeg: isVeg !== undefined ? isVeg : true,
      image,
      isPopular: !!isPopular,
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      message: 'New dish added to menu successfully',
      data: item
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update existing dish
// @route   PUT /api/admin/menu/:id
exports.updateMenuItem = async (req, res, next) => {
  try {
    const updated = await dataService.updateMenuItem(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }
    res.json({
      success: true,
      message: 'Dish updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle dish availability
// @route   PATCH /api/admin/menu/:id/toggle-availability
exports.toggleAvailability = async (req, res, next) => {
  try {
    const dish = await dataService.getMenuItemById(req.params.id);
    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    const updated = await dataService.updateMenuItem(req.params.id, {
      isAvailable: !dish.isAvailable
    });

    res.json({
      success: true,
      message: `Dish availability changed to ${updated.isAvailable ? 'In Stock' : 'Out of Stock'}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete dish from menu
// @route   DELETE /api/admin/menu/:id
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const deleted = await dataService.deleteMenuItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }
    res.json({
      success: true,
      message: 'Dish deleted successfully from menu',
      data: deleted
    });
  } catch (err) {
    next(err);
  }
};

