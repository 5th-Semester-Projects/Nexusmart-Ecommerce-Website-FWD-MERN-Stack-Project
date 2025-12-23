import LoyaltyProgram from '../models/LoyaltyProgram.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';

// Get user loyalty program
export const getUserLoyalty = catchAsyncErrors(async (req, res) => {
  let loyalty = await LoyaltyProgram.findOne({ user: req.user._id });

  if (!loyalty) {
    loyalty = await LoyaltyProgram.create({ user: req.user._id });
  }

  res.status(200).json({
    success: true,
    loyalty
  });
});

// Add points
export const addPoints = catchAsyncErrors(async (req, res) => {
  const { amount, reason, category } = req.body;

  let loyalty = await LoyaltyProgram.findOne({ user: req.user._id });

  if (!loyalty) {
    loyalty = await LoyaltyProgram.create({ user: req.user._id });
  }

  loyalty.addPoints(amount, reason, category || 'purchase');
  await loyalty.save();

  res.status(200).json({
    success: true,
    message: `${amount} points added successfully`,
    loyalty
  });
});

// Redeem points
export const redeemPoints = catchAsyncErrors(async (req, res) => {
  const { amount, reason } = req.body;

  const loyalty = await LoyaltyProgram.findOne({ user: req.user._id });

  if (!loyalty) {
    return res.status(404).json({
      success: false,
      message: 'Loyalty program not found'
    });
  }

  if (loyalty.points.current < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient points'
    });
  }

  loyalty.redeemPoints(amount, reason);
  await loyalty.save();

  res.status(200).json({
    success: true,
    message: `${amount} points redeemed successfully`,
    loyalty
  });
});

// Get leaderboard
export const getLeaderboard = catchAsyncErrors(async (req, res) => {
  const { limit = 10 } = req.query;

  const leaderboard = await LoyaltyProgram.getLeaderboard(parseInt(limit));

  res.status(200).json({
    success: true,
    leaderboard
  });
});

// Validate referral code
export const validateReferralCode = catchAsyncErrors(async (req, res) => {
  const { code } = req.params;

  const loyalty = await LoyaltyProgram.findOne({ 'referralProgram.code': code });

  if (!loyalty) {
    return res.status(404).json({
      success: false,
      message: 'Invalid referral code'
    });
  }

  res.status(200).json({
    success: true,
    valid: true,
    referrer: loyalty.user
  });
});

module.exports = exports;
