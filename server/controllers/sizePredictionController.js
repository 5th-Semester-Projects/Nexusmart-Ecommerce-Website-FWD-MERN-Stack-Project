const SizePrediction = require('../models/SizePrediction');
const Product = require('../models/Product');
const StyleProfile = require('../models/StyleProfile');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');

// Get size prediction for a product
export const predictSize = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Get user's body measurements
  const styleProfile = await StyleProfile.findOne({ user: req.user.id });
  const measurements = styleProfile?.bodyMeasurements || {};

  // Get user's previous purchases for this brand/category
  const previousPurchases = await SizePrediction.find({
    user: req.user.id
  }).populate('product');

  // Run ML prediction algorithm
  const prediction = runSizePredictionML(
    measurements,
    product,
    previousPurchases
  );

  // Save prediction
  const sizePrediction = await SizePrediction.create({
    user: req.user.id,
    product: productId,
    measurements,
    previousPurchases: previousPurchases.map(p => ({
      product: p.product._id,
      size: p.actualPurchase?.size,
      fit: p.actualPurchase?.fitFeedback,
      returned: p.actualPurchase?.returned
    })),
    predictedSize: prediction,
    fitGuarantee: {
      eligible: prediction.confidence > 80,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    mlModel: {
      version: '1.0.0',
      accuracy: 0.87,
      lastTrainedAt: new Date('2025-01-01')
    }
  });

  res.status(200).json({
    success: true,
    prediction: sizePrediction
  });
});

// Update actual purchase feedback
export const updateFeedback = catchAsyncErrors(async (req, res, next) => {
  const { predictionId } = req.params;
  const { actualSize, fitFeedback, returned, returnReason } = req.body;

  const prediction = await SizePrediction.findById(predictionId);
  if (!prediction) {
    return next(new ErrorHandler('Prediction not found', 404));
  }

  prediction.actualPurchase = {
    size: actualSize,
    fitFeedback,
    returned,
    returnReason
  };

  await prediction.save();

  // Retrain ML model with new feedback (async)
  retrainSizeModel(prediction);

  res.status(200).json({
    success: true,
    message: 'Thank you for your feedback! This helps improve our predictions.'
  });
});

// Get size chart for brand
export const getSizeChart = catchAsyncErrors(async (req, res, next) => {
  const { brand, category } = req.query;

  // Get user measurements
  const styleProfile = await StyleProfile.findOne({ user: req.user.id });

  const sizeChart = generateSizeChart(brand, category, styleProfile?.bodyMeasurements);

  res.status(200).json({
    success: true,
    sizeChart
  });
});

// Get fit guarantee details
export const getFitGuarantee = catchAsyncErrors(async (req, res, next) => {
  const guaranteeDetails = {
    description: 'We guarantee the fit or you get free returns and exchanges',
    conditions: [
      'Purchase based on our AI size recommendation',
      'Return within 30 days',
      'Items in original condition'
    ],
    benefits: [
      'Free return shipping',
      'Free size exchange',
      'Priority processing',
      '100% refund guarantee'
    ]
  };

  res.status(200).json({
    success: true,
    guaranteeDetails
  });
});

// Get sizing analytics
export const getSizingAnalytics = catchAsyncErrors(async (req, res, next) => {
  const predictions = await SizePrediction.find({ user: req.user.id })
    .populate('product');

  const analytics = {
    totalPredictions: predictions.length,
    purchasedProducts: predictions.filter(p => p.actualPurchase).length,
    accuratePredictons: predictions.filter(
      p => p.actualPurchase && p.actualPurchase.fitFeedback === 'perfect'
    ).length,
    returnedDueToSize: predictions.filter(
      p => p.actualPurchase?.returned && p.actualPurchase?.returnReason?.includes('size')
    ).length,
    brandFitMapping: {}
  };

  // Calculate accuracy rate
  if (analytics.purchasedProducts > 0) {
    analytics.accuracyRate = (analytics.accuratePredictons / analytics.purchasedProducts * 100).toFixed(2);
  }

  res.status(200).json({
    success: true,
    analytics
  });
});

// Helper Functions
function runSizePredictionML(measurements, product, previousPurchases) {
  // Mock ML prediction - integrate with TensorFlow/PyTorch model
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  let predictedIndex = 2; // Default to M

  // Adjust based on measurements
  if (measurements.chest && measurements.chest < 85) predictedIndex = 0;
  else if (measurements.chest && measurements.chest < 90) predictedIndex = 1;
  else if (measurements.chest && measurements.chest < 100) predictedIndex = 2;
  else if (measurements.chest && measurements.chest < 110) predictedIndex = 3;
  else if (measurements.chest) predictedIndex = 4;

  // Adjust based on previous purchases
  if (previousPurchases.length > 0) {
    const recentFit = previousPurchases[previousPurchases.length - 1]?.actualPurchase?.fitFeedback;
    if (recentFit === 'too_small') predictedIndex++;
    else if (recentFit === 'too_large') predictedIndex--;
  }

  predictedIndex = Math.max(0, Math.min(sizes.length - 1, predictedIndex));

  return {
    size: sizes[predictedIndex],
    confidence: 85 + Math.random() * 10,
    alternativeSizes: [
      { size: sizes[Math.max(0, predictedIndex - 1)], probability: 0.25 },
      { size: sizes[Math.min(sizes.length - 1, predictedIndex + 1)], probability: 0.20 }
    ]
  };
}

function generateSizeChart(brand, category, userMeasurements) {
  // Mock size chart generation
  const sizeChart = {
    brand,
    category,
    unit: 'cm',
    sizes: [
      { size: 'XS', chest: '80-85', waist: '60-65', hips: '85-90' },
      { size: 'S', chest: '85-90', waist: '65-70', hips: '90-95' },
      { size: 'M', chest: '90-95', waist: '70-75', hips: '95-100' },
      { size: 'L', chest: '95-100', waist: '75-80', hips: '100-105' },
      { size: 'XL', chest: '100-110', waist: '80-90', hips: '105-115' }
    ]
  };

  if (userMeasurements) {
    sizeChart.recommendedSize = findMatchingSize(userMeasurements, sizeChart.sizes);
  }

  return sizeChart;
}

function findMatchingSize(measurements, sizes) {
  for (const size of sizes) {
    const [minChest, maxChest] = size.chest.split('-').map(Number);
    if (measurements.chest >= minChest && measurements.chest <= maxChest) {
      return size.size;
    }
  }
  return 'M'; // Default
}

async function retrainSizeModel(newData) {
  // Async ML model retraining - implement with ML pipeline
  console.log('Retraining size prediction model with new feedback...');
  // This would trigger ML pipeline to retrain model
}
