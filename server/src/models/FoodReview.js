const mongoose = require('mongoose');

const foodReviewSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.Mixed, // Can store ObjectId or string ID
      ref: 'MenuItem',
      default: null,
      index: true
    },
    // Backwards compatibility alias
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
      trim: true,
      maxlength: [100, 'Student name cannot exceed 100 characters']
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
      minlength: [3, 'Comment must be at least 3 characters long'],
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save synchronization hook
foodReviewSchema.pre('save', function (next) {
  if (this.menuItem && !this.menuItemId) {
    this.menuItemId = this.menuItem.toString();
  }
  if (this.menuItemId && !this.menuItem) {
    this.menuItem = this.menuItemId;
  }
  next();
});

// Post-save hook to automatically recalculate averageRating and totalReviews on MenuItem
foodReviewSchema.post('save', async function () {
  try {
    const targetId = this.menuItemId || this.menuItem;
    if (targetId) {
      const MenuItem = mongoose.model('MenuItem');
      const allReviews = await mongoose.model('FoodReview').find({
        $or: [{ menuItem: targetId }, { menuItemId: targetId }]
      });

      if (allReviews.length > 0) {
        const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = Math.round((sum / allReviews.length) * 10) / 10;
        await MenuItem.findByIdAndUpdate(targetId, {
          averageRating: avg,
          totalReviews: allReviews.length,
          rating: avg,
          ratingCount: allReviews.length
        });
      }
    }
  } catch (err) {
    // Non-fatal logging
    console.error('Failed to recalculate average rating for menu item:', err.message);
  }
});

foodReviewSchema.index({ menuItem: 1, createdAt: -1 });
foodReviewSchema.index({ menuItemId: 1, createdAt: -1 });

const FoodReview = mongoose.model('FoodReview', foodReviewSchema);

module.exports = FoodReview;
