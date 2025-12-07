import InfluencerMarketing from '../models/InfluencerMarketing.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Get all influencers for seller
export const getInfluencers = catchAsyncErrors(async (req, res, next) => {
  const influencers = await InfluencerMarketing.find({ seller: req.user._id })
    .populate('influencer.user');

  res.status(200).json({
    success: true,
    count: influencers.length,
    influencers
  });
});

// Get influencer by ID
export const getInfluencer = catchAsyncErrors(async (req, res, next) => {
  const influencer = await InfluencerMarketing.findById(req.params.id)
    .populate('influencer.user campaigns.products');

  if (!influencer) {
    return next(new ErrorHandler('Influencer not found', 404));
  }

  res.status(200).json({
    success: true,
    influencer
  });
});

// Create influencer profile
export const createInfluencerProfile = catchAsyncErrors(async (req, res, next) => {
  const influencerData = {
    ...req.body,
    seller: req.user._id
  };

  const influencer = await InfluencerMarketing.create(influencerData);

  res.status(201).json({
    success: true,
    message: 'Influencer profile created',
    influencer
  });
});

// Update influencer profile
export const updateInfluencerProfile = catchAsyncErrors(async (req, res, next) => {
  let influencer = await InfluencerMarketing.findById(req.params.id);

  if (!influencer) {
    return next(new ErrorHandler('Influencer not found', 404));
  }

  influencer = await InfluencerMarketing.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated',
    influencer
  });
});

// Generate discount code
export const generateDiscountCode = catchAsyncErrors(async (req, res, next) => {
  const codeData = req.body;

  const influencer = await InfluencerMarketing.findById(req.params.id);

  if (!influencer) {
    return next(new ErrorHandler('Influencer not found', 404));
  }

  await influencer.generateDiscountCode(codeData);

  res.status(200).json({
    success: true,
    message: 'Discount code generated',
    code: codeData.code
  });
});

// Track sale
export const trackSale = catchAsyncErrors(async (req, res, next) => {
  const { orderId, orderAmount } = req.body;

  const influencer = await InfluencerMarketing.findById(req.params.id);

  if (!influencer) {
    return next(new ErrorHandler('Influencer not found', 404));
  }

  await influencer.trackSale({ orderId, orderAmount });

  res.status(200).json({
    success: true,
    message: 'Sale tracked'
  });
});

// Create campaign
export const createCampaign = catchAsyncErrors(async (req, res, next) => {
  const campaignData = req.body;

  const influencer = await InfluencerMarketing.findById(req.params.id);

  if (!influencer) {
    return next(new ErrorHandler('Influencer not found', 404));
  }

  influencer.campaigns.push(campaignData);
  await influencer.save();

  res.status(201).json({
    success: true,
    message: 'Campaign created',
    campaign: influencer.campaigns[influencer.campaigns.length - 1]
  });
});

// Approve content
export const approveContent = catchAsyncErrors(async (req, res, next) => {
  const { contentId } = req.params;

  const influencer = await InfluencerMarketing.findOne({
    'contentApproval.pendingContent._id': contentId
  });

  if (!influencer) {
    return next(new ErrorHandler('Content not found', 404));
  }

  await influencer.approveContent(contentId, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Content approved'
  });
});

// Reject content
export const rejectContent = catchAsyncErrors(async (req, res, next) => {
  const { contentId } = req.params;
  const { feedback } = req.body;

  const influencer = await InfluencerMarketing.findOne({
    'contentApproval.pendingContent._id': contentId
  });

  if (!influencer) {
    return next(new ErrorHandler('Content not found', 404));
  }

  const content = influencer.contentApproval.pendingContent.id(contentId);
  content.status = 'rejected';
  content.reviewedBy = req.user._id;
  content.reviewedAt = Date.now();
  content.feedback = feedback;

  await influencer.save();

  res.status(200).json({
    success: true,
    message: 'Content rejected'
  });
});

// Get commission report
export const getCommissionReport = catchAsyncErrors(async (req, res, next) => {
  const influencer = await InfluencerMarketing.findById(req.params.id);

  if (!influencer) {
    return next(new ErrorHandler('Influencer not found', 404));
  }

  res.status(200).json({
    success: true,
    commissionTracking: influencer.commissionTracking
  });
});

// Process payout
export const processPayout = catchAsyncErrors(async (req, res, next) => {
  const { amount, method } = req.body;

  const influencer = await InfluencerMarketing.findById(req.params.id);

  if (!influencer) {
    return next(new ErrorHandler('Influencer not found', 404));
  }

  influencer.commissionTracking.payouts.push({
    amount,
    method,
    status: 'pending',
    transactionId: `PAY${Date.now()}`
  });

  influencer.commissionTracking.pending -= amount;

  await influencer.save();

  res.status(200).json({
    success: true,
    message: 'Payout initiated'
  });
});

// Get top influencers
export const getTopInfluencers = catchAsyncErrors(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const topInfluencers = await InfluencerMarketing.getTopInfluencers(
    req.user._id,
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    count: topInfluencers.length,
    influencers: topInfluencers
  });
});

// Get influencer analytics
export const getInfluencerAnalytics = catchAsyncErrors(async (req, res, next) => {
  const influencer = await InfluencerMarketing.findById(req.params.id);

  if (!influencer) {
    return next(new ErrorHandler('Influencer not found', 404));
  }

  res.status(200).json({
    success: true,
    performance: influencer.performance,
    analytics: influencer.analytics
  });
});
