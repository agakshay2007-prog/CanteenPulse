const dataService = require('../services/dataService');

// @desc    Get all menu items (with search, category, available filter)
// @route   GET /api/menu
exports.getMenu = async (req, res, next) => {
  try {
    const { category, search, availableOnly } = req.query;
    const items = await dataService.getAllMenuItems({ category, search, availableOnly });
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
exports.getMenuItem = async (req, res, next) => {
  try {
    const item = await dataService.getMenuItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

