import SubscriptionManagement from '../models/SubscriptionManagement.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/ErrorHandler.js';

// Get all subscriptions for user
export const getUserSubscriptions = catchAsyncErrors(async (req, res, next) => {
  const subscriptions = await SubscriptionManagement.getActiveSubscriptions(req.user._id);

  res.status(200).json({
    success: true,
    subscriptions
  });
});

// Get subscription by ID
export const getSubscription = catchAsyncErrors(async (req, res, next) => {
  const subscription = await SubscriptionManagement.findById(req.params.id)
    .populate('items.product');

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  if (subscription.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  res.status(200).json({
    success: true,
    subscription
  });
});

// Create new subscription
export const createSubscription = catchAsyncErrors(async (req, res, next) => {
  const subscriptionData = {
    ...req.body,
    user: req.user._id
  };

  const subscription = await SubscriptionManagement.create(subscriptionData);

  res.status(201).json({
    success: true,
    message: 'Subscription created successfully',
    subscription
  });
});

// Update subscription
export const updateSubscription = catchAsyncErrors(async (req, res, next) => {
  let subscription = await SubscriptionManagement.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  if (subscription.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  subscription = await SubscriptionManagement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Subscription updated successfully',
    subscription
  });
});

// Pause subscription
export const pauseSubscription = catchAsyncErrors(async (req, res, next) => {
  const { reason, duration } = req.body;

  const subscription = await SubscriptionManagement.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  if (subscription.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  await subscription.pauseSubscription(reason, duration);

  res.status(200).json({
    success: true,
    message: 'Subscription paused successfully',
    subscription
  });
});

// Resume subscription
export const resumeSubscription = catchAsyncErrors(async (req, res, next) => {
  const subscription = await SubscriptionManagement.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  if (subscription.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  await subscription.resumeSubscription();

  res.status(200).json({
    success: true,
    message: 'Subscription resumed successfully',
    subscription
  });
});

// Skip next delivery
export const skipNextDelivery = catchAsyncErrors(async (req, res, next) => {
  const { reason } = req.body;

  const subscription = await SubscriptionManagement.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  if (subscription.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  await subscription.skipNextDelivery(reason);

  res.status(200).json({
    success: true,
    message: 'Next delivery skipped successfully',
    subscription
  });
});

// Cancel subscription
export const cancelSubscription = catchAsyncErrors(async (req, res, next) => {
  const { reason } = req.body;

  const subscription = await SubscriptionManagement.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  if (subscription.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  await subscription.cancelSubscription(reason);

  res.status(200).json({
    success: true,
    message: 'Subscription cancelled successfully',
    subscription
  });
});

// Get subscriptions due for delivery
export const getDueDeliveries = catchAsyncErrors(async (req, res, next) => {
  const { date } = req.query;
  const deliveryDate = date ? new Date(date) : new Date();

  const subscriptions = await SubscriptionManagement.getDueForDelivery(deliveryDate);

  res.status(200).json({
    success: true,
    count: subscriptions.length,
    subscriptions
  });
});

// Get subscription analytics
export const getSubscriptionAnalytics = catchAsyncErrors(async (req, res, next) => {
  const analytics = await SubscriptionManagement.getSubscriptionAnalytics(req.user._id);

  res.status(200).json({
    success: true,
    analytics
  });
});

// Update payment method
export const updatePaymentMethod = catchAsyncErrors(async (req, res, next) => {
  const subscription = await SubscriptionManagement.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  if (subscription.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  subscription.paymentMethod = req.body.paymentMethod;
  await subscription.save();

  res.status(200).json({
    success: true,
    message: 'Payment method updated successfully',
    subscription
  });
});

// Process recurring payment
export const processRecurringPayment = catchAsyncErrors(async (req, res, next) => {
  const subscription = await SubscriptionManagement.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  const billing = {
    date: new Date(),
    amount: subscription.pricing.totalAmount,
    status: 'paid',
    transactionId: `TXN${Date.now()}`,
    invoiceNumber: `INV${Date.now()}`,
    paymentMethod: subscription.paymentMethod.type
  };

  subscription.billingHistory.push(billing);
  await subscription.updateAnalytics();
  await subscription.save();

  res.status(200).json({
    success: true,
    message: 'Payment processed successfully',
    billing
  });
});
