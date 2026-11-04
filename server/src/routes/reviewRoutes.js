const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { reviewLimiter } = require('../middleware/rateLimiter');

router.get('/', reviewController.getReviews);
router.post('/', reviewLimiter, reviewController.submitReview);

module.exports = router;

