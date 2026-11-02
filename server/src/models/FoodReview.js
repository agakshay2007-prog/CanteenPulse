const mongoose = require('mongoose');

const foodReviewSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: String,
      default: null,
      index: true
    },
    dishName: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

foodReviewSchema.index({ menuItemId: 1, createdAt: -1 });

const FoodReview = mongoose.model('FoodReview', foodReviewSchema);

module.exports = FoodReview;

