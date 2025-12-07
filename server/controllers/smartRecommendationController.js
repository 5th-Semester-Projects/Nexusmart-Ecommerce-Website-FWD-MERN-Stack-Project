import SmartRecommendation from '../models/SmartRecommendation.js';
import Product from '../models/Product.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';

// Get personalized recommendations
export const getPersonalizedRecommendations = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;
  const { page = 'home', limit = 10, type } = req.query;

  const context = {
    page,
    device: req.headers['user-agent'],
    location: req.ip
  };

  const recommendations = await SmartRecommendation.getPersonalizedRecommendations(
    userId,
    context,
    parseInt(limit)
  );

  if (type) {
    const filtered = recommendations.filter(rec => rec.recommendationType === type);
    return res.status(200).json({
      success: true,
      recommendations: filtered
    });
  }

  res.status(200).json({
    success: true,
    recommendations
  });
});

// Update recommendation performance
export const updatePerformance = catchAsyncErrors(async (req, res) => {
  const { recommendationId } = req.params;
  const { action, value } = req.body;

  const recommendation = await SmartRecommendation.findById(recommendationId);

  if (!recommendation) {
    return res.status(404).json({
      success: false,
      message: 'Recommendation not found'
    });
  }

  recommendation.updatePerformance(action, value || 1);
  await recommendation.save();

  res.status(200).json({
    success: true,
    message: 'Performance updated successfully'
  });
});

// Get trending products
export const getTrendingProducts = catchAsyncErrors(async (req, res) => {
  const { limit = 10 } = req.query;

  const trending = await SmartRecommendation.find({
    recommendationType: 'trending',
    expiresAt: { $gt: Date.now() }
  })
    .sort({ 'performanceMetrics.clicks': -1 })
    .limit(parseInt(limit))
    .populate('products.product');

  res.status(200).json({
    success: true,
    trending
  });
});

// Create recommendation
export const createRecommendation = catchAsyncErrors(async (req, res) => {
  const recommendation = await SmartRecommendation.create(req.body);

  res.status(201).json({
    success: true,
    recommendation
  });
});
