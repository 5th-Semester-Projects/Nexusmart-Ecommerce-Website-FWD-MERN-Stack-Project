import Newsletter from '../models/Newsletter.js';
import { catchAsyncErrors as catchAsync } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribe = catchAsync(async (req, res, next) => {
  const { email, name, preferences, source } = req.body;

  if (!email) {
    return next(new ErrorHandler('Email is required', 400));
  }

  // Check if already subscribed
  let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

  if (subscriber) {
    if (subscriber.status === 'unsubscribed') {
      // Resubscribe
      subscriber.status = 'pending';
      subscriber.preferences = preferences || subscriber.preferences;
      subscriber.unsubscribedAt = undefined;
      await subscriber.save();

      return res.status(200).json({
        success: true,
        message: 'Welcome back! Please confirm your subscription via email.',
        requiresConfirmation: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'You are already subscribed to our newsletter.',
      alreadySubscribed: true,
    });
  }

  // Create new subscriber
  subscriber = await Newsletter.create({
    email,
    name,
    preferences: preferences || {
      newProducts: true,
      promotions: true,
      weeklyDigest: true,
    },
    source: source || 'website',
    user: req.user?._id,
  });

  // In production, send confirmation email here
  // For now, we'll auto-confirm (remove this in production)
  subscriber.confirmSubscription(subscriber.confirmationToken);

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to newsletter!',
    subscriber: {
      email: subscriber.email,
      status: subscriber.status,
    },
  });
});

// @desc    Confirm newsletter subscription
// @route   GET /api/newsletter/confirm/:token
// @access  Public
export const confirmSubscription = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const subscriber = await Newsletter.findOne({
    confirmationToken: token,
    status: 'pending',
  });

  if (!subscriber) {
    return next(new ErrorHandler('Invalid or expired confirmation token', 400));
  }

  subscriber.confirmSubscription(token);

  res.status(200).json({
    success: true,
    message: 'Email confirmed! You are now subscribed to our newsletter.',
  });
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
export const unsubscribe = catchAsync(async (req, res, next) => {
  const { email, token } = req.body;

  let subscriber;

  if (token) {
    subscriber = await Newsletter.findOne({ unsubscribeToken: token });
  } else if (email) {
    subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
  }

  if (!subscriber) {
    return next(new ErrorHandler('Subscriber not found', 404));
  }

  subscriber.status = 'unsubscribed';
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  res.status(200).json({
    success: true,
    message: 'Successfully unsubscribed from newsletter.',
  });
});

// @desc    Update newsletter preferences
// @route   PATCH /api/newsletter/preferences
// @access  Private
export const updatePreferences = catchAsync(async (req, res, next) => {
  const { preferences } = req.body;

  const subscriber = await Newsletter.findOne({
    $or: [
      { user: req.user._id },
      { email: req.user.email },
    ],
  });

  if (!subscriber) {
    return next(new ErrorHandler('You are not subscribed to the newsletter', 404));
  }

  subscriber.preferences = { ...subscriber.preferences, ...preferences };
  await subscriber.save();

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    preferences: subscriber.preferences,
  });
});

// @desc    Get subscription status
// @route   GET /api/newsletter/status
// @access  Private
export const getSubscriptionStatus = catchAsync(async (req, res, next) => {
  const subscriber = await Newsletter.findOne({
    $or: [
      { user: req.user._id },
      { email: req.user.email },
    ],
  });

  res.status(200).json({
    success: true,
    isSubscribed: subscriber?.status === 'confirmed',
    status: subscriber?.status || 'not_subscribed',
    preferences: subscriber?.preferences || null,
  });
});

// ==================== ADMIN ROUTES ====================

// @desc    Get all subscribers (Admin)
// @route   GET /api/newsletter/admin/subscribers
// @access  Admin
export const getAllSubscribers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const query = {};

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by source
  if (req.query.source) {
    query.source = req.query.source;
  }

  // Search by email
  if (req.query.search) {
    query.email = { $regex: req.query.search, $options: 'i' };
  }

  const [subscribers, total] = await Promise.all([
    Newsletter.find(query)
      .populate('user', 'name')
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit),
    Newsletter.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: subscribers.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    subscribers,
  });
});

// @desc    Get newsletter statistics (Admin)
// @route   GET /api/newsletter/admin/stats
// @access  Admin
export const getNewsletterStats = catchAsync(async (req, res, next) => {
  const stats = await Newsletter.getStats();

  res.status(200).json({
    success: true,
    stats,
  });
});

// @desc    Export subscribers (Admin)
// @route   GET /api/newsletter/admin/export
// @access  Admin
export const exportSubscribers = catchAsync(async (req, res, next) => {
  const { status, format } = req.query;

  const query = { status: status || 'confirmed' };
  const subscribers = await Newsletter.find(query)
    .select('email name preferences subscribedAt source')
    .sort({ subscribedAt: -1 });

  if (format === 'csv') {
    const csv = [
      'Email,Name,Subscribed At,Source,New Products,Promotions,Weekly Digest',
      ...subscribers.map(s =>
        `${s.email},${s.name || ''},${s.subscribedAt.toISOString()},${s.source},${s.preferences?.newProducts},${s.preferences?.promotions},${s.preferences?.weeklyDigest}`
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=newsletter-subscribers.csv');
    return res.send(csv);
  }

  res.status(200).json({
    success: true,
    count: subscribers.length,
    subscribers,
  });
});

// @desc    Send newsletter (Admin)
// @route   POST /api/newsletter/admin/send
// @access  Admin
export const sendNewsletter = catchAsync(async (req, res, next) => {
  const { subject, content, targetPreference } = req.body;

  if (!subject || !content) {
    return next(new ErrorHandler('Subject and content are required', 400));
  }

  // Build query based on preferences
  const query = { status: 'confirmed' };
  if (targetPreference) {
    query[`preferences.${targetPreference}`] = true;
  }

  const subscribers = await Newsletter.find(query).select('email name');

  if (subscribers.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No subscribers found matching the criteria',
      sentCount: 0,
    });
  }

  // In production, you would integrate with an email service here
  // For now, we'll just return the count

  // Track that we sent to these subscribers
  await Newsletter.updateMany(
    { _id: { $in: subscribers.map(s => s._id) } },
    { lastEmailSent: new Date() }
  );

  res.status(200).json({
    success: true,
    message: `Newsletter queued for ${subscribers.length} subscribers`,
    sentCount: subscribers.length,
  });
});

// @desc    Delete subscriber (Admin)
// @route   DELETE /api/newsletter/admin/:subscriberId
// @access  Admin
export const deleteSubscriber = catchAsync(async (req, res, next) => {
  const subscriber = await Newsletter.findByIdAndDelete(req.params.subscriberId);

  if (!subscriber) {
    return next(new ErrorHandler('Subscriber not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Subscriber deleted successfully',
  });
});

export default {
  subscribe,
  confirmSubscription,
  unsubscribe,
  updatePreferences,
  getSubscriptionStatus,
  getAllSubscribers,
  getNewsletterStats,
  exportSubscribers,
  sendNewsletter,
  deleteSubscriber,
};
