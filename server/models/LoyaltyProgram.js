import mongoose from 'mongoose';

const loyaltyProgramSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Membership details
  membership: {
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    tierSince: {
      type: Date,
      default: Date.now
    },
    nextTierReviewDate: Date,
    autoUpgrade: {
      type: Boolean,
      default: true
    }
  },

  // Points system
  points: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    lifetime: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    expiring: [{
      amount: Number,
      expiryDate: Date,
      reason: String
    }]
  },

  // Points transactions
  transactions: [{
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'refunded', 'adjusted', 'bonus'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    balance: Number,
    reason: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['purchase', 'review', 'referral', 'signup', 'birthday', 'social_share', 'survey', 'redemption', 'adjustment', 'bonus', 'other']
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    relatedReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    relatedReferral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral'
    },
    pointsRate: Number,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'expired'],
      default: 'confirmed'
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Tier benefits
  benefits: {
    pointsMultiplier: {
      type: Number,
      default: 1
    },
    birthdayBonus: {
      type: Number,
      default: 0
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    freeShippingThreshold: Number,
    prioritySupport: {
      type: Boolean,
      default: false
    },
    earlyAccess: {
      type: Boolean,
      default: false
    },
    exclusiveDeals: {
      type: Boolean,
      default: false
    },
    extendedReturns: {
      type: Number,
      default: 30
    },
    giftWrapping: {
      type: Boolean,
      default: false
    },
    personalShopper: {
      type: Boolean,
      default: false
    }
  },

  // Activity tracking
  activity: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    avgOrderValue: {
      type: Number,
      default: 0
    },
    reviewsWritten: {
      type: Number,
      default: 0
    },
    referralsMade: {
      type: Number,
      default: 0
    },
    referralsConverted: {
      type: Number,
      default: 0
    },
    lastPurchaseDate: Date,
    lastActivityDate: {
      type: Date,
      default: Date.now
    },
    purchaseFrequency: Number, // days between purchases
    preferredCategories: [{
      category: String,
      purchaseCount: Number,
      totalSpent: Number
    }]
  },

  // Achievements & badges
  achievements: [{
    badge: {
      type: String,
      enum: ['first_purchase', 'frequent_buyer', 'big_spender', 'review_master', 'referral_champion', 'loyal_customer', 'early_bird', 'trend_setter', 'brand_ambassador']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    level: {
      type: Number,
      default: 1
    },
    progress: {
      current: Number,
      target: Number
    }
  }],

  // Rewards catalog
  redeemedRewards: [{
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward'
    },
    name: String,
    pointsCost: Number,
    type: {
      type: String,
      enum: ['discount', 'free_product', 'free_shipping', 'gift_card', 'experience']
    },
    value: Number,
    code: String,
    redeemedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date,
    usedAt: Date,
    status: {
      type: String,
      enum: ['active', 'used', 'expired', 'cancelled'],
      default: 'active'
    }
  }],

  // Challenges & missions
  challenges: [{
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    name: String,
    description: String,
    pointsReward: Number,
    startDate: Date,
    endDate: Date,
    progress: {
      current: Number,
      target: Number
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'expired', 'cancelled'],
      default: 'active'
    }
  }],

  // Referral program
  referral: {
    code: {
      type: String,
      unique: true,
      sparse: true
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    referredUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'converted', 'expired'],
        default: 'pending'
      },
      signupDate: Date,
      firstPurchaseDate: Date,
      pointsEarned: Number
    }],
    totalReferralPoints: {
      type: Number,
      default: 0
    }
  },

  // Special occasions
  specialOccasions: {
    birthday: Date,
    anniversary: Date,
    bonusClaimed: [{
      occasion: String,
      claimedAt: Date,
      points: Number
    }]
  },

  // Notifications & preferences
  notifications: {
    pointsEarned: {
      type: Boolean,
      default: true
    },
    pointsExpiring: {
      type: Boolean,
      default: true
    },
    tierUpgrade: {
      type: Boolean,
      default: true
    },
    exclusiveOffers: {
      type: Boolean,
      default: true
    },
    challengeUpdates: {
      type: Boolean,
      default: true
    }
  },

  // Program settings
  settings: {
    active: {
      type: Boolean,
      default: true
    },
    suspendedUntil: Date,
    suspensionReason: String,
    optedOut: {
      type: Boolean,
      default: false
    },
    optedOutAt: Date
  }
}, {
  timestamps: true
});

