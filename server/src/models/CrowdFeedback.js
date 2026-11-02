const mongoose = require('mongoose');

const crowdFeedbackSchema = new mongoose.Schema(
  {
    crowdLevel: {
      type: String,
      required: [true, 'Crowd level is required'],
      enum: ['Quiet', 'Moderate', 'Busy']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [200, 'Comment cannot exceed 200 characters'],
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
      index: true
    }
  },
  {
    timestamps: true
  }
);

crowdFeedbackSchema.index({ createdAt: -1 });

const CrowdFeedback = mongoose.model('CrowdFeedback', crowdFeedbackSchema);

module.exports = CrowdFeedback;

