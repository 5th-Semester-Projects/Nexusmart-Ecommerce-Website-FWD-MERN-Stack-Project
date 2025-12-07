const OneClickCheckout = require('../models/OneClickCheckout');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Get one-click checkout settings
exports.getSettings = catchAsyncErrors(async (req, res) => {
  let settings = await OneClickCheckout.findOne({ user: req.user._id });

  if (!settings) {
    settings = await OneClickCheckout.create({ user: req.user._id });
  }

  res.status(200).json({
    success: true,
    settings
  });
});

// Add payment method
exports.addPaymentMethod = catchAsyncErrors(async (req, res) => {
  const { paymentData } = req.body;

  let settings = await OneClickCheckout.findOne({ user: req.user._id });

  if (!settings) {
    settings = await OneClickCheckout.create({ user: req.user._id });
  }

  settings.addPaymentMethod(paymentData);
  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Payment method added',
    settings
  });
});

// Add shipping address
exports.addShippingAddress = catchAsyncErrors(async (req, res) => {
  const { addressData } = req.body;

  let settings = await OneClickCheckout.findOne({ user: req.user._id });

  if (!settings) {
    settings = await OneClickCheckout.create({ user: req.user._id });
  }

  settings.addShippingAddress(addressData);
  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Shipping address added',
    settings
  });
});

// Set default payment method
exports.setDefaultPayment = catchAsyncErrors(async (req, res) => {
  const { paymentId } = req.body;

  const settings = await OneClickCheckout.findOne({ user: req.user._id });

  if (!settings) {
    return res.status(404).json({
      success: false,
      message: 'Settings not found'
    });
  }

  settings.setDefaultPaymentMethod(paymentId);
  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Default payment method set'
  });
});

// Set default shipping address
exports.setDefaultShipping = catchAsyncErrors(async (req, res) => {
  const { addressId } = req.body;

  const settings = await OneClickCheckout.findOne({ user: req.user._id });

  if (!settings) {
    return res.status(404).json({
      success: false,
      message: 'Settings not found'
    });
  }

  settings.setDefaultShippingAddress(addressId);
  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Default shipping address set'
  });
});

// Validate one-click purchase
exports.validatePurchase = catchAsyncErrors(async (req, res) => {
  const { orderValue } = req.body;

  const settings = await OneClickCheckout.findOne({ user: req.user._id });

  if (!settings) {
    return res.status(404).json({
      success: false,
      message: 'One-click checkout not set up'
    });
  }

  const validation = settings.validateOneClickPurchase(orderValue);

  res.status(200).json({
    success: true,
    valid: validation.valid,
    message: validation.message
  });
});

// Update analytics
exports.updateAnalytics = catchAsyncErrors(async (req, res) => {
  const { orderValue, isOneClick } = req.body;

  const settings = await OneClickCheckout.findOne({ user: req.user._id });

  if (!settings) {
    return res.status(404).json({
      success: false,
      message: 'Settings not found'
    });
  }

  settings.updateAnalytics(orderValue, isOneClick);
  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Analytics updated'
  });
});

module.exports = exports;
