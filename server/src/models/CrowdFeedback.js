const mongoose = require('mongoose');

const CROWD_LEVELS = ['QUIET', 'MODERATE', 'BUSY'];

function normalizeCrowdLevel(level) {
  if (!level) return 'MODERATE';
  const clean = level.toString().trim().toUpperCase();
  if (clean === 'QUIET' || clean === 'MODERATE' || clean === 'BUSY') {
    return clean;
  }
  return 'MODERATE';
}

const crowdFeedbackSchema = new mongoose.Schema(
  {
    crowdLevel: {
      type: String,
      required: [true, 'Crowd level is required'],
      enum: {
        values: ['QUIET', 'MODERATE', 'BUSY', 'Quiet', 'Moderate', 'Busy'],
        message: '{VALUE} is not a valid crowd level (must be QUIET, MODERATE, or BUSY)'
      }
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [300, 'Comment cannot exceed 300 characters'],
      default: ''
    },
    estimatedWait: {
      type: String,
      default: '5-10 mins'
    },
    studentName: {
      type: String,
      trim: true,
      default: 'Anonymous Student'
    },
    studentIdentifier: {
      type: String,
      default: 'anonymous',
      trim: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for UI display format ("Quiet", "Moderate", "Busy")
crowdFeedbackSchema.virtual('crowdLevelDisplay').get(function () {
  const norm = normalizeCrowdLevel(this.crowdLevel);
  return norm.charAt(0) + norm.slice(1).toLowerCase();
});

// Pre-save normalization
crowdFeedbackSchema.pre('save', function (next) {
  if (this.crowdLevel) {
    this.crowdLevel = normalizeCrowdLevel(this.crowdLevel);
  }
  if (!this.estimatedWait) {
    if (this.crowdLevel === 'QUIET') this.estimatedWait = '< 5 mins';
    else if (this.crowdLevel === 'BUSY') this.estimatedWait = '15+ mins';
    else this.estimatedWait = '5-10 mins';
  }
  next();
});

// Indexes for query performance and rate limiting checks
crowdFeedbackSchema.index({ createdAt: -1 });
crowdFeedbackSchema.index({ studentIdentifier: 1, createdAt: -1 });

crowdFeedbackSchema.statics.CROWD_LEVELS = CROWD_LEVELS;
crowdFeedbackSchema.statics.normalizeCrowdLevel = normalizeCrowdLevel;

const CrowdFeedback = mongoose.model('CrowdFeedback', crowdFeedbackSchema);

module.exports = CrowdFeedback;
