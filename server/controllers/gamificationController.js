import {
  LoyaltyTransaction,
  Achievement,
  UserAchievement,
  SpinWheelPrize,
  UserSpin,
  Referral,
  GamificationSettings,
} from '../models/Gamification.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// ==================== LOYALTY POINTS ====================

// @desc    Get user's loyalty points and history
// @route   GET /api/gamification/points
// @access  Private
export const getLoyaltyPoints = catchAsyncErrors(async (req, res) => {
  const user = await User.findById(req.user._id);
  const transactions = await LoyaltyTransaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const settings = await GamificationSettings.findOne() || {
    pointsPerDollar: 10,
    pointsValue: 0.01,
    membershipTiers: [
      { name: 'bronze', minPoints: 0, multiplier: 1, perks: ['Basic rewards'] },
      { name: 'silver', minPoints: 1000, multiplier: 1.25, perks: ['Free shipping on orders over $50', '10% bonus points'] },
      { name: 'gold', minPoints: 5000, multiplier: 1.5, perks: ['Free shipping', 'Early access to sales', '25% bonus points'] },
      { name: 'platinum', minPoints: 15000, multiplier: 2, perks: ['Free express shipping', 'Exclusive deals', '50% bonus points', 'Priority support'] },
    ],
  };

  const currentTier = settings.membershipTiers.find(t => t.name === user.membershipTier) || settings.membershipTiers[0];
  const nextTier = settings.membershipTiers.find(t => t.minPoints > user.loyaltyPoints);

  res.status(200).json({
    success: true,
    data: {
      points: user.loyaltyPoints,
      tier: user.membershipTier,
      currentTierDetails: currentTier,
      nextTier: nextTier || null,
      pointsToNextTier: nextTier ? nextTier.minPoints - user.loyaltyPoints : 0,
      transactions,
      pointsValue: settings.pointsValue,
    },
  });
});

// @desc    Earn loyalty points
// @route   POST /api/gamification/points/earn
// @access  Private
export const earnPoints = catchAsyncErrors(async (req, res) => {
  const { orderId, amount, description } = req.body;

  const settings = await GamificationSettings.findOne() || { pointsPerDollar: 10 };
  const user = await User.findById(req.user._id);

  // Calculate points based on tier multiplier
  let multiplier = 1;
  if (user.membershipTier === 'silver') multiplier = 1.25;
  else if (user.membershipTier === 'gold') multiplier = 1.5;
  else if (user.membershipTier === 'platinum') multiplier = 2;

  const basePoints = Math.floor(amount * settings.pointsPerDollar);
  const bonusPoints = Math.floor(basePoints * (multiplier - 1));
  const totalPoints = basePoints + bonusPoints;

  // Create transaction
  const transaction = await LoyaltyTransaction.create({
    user: req.user._id,
    type: 'earned',
    points: totalPoints,
    description: description || `Earned from order`,
    orderId,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  });

  // Update user points
  user.loyaltyPoints += totalPoints;

  // Check for tier upgrade
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const tierThresholds = [0, 1000, 5000, 15000];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (user.loyaltyPoints >= tierThresholds[i] && tiers.indexOf(user.membershipTier) < i) {
      user.membershipTier = tiers[i];
      // Give bonus points for tier upgrade
      await LoyaltyTransaction.create({
        user: req.user._id,
        type: 'bonus',
        points: 100 * (i + 1),
        description: `Tier upgrade bonus: Welcome to ${tiers[i].toUpperCase()}!`,
      });
      user.loyaltyPoints += 100 * (i + 1);
      break;
    }
  }

  await user.save();

  // Check achievements
  await checkAchievements(req.user._id, 'points_earned', user.loyaltyPoints);

  res.status(200).json({
    success: true,
    data: {
      pointsEarned: totalPoints,
      basePoints,
      bonusPoints,
      totalPoints: user.loyaltyPoints,
      tier: user.membershipTier,
      transaction,
    },
  });
});

// @desc    Redeem loyalty points
// @route   POST /api/gamification/points/redeem
// @access  Private
export const redeemPoints = catchAsyncErrors(async (req, res) => {
  const { points } = req.body;

  const user = await User.findById(req.user._id);
  const settings = await GamificationSettings.findOne() || { pointsValue: 0.01 };

  if (user.loyaltyPoints < points) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient points',
    });
  }

  const discountValue = points * settings.pointsValue;

  // Create redemption transaction
  await LoyaltyTransaction.create({
    user: req.user._id,
    type: 'redeemed',
    points: -points,
    description: `Redeemed for $${discountValue.toFixed(2)} discount`,
  });

  user.loyaltyPoints -= points;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      pointsRedeemed: points,
      discountValue,
      remainingPoints: user.loyaltyPoints,
    },
  });
});

