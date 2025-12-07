const CustomerSegmentation = require('../models/CustomerSegmentation');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Get user segmentation
exports.getUserSegmentation = catchAsyncErrors(async (req, res) => {
  let segmentation = await CustomerSegmentation.findOne({ user: req.user._id });

  if (!segmentation) {
    segmentation = await CustomerSegmentation.create({ user: req.user._id });
  }

  res.status(200).json({
    success: true,
    segmentation
  });
});

// Calculate RFM
exports.calculateRFM = catchAsyncErrors(async (req, res) => {
  const segmentation = await CustomerSegmentation.findOne({ user: req.user._id });

  if (!segmentation) {
    return res.status(404).json({
      success: false,
      message: 'Segmentation not found'
    });
  }

  segmentation.calculateRFM();
  await segmentation.save();

  res.status(200).json({
    success: true,
    message: 'RFM calculated',
    rfmAnalysis: segmentation.rfmAnalysis
  });
});

// Determine segment
exports.determineSegment = catchAsyncErrors(async (req, res) => {
  const segmentation = await CustomerSegmentation.findOne({ user: req.user._id });

  if (!segmentation) {
    return res.status(404).json({
      success: false,
      message: 'Segmentation not found'
    });
  }

  const segment = segmentation.determineSegment();
  await segmentation.save();

  res.status(200).json({
    success: true,
    segment,
    segmentation
  });
});

// Update segmentation from order
exports.updateFromOrder = catchAsyncErrors(async (req, res) => {
  const { orderData } = req.body;

  let segmentation = await CustomerSegmentation.findOne({ user: req.user._id });

  if (!segmentation) {
    segmentation = await CustomerSegmentation.create({ user: req.user._id });
  }

  segmentation.updateSegmentation(orderData);
  await segmentation.save();

  res.status(200).json({
    success: true,
    message: 'Segmentation updated',
    segmentation
  });
});

// Get segment distribution
exports.getSegmentDistribution = catchAsyncErrors(async (req, res) => {
  const distribution = await CustomerSegmentation.getSegmentDistribution();

  res.status(200).json({
    success: true,
    distribution
  });
});

// Get high-value customers
exports.getHighValueCustomers = catchAsyncErrors(async (req, res) => {
  const { limit = 100 } = req.query;

  const customers = await CustomerSegmentation.find({
    valueTier: { $in: ['platinum', 'diamond'] }
  })
    .sort({ 'customerLifecycle.currentLifetimeValue': -1 })
    .limit(parseInt(limit))
    .populate('user', 'name email');

  res.status(200).json({
    success: true,
    count: customers.length,
    customers
  });
});

// Get at-risk customers
exports.getAtRiskCustomers = catchAsyncErrors(async (req, res) => {
  const { limit = 100 } = req.query;

  const customers = await CustomerSegmentation.find({
    primarySegment: { $in: ['at_risk', 'about_to_sleep', 'cant_lose_them'] }
  })
    .sort({ 'customerLifecycle.churnRisk.score': -1 })
    .limit(parseInt(limit))
    .populate('user', 'name email');

  res.status(200).json({
    success: true,
    count: customers.length,
    customers
  });
});

module.exports = exports;
