import EmailCampaign from '../models/EmailCampaign.js';
import RetargetingCampaign from '../models/RetargetingCampaign.js';
import ReferralProgram from '../models/ReferralProgram.js';
import FlashSale from '../models/FlashSale.js';
import LoyaltyTier from '../models/LoyaltyTier.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Email Marketing Controllers

export const createEmailCampaign = catchAsyncErrors(async (req, res, next) => {
  const { name, type, subject, content, audience, schedule } = req.body;

  const campaign = await EmailCampaign.create({
    name,
    type,
    subject,
    content,
    audience,
    schedule,
    createdBy: req.user.id,
    status: schedule.type === 'immediate' ? 'sending' : 'scheduled'
  });

  res.status(201).json({
    success: true,
    data: campaign
  });
});

export const sendEmailCampaign = catchAsyncErrors(async (req, res, next) => {
  const { campaignId } = req.params;

  const campaign = await EmailCampaign.findById(campaignId);

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  // Simulate sending emails
  campaign.status = 'sending';
  campaign.metrics.sent = campaign.audience.recipientCount || 1000;
  campaign.metrics.delivered = Math.floor(campaign.metrics.sent * 0.98);
  await campaign.save();

  // Background job would handle actual sending
  setTimeout(async () => {
    campaign.status = 'sent';
    campaign.metrics.opened = Math.floor(campaign.metrics.delivered * 0.25);
    campaign.metrics.clicked = Math.floor(campaign.metrics.opened * 0.15);
    campaign.metrics.openRate = (campaign.metrics.opened / campaign.metrics.delivered) * 100;
    campaign.metrics.clickRate = (campaign.metrics.clicked / campaign.metrics.delivered) * 100;
    await campaign.save();
  }, 5000);

  res.status(200).json({
    success: true,
    message: 'Campaign is being sent',
    data: campaign
  });
});

export const getCampaignAnalytics = catchAsyncErrors(async (req, res, next) => {
  const { campaignId } = req.params;

  const campaign = await EmailCampaign.findById(campaignId);

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      campaign: campaign.name,
      metrics: campaign.metrics,
      roi: campaign.metrics.revenue > 0 ? (campaign.metrics.revenue / 100).toFixed(2) : 0
    }
  });
});

// Retargeting Campaign Controllers

export const createRetargetingCampaign = catchAsyncErrors(async (req, res, next) => {
  const { name, platform, audience, creative, budget, bidding, duration } = req.body;

  const campaign = await RetargetingCampaign.create({
    name,
    platform,
    audience,
    creative,
    budget,
    bidding,
    duration,
    status: 'draft',
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: campaign
  });
});

export const launchRetargetingCampaign = catchAsyncErrors(async (req, res, next) => {
  const { campaignId } = req.params;

  const campaign = await RetargetingCampaign.findById(campaignId);

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  campaign.status = 'active';
  campaign.duration.startDate = new Date();
  await campaign.save();

  res.status(200).json({
    success: true,
    message: 'Campaign launched successfully',
    data: campaign
  });
});

export const getRetargetingPerformance = catchAsyncErrors(async (req, res, next) => {
  const { campaignId } = req.params;

  const campaign = await RetargetingCampaign.findById(campaignId);

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  // Calculate metrics
  const performance = campaign.performance;
  performance.ctr = performance.impressions > 0 ? (performance.clicks / performance.impressions) * 100 : 0;
  performance.cpc = performance.clicks > 0 ? performance.spend / performance.clicks : 0;
  performance.roas = performance.spend > 0 ? (performance.revenue / performance.spend) * 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      campaign: campaign.name,
      platform: campaign.platform,
      performance
    }
  });
});

// Referral Program Controllers

