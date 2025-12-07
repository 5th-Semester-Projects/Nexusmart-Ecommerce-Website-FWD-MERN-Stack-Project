const mongoose = require('mongoose');

const spinWheelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  segments: [{
    label: String,
    value: String, // discount percentage, points, etc.
    probability: Number,
    color: String,
    rewardType: {
      type: String,
      enum: ['discount', 'points', 'free_shipping', 'gift', 'cashback', 'coupon', 'nothing']
    },
    rewardValue: mongoose.Schema.Types.Mixed,
    icon: String
  }],
  rules: {
    maxSpinsPerUser: Number,
    cooldownPeriod: Number, // hours
    requiresAccount: Boolean,
    minimumOrderValue: Number,
    eligibleUserTypes: [String]
  },
  design: {
    colors: [String],
    buttonText: String,
    wheelImage: String,
    backgroundImage: String,
    soundEnabled: Boolean
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    isAlwaysActive: Boolean
  },
  spins: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    segment: Number,
    reward: mongoose.Schema.Types.Mixed,
    redeemed: Boolean,
    redeemedAt: Date,
    spunAt: Date
  }],
  analytics: {
    totalSpins: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    rewardsGiven: { type: Number, default: 0 },
    rewardsRedeemed: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

spinWheelSchema.index({ isActive: 1 });
spinWheelSchema.index({ 'spins.user': 1 });

const SpinWheel = mongoose.model('SpinWheel', spinWheelSchema);`nexport default SpinWheel;`nexport { SpinWheel };
