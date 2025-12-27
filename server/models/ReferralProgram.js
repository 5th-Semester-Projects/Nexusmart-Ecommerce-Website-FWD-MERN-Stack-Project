import mongoose from 'mongoose';

const referralProgramSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  referrals: [{
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    status: {
      type: String,
      enum: ['invited', 'signed_up', 'purchased', 'rewarded'],
      default: 'invited'
    },
    invitedAt: { type: Date, default: Date.now },
    signedUpAt: Date,
    firstPurchaseAt: Date,
    rewardedAt: Date,
    orderValue: Number
  }],
  rewards: {
    referrerReward: {
      type: {
        type: String,
        enum: ['discount', 'credit', 'cashback', 'points'],
        default: 'credit'
      },
      value: Number,
      currency: String
    },
    refereeReward: {
      type: {
        type: String,
        enum: ['discount', 'credit', 'cashback', 'points'],
        default: 'discount'
      },
      value: Number,
      currency: String
    }
  },
  statistics: {
    totalInvites: { type: Number, default: 0 },
    totalSignups: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalRewardsEarned: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true, suppressReservedKeysWarning: true });

referralProgramSchema.index({ referrer: 1 });

export default mongoose.model('ReferralProgram', referralProgramSchema);
