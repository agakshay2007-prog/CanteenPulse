const dataService = require('../services/dataService');

// @desc    Get Crowd Pulse summary & trends
// @route   GET /api/crowd
exports.getCrowd = async (req, res, next) => {
  try {
    const summary = await dataService.getCrowdSummary();
    res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit voluntary crowd feedback (with duplicate protection)
// @route   POST /api/crowd
exports.submitCrowd = async (req, res, next) => {
  try {
    const { crowdLevel, comment, estimatedWait, studentName, studentIdentifier } = req.body;

    if (!crowdLevel) {
      return res.status(400).json({
        success: false,
        message: 'Please select a crowd level: Quiet, Moderate, or Busy.'
      });
    }

    const report = await dataService.submitCrowdFeedback({
      crowdLevel,
      comment,
      estimatedWait,
      studentName,
      studentIdentifier
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your voluntary crowd check-in! Helping your peers skip lines.',
      data: report
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

