const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
      maxlength: [100, 'Dish name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Dessert', 'Specials'],
        message: '{VALUE} is not a valid category'
      },
      default: 'Lunch'
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than zero']
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
    preparationTime: {
      type: Number,
      default: 10,
      min: [1, 'Preparation time must be at least 1 minute']
    },
    isVeg: {
      type: Boolean,
      default: true
    },
    averageRating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
      type: Number,
      default: 1,
      min: 0
    },
    // Backwards-compatible fields for React frontend components
    rating: {
      type: Number,
      default: 4.5
    },
    ratingCount: {
      type: Number,
      default: 1
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Keep rating and averageRating synced before save
menuItemSchema.pre('save', function (next) {
  if (this.averageRating && !this.rating) {
    this.rating = this.averageRating;
  }
  if (this.rating && !this.averageRating) {
    this.averageRating = this.rating;
  }
  if (this.totalReviews && !this.ratingCount) {
    this.ratingCount = this.totalReviews;
  }
  if (this.ratingCount && !this.totalReviews) {
    this.totalReviews = this.ratingCount;
  }
  next();
});

// Compound & text indexes for rapid search and category filtering
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
