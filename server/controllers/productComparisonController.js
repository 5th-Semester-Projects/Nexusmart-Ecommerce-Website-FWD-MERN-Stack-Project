const ProductComparison = require('../models/ProductComparison');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create comparison
exports.createComparison = catchAsyncErrors(async (req, res) => {
  const { products } = req.body;

  const comparison = await ProductComparison.create({
    user: req.user?._id,
    sessionId: req.sessionID || `session_${Date.now()}`,
    products: products.map(p => ({ product: p }))
  });

  await comparison.populate('products.product');

  res.status(201).json({
    success: true,
    comparison
  });
});

// Get comparison
exports.getComparison = catchAsyncErrors(async (req, res) => {
  const { comparisonId } = req.params;

  const comparison = await ProductComparison.findById(comparisonId)
    .populate('products.product');

  if (!comparison) {
    return res.status(404).json({
      success: false,
      message: 'Comparison not found'
    });
  }

  res.status(200).json({
    success: true,
    comparison
  });
});

// Add product to comparison
exports.addProduct = catchAsyncErrors(async (req, res) => {
  const { comparisonId } = req.params;
  const { productId } = req.body;

  const comparison = await ProductComparison.findById(comparisonId);

  if (!comparison) {
    return res.status(404).json({
      success: false,
      message: 'Comparison not found'
    });
  }

  if (comparison.products.length >= 5) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 5 products can be compared'
    });
  }

  comparison.products.push({ product: productId });
  await comparison.save();
  await comparison.populate('products.product');

  res.status(200).json({
    success: true,
    comparison
  });
});

// Remove product from comparison
exports.removeProduct = catchAsyncErrors(async (req, res) => {
  const { comparisonId, productId } = req.params;

  const comparison = await ProductComparison.findById(comparisonId);

  if (!comparison) {
    return res.status(404).json({
      success: false,
      message: 'Comparison not found'
    });
  }

  comparison.products = comparison.products.filter(
    p => p.product.toString() !== productId
  );

  await comparison.save();
  await comparison.populate('products.product');

  res.status(200).json({
    success: true,
    comparison
  });
});

// Get user comparisons
exports.getUserComparisons = catchAsyncErrors(async (req, res) => {
  const { limit = 10 } = req.query;

  const comparisons = await ProductComparison.find({ user: req.user._id })
    .sort({ lastModified: -1 })
    .limit(parseInt(limit))
    .populate('products.product');

  res.status(200).json({
    success: true,
    comparisons
  });
});

module.exports = exports;
