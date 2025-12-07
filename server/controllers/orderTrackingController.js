const OrderTracking = require('../models/OrderTracking');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create tracking
exports.createTracking = catchAsyncErrors(async (req, res) => {
  const tracking = await OrderTracking.create(req.body);

  res.status(201).json({
    success: true,
    tracking
  });
});

// Get tracking by tracking number
exports.getTracking = catchAsyncErrors(async (req, res) => {
  const { trackingNumber } = req.params;

  const tracking = await OrderTracking.findOne({ trackingNumber })
    .populate('order user');

  if (!tracking) {
    return res.status(404).json({
      success: false,
      message: 'Tracking information not found'
    });
  }

  // Track view
  tracking.analytics.viewCount += 1;
  tracking.analytics.lastViewed = Date.now();
  await tracking.save();

  res.status(200).json({
    success: true,
    tracking
  });
});

// Update status
exports.updateStatus = catchAsyncErrors(async (req, res) => {
  const { trackingNumber } = req.params;
  const { status, location, description, performedBy } = req.body;

  const tracking = await OrderTracking.findOne({ trackingNumber });

  if (!tracking) {
    return res.status(404).json({
      success: false,
      message: 'Tracking not found'
    });
  }

  tracking.updateStatus(status, location, description, performedBy);
  await tracking.save();

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    tracking
  });
});

// Report issue
exports.reportIssue = catchAsyncErrors(async (req, res) => {
  const { trackingNumber } = req.params;
  const { type, description, priority } = req.body;

  const tracking = await OrderTracking.findOne({ trackingNumber });

  if (!tracking) {
    return res.status(404).json({
      success: false,
      message: 'Tracking not found'
    });
  }

  tracking.reportIssue(type, description, priority || 'medium');
  await tracking.save();

  res.status(200).json({
    success: true,
    message: 'Issue reported successfully'
  });
});

// Get deliveries today
exports.getDeliveriesToday = catchAsyncErrors(async (req, res) => {
  const deliveries = await OrderTracking.getDeliveriesToday();

  res.status(200).json({
    success: true,
    count: deliveries.length,
    deliveries
  });
});

module.exports = exports;