// ==================== ACHIEVEMENTS ====================

// @desc    Get all achievements with user progress
// @route   GET /api/gamification/achievements
// @access  Private
export const getAchievements = catchAsyncErrors(async (req, res) => {
  const achievements = await Achievement.find({ isActive: true });
  const userAchievements = await UserAchievement.find({ user: req.user._id });

  const achievementsWithProgress = achievements.map(achievement => {
    const userProgress = userAchievements.find(
      ua => ua.achievement.toString() === achievement._id.toString()
    );

    return {
      ...achievement.toObject(),
      progress: userProgress ? {
        current: userProgress.progress.current,
        target: userProgress.progress.target,
        percentage: Math.min(100, (userProgress.progress.current / userProgress.progress.target) * 100),
        isCompleted: userProgress.isCompleted,
        claimed: userProgress.claimed,
        unlockedAt: userProgress.isCompleted ? userProgress.unlockedAt : null,
      } : {
        current: 0,
        target: achievement.requirement.value,
        percentage: 0,
        isCompleted: false,
        claimed: false,
        unlockedAt: null,
      },
    };
  });

  // Categorize achievements
  const categorized = {
    shopping: achievementsWithProgress.filter(a => a.category === 'shopping'),
    social: achievementsWithProgress.filter(a => a.category === 'social'),
    loyalty: achievementsWithProgress.filter(a => a.category === 'loyalty'),
    special: achievementsWithProgress.filter(a => a.category === 'special'),
    seasonal: achievementsWithProgress.filter(a => a.category === 'seasonal'),
  };

  const stats = {
    total: achievements.length,
    completed: userAchievements.filter(ua => ua.isCompleted).length,
    claimed: userAchievements.filter(ua => ua.claimed).length,
  };

  res.status(200).json({
    success: true,
    data: {
      achievements: achievementsWithProgress,
      categorized,
      stats,
    },
  });
});

// @desc    Claim achievement reward
// @route   POST /api/gamification/achievements/:id/claim
// @access  Private
export const claimAchievement = catchAsyncErrors(async (req, res) => {
  const userAchievement = await UserAchievement.findOne({
    user: req.user._id,
    achievement: req.params.id,
    isCompleted: true,
    claimed: false,
  }).populate('achievement');

  if (!userAchievement) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found or already claimed',
    });
  }

  const achievement = userAchievement.achievement;
  const user = await User.findById(req.user._id);

  // Give rewards
  if (achievement.reward.points > 0) {
    user.loyaltyPoints += achievement.reward.points;
    await LoyaltyTransaction.create({
      user: req.user._id,
      type: 'achievement',
      points: achievement.reward.points,
      description: `Achievement unlocked: ${achievement.title}`,
    });
  }

  userAchievement.claimed = true;
  await userAchievement.save();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Achievement reward claimed!',
    data: {
      achievement: achievement.title,
      reward: achievement.reward,
    },
  });
});

// Helper function to check and update achievements
export const checkAchievements = async (userId, type, value) => {
  const achievements = await Achievement.find({
    'requirement.type': type,
    isActive: true,
  });

  for (const achievement of achievements) {
    let userAchievement = await UserAchievement.findOne({
      user: userId,
      achievement: achievement._id,
    });

    if (!userAchievement) {
      userAchievement = await UserAchievement.create({
        user: userId,
        achievement: achievement._id,
        progress: {
          current: value,
          target: achievement.requirement.value,
        },
        isCompleted: value >= achievement.requirement.value,
      });
    } else if (!userAchievement.isCompleted) {
      userAchievement.progress.current = value;
      userAchievement.isCompleted = value >= achievement.requirement.value;
      if (userAchievement.isCompleted) {
        userAchievement.unlockedAt = new Date();
      }
      await userAchievement.save();
    }
  }
};

// ==================== SPIN THE WHEEL ====================

// @desc    Get spin wheel info
// @route   GET /api/gamification/spin
// @access  Private
export const getSpinWheel = catchAsyncErrors(async (req, res) => {
  const prizes = await SpinWheelPrize.find({ isActive: true });
  const lastSpin = await UserSpin.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  const settings = await GamificationSettings.findOne() || { spinCooldown: 24 };

  const now = new Date();
  let canSpin = true;
  let nextSpinAt = null;

  if (lastSpin) {
    const cooldownEnd = new Date(lastSpin.createdAt.getTime() + settings.spinCooldown * 60 * 60 * 1000);
    if (now < cooldownEnd) {
      canSpin = false;
      nextSpinAt = cooldownEnd;
    }
  }

  // Get unclaimed prizes
  const unclaimedPrizes = await UserSpin.find({
    user: req.user._id,
    claimed: false,
    expiresAt: { $gt: now },
  }).populate('prize');

  res.status(200).json({
    success: true,
    data: {
      prizes: prizes.map(p => ({
        id: p._id,
        name: p.name,
        type: p.type,
        color: p.color,
        icon: p.icon,
      })),
      canSpin,
      nextSpinAt,
      unclaimedPrizes,
    },
  });
});

