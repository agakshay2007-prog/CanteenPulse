const dataService = require('../services/dataService');
const { verifyPasscode, generateAdminToken } = require('../middleware/auth');

// @desc    Admin login & verify credentials with secure timing-safe check and signed HMAC token
// @route   POST /api/admin/login
exports.login = (req, res) => {
  const { passcode, username } = req.body;

  if (!passcode) {
    return res.status(400).json({
      success: false,
      message: 'Passcode is required for administrative login'
    });
  }

  // Timing-safe password verification
  const isValid = verifyPasscode(passcode);

  if (isValid) {
    const adminUser = username || 'canteen_manager';
    const signedToken = generateAdminToken(adminUser);

    return res.json({
      success: true,
      message: 'Admin authorization successful',
      token: signedToken,
      expiresIn: '24h',
      user: {
        username: adminUser,
        role: 'ADMIN'
      }
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid administrative passcode. Please check your credentials.'
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

// @desc    Get all orders for admin review with filtering and search
// @route   GET /api/admin/orders
exports.getOrders = async (req, res, next) => {
  try {
    const { status, studentId, rollNumber, search } = req.query;
    const orders = await dataService.getAllOrders({
      status,
      studentId,
      rollNumber,
      search
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order kitchen status with state machine transition enforcement
// @route   PATCH /api/admin/orders/:orderNumber/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { status, paymentStatus } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const updated = await dataService.updateOrderStatus(orderNumber, status, paymentStatus);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderNumber} not found`
      });
    }

    res.json({
      success: true,
      message: `Order ${updated.orderNumber} successfully updated to '${updated.status}'`,
      data: updated
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add dish to menu
// @route   POST /api/admin/menu
exports.addMenuItem = async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      description,
      preparationTime,
      isVeg,
      image,
      isPopular,
      tags
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Dish name and price are required'
      });
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
      return res.status(404).json({
        success: false,
        message: 'Dish not found'
      });
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
      return res.status(404).json({
        success: false,
        message: 'Dish not found'
      });
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
      return res.status(404).json({
        success: false,
        message: 'Dish not found'
      });
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
