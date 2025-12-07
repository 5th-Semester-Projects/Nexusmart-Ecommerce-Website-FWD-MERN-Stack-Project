import ARTryOn from '../models/ARTryOn.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/ErrorHandler.js';

// Get all AR enabled products
export const getAllARProducts = catchAsyncErrors(async (req, res, next) => {
  const arProducts = await ARTryOn.find({ status: 'active' })
    .populate('product');

  res.status(200).json({
    success: true,
    count: arProducts.length,
    arProducts
  });
});

// Get AR configuration for product
export const getARProduct = catchAsyncErrors(async (req, res, next) => {
  const arProduct = await ARTryOn.findOne({ product: req.params.productId })
    .populate('product');

  if (!arProduct) {
    return next(new ErrorHandler('AR configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    arProduct
  });
});

// Create AR configuration
export const createARConfiguration = catchAsyncErrors(async (req, res, next) => {
  const arConfig = await ARTryOn.create(req.body);

  res.status(201).json({
    success: true,
    message: 'AR configuration created successfully',
    arConfig
  });
});

// Update AR configuration
export const updateARConfiguration = catchAsyncErrors(async (req, res, next) => {
  let arConfig = await ARTryOn.findById(req.params.id);

  if (!arConfig) {
    return next(new ErrorHandler('AR configuration not found', 404));
  }

  arConfig = await ARTryOn.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'AR configuration updated successfully',
    arConfig
  });
});

// Delete AR configuration
export const deleteARConfiguration = catchAsyncErrors(async (req, res, next) => {
  const arConfig = await ARTryOn.findById(req.params.id);

  if (!arConfig) {
    return next(new ErrorHandler('AR configuration not found', 404));
  }

  await arConfig.remove();

  res.status(200).json({
    success: true,
    message: 'AR configuration deleted successfully'
  });
});

// Start AR session
export const startARSession = catchAsyncErrors(async (req, res, next) => {
  const { productId, deviceInfo } = req.body;

  const arProduct = await ARTryOn.findOne({ product: productId });

  if (!arProduct) {
    return next(new ErrorHandler('AR configuration not found', 404));
  }

  await arProduct.startSession(req.user._id, deviceInfo);

  res.status(200).json({
    success: true,
    message: 'AR session started',
    arProduct
  });
});

// Track AR action
export const trackARAction = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, action } = req.body;

  const arProduct = await ARTryOn.findOne({ 'arSessions.sessionId': sessionId });

  if (!arProduct) {
    return next(new ErrorHandler('AR session not found', 404));
  }

  await arProduct.trackAction(sessionId, action);

  res.status(200).json({
    success: true,
    message: 'Action tracked'
  });
});

// End AR session
export const endARSession = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, converted } = req.body;

  const arProduct = await ARTryOn.findOne({ 'arSessions.sessionId': sessionId });

  if (!arProduct) {
    return next(new ErrorHandler('AR session not found', 404));
  }

  await arProduct.endSession(sessionId, converted);

  res.status(200).json({
    success: true,
    message: 'AR session ended'
  });
});

// Upload 3D model
export const upload3DModel = catchAsyncErrors(async (req, res, next) => {
  const { productId, modelData } = req.body;

  const arProduct = await ARTryOn.findOne({ product: productId });

  if (!arProduct) {
    return next(new ErrorHandler('AR configuration not found', 404));
  }

  arProduct.model3D = modelData;
  arProduct.processing.modelOptimization = 'processing';

  await arProduct.save();

  res.status(200).json({
    success: true,
    message: '3D model uploaded successfully',
    arProduct
  });
});

// Get AR analytics
export const getARAnalytics = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const analytics = await ARTryOn.getARAnalytics(productId);

  res.status(200).json({
    success: true,
    analytics
  });
});

// Get top performing AR products
export const getTopPerformingAR = catchAsyncErrors(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const topProducts = await ARTryOn.getTopPerformingAR(parseInt(limit));

  res.status(200).json({
    success: true,
    count: topProducts.length,
    topProducts
  });
});

// Submit AR feedback
export const submitARFeedback = catchAsyncErrors(async (req, res, next) => {
  const { productId, rating, feedback, issues } = req.body;

  const arProduct = await ARTryOn.findOne({ product: productId });

  if (!arProduct) {
    return next(new ErrorHandler('AR configuration not found', 404));
  }

  arProduct.arFeedback.push({
    user: req.user._id,
    rating,
    feedback,
    issues
  });

  await arProduct.save();

  res.status(200).json({
    success: true,
    message: 'Feedback submitted successfully'
  });
});