// @desc    Spin the wheel
// @route   POST /api/gamification/spin
// @access  Private
export const spinWheel = catchAsyncErrors(async (req, res) => {
  const settings = await GamificationSettings.findOne() || { spinCooldown: 24 };
  const lastSpin = await UserSpin.findOne({ user: req.user._id }).sort({ createdAt: -1 });

  const now = new Date();
  if (lastSpin) {
    const cooldownEnd = new Date(lastSpin.createdAt.getTime() + settings.spinCooldown * 60 * 60 * 1000);
    if (now < cooldownEnd) {
      return res.status(400).json({
        success: false,
        message: 'Spin cooldown active',
        nextSpinAt: cooldownEnd,
      });
    }
  }

  // Get prizes and calculate based on probability
  const prizes = await SpinWheelPrize.find({ isActive: true });
  const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
  let random = Math.random() * totalProbability;

  let selectedPrize = prizes[0];
  for (const prize of prizes) {
    random -= prize.probability;
    if (random <= 0) {
      selectedPrize = prize;
      break;
    }
  }

  // Create spin record
  const userSpin = await UserSpin.create({
    user: req.user._id,
    prize: selectedPrize._id,
    prizeDetails: {
      name: selectedPrize.name,
      type: selectedPrize.type,
      value: selectedPrize.value,
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days to claim
  });

  // Auto-claim points
  if (selectedPrize.type === 'points') {
    const user = await User.findById(req.user._id);
    user.loyaltyPoints += selectedPrize.value;
    await user.save();

    await LoyaltyTransaction.create({
      user: req.user._id,
      type: 'bonus',
      points: selectedPrize.value,
      description: `Spin wheel prize: ${selectedPrize.name}`,
    });

    userSpin.claimed = true;
    userSpin.claimedAt = new Date();
    await userSpin.save();
  }

  res.status(200).json({
    success: true,
    data: {
      prize: {
        name: selectedPrize.name,
        type: selectedPrize.type,
        value: selectedPrize.value,
        icon: selectedPrize.icon,
        color: selectedPrize.color,
      },
      spinId: userSpin._id,
      autoClaimed: selectedPrize.type === 'points',
    },
  });
});

// @desc    Claim spin prize
// @route   POST /api/gamification/spin/:spinId/claim
// @access  Private
export const claimSpinPrize = catchAsyncErrors(async (req, res) => {
  const userSpin = await UserSpin.findOne({
    _id: req.params.spinId,
    user: req.user._id,
    claimed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!userSpin) {
    return res.status(404).json({
      success: false,
      message: 'Prize not found or already claimed',
    });
  }

  userSpin.claimed = true;
  userSpin.claimedAt = new Date();
  await userSpin.save();

  res.status(200).json({
    success: true,
    message: 'Prize claimed successfully!',
    data: {
      prize: userSpin.prizeDetails,
    },
  });
});

// ==================== REFERRAL PROGRAM ====================

// @desc    Get referral info
// @route   GET /api/gamification/referral
// @access  Private
export const getReferralInfo = catchAsyncErrors(async (req, res) => {
  const user = await User.findById(req.user._id);
  const referrals = await Referral.find({ referrer: req.user._id })
    .populate('referred', 'firstName lastName avatar createdAt')
    .sort({ createdAt: -1 });

  const stats = {
    totalReferrals: referrals.length,
    completedReferrals: referrals.filter(r => r.status === 'completed' || r.status === 'rewarded').length,
    pendingReferrals: referrals.filter(r => r.status === 'pending').length,
    totalPointsEarned: referrals
      .filter(r => r.status === 'rewarded')
      .reduce((sum, r) => sum + r.referrerReward.points, 0),
  };

  res.status(200).json({
    success: true,
    data: {
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,
      referrals,
      stats,
      rewards: {
        referrer: { points: 500, discount: 10 },
        referred: { points: 200, discount: 15 },
      },
    },
  });
});

// @desc    Apply referral code
// @route   POST /api/gamification/referral/apply
// @access  Private
export const applyReferralCode = catchAsyncErrors(async (req, res) => {
  const { code } = req.body;

  const referrer = await User.findOne({ referralCode: code.toUpperCase() });
  if (!referrer) {
    return res.status(404).json({
      success: false,
      message: 'Invalid referral code',
    });
  }

  if (referrer._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot use your own referral code',
    });
  }

  // Check if already referred
  const existingReferral = await Referral.findOne({
    referred: req.user._id,
  });

  if (existingReferral) {
    return res.status(400).json({
      success: false,
      message: 'You have already used a referral code',
    });
  }

  // Create referral
  await Referral.create({
    referrer: referrer._id,
    referred: req.user._id,
    code,
    status: 'pending',
  });

  // Update user
  await User.findByIdAndUpdate(req.user._id, {
    referredBy: referrer._id,
  });

  // Give referred user bonus points
  const user = await User.findById(req.user._id);
  user.loyaltyPoints += 200;
  await user.save();

  await LoyaltyTransaction.create({
    user: req.user._id,
    type: 'referral',
    points: 200,
    description: 'Welcome bonus from referral',
  });

  res.status(200).json({
    success: true,
    message: 'Referral code applied! You earned 200 bonus points!',
    data: {
      pointsEarned: 200,
    },
  });
});

