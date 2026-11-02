const dataService = require('../services/dataService');

// @desc    Place a new food order (Server-Side Price Calculation)
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { student, items, pickupTime, pickupCounter, paymentMethod, notes } = req.body;

    if (!student || !student.name || !student.studentId || !student.phone) {
      return res.status(400).json({
        success: false,
        message: 'Student name, Roll Number/Student ID, and phone number are required.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart cannot be empty. Please select at least one dish.'
      });
    }

    if (!pickupTime) {
      return res.status(400).json({
        success: false,
        message: 'Please choose an available pickup time slot.'
      });
    }

    const order = await dataService.createOrderWithServerValidation({
      student,
      items,
      pickupTime,
      pickupCounter,
      paymentMethod,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Please collect your food at the chosen pickup slot.',
      data: order
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Track order by orderNumber (with optional student verification)
// @route   GET /api/orders/:orderNumber
exports.getOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { verifyPhone, verifyId } = req.query;

    const order = await dataService.getOrderByNumber(orderNumber);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderNumber} not found. Please double-check your Order Number.`
      });
    }

    // Optional verification if student checks private order
    if (verifyPhone && order.student.phone !== verifyPhone.trim()) {
      return res.status(403).json({
        success: false,
        message: 'Verification failed: Phone number does not match this order.'
      });
    }

    if (verifyId && order.student.studentId.toUpperCase() !== verifyId.trim().toUpperCase()) {
      return res.status(403).json({
        success: false,
        message: 'Verification failed: Student ID does not match this order.'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

