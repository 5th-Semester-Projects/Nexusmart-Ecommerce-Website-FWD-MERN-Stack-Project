import mongoose from 'mongoose';

const loyaltyTierSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentTier: {
    name: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    level: {
      type: Number,
      default: 1
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  points: {
    total: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    },
    lifetime: {
      type: Number,
      default: 0
    },
    expiring: [{
      points: Number,
      expiresAt: Date
    }]
  },
  spending: {
    totalSpent: {
      type: Number,
      default: 0
    },
    currentYearSpent: {
      type: Number,
      default: 0
    },
    lastPurchaseDate: Date,
    averageOrderValue: Number,
    orderCount: {
      type: Number,
      default: 0
    }
  },
  benefits: {
    discountPercentage: {
      type: Number,
      default: 0
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    earlyAccess: {
      type: Boolean,
      default: false
    },
    birthdayBonus: {
      type: Boolean,
      default: false
    },
    exclusiveDeals: {
      type: Boolean,
      default: false
    }
  },
  progress: {
    nextTier: String,
    pointsNeeded: Number,
    spendingNeeded: Number,
    progressPercentage: Number
  },
  history: [{
    action: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'tier_upgrade', 'tier_downgrade']
    },
    points: Number,
    description: String,
    reference: {
      type: String
    },
    referenceId: mongoose.Schema.Types.ObjectId,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, { timestamps: true });

loyaltyTierSchema.index({ 'currentTier.name': 1 });

export default mongoose.model('LoyaltyTier', loyaltyTierSchema);
