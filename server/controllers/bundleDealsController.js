const BundleDeals = require('../models/BundleDeals');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create bundle
export const createBundle = catchAsyncErrors(async (req, res) => {
  const bundle = await BundleDeals.create(req.body);

  res.status(201).json({
    success: true,
    bundle
  });
});

// Get bundle by slug
export const getBundle = catchAsyncErrors(async (req, res) => {
  const { slug } = req.params;

  const bundle = await BundleDeals.findOne({ slug })
    .populate('products.product relatedBundles frequentlyBoughtTogether');

  if (!bundle) {
    return res.status(404).json({
      success: false,
      message: 'Bundle not found'
    });
  }

  // Update analytics
  bundle.updateAnalytics('view');
  await bundle.save();

  res.status(200).json({
    success: true,
    bundle
  });
});

// Get active bundles
export const getActiveBundles = catchAsyncErrors(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const bundles = await BundleDeals.getActiveBundles()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('products.product');

  const count = await BundleDeals.countDocuments({
    active: true,
    status: 'active'
  });

  res.status(200).json({
    success: true,
    bundles,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});

// Get featured bundles
export const getFeaturedBundles = catchAsyncErrors(async (req, res) => {
  const { limit = 5 } = req.query;

  const bundles = await BundleDeals.getFeaturedBundles(parseInt(limit));

  res.status(200).json({
    success: true,
    bundles
  });
});

// Check availability
export const checkAvailability = catchAsyncErrors(async (req, res) => {
  const { bundleId } = req.params;

  const bundle = await BundleDeals.findById(bundleId);

  if (!bundle) {
    return res.status(404).json({
      success: false,
      message: 'Bundle not found'
    });
  }

  const available = bundle.checkAvailability();

  res.status(200).json({
    success: true,
    available,
    bundle: available ? bundle : null
  });
});

// Track analytics
export const trackAnalytics = catchAsyncErrors(async (req, res) => {
  const { bundleId } = req.params;
  const { action, value } = req.body;

  const bundle = await BundleDeals.findById(bundleId);

  if (!bundle) {
    return res.status(404).json({
      success: false,
      message: 'Bundle not found'
    });
  }

  bundle.updateAnalytics(action, value || 1);
  await bundle.save();

  res.status(200).json({
    success: true,
    message: 'Analytics tracked'
  });
});

module.exports = exports;