export const createReferralCode = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  // Check if user already has a referral program
  let referralProgram = await ReferralProgram.findOne({ referrer: userId });

  if (referralProgram) {
    return res.status(200).json({
      success: true,
      data: referralProgram
    });
  }

  // Generate unique referral code
  const referralCode = `REF${userId.toString().slice(-6).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  referralProgram = await ReferralProgram.create({
    referrer: userId,
    referralCode,
    rewards: {
      referrerReward: {
        type: 'credit',
        value: 10,
        currency: 'USD'
      },
      refereeReward: {
        type: 'discount',
        value: 15,
        currency: 'USD'
      }
    }
  });

  res.status(201).json({
    success: true,
    data: referralProgram
  });
});

export const inviteReferral = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const referralProgram = await ReferralProgram.findOne({ referrer: req.user.id });

  if (!referralProgram) {
    return next(new ErrorHandler('Referral program not found', 404));
  }

  referralProgram.referrals.push({
    email,
    status: 'invited'
  });

  referralProgram.statistics.totalInvites += 1;
  await referralProgram.save();

  res.status(200).json({
    success: true,
    message: 'Invitation sent successfully'
  });
});

export const getReferralStats = catchAsyncErrors(async (req, res, next) => {
  const referralProgram = await ReferralProgram.findOne({ referrer: req.user.id })
    .populate('referrals.referee', 'name email');

  if (!referralProgram) {
    return next(new ErrorHandler('Referral program not found', 404));
  }

  res.status(200).json({
    success: true,
    data: referralProgram
  });
});

// Flash Sale Controllers

export const createFlashSale = catchAsyncErrors(async (req, res, next) => {
  const { name, description, products, timing, visibility, restrictions } = req.body;

  const flashSale = await FlashSale.create({
    name,
    description,
    products,
    timing,
    visibility,
    restrictions,
    status: 'draft',
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: flashSale
  });
});

export const activateFlashSale = catchAsyncErrors(async (req, res, next) => {
  const { saleId } = req.params;

  const flashSale = await FlashSale.findById(saleId).populate('products.product');

  if (!flashSale) {
    return next(new ErrorHandler('Flash sale not found', 404));
  }

  const now = new Date();
  if (now >= new Date(flashSale.timing.startTime)) {
    flashSale.status = 'active';
  } else {
    flashSale.status = 'scheduled';
  }

  await flashSale.save();

  res.status(200).json({
    success: true,
    data: flashSale
  });
});

export const getActiveFlashSales = catchAsyncErrors(async (req, res, next) => {
  const now = new Date();

  const flashSales = await FlashSale.find({
    status: 'active',
    'timing.startTime': { $lte: now },
    'timing.endTime': { $gte: now }
  }).populate('products.product');

  res.status(200).json({
    success: true,
    count: flashSales.length,
    data: flashSales
  });
});

// Loyalty Tier Controllers

export const getLoyaltyTier = catchAsyncErrors(async (req, res, next) => {
  let loyaltyTier = await LoyaltyTier.findOne({ user: req.user.id });

  if (!loyaltyTier) {
    // Create default tier for new user
    loyaltyTier = await LoyaltyTier.create({
      user: req.user.id,
      currentTier: {
        name: 'bronze',
        level: 1
      }
    });
  }

  res.status(200).json({
    success: true,
    data: loyaltyTier
  });
});

export const addLoyaltyPoints = catchAsyncErrors(async (req, res, next) => {
  const { userId, points, action, description } = req.body;

  let loyaltyTier = await LoyaltyTier.findOne({ user: userId });

  if (!loyaltyTier) {
    loyaltyTier = await LoyaltyTier.create({ user: userId });
  }

  loyaltyTier.points.total += points;
  loyaltyTier.points.available += points;
  loyaltyTier.points.lifetime += points;

  loyaltyTier.history.push({
    action: 'earned',
    points,
    description
  });

  // Check for tier upgrade
  const newTier = calculateTier(loyaltyTier.points.lifetime);
  if (newTier !== loyaltyTier.currentTier.name) {
    loyaltyTier.currentTier.name = newTier;
    loyaltyTier.history.push({
      action: 'tier_upgrade',
      points: 0,
      description: `Upgraded to ${newTier} tier`
    });
  }

  await loyaltyTier.save();

  res.status(200).json({
    success: true,
    data: loyaltyTier
  });
});

export const redeemPoints = catchAsyncErrors(async (req, res, next) => {
  const { points, rewardType } = req.body;

  const loyaltyTier = await LoyaltyTier.findOne({ user: req.user.id });

  if (!loyaltyTier) {
    return next(new ErrorHandler('Loyalty account not found', 404));
  }

  if (loyaltyTier.points.available < points) {
    return next(new ErrorHandler('Insufficient points', 400));
  }

  loyaltyTier.points.available -= points;

  loyaltyTier.history.push({
    action: 'redeemed',
    points: -points,
    description: `Redeemed ${points} points for ${rewardType}`
  });

  await loyaltyTier.save();

  res.status(200).json({
    success: true,
    message: 'Points redeemed successfully',
    data: loyaltyTier
  });
});

// Helper function
function calculateTier(lifetimePoints) {
  if (lifetimePoints >= 50000) return 'diamond';
  if (lifetimePoints >= 25000) return 'platinum';
  if (lifetimePoints >= 10000) return 'gold';
  if (lifetimePoints >= 5000) return 'silver';
  return 'bronze';
}