// Indexes
loyaltyProgramSchema.index({ user: 1 });
loyaltyProgramSchema.index({ 'membership.tier': 1 });
loyaltyProgramSchema.index({ 'points.current': -1 });
loyaltyProgramSchema.index({ 'referral.code': 1 });
loyaltyProgramSchema.index({ 'points.expiring.expiryDate': 1 });

// Method to add points
loyaltyProgramSchema.methods.addPoints = function (amount, reason, category, relatedDoc = {}) {
  const multiplier = this.benefits.pointsMultiplier || 1;
  const finalAmount = Math.floor(amount * multiplier);

  this.points.current += finalAmount;
  this.points.lifetime += finalAmount;

  this.transactions.push({
    type: 'earned',
    amount: finalAmount,
    balance: this.points.current,
    reason,
    category,
    pointsRate: multiplier,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    ...relatedDoc
  });

  this.activity.lastActivityDate = Date.now();
};

// Method to redeem points
loyaltyProgramSchema.methods.redeemPoints = function (amount, reason, rewardDetails = {}) {
  if (this.points.current < amount) {
    throw new Error('Insufficient points');
  }

  this.points.current -= amount;

  this.transactions.push({
    type: 'redeemed',
    amount: -amount,
    balance: this.points.current,
    reason,
    category: 'redemption'
  });

  if (rewardDetails.reward) {
    this.redeemedRewards.push(rewardDetails);
  }
};

// Method to check and upgrade tier
loyaltyProgramSchema.methods.checkTierUpgrade = function () {
  const { totalSpent } = this.activity;
  let newTier = this.membership.tier;

  if (totalSpent >= 10000) newTier = 'diamond';
  else if (totalSpent >= 5000) newTier = 'platinum';
  else if (totalSpent >= 2000) newTier = 'gold';
  else if (totalSpent >= 500) newTier = 'silver';
  else newTier = 'bronze';

  if (newTier !== this.membership.tier) {
    this.membership.tier = newTier;
    this.membership.tierSince = Date.now();
    this.updateBenefits();
    return true;
  }
  return false;
};

// Method to update benefits based on tier
loyaltyProgramSchema.methods.updateBenefits = function () {
  const tierBenefits = {
    bronze: { pointsMultiplier: 1, birthdayBonus: 100, extendedReturns: 30 },
    silver: { pointsMultiplier: 1.25, birthdayBonus: 250, freeShipping: true, freeShippingThreshold: 50, extendedReturns: 45 },
    gold: { pointsMultiplier: 1.5, birthdayBonus: 500, freeShipping: true, earlyAccess: true, extendedReturns: 60 },
    platinum: { pointsMultiplier: 2, birthdayBonus: 1000, freeShipping: true, prioritySupport: true, earlyAccess: true, exclusiveDeals: true, extendedReturns: 90 },
    diamond: { pointsMultiplier: 2.5, birthdayBonus: 2000, freeShipping: true, prioritySupport: true, earlyAccess: true, exclusiveDeals: true, giftWrapping: true, personalShopper: true, extendedReturns: 120 }
  };

  this.benefits = { ...this.benefits, ...tierBenefits[this.membership.tier] };
};

// Static method to get leaderboard
loyaltyProgramSchema.statics.getLeaderboard = function (limit = 10) {
  return this.find({ 'settings.active': true })
    .sort({ 'points.lifetime': -1 })
    .limit(limit)
    .select('user points.lifetime membership.tier')
    .populate('user', 'name avatar');
};

const LoyaltyProgram = mongoose.model('LoyaltyProgram', loyaltyProgramSchema);
export default LoyaltyProgram;
export { LoyaltyProgram };
