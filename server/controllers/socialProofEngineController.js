import SocialProofEngine from '../models/SocialProofEngine.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/ErrorHandler.js';

// Get social proof configuration
export const getConfiguration = catchAsyncErrors(async (req, res, next) => {
  const config = await SocialProofEngine.getBusinessSocialProof(req.user._id);

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    config
  });
});

// Update social proof configuration
export const updateConfiguration = catchAsyncErrors(async (req, res, next) => {
  let config = await SocialProofEngine.findOne({ business: req.user._id });

  if (!config) {
    config = await SocialProofEngine.create({
      business: req.user._id,
      ...req.body
    });
  } else {
    config = await SocialProofEngine.findByIdAndUpdate(
      config._id,
      req.body,
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({
    success: true,
    message: 'Configuration updated successfully',
    config
  });
});

// Add recent purchase
export const addRecentPurchase = catchAsyncErrors(async (req, res, next) => {
  const { orderData } = req.body;

  const config = await SocialProofEngine.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  await config.addRecentPurchase(orderData);

  res.status(200).json({
    success: true,
    message: 'Recent purchase added'
  });
});

// Update live visitors
export const updateLiveVisitors = catchAsyncErrors(async (req, res, next) => {
  const { count, page } = req.body;

  const config = await SocialProofEngine.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  await config.updateLiveVisitors(count, page);

  res.status(200).json({
    success: true,
    message: 'Live visitors updated'
  });
});

// Track impression
export const trackImpression = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.body;

  const config = await SocialProofEngine.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  await config.trackImpression(type);

  res.status(200).json({
    success: true,
    message: 'Impression tracked'
  });
});

// Track click
export const trackClick = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.body;

  const config = await SocialProofEngine.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  await config.trackClick(type);

  res.status(200).json({
    success: true,
    message: 'Click tracked'
  });
});

// Get FOMO triggers
export const getFOMOTriggers = catchAsyncErrors(async (req, res, next) => {
  const config = await SocialProofEngine.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  const activeTriggers = config.fomoTriggers.triggers.filter(t => t.active);

  res.status(200).json({
    success: true,
    triggers: activeTriggers
  });
});

// Activate FOMO trigger
export const activateFOMOTrigger = catchAsyncErrors(async (req, res, next) => {
  const { triggerId } = req.params;
  const config = await SocialProofEngine.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  const trigger = config.fomoTriggers.triggers.id(triggerId);

  if (!trigger) {
    return next(new ErrorHandler('Trigger not found', 404));
  }

  trigger.active = true;
  await config.save();

  res.status(200).json({
    success: true,
    message: 'FOMO trigger activated'
  });
});

// Get analytics
export const getAnalytics = catchAsyncErrors(async (req, res, next) => {
  const config = await SocialProofEngine.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    analytics: config.analytics
  });
});

// Manage trust badges
export const manageTrustBadges = catchAsyncErrors(async (req, res, next) => {
  const { badges } = req.body;
  const config = await SocialProofEngine.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  config.trustBadges.badges = badges;
  await config.save();

  res.status(200).json({
    success: true,
    message: 'Trust badges updated'
  });
});

// Update review highlights
export const updateReviewHighlights = catchAsyncErrors(async (req, res, next) => {
  const { highlights } = req.body;
  const config = await SocialProofEngine.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  config.reviewHighlights.highlights = highlights;
  await config.save();

  res.status(200).json({
    success: true,
    message: 'Review highlights updated'
  });
});
