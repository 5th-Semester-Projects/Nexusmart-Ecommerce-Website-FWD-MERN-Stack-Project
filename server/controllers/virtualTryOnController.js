const VirtualTryOn = require('../models/VirtualTryOn');
const Product = require('../models/Product');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create try-on session
export const createSession = catchAsyncErrors(async (req, res) => {
  const session = await VirtualTryOn.create({
    ...req.body,
    user: req.user?._id,
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });

  await session.populate('product');

  res.status(201).json({
    success: true,
    session
  });
});

// Get try-on session
export const getSession = catchAsyncErrors(async (req, res) => {
  const { sessionId } = req.params;

  const session = await VirtualTryOn.findOne({ sessionId }).populate('product');

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  res.status(200).json({
    success: true,
    session
  });
});

// Track interaction
export const trackInteraction = catchAsyncErrors(async (req, res) => {
  const { sessionId } = req.params;
  const { action, value } = req.body;

  const session = await VirtualTryOn.findOne({ sessionId });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  session.trackInteraction(action, value);
  await session.save();

  res.status(200).json({
    success: true,
    message: 'Interaction tracked'
  });
});

// Generate share link
export const generateShareLink = catchAsyncErrors(async (req, res) => {
  const { sessionId } = req.params;

  const session = await VirtualTryOn.findOne({ sessionId });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  const shareLink = session.generateShareLink();
  await session.save();

  res.status(200).json({
    success: true,
    shareLink
  });
});

// Get popular try-ons
export const getPopularTryOns = catchAsyncErrors(async (req, res) => {
  const { limit = 10 } = req.query;

  const popular = await VirtualTryOn.getPopularTryOns(parseInt(limit));

  res.status(200).json({
    success: true,
    popular
  });
});

// Get conversion rate
export const getConversionRate = catchAsyncErrors(async (req, res) => {
  const { productId } = req.params;

  const conversionRate = await VirtualTryOn.getConversionRate(productId);

  res.status(200).json({
    success: true,
    productId,
    conversionRate
  });
});

module.exports = exports;
