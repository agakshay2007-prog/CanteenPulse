const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  specialInstructions: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    student: {
      name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true
      },
      studentId: {
        type: String,
        required: [true, 'Student Roll No / ID is required'],
        trim: true,
        index: true
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
      }
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'Order must contain at least one item'
      }
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    pickupTime: {
      type: String,
      required: [true, 'Pickup time is required']
    },
    pickupCounter: {
      type: String,
      default: 'Counter #1 (Express Pickup)'
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['Pay at Counter', 'UPI / Online'],
      default: 'Pay at Counter'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

