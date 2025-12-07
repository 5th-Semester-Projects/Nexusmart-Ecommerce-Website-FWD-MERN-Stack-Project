import DynamicPricingEngine from '../models/DynamicPricingEngine.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/ErrorHandler.js';

// Get product dynamic price
export const getProductPrice = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const pricing = await DynamicPricingEngine.getProductDynamicPrice(productId);

  if (!pricing) {
    return next(new ErrorHandler('Pricing not found', 404));
  }

  res.status(200).json({
    success: true,
    pricing
  });
});

// Update product price
export const updateProductPrice = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { reason, newPrice } = req.body;

  const pricing = await DynamicPricingEngine.findOne({ product: productId });

  if (!pricing) {
    return next(new ErrorHandler('Pricing configuration not found', 404));
  }

  await pricing.updatePrice(reason, newPrice);

  res.status(200).json({
    success: true,
    message: 'Price updated successfully',
    pricing
  });
});

// Track competitor prices
export const trackCompetitorPrices = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { competitors } = req.body;

  const pricing = await DynamicPricingEngine.findOne({ product: productId });

  if (!pricing) {
    return next(new ErrorHandler('Pricing configuration not found', 404));
  }

  pricing.competitorTracking.competitors = competitors;
  await pricing.save();

  res.status(200).json({
    success: true,
    message: 'Competitor prices updated'
  });
});

// Calculate demand score
export const calculateDemandScore = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const pricing = await DynamicPricingEngine.findOne({ product: productId });

  if (!pricing) {
    return next(new ErrorHandler('Pricing configuration not found', 404));
  }

  await pricing.calculateDemandScore();

  res.status(200).json({
    success: true,
    demandScore: pricing.demandBasedPricing.demandScore,
    demandLevel: pricing.demandBasedPricing.demandLevel
  });
});

// Activate flash sale
export const activateFlashSale = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { saleData } = req.body;

  const pricing = await DynamicPricingEngine.findOne({ product: productId });

  if (!pricing) {
    return next(new ErrorHandler('Pricing configuration not found', 404));
  }

  await pricing.activateFlashSale(saleData);

  res.status(200).json({
    success: true,
    message: 'Flash sale activated',
    flashSale: pricing.flashSaleAutomation.activeSale
  });
});

// Set personalized price
export const setPersonalizedPrice = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { userId, segment } = req.body;

  const pricing = await DynamicPricingEngine.findOne({ product: productId });

  if (!pricing) {
    return next(new ErrorHandler('Pricing configuration not found', 404));
  }

  const userSegment = pricing.personalizedPricing.userSegments.find(
    s => s.segment === segment
  );

  if (!userSegment) {
    return next(new ErrorHandler('User segment not found', 404));
  }

  const personalizedPrice = pricing.currentPrice.amount * (1 + userSegment.priceAdjustment / 100);

  res.status(200).json({
    success: true,
    personalizedPrice,
    segment
  });
});

// Update pricing rules
export const updatePricingRules = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { rules } = req.body;

  const pricing = await DynamicPricingEngine.findOne({ product: productId });

  if (!pricing) {
    return next(new ErrorHandler('Pricing configuration not found', 404));
  }

  pricing.rulesAndConstraints = {
    ...pricing.rulesAndConstraints,
    ...rules
  };

  await pricing.save();

  res.status(200).json({
    success: true,
    message: 'Pricing rules updated'
  });
});

// Get price history
export const getPriceHistory = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const pricing = await DynamicPricingEngine.findOne({ product: productId });

  if (!pricing) {
    return next(new ErrorHandler('Pricing not found', 404));
  }

  res.status(200).json({
    success: true,
    priceHistory: pricing.priceHistory
  });
});

// Get pricing analytics
export const getPricingAnalytics = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const pricing = await DynamicPricingEngine.findOne({ product: productId });

  if (!pricing) {
    return next(new ErrorHandler('Pricing not found', 404));
  }

  res.status(200).json({
    success: true,
    analytics: pricing.analytics
  });
});

// Handle pricing alerts
export const handlePricingAlerts = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const pricing = await DynamicPricingEngine.findOne({ product: productId });

  if (!pricing) {
    return next(new ErrorHandler('Pricing not found', 404));
  }

  const unacknowledgedAlerts = pricing.alerts.filter(a => !a.acknowledged);

  res.status(200).json({
    success: true,
    count: unacknowledgedAlerts.length,
    alerts: unacknowledgedAlerts
  });
});

// Update competitor prices (batch)
export const updateCompetitorPricesBatch = catchAsyncErrors(async (req, res, next) => {
  await DynamicPricingEngine.updateCompetitorPrices();

  res.status(200).json({
    success: true,
    message: 'Competitor prices updated for all products'
  });
});

// Create dynamic pricing configuration
export const createPricingConfiguration = catchAsyncErrors(async (req, res, next) => {
  const pricing = await DynamicPricingEngine.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Pricing configuration created',
    pricing
  });
});
