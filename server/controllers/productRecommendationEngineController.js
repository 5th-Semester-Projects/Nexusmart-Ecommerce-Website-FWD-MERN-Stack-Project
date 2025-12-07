import ProductRecommendationEngine from '../models/ProductRecommendationEngine.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Get user recommendations
// @route   GET /api/v1/recommendations/:userId
// @access  Private
export const getUserRecommendations = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId })
    .populate('collaborativeFiltering.userBased.product')
    .populate('collaborativeFiltering.itemBased.product')
    .populate('deepLearning.neuralNetworkPredictions.product');

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  const recommendations = engine.getPersonalizedRecommendations(req.body.context);

  res.status(200).json({
    success: true,
    recommendations
  });
});

// @desc    Create recommendation engine for user
// @route   POST /api/v1/recommendations
// @access  Private
export const createRecommendationEngine = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.create(req.body);

  res.status(201).json({
    success: true,
    engine
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/recommendations/:userId/profile
// @access  Private
export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId });

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  engine.userProfile = { ...engine.userProfile, ...req.body };
  await engine.save();

  res.status(200).json({
    success: true,
    engine
  });
});

// @desc    Record impression
// @route   POST /api/v1/recommendations/:userId/impression
// @access  Public
export const recordImpression = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId });

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  const { productId, algorithm } = req.body;

  engine.recordImpression(productId, algorithm);
  await engine.save();

  res.status(200).json({
    success: true,
    message: 'Impression recorded'
  });
});

// @desc    Record click
// @route   POST /api/v1/recommendations/:userId/click
// @access  Public
export const recordClick = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId });

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  const { productId, algorithm } = req.body;

  engine.recordClick(productId, algorithm);
  await engine.save();

  res.status(200).json({
    success: true,
    message: 'Click recorded'
  });
});

// @desc    Record conversion
// @route   POST /api/v1/recommendations/:userId/conversion
// @access  Private
export const recordConversion = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId });

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  const { productId, algorithm, revenue } = req.body;

  engine.recordConversion(productId, algorithm, revenue);
  await engine.save();

  res.status(200).json({
    success: true,
    message: 'Conversion recorded'
  });
});

// @desc    Get cross-sell recommendations
// @route   GET /api/v1/recommendations/:userId/cross-sell/:productId
// @access  Public
export const getCrossSellRecommendations = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId })
    .populate('crossSell.recommendations.product');

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  const crossSell = engine.crossSell.find(
    cs => cs.baseProduct.toString() === req.params.productId
  );

  res.status(200).json({
    success: true,
    crossSell: crossSell || { recommendations: [] }
  });
});

// @desc    Get up-sell recommendations
// @route   GET /api/v1/recommendations/:userId/up-sell/:productId
// @access  Public
export const getUpSellRecommendations = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId })
    .populate('upSell.recommendations.product');

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  const upSell = engine.upSell.find(
    us => us.baseProduct.toString() === req.params.productId
  );

  res.status(200).json({
    success: true,
    upSell: upSell || { recommendations: [] }
  });
});

// @desc    Get trending recommendations
// @route   GET /api/v1/recommendations/:userId/trending
// @access  Public
export const getTrendingRecommendations = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId })
    .populate('trendingRecommendations.product');

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  res.status(200).json({
    success: true,
    trending: engine.trendingRecommendations
  });
});

// @desc    Get personalized bundles
// @route   GET /api/v1/recommendations/:userId/bundles
// @access  Private
export const getPersonalizedBundles = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId })
    .populate('personalizedBundles.products');

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  res.status(200).json({
    success: true,
    bundles: engine.personalizedBundles
  });
});

// @desc    Get similar items
// @route   GET /api/v1/recommendations/:userId/similar/:productId
// @access  Public
export const getSimilarItems = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId })
    .populate('similarItems.alternatives.product');

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  const similar = engine.similarItems.find(
    si => si.baseProduct.toString() === req.params.productId
  );

  res.status(200).json({
    success: true,
    similar: similar || { alternatives: [] }
  });
});

// @desc    Get recommendation performance
// @route   GET /api/v1/recommendations/:userId/performance
// @access  Private/Admin
export const getRecommendationPerformance = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId });

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  res.status(200).json({
    success: true,
    performance: engine.performance
  });
});

// @desc    Get top performers
// @route   GET /api/v1/recommendations/top-performers
// @access  Private/Admin
export const getTopPerformers = catchAsyncErrors(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const topPerformers = await ProductRecommendationEngine.getTopPerformers(parseInt(limit));

  res.status(200).json({
    success: true,
    topPerformers
  });
});

// @desc    Update diversity settings
// @route   PUT /api/v1/recommendations/:userId/diversity-settings
// @access  Private
export const updateDiversitySettings = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId });

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  engine.diversitySettings = { ...engine.diversitySettings, ...req.body };
  await engine.save();

  res.status(200).json({
    success: true,
    engine
  });
});

// @desc    Add negative signal
// @route   POST /api/v1/recommendations/:userId/negative-signal
// @access  Private
export const addNegativeSignal = catchAsyncErrors(async (req, res, next) => {
  const engine = await ProductRecommendationEngine.findOne({ user: req.params.userId });

  if (!engine) {
    return next(new ErrorHandler('Recommendation engine not found', 404));
  }

  const { type, productId, reason } = req.body;

  if (type === 'dislike') {
    engine.negativeSignals.dislikedProducts.push({
      product: productId,
      reason,
      timestamp: Date.now()
    });
  } else if (type === 'return') {
    engine.negativeSignals.returnedProducts.push({
      product: productId,
      reason,
      timestamp: Date.now()
    });
  }

  await engine.save();

  res.status(200).json({
    success: true,
    message: 'Negative signal added'
  });
});
