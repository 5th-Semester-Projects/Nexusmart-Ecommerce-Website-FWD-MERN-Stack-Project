import mongoose from 'mongoose';

// ==================== MEMBERSHIP TIER ====================
const membershipTierSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  minPoints: {
    type: Number,
    required: true,
  },
  maxPoints: Number,
  multiplier: {
    type: Number,
    default: 1,
  },
  color: String,
  icon: String,
  benefits: [{
    type: {
      type: String,
      enum: ['discount', 'free_shipping', 'early_access', 'bonus_points', 'exclusive_products', 'priority_support', 'free_returns', 'birthday_bonus'],
    },
    value: mongoose.Schema.Types.Mixed,
    description: String,
  }],
  perks: [String],
  exclusiveCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  freeShippingThreshold: Number,
  returnWindow: {
    type: Number,
    default: 30,
  },
  prioritySupport: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

export const MembershipTier = mongoose.model('MembershipTier', membershipTierSchema);

// ==================== REWARD CATALOG ====================
const rewardCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ['product', 'discount', 'free_shipping', 'experience', 'donation', 'gift_card'],
    required: true,
  },
  pointsCost: {
    type: Number,
    required: true,
    min: 0,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  image: {
    public_id: String,
    url: String,
  },
  category: String,
  stock: {
    type: Number,
    default: -1, // -1 for unlimited
  },
  minTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
  },
  validFrom: Date,
  validUntil: Date,
  terms: String,
  featured: {
    type: Boolean,
    default: false,
  },
  redemptions: {
    type: Number,
    default: 0,
  },
  maxRedemptionsPerUser: {
    type: Number,
    default: -1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

rewardCatalogSchema.index({ type: 1, isActive: 1 });
rewardCatalogSchema.index({ pointsCost: 1 });

export const RewardCatalog = mongoose.model('RewardCatalog', rewardCatalogSchema);

// ==================== REWARD REDEMPTION ====================
const rewardRedemptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RewardCatalog',
    required: true,
  },
  pointsSpent: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'fulfilled', 'cancelled', 'expired'],
    default: 'pending',
  },
  redemptionCode: {
    type: String,
    unique: true,
  },
  usedAt: Date,
  expiresAt: Date,
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  notes: String,
}, { timestamps: true, suppressReservedKeysWarning: true });

rewardRedemptionSchema.index({ user: 1, status: 1 });

export const RewardRedemption = mongoose.model('RewardRedemption', rewardRedemptionSchema);

// ==================== EXCLUSIVE MEMBER DEALS ====================
const memberDealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'buy_x_get_y'],
    },
    value: Number,
    buyQuantity: Number,
    getQuantity: Number,
  },
  minTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  usageLimit: Number,
  usedCount: {
    type: Number,
    default: 0,
  },
  image: {
    public_id: String,
    url: String,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

memberDealSchema.index({ minTier: 1, isActive: 1 });
memberDealSchema.index({ startDate: 1, endDate: 1 });

export const MemberDeal = mongoose.model('MemberDeal', memberDealSchema);

// ==================== BIRTHDAY REWARDS ====================
const birthdayRewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    required: true,
  },
  reward: {
    type: {
      type: String,
      enum: ['discount', 'points', 'free_product', 'free_shipping'],
    },
    value: mongoose.Schema.Types.Mixed,
    description: String,
  },
  couponCode: String,
  status: {
    type: String,
    enum: ['pending', 'sent', 'claimed', 'expired'],
    default: 'pending',
  },
  sentAt: Date,
  claimedAt: Date,
  expiresAt: Date,
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

birthdayRewardSchema.index({ user: 1, year: 1 }, { unique: true });

export const BirthdayReward = mongoose.model('BirthdayReward', birthdayRewardSchema);

// ==================== POINTS EXPIRY NOTIFICATION ====================
const pointsExpirySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  notificationSent: {
    type: Boolean,
    default: false,
  },
  notificationSentAt: Date,
  expired: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

pointsExpirySchema.index({ expiresAt: 1, expired: 1 });

export const PointsExpiry = mongoose.model('PointsExpiry', pointsExpirySchema);

export default { MembershipTier, RewardCatalog, RewardRedemption, MemberDeal, BirthdayReward, PointsExpiry };
