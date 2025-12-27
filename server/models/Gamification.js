import mongoose from 'mongoose';

// ==================== LOYALTY POINTS SCHEMA ====================
const loyaltyTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['earned', 'redeemed', 'bonus', 'referral', 'achievement', 'expired'],
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  expiresAt: {
    type: Date,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

export const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);

// ==================== ACHIEVEMENT BADGES SCHEMA ====================
const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['shopping', 'social', 'loyalty', 'special', 'seasonal'],
    default: 'shopping',
  },
  requirement: {
    type: {
      type: String,
      enum: ['orders_count', 'total_spent', 'reviews_count', 'referrals_count', 'login_streak', 'wishlist_count', 'categories_explored', 'special'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  reward: {
    points: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    badge: String,
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

export const Achievement = mongoose.model('Achievement', achievementSchema);

// ==================== USER ACHIEVEMENTS SCHEMA ====================
const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
  progress: {
    current: {
      type: Number,
      default: 0,
    },
    target: {
      type: Number,
      required: true,
    },
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  claimed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

export const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

// ==================== SPIN WHEEL SCHEMA ====================
const spinWheelPrizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['points', 'discount', 'freeShipping', 'product', 'coupon', 'nothing'],
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  color: {
    type: String,
    default: '#8B5CF6',
  },
  icon: {
    type: String,
    default: '🎁',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

export const SpinWheelPrize = mongoose.model('SpinWheelPrize', spinWheelPrizeSchema);

// ==================== USER SPIN HISTORY ====================
const userSpinSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  prize: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpinWheelPrize',
    required: true,
  },
  prizeDetails: {
    name: String,
    type: String,
    value: mongoose.Schema.Types.Mixed,
  },
  claimed: {
    type: Boolean,
    default: false,
  },
  claimedAt: Date,
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

export const UserSpin = mongoose.model('UserSpin', userSpinSchema);

// ==================== REFERRAL SCHEMA ====================
const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rewarded'],
    default: 'pending',
  },
  referrerReward: {
    points: {
      type: Number,
      default: 500,
    },
    discount: {
      type: Number,
      default: 10,
    },
  },
  referredReward: {
    points: {
      type: Number,
      default: 200,
    },
    discount: {
      type: Number,
      default: 15,
    },
  },
  completedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

export const Referral = mongoose.model('Referral', referralSchema);

// ==================== GAMIFICATION SETTINGS ====================
const gamificationSettingsSchema = new mongoose.Schema({
  pointsPerDollar: {
    type: Number,
    default: 10,
  },
  pointsValue: {
    type: Number,
    default: 0.01, // 1 point = $0.01
  },
  membershipTiers: [{
    name: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
    },
    minPoints: Number,
    multiplier: Number,
    perks: [String],
  }],
  spinCooldown: {
    type: Number,
    default: 24, // Hours between spins
  },
  referralEnabled: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

export const GamificationSettings = mongoose.model('GamificationSettings', gamificationSettingsSchema);

export default {
  LoyaltyTransaction,
  Achievement,
  UserAchievement,
  SpinWheelPrize,
  UserSpin,
  Referral,
  GamificationSettings,
};
