import ProductBundleKit from '../models/ProductBundleKit.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Get all bundles
// @route   GET /api/v1/bundles
// @access  Public
export const getAllBundles = catchAsyncErrors(async (req, res, next) => {
  const { type, featured, category } = req.query;

  const query = { available: true };
  if (type) query.type = type;
  if (featured === 'true') query.featured = true;
  if (category) query.category = category;

  const bundles = await ProductBundleKit.find(query)
    .populate('items.product')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bundles.length,
    bundles
  });
});

// @desc    Get single bundle
// @route   GET /api/v1/bundles/:id
// @access  Public
export const getBundleById = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.findById(req.params.id)
    .populate('items.product');

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  // Increment views
  bundle.performanceMetrics.views += 1;
  await bundle.save();

  res.status(200).json({
    success: true,
    bundle
  });
});

// @desc    Create bundle
// @route   POST /api/v1/bundles
// @access  Private/Admin
export const createBundle = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.create(req.body);

  res.status(201).json({
    success: true,
    bundle
  });
});

// @desc    Update bundle
// @route   PUT /api/v1/bundles/:id
// @access  Private/Admin
export const updateBundle = catchAsyncErrors(async (req, res, next) => {
  let bundle = await ProductBundleKit.findById(req.params.id);

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  bundle = await ProductBundleKit.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    bundle
  });
});

// @desc    Delete bundle
// @route   DELETE /api/v1/bundles/:id
// @access  Private/Admin
export const deleteBundle = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.findById(req.params.id);

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  await bundle.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Bundle deleted'
  });
});

// @desc    Add item to bundle
// @route   POST /api/v1/bundles/:id/items
// @access  Private/Admin
export const addItemToBundle = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.findById(req.params.id);

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  const { productId, quantity, variant, isOptional, discount } = req.body;

  bundle.addItem(productId, quantity, variant, isOptional, discount);
  await bundle.save();

  res.status(200).json({
    success: true,
    bundle
  });
});

// @desc    Remove item from bundle
// @route   DELETE /api/v1/bundles/:id/items/:productId
// @access  Private/Admin
export const removeItemFromBundle = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.findById(req.params.id);

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  bundle.removeItem(req.params.productId);
  await bundle.save();

  res.status(200).json({
    success: true,
    bundle
  });
});

// @desc    Calculate bundle price
// @route   POST /api/v1/bundles/:id/calculate-price
// @access  Public
export const calculateBundlePrice = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.findById(req.params.id)
    .populate('items.product');

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  const { selectedItems, customQuantities } = req.body;

  const pricing = await bundle.calculateBundlePrice(selectedItems, customQuantities);

  res.status(200).json({
    success: true,
    pricing
  });
});

// @desc    Check bundle availability
// @route   GET /api/v1/bundles/:id/availability
// @access  Public
export const checkBundleAvailability = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.findById(req.params.id)
    .populate('items.product');

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  const availability = await bundle.checkAvailability();

  res.status(200).json({
    success: true,
    available: availability.available,
    unavailableItems: availability.unavailableItems,
    maxQuantity: availability.maxQuantity
  });
});

// @desc    Validate bundle configuration
// @route   POST /api/v1/bundles/:id/validate
// @access  Public
export const validateBundle = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.findById(req.params.id);

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  const { selectedItems, quantities } = req.body;

  const validation = bundle.validateBundle(selectedItems, quantities);

  res.status(200).json({
    success: true,
    valid: validation.valid,
    errors: validation.errors
  });
});

// @desc    Get popular bundles
// @route   GET /api/v1/bundles/popular
// @access  Public
export const getPopularBundles = catchAsyncErrors(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const bundles = await ProductBundleKit.getPopularBundles(limit);

  res.status(200).json({
    success: true,
    count: bundles.length,
    bundles
  });
});

// @desc    Get featured bundles
// @route   GET /api/v1/bundles/featured
// @access  Public
export const getFeaturedBundles = catchAsyncErrors(async (req, res, next) => {
  const bundles = await ProductBundleKit.getFeaturedBundles();

  res.status(200).json({
    success: true,
    count: bundles.length,
    bundles
  });
});

// @desc    Update bundle inventory
// @route   PUT /api/v1/bundles/:id/inventory
// @access  Private/Admin
export const updateBundleInventory = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.findById(req.params.id);

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  const { action, quantity } = req.body;

  if (action === 'sold') {
    bundle.inventory.sold += quantity;
    bundle.inventory.totalAvailable -= quantity;
  } else if (action === 'add') {
    bundle.inventory.totalAvailable += quantity;
  } else if (action === 'reserve') {
    bundle.inventory.reserved += quantity;
    bundle.inventory.totalAvailable -= quantity;
  } else if (action === 'release') {
    bundle.inventory.reserved -= quantity;
    bundle.inventory.totalAvailable += quantity;
  }

  await bundle.save();

  res.status(200).json({
    success: true,
    inventory: bundle.inventory
  });
});

// @desc    Get bundle performance metrics
// @route   GET /api/v1/bundles/:id/performance
// @access  Private/Admin
export const getBundlePerformance = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.findById(req.params.id);

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  res.status(200).json({
    success: true,
    performance: bundle.performanceMetrics
  });
});

// @desc    Track bundle interaction
// @route   POST /api/v1/bundles/:id/track
// @access  Public
export const trackBundleInteraction = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.findById(req.params.id);

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  const { action, data } = req.body;

  if (action === 'view') {
    bundle.performanceMetrics.views += 1;
  } else if (action === 'purchase') {
    bundle.performanceMetrics.purchases += 1;
    bundle.performanceMetrics.revenue += data.revenue || 0;
  }

  await bundle.save();

  res.status(200).json({
    success: true,
    message: 'Interaction tracked'
  });
});

// @desc    Get bundle recommendations
// @route   GET /api/v1/bundles/:id/recommendations
// @access  Public
export const getBundleRecommendations = catchAsyncErrors(async (req, res, next) => {
  const bundle = await ProductBundleKit.findById(req.params.id);

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  // Find similar bundles based on category and tags
  const recommendations = await ProductBundleKit.find({
    _id: { $ne: bundle._id },
    category: bundle.category,
    available: true
  })
    .limit(5)
    .populate('items.product');

  res.status(200).json({
    success: true,
    count: recommendations.length,
    recommendations
  });
});

// @desc    Create custom bundle
// @route   POST /api/v1/bundles/custom
// @access  Public
export const createCustomBundle = catchAsyncErrors(async (req, res, next) => {
  const { items, name, type } = req.body;

  if (!items || items.length === 0) {
    return next(new ErrorHandler('Bundle must contain at least one item', 400));
  }

  const bundleData = {
    name: name || 'Custom Bundle',
    type: type || 'dynamic',
    items,
    pricingStrategy: {
      type: 'percentage-discount',
      value: 10
    }
  };

  const bundle = await ProductBundleKit.create(bundleData);

  res.status(201).json({
    success: true,
    bundle
  });
});
