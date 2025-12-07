import MultiChannelIntegration from '../models/MultiChannelIntegration.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Get integration by business
// @route   GET /api/v1/multi-channel/:businessId
// @access  Private/Admin
export const getIntegration = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  res.status(200).json({
    success: true,
    integration
  });
});

// @desc    Create integration
// @route   POST /api/v1/multi-channel
// @access  Private/Admin
export const createIntegration = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.create(req.body);

  res.status(201).json({
    success: true,
    integration
  });
});

// @desc    Update integration
// @route   PUT /api/v1/multi-channel/:businessId
// @access  Private/Admin
export const updateIntegration = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOneAndUpdate(
    { businessId: req.params.businessId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  res.status(200).json({
    success: true,
    integration
  });
});

// @desc    Enable channel
// @route   PUT /api/v1/multi-channel/:businessId/enable/:channel
// @access  Private/Admin
export const enableChannel = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  const channel = req.params.channel;

  if (integration[channel]) {
    integration[channel].enabled = true;
    await integration.save();
  }

  res.status(200).json({
    success: true,
    message: `${channel} enabled successfully`
  });
});

// @desc    Disable channel
// @route   PUT /api/v1/multi-channel/:businessId/disable/:channel
// @access  Private/Admin
export const disableChannel = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  const channel = req.params.channel;

  if (integration[channel]) {
    integration[channel].enabled = false;
    await integration.save();
  }

  res.status(200).json({
    success: true,
    message: `${channel} disabled successfully`
  });
});

// @desc    Sync products to channel
// @route   POST /api/v1/multi-channel/:businessId/sync/:channel
// @access  Private/Admin
export const syncProductsToChannel = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  const { productIds } = req.body;
  const result = await integration.syncProductsToChannel(req.params.channel, productIds);

  await integration.save();

  res.status(200).json({
    success: true,
    result
  });
});

// @desc    Get Instagram analytics
// @route   GET /api/v1/multi-channel/:businessId/instagram/analytics
// @access  Private/Admin
export const getInstagramAnalytics = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  res.status(200).json({
    success: true,
    analytics: integration.instagram.analytics
  });
});

// @desc    Get Facebook analytics
// @route   GET /api/v1/multi-channel/:businessId/facebook/analytics
// @access  Private/Admin
export const getFacebookAnalytics = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  res.status(200).json({
    success: true,
    analytics: integration.facebook.analytics
  });
});

// @desc    Get Amazon analytics
// @route   GET /api/v1/multi-channel/:businessId/amazon/analytics
// @access  Private/Admin
export const getAmazonAnalytics = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  res.status(200).json({
    success: true,
    analytics: integration.amazon.analytics
  });
});

// @desc    Get eBay analytics
// @route   GET /api/v1/multi-channel/:businessId/ebay/analytics
// @access  Private/Admin
export const getEbayAnalytics = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  res.status(200).json({
    success: true,
    analytics: integration.ebay.analytics
  });
});

// @desc    Get WhatsApp analytics
// @route   GET /api/v1/multi-channel/:businessId/whatsapp/analytics
// @access  Private/Admin
export const getWhatsAppAnalytics = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  res.status(200).json({
    success: true,
    analytics: integration.whatsapp.analytics
  });
});

// @desc    Calculate total revenue
// @route   GET /api/v1/multi-channel/:businessId/total-revenue
// @access  Private/Admin
export const getTotalRevenue = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  const totalRevenue = integration.calculateTotalRevenue();
  await integration.save();

  res.status(200).json({
    success: true,
    totalRevenue,
    analytics: integration.analytics
  });
});

// @desc    Get sync history
// @route   GET /api/v1/multi-channel/:businessId/sync-history
// @access  Private/Admin
export const getSyncHistory = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  const { limit = 50 } = req.query;
  const history = integration.syncHistory.slice(-parseInt(limit));

  res.status(200).json({
    success: true,
    count: history.length,
    history
  });
});

// @desc    Get active integrations
// @route   GET /api/v1/multi-channel/:businessId/active
// @access  Private/Admin
export const getActiveIntegrations = catchAsyncErrors(async (req, res, next) => {
  const activeIntegrations = await MultiChannelIntegration.getActiveIntegrations(req.params.businessId);

  res.status(200).json({
    success: true,
    activeIntegrations
  });
});

// @desc    Update channel settings
// @route   PUT /api/v1/multi-channel/:businessId/:channel/settings
// @access  Private/Admin
export const updateChannelSettings = catchAsyncErrors(async (req, res, next) => {
  const integration = await MultiChannelIntegration.findOne({ businessId: req.params.businessId });

  if (!integration) {
    return next(new ErrorHandler('Integration not found', 404));
  }

  const channel = req.params.channel;

  if (integration[channel] && integration[channel].settings) {
    integration[channel].settings = { ...integration[channel].settings, ...req.body };
    await integration.save();
  }

  res.status(200).json({
    success: true,
    settings: integration[channel].settings
  });
});
