const mongoose = require('mongoose');

// Canonical allowed order statuses
const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED'
];

// Display label mappings for UI compatibility
const STATUS_DISPLAY_MAP = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready for Pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

// Valid status transitions state machine
const ALLOWED_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], // Terminal state
  CANCELLED: []  // Terminal state
};

// Normalize any status input (e.g. "Ready for Pickup", "pending" -> "READY", "PENDING")
function normalizeStatus(status) {
  if (!status) return 'PENDING';
  const clean = status.toString().trim().toUpperCase();
  if (clean === 'READY FOR PICKUP' || clean === 'READY_FOR_PICKUP' || clean === 'READY') {
    return 'READY';
  }
  return clean;
}

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: String,
    required: [true, 'Menu item ID is required']
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  specialInstructions: {
    type: String,
    default: '',
    trim: true
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      index: true,
      trim: true,
      uppercase: true
    },
    // Top-level student information for Phase 3 schema compliance
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    rollNumber: {
      type: String,
      required: [true, 'Student Roll Number is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          // Allow 10 digits or standard format
          return /^\+?[0-9\s-]{10,15}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number (must be at least 10 digits)`
      }
    },
    // Nested object for backwards compatibility with existing UI
    student: {
      name: { type: String, trim: true },
      studentId: { type: String, trim: true },
      phone: { type: String, trim: true }
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'Order must contain at least one item'
      }
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    // Backwards compatibility alias for UI total
    total: {
      type: Number,
      min: 0
    },
    pickupTime: {
      type: String,
      required: [true, 'Pickup time is required'],
      trim: true
    },
    pickupCounter: {
      type: String,
      default: 'Counter #1 (Express Pickup)'
    },
    specialInstructions: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'PENDING',
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
    timestamps: true,
    collection: 'orders',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for human-readable display status (e.g., "Ready for Pickup")
orderSchema.virtual('statusDisplay').get(function () {
  return STATUS_DISPLAY_MAP[this.status] || this.status;
});

// Pre-save synchronization hook: keep top-level and nested student fields & total synced
orderSchema.pre('save', function (next) {
  // Sync student object
  if (this.studentName && (!this.student || !this.student.name)) {
    if (!this.student) this.student = {};
    this.student.name = this.studentName;
  }
  if (this.rollNumber && (!this.student || !this.student.studentId)) {
    if (!this.student) this.student = {};
    this.student.studentId = this.rollNumber;
  }
  if (this.phoneNumber && (!this.student || !this.student.phone)) {
    if (!this.student) this.student = {};
    this.student.phone = this.phoneNumber;
  }

  // Reverse sync if student object was provided
  if (this.student) {
    if (this.student.name && !this.studentName) this.studentName = this.student.name;
    if (this.student.studentId && !this.rollNumber) this.rollNumber = this.student.studentId;
    if (this.student.phone && !this.phoneNumber) this.phoneNumber = this.student.phone;
  }

  // Sync totals
  if (this.totalAmount !== undefined && this.total === undefined) {
    this.total = this.totalAmount;
  }
  if (this.total !== undefined && this.totalAmount === undefined) {
    this.totalAmount = this.total;
  }

  // Normalize status
  if (this.status) {
    this.status = normalizeStatus(this.status);
  }

  next();
});

// Compound indexes
orderSchema.index({ createdAt: -1 });
orderSchema.index({ rollNumber: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Helper methods on Model
orderSchema.statics.ORDER_STATUSES = ORDER_STATUSES;
orderSchema.statics.ALLOWED_TRANSITIONS = ALLOWED_TRANSITIONS;
orderSchema.statics.normalizeStatus = normalizeStatus;

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
