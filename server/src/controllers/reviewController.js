const dataService = require('../services/dataService');

// @desc    Get food reviews
// @route   GET /api/reviews
exports.getReviews = async (req, res, next) => {
  try {
    const { menuItemId, limit } = req.query;
    const reviews = await dataService.getAllReviews({
      menuItemId,
      limit: parseInt(limit, 10) || 30
    });
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit food rating & review
// @route   POST /api/reviews
exports.submitReview = async (req, res, next) => {
  try {
    const { menuItemId, dishName, studentName, rating, comment } = req.body;

    if (!studentName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Student name, rating (1-5 stars), and review comment are required.'
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5.'
      });
    }

    const review = await dataService.createReview({
      menuItemId: menuItemId || null,
      dishName: dishName || 'General Canteen Service',
      studentName: studentName.trim(),
      rating: numRating,
      comment: comment.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Review published successfully! Thank you for your feedback.',
      data: review
    });
  } catch (err) {
    next(err);
  }
};

