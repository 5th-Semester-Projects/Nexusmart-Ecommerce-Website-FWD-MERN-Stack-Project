const mongoose = require('mongoose');

const influencerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: String,
  platforms: [{
    platform: {
      type: String,
      enum: ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'snapchat', 'pinterest']
    },
    handle: String,
    url: String,
    followers: Number,
    engagementRate: Number,
    verified: Boolean
  }],
  niche: [String],
  demographics: {
    primaryAudience: String,
    ageRange: String,
    genderSplit: mongoose.Schema.Types.Mixed,
    topCountries: [String]
  },
  collaboration: {
    type: {
      type: String,
      enum: ['affiliate', 'sponsored_post', 'brand_ambassador', 'commission', 'gifting']
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'paused', 'completed', 'cancelled'],
      default: 'pending'
    },
    startDate: Date,
    endDate: Date,
    terms: String
  },
  affiliate: {
    code: {
      type: String,
      unique: true
    },
    commission: {
      type: Number,
      default: 10 // percentage
    },
    cookieDuration: {
      type: Number,
      default: 30 // days
    }
  },
  campaigns: [{
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    products: [mongoose.Schema.Types.ObjectId],
    deliverables: [String],
    dueDate: Date,
    compensation: Number,
    status: String,
    content: [{
      type: String,
      url: String,
      postedAt: Date,
      engagement: mongoose.Schema.Types.Mixed
    }]
  }],
  performance: {
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 }
  },
  payouts: [{
    amount: Number,
    period: String,
    status: String,
    paidAt: Date,
    method: String,
    reference: String
  }],
  rating: {
    overall: { type: Number, default: 0 },
    contentQuality: Number,
    engagement: Number,
    professionalism: Number,
    reviews: [{
      by: mongoose.Schema.Types.ObjectId,
      rating: Number,
      comment: String,
      date: Date
    }]
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    taxId: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

influencerSchema.index({ username: 1 });
influencerSchema.index({ 'affiliate.code': 1 });
influencerSchema.index({ 'collaboration.status': 1 });

const Influencer = mongoose.model('Influencer', influencerSchema);
export default Influencer;
export { Influencer };
