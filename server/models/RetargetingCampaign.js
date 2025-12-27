import mongoose from 'mongoose';

const retargetingCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    enum: ['facebook', 'google', 'instagram', 'tiktok', 'linkedin'],
    required: true
  },
  audience: {
    type: {
      type: String,
      enum: ['website_visitors', 'cart_abandoners', 'product_viewers', 'purchasers', 'custom'],
      required: true
    },
    pixelId: String,
    customAudience: {
      userIds: [mongoose.Schema.Types.ObjectId],
      filters: mongoose.Schema.Types.Mixed
    },
    size: Number
  },
  creative: {
    headline: String,
    description: String,
    images: [String],
    videos: [String],
    cta: String,
    landingUrl: String
  },
  budget: {
    daily: Number,
    total: Number,
    currency: { type: String, default: 'USD' }
  },
  bidding: {
    strategy: {
      type: String,
      enum: ['cpc', 'cpm', 'cpa', 'auto'],
      default: 'auto'
    },
    amount: Number
  },
  duration: {
    startDate: Date,
    endDate: Date
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  performance: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    roas: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    cpc: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true, suppressReservedKeysWarning: true });

export default mongoose.model('RetargetingCampaign', retargetingCampaignSchema);
