import PriceAlert from '../models/PriceAlert.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';

// Create price alert
export const createAlert = catchAsyncErrors(async (req, res) => {
  const alert = await PriceAlert.create({
    ...req.body,
    user: req.user._id
  });

  await alert.populate('product');

  res.status(201).json({
    success: true,
    alert
  });
});

// Get user alerts
export const getUserAlerts = catchAsyncErrors(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { user: req.user._id };
  if (status) query.status = status;

  const alerts = await PriceAlert.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('product');

  const count = await PriceAlert.countDocuments(query);

  res.status(200).json({
    success: true,
    alerts,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});

// Check price
export const checkPrice = catchAsyncErrors(async (req, res) => {
  const { alertId } = req.params;
  const { newPrice } = req.body;

  const alert = await PriceAlert.findById(alertId);

  if (!alert) {
    return res.status(404).json({
      success: false,
      message: 'Alert not found'
    });
  }

  alert.checkPrice(newPrice);
  await alert.save();

  res.status(200).json({
    success: true,
    triggered: alert.triggered,
    alert
  });
});

// Cancel alert
export const cancelAlert = catchAsyncErrors(async (req, res) => {
  const { alertId } = req.params;

  const alert = await PriceAlert.findById(alertId);

  if (!alert) {
    return res.status(404).json({
      success: false,
      message: 'Alert not found'
    });
  }

  alert.cancel();
  await alert.save();

  res.status(200).json({
    success: true,
    message: 'Alert cancelled'
  });
});

// Pause alert
export const pauseAlert = catchAsyncErrors(async (req, res) => {
  const { alertId } = req.params;

  const alert = await PriceAlert.findById(alertId);

  if (!alert) {
    return res.status(404).json({
      success: false,
      message: 'Alert not found'
    });
  }

  alert.pause();
  await alert.save();

  res.status(200).json({
    success: true,
    message: 'Alert paused'
  });
});

// Resume alert
export const resumeAlert = catchAsyncErrors(async (req, res) => {
  const { alertId } = req.params;

  const alert = await PriceAlert.findById(alertId);

  if (!alert) {
    return res.status(404).json({
      success: false,
      message: 'Alert not found'
    });
  }

  alert.resume();
  await alert.save();

  res.status(200).json({
    success: true,
    message: 'Alert resumed'
  });
});

// Get alerts to check
export const getAlertsToCheck = catchAsyncErrors(async (req, res) => {
  const alerts = await PriceAlert.getAlertsToCheck();

  res.status(200).json({
    success: true,
    count: alerts.length,
    alerts
  });
});
