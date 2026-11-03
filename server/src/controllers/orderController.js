const dataService = require('../services/dataService');

// @desc    Place a new food order (Strict Server-Side Price Calculation & Validation)
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const {
      student,
      studentName,
      rollNumber,
      phoneNumber,
      items,
      pickupTime,
      pickupCounter,
      specialInstructions,
      paymentMethod,
      notes
    } = req.body;

    const sName = (studentName || (student && student.name) || '').trim();
    const sRoll = (rollNumber || (student && student.studentId) || '').trim();
    const sPhone = (phoneNumber || (student && student.phone) || '').trim();

    if (!sName) {
      return res.status(400).json({
        success: false,
        message: 'Student name is required'
      });
    }

    if (!sRoll) {
      return res.status(400).json({
        success: false,
        message: 'Student Roll Number / College ID is required'
      });
    }

    if (!sPhone || !/^\+?[0-9\s-]{10,15}$/.test(sPhone)) {
      return res.status(400).json({
        success: false,
        message: 'A valid contact phone number (at least 10 digits) is required'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart cannot be empty. Please select at least one dish.'
      });
    }

    if (!pickupTime || !pickupTime.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please choose an available pickup time slot.'
      });
    }

    const order = await dataService.createOrderWithServerValidation({
      studentName: sName,
      rollNumber: sRoll,
      phoneNumber: sPhone,
      student: { name: sName, studentId: sRoll, phone: sPhone },
      items,
      pickupTime,
      pickupCounter,
      specialInstructions,
      paymentMethod,
      notes
    });

    res.status(201).json({
      success: true,
      message: `Order #${order.orderNumber} placed successfully! Please collect your food at counter during your chosen pickup slot (${order.pickupTime}).`,
      data: order
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Track order by orderNumber (with privacy verification check)
// @route   GET /api/orders/:orderNumber
exports.getOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { verifyPhone, verifyId, verifyRoll } = req.query;

    const order = await dataService.getOrderByNumber(orderNumber);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderNumber} not found. Please double-check your Order Number.`
      });
    }

    const orderPhone = order.phoneNumber || (order.student && order.student.phone) || '';
    const orderRoll = (order.rollNumber || (order.student && order.student.studentId) || '').toUpperCase();

    // Verification protection so users cannot inspect arbitrary student orders
    if (verifyPhone && orderPhone !== verifyPhone.trim()) {
      return res.status(403).json({
        success: false,
        message: 'Verification failed: Phone number does not match this order.'
      });
    }

    const targetRoll = (verifyRoll || verifyId || '').trim().toUpperCase();
    if (targetRoll && orderRoll !== targetRoll) {
      return res.status(403).json({
        success: false,
        message: 'Verification failed: Roll Number / Student ID does not match this order.'
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

// @desc    Update order status
// @route   PATCH /api/orders/:orderNumber/status
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
      message: `Order #${updated.orderNumber} updated to status '${updated.status}'`,
      data: updated
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
