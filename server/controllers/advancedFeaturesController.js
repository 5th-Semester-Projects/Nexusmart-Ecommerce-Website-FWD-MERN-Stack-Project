import SubscriptionBox from '../models/SubscriptionBox.js';
import ProductBundle from '../models/ProductBundle.js';
import PreOrder from '../models/PreOrder.js';
import ShippingRate from '../models/ShippingRate.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Subscription Box Controllers

export const createSubscriptionBox = catchAsyncErrors(async (req, res, next) => {
  const { name, description, type, category, pricing, products, shipping } = req.body;

  const subscriptionBox = await SubscriptionBox.create({
    name,
    description,
    type,
    category,
    pricing,
    products,
    shipping,
    status: 'draft'
  });

  res.status(201).json({
    success: true,
    data: subscriptionBox
  });
});

export const subscribeToBox = catchAsyncErrors(async (req, res, next) => {
  const { boxId } = req.params;
  const { plan, customizations } = req.body;

  const box = await SubscriptionBox.findById(boxId);

  if (!box) {
    return next(new ErrorHandler('Subscription box not found', 404));
  }

  // Check if user already subscribed
  const existingSubscription = box.subscribers.find(
    sub => sub.user.toString() === req.user.id.toString()
  );

  if (existingSubscription) {
    return next(new ErrorHandler('Already subscribed', 400));
  }

  const nextDelivery = calculateNextDelivery(box.shipping.frequency);

  box.subscribers.push({
    user: req.user.id,
    plan,
    startDate: Date.now(),
    nextDelivery,
    status: 'active',
    customizations
  });

  box.analytics.totalSubscribers += 1;
  box.analytics.activeSubscribers += 1;

  await box.save();

  res.status(200).json({
    success: true,
    message: 'Subscribed successfully',
    data: box
  });
});

export const pauseSubscription = catchAsyncErrors(async (req, res, next) => {
  const { boxId } = req.params;

  const box = await SubscriptionBox.findById(boxId);

  if (!box) {
    return next(new ErrorHandler('Subscription box not found', 404));
  }

  const subscription = box.subscribers.find(
    sub => sub.user.toString() === req.user.id.toString()
  );

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  subscription.status = 'paused';
  box.analytics.activeSubscribers -= 1;

  await box.save();

  res.status(200).json({
    success: true,
    message: 'Subscription paused'
  });
});

// Product Bundle Controllers

export const createBundle = catchAsyncErrors(async (req, res, next) => {
  const { name, description, bundleType, products, pricing } = req.body;

  const bundle = await ProductBundle.create({
    name,
    description,
    bundleType,
    products,
    pricing,
    createdBy: req.user.id,
    seo: {
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }
  });

  res.status(201).json({
    success: true,
    data: bundle
  });
});

export const getBundleDetails = catchAsyncErrors(async (req, res, next) => {
  const { bundleId } = req.params;

  const bundle = await ProductBundle.findById(bundleId)
    .populate('products.product');

  if (!bundle) {
    return next(new ErrorHandler('Bundle not found', 404));
  }

  // Increment views
  bundle.analytics.views += 1;
  await bundle.save();

  res.status(200).json({
    success: true,
    data: bundle
  });
});

// Pre-Order Controllers

export const createPreOrder = catchAsyncErrors(async (req, res, next) => {
  const { productId, quantity, shippingAddress } = req.body;

  const preOrder = await PreOrder.create({
    product: productId,
    user: req.user.id,
    quantity,
    pricing: {
      unitPrice: 99.99, // Would come from product
      totalPrice: 99.99 * quantity,
      currency: 'USD'
    },
    availability: {
      expectedReleaseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    fulfillment: {
      shippingAddress
    }
  });

  res.status(201).json({
    success: true,
    data: preOrder
  });
});

export const cancelPreOrder = catchAsyncErrors(async (req, res, next) => {
  const { preOrderId } = req.params;
  const { reason } = req.body;

  const preOrder = await PreOrder.findById(preOrderId);

  if (!preOrder) {
    return next(new ErrorHandler('Pre-order not found', 404));
  }

  if (preOrder.user.toString() !== req.user.id.toString()) {
    return next(new ErrorHandler('Not authorized', 403));
  }

  if (!preOrder.cancellation.canCancel) {
    return next(new ErrorHandler('Pre-order cannot be cancelled', 400));
  }

  preOrder.status = 'cancelled';
  preOrder.cancellation.cancelledAt = Date.now();
  preOrder.cancellation.cancelReason = reason;

  await preOrder.save();

  res.status(200).json({
    success: true,
    message: 'Pre-order cancelled'
  });
});

// Shipping Rate Controllers

export const calculateShippingRates = catchAsyncErrors(async (req, res, next) => {
  const { origin, destination, package: pkg } = req.body;

  // Simulate multiple carrier rates
  const carriers = ['fedex', 'ups', 'dhl', 'usps'];
  const rates = [];

  for (const carrier of carriers) {
    const baseRate = Math.random() * 20 + 10;
    const fuelSurcharge = baseRate * 0.1;

    const rate = await ShippingRate.create({
      carrier: {
        name: carrier,
        serviceType: 'standard'
      },
      origin,
      destination,
      package: pkg,
      rate: {
        baseRate,
        fuelSurcharge,
        handlingFee: 2,
        insuranceFee: 1,
        totalRate: baseRate + fuelSurcharge + 3,
        currency: 'USD'
      },
      transit: {
        estimatedDays: Math.floor(Math.random() * 5) + 2,
        guaranteed: false,
        estimatedDeliveryDate: new Date(Date.now() + (Math.random() * 5 + 2) * 24 * 60 * 60 * 1000)
      }
    });

    rates.push(rate);
  }

  res.status(200).json({
    success: true,
    count: rates.length,
    data: rates
  });
});

export const getShippingRate = catchAsyncErrors(async (req, res, next) => {
  const { rateId } = req.params;

  const rate = await ShippingRate.findById(rateId);

  if (!rate) {
    return next(new ErrorHandler('Shipping rate not found', 404));
  }

  res.status(200).json({
    success: true,
    data: rate
  });
});

// Helper function
function calculateNextDelivery(frequency) {
  const now = new Date();

  switch (frequency) {
    case 'weekly':
      return new Date(now.setDate(now.getDate() + 7));
    case 'biweekly':
      return new Date(now.setDate(now.getDate() + 14));
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3));
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
}
