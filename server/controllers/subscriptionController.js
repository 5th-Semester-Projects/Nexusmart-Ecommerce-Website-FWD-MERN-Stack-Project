import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import { Subscription, UserSubscription } from '../models/Subscription.js';

/**
 * Subscription Box Controller
 */

// Get all subscription plans
export const getSubscriptionPlans = catchAsyncErrors(async (req, res, next) => {
  const plans = await Subscription.find({ isActive: true })
    .sort({ price: 1 });

  res.status(200).json({
    success: true,
    plans
  });
});

// Get single plan details
export const getSubscriptionPlan = catchAsyncErrors(async (req, res, next) => {
  const plan = await Subscription.findById(req.params.id);

  if (!plan) {
    return next(new ErrorHandler('Subscription plan not found', 404));
  }

  res.status(200).json({
    success: true,
    plan
  });
});

// Subscribe to a plan
export const subscribeToPlan = catchAsyncErrors(async (req, res, next) => {
  const { planId, customization, shippingAddress, paymentMethod } = req.body;

  const plan = await Subscription.findById(planId);

  if (!plan || !plan.isActive) {
    return next(new ErrorHandler('Invalid subscription plan', 400));
  }

  // Check if user already has active subscription to this plan
  const existingSubscription = await UserSubscription.findOne({
    user: req.user._id,
    plan: planId,
    status: 'active'
  });

  if (existingSubscription) {
    return next(new ErrorHandler('You already have an active subscription to this plan', 400));
  }

  // Calculate next billing date
  const nextBilling = new Date();
  switch (plan.frequency) {
    case 'weekly':
      nextBilling.setDate(nextBilling.getDate() + 7);
      break;
    case 'monthly':
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      break;
    case 'quarterly':
      nextBilling.setMonth(nextBilling.getMonth() + 3);
      break;
    case 'yearly':
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      break;
  }

  const subscription = await UserSubscription.create({
    user: req.user._id,
    plan: planId,
    customization,
    shippingAddress,
    paymentMethod,
    nextBillingDate: nextBilling,
    status: 'active'
  });

  // Update plan subscriber count
  plan.subscriberCount += 1;
  await plan.save();

  res.status(201).json({
    success: true,
    message: 'Subscription created successfully',
    subscription
  });
});

// Get user's subscriptions
export const getUserSubscriptions = catchAsyncErrors(async (req, res, next) => {
  const subscriptions = await UserSubscription.find({ user: req.user._id })
    .populate('plan')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    subscriptions
  });
});

// Pause subscription
export const pauseSubscription = catchAsyncErrors(async (req, res, next) => {
  const { reason, resumeDate } = req.body;

  const subscription = await UserSubscription.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  if (subscription.status !== 'active') {
    return next(new ErrorHandler('Only active subscriptions can be paused', 400));
  }

  subscription.status = 'paused';
  subscription.pausedAt = new Date();
  subscription.pauseReason = reason;
  if (resumeDate) {
    subscription.resumeDate = new Date(resumeDate);
  }

  await subscription.save();

  res.status(200).json({
    success: true,
    message: 'Subscription paused successfully',
    subscription
  });
});

// Resume subscription
export const resumeSubscription = catchAsyncErrors(async (req, res, next) => {
  const subscription = await UserSubscription.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  if (subscription.status !== 'paused') {
    return next(new ErrorHandler('Only paused subscriptions can be resumed', 400));
  }

  subscription.status = 'active';
  subscription.pausedAt = null;
  subscription.pauseReason = null;
  subscription.resumeDate = null;

  // Calculate next billing date from today
  const plan = await Subscription.findById(subscription.plan);
  const nextBilling = new Date();
  switch (plan.frequency) {
    case 'weekly':
      nextBilling.setDate(nextBilling.getDate() + 7);
      break;
    case 'monthly':
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      break;
    case 'quarterly':
      nextBilling.setMonth(nextBilling.getMonth() + 3);
      break;
    case 'yearly':
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      break;
  }
  subscription.nextBillingDate = nextBilling;

  await subscription.save();

  res.status(200).json({
    success: true,
    message: 'Subscription resumed successfully',
    subscription
  });
});

// Cancel subscription
export const cancelSubscription = catchAsyncErrors(async (req, res, next) => {
  const { reason } = req.body;

  const subscription = await UserSubscription.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  if (subscription.status === 'cancelled') {
    return next(new ErrorHandler('Subscription is already cancelled', 400));
  }

  subscription.status = 'cancelled';
  subscription.cancelledAt = new Date();
  subscription.cancelReason = reason;

  await subscription.save();

  // Update plan subscriber count
  const plan = await Subscription.findById(subscription.plan);
  if (plan) {
    plan.subscriberCount = Math.max(0, plan.subscriberCount - 1);
    await plan.save();
  }

  res.status(200).json({
    success: true,
    message: 'Subscription cancelled successfully'
  });
});

// Update customization preferences
export const updateCustomization = catchAsyncErrors(async (req, res, next) => {
  const { preferences } = req.body;

  const subscription = await UserSubscription.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!subscription) {
    return next(new ErrorHandler('Subscription not found', 404));
  }

  subscription.customization = {
    ...subscription.customization,
    preferences
  };

  await subscription.save();

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    subscription
  });
});

// Admin: Create subscription plan
export const createSubscriptionPlan = catchAsyncErrors(async (req, res, next) => {
  const plan = await Subscription.create(req.body);

  res.status(201).json({
    success: true,
    plan
  });
});

// Admin: Update subscription plan
export const updateSubscriptionPlan = catchAsyncErrors(async (req, res, next) => {
  const plan = await Subscription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!plan) {
    return next(new ErrorHandler('Plan not found', 404));
  }

  res.status(200).json({
    success: true,
    plan
  });
});

// Admin: Delete subscription plan
export const deleteSubscriptionPlan = catchAsyncErrors(async (req, res, next) => {
  const plan = await Subscription.findById(req.params.id);

  if (!plan) {
    return next(new ErrorHandler('Plan not found', 404));
  }

  // Check for active subscribers
  const activeSubscribers = await UserSubscription.countDocuments({
    plan: req.params.id,
    status: 'active'
  });

  if (activeSubscribers > 0) {
    return next(new ErrorHandler(`Cannot delete plan with ${activeSubscribers} active subscribers`, 400));
  }

  await plan.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Plan deleted successfully'
  });
});
