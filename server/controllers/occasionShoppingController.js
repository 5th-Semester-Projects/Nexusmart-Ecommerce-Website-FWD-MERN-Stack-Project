import OccasionBasedShopping from '../models/OccasionBasedShopping.js';
import Product from '../models/Product.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Create occasion shopping plan
export const createOccasionPlan = catchAsyncErrors(async (req, res, next) => {
  const { occasion, occasionDate, budget, recipients, preferences } = req.body;

  // Get AI recommendations based on occasion
  const recommendedProducts = await getOccasionRecommendations(
    occasion,
    budget,
    recipients,
    preferences
  );

  const plan = await OccasionBasedShopping.create({
    user: req.user.id,
    occasion,
    occasionDate,
    budget,
    recipients,
    recommendedProducts,
    preferences,
    status: 'planning'
  });

  res.status(201).json({
    success: true,
    data: plan
  });
});

// Get user's occasion plans
export const getUserOccasionPlans = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.query;

  const query = { user: req.user.id };
  if (status) query.status = status;

  const plans = await OccasionBasedShopping.find(query)
    .populate('recommendedProducts.product')
    .populate('purchasedProducts.product')
    .sort('-occasionDate');

  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans
  });
});

// Get occasion recommendations
export const getOccasionRecommendations = async (occasion, budget, recipients, preferences) => {
  const query = { stock: { $gt: 0 } };

  // Add budget filter
  if (budget) {
    query.price = { $gte: budget.min || 0, $lte: budget.max || 999999 };
  }

  // Add preference filters
  if (preferences?.categories?.length > 0) {
    query.category = { $in: preferences.categories };
  }

  const products = await Product.find(query).limit(20);

  return products.map(product => ({
    product: product._id,
    relevanceScore: Math.random() * 0.5 + 0.5, // Simulate AI scoring
    reason: `Perfect for ${occasion}`,
    addedAt: Date.now()
  }));
};

// Update occasion plan
export const updateOccasionPlan = catchAsyncErrors(async (req, res, next) => {
  const plan = await OccasionBasedShopping.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!plan) {
    return next(new ErrorHandler('Occasion plan not found', 404));
  }

  const allowedUpdates = ['budget', 'recipients', 'preferences', 'status', 'occasionDate'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      plan[field] = req.body[field];
    }
  });

  await plan.save();

  res.status(200).json({
    success: true,
    data: plan
  });
});

// Add product to occasion plan
export const addProductToOccasion = catchAsyncErrors(async (req, res, next) => {
  const { productId, reason } = req.body;

  const plan = await OccasionBasedShopping.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!plan) {
    return next(new ErrorHandler('Occasion plan not found', 404));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  plan.recommendedProducts.push({
    product: productId,
    relevanceScore: 0.95,
    reason: reason || 'User added',
    addedAt: Date.now()
  });

  await plan.save();

  res.status(200).json({
    success: true,
    data: plan
  });
});

// Set reminder for occasion
export const setOccasionReminder = catchAsyncErrors(async (req, res, next) => {
  const { date, message } = req.body;

  const plan = await OccasionBasedShopping.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!plan) {
    return next(new ErrorHandler('Occasion plan not found', 404));
  }

  plan.reminders.push({
    date,
    message: message || `Don't forget to shop for ${plan.occasion}`,
    sent: false
  });

  await plan.save();

  res.status(200).json({
    success: true,
    data: plan
  });
});

// Share occasion plan
export const shareOccasionPlan = catchAsyncErrors(async (req, res, next) => {
  const { userId, permissions } = req.body;

  const plan = await OccasionBasedShopping.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!plan) {
    return next(new ErrorHandler('Occasion plan not found', 404));
  }

  plan.sharedWith.push({
    user: userId,
    permissions: permissions || 'view'
  });

  await plan.save();

  res.status(200).json({
    success: true,
    data: plan
  });
});