// @desc    Complete referral (called after first purchase)
// @route   POST /api/gamification/referral/complete
// @access  Private (Internal)
export const completeReferral = async (userId, orderId) => {
  const referral = await Referral.findOne({
    referred: userId,
    status: 'pending',
  });

  if (!referral) return;

  referral.status = 'completed';
  referral.completedOrderId = orderId;
  await referral.save();

  // Reward referrer
  const referrer = await User.findById(referral.referrer);
  referrer.loyaltyPoints += referral.referrerReward.points;
  await referrer.save();

  await LoyaltyTransaction.create({
    user: referral.referrer,
    type: 'referral',
    points: referral.referrerReward.points,
    description: 'Referral reward - friend made first purchase',
  });

  referral.status = 'rewarded';
  await referral.save();

  // Check achievements
  const totalReferrals = await Referral.countDocuments({
    referrer: referral.referrer,
    status: 'rewarded',
  });
  await checkAchievements(referral.referrer, 'referrals_count', totalReferrals);
};

// ==================== LEADERBOARD ====================

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
export const getLeaderboard = catchAsyncErrors(async (req, res) => {
  const { type = 'points', period = 'all' } = req.query;

  let dateFilter = {};
  if (period === 'weekly') {
    dateFilter.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  } else if (period === 'monthly') {
    dateFilter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }

  let leaderboard;

  if (type === 'points') {
    leaderboard = await User.find({ isActive: true })
      .select('firstName lastName avatar loyaltyPoints membershipTier')
      .sort({ loyaltyPoints: -1 })
      .limit(50);
  } else if (type === 'achievements') {
    leaderboard = await UserAchievement.aggregate([
      { $match: { isCompleted: true, ...dateFilter } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          avatar: '$user.avatar',
          achievementCount: '$count',
        },
      },
    ]);
  }

  res.status(200).json({
    success: true,
    data: {
      leaderboard,
      type,
      period,
    },
  });
});

// ==================== ADMIN: Manage Gamification ====================

// @desc    Create achievement
// @route   POST /api/gamification/admin/achievements
// @access  Admin
export const createAchievement = catchAsyncErrors(async (req, res) => {
  const achievement = await Achievement.create(req.body);

  res.status(201).json({
    success: true,
    data: achievement,
  });
});

// @desc    Update gamification settings
// @route   PUT /api/gamification/admin/settings
// @access  Admin
export const updateGamificationSettings = catchAsyncErrors(async (req, res) => {
  let settings = await GamificationSettings.findOne();

  if (!settings) {
    settings = await GamificationSettings.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }

  res.status(200).json({
    success: true,
    data: settings,
  });
});

// @desc    Create spin wheel prize
// @route   POST /api/gamification/admin/prizes
// @access  Admin
export const createSpinPrize = catchAsyncErrors(async (req, res) => {
  const prize = await SpinWheelPrize.create(req.body);

  res.status(201).json({
    success: true,
    data: prize,
  });
});

export default {
  getLoyaltyPoints,
  earnPoints,
  redeemPoints,
  getAchievements,
  claimAchievement,
  getSpinWheel,
  spinWheel,
  claimSpinPrize,
  getReferralInfo,
  applyReferralCode,
  completeReferral,
  getLeaderboard,
  createAchievement,
  updateGamificationSettings,
  createSpinPrize,
};
