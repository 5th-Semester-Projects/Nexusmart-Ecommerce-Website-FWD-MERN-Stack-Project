import mongoose from 'mongoose';

const influencerMarketplaceSchema = new mongoose.Schema({
  influencer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profile: {
    bio: String,
    categories: [String],
    socialMedia: {
      instagram: {
        handle: String,
        followers: Number,
        verifiedAt: Date
      },
      youtube: {
        channel: String,
        subscribers: Number,
        verifiedAt: Date
      },
      tiktok: {
        handle: String,
        followers: Number,
        verifiedAt: Date
      },
      twitter: {
        handle: String,
        followers: Number,
        verifiedAt: Date
      }
    },
    totalReach: Number,
    engagementRate: Number,
    audienceDemographics: {
      ageGroups: [{
        range: String,
        percentage: Number
      }],
      topLocations: [String],
      genderSplit: {
        male: Number,
        female: Number,
        other: Number
      }
    }
  },
  pricing: {
    postRates: [{
      platform: String,
      type: {
        type: String,
        enum: ['image', 'video', 'story', 'reel', 'short']
      },
      price: Number
    }],
    packageDeals: [{
      name: String,
      description: String,
      includes: [String],
      price: Number,
      duration: Number
    }],
    negotiable: {
      type: Boolean,
      default: true
    }
  },
  campaigns: [{
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: String,
    description: String,
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    deliverables: [{
      platform: String,
      type: String,
      quantity: Number,
      completed: Boolean
    }],
    compensation: {
      type: {
        type: String,
        enum: ['money', 'products', 'commission', 'hybrid']
      },
      amount: Number,
      commission: Number
    },
    status: {
      type: String,
      enum: ['proposed', 'negotiating', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'proposed'
    },
    startDate: Date,
    endDate: Date,
    contractUrl: String,
    trackingLinks: [{
      platform: String,
      url: String,
      clicks: Number,
      conversions: Number,
      revenue: Number
    }]
  }],
  ratings: [{
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    metrics: {
      professionalism: Number,
      creativity: Number,
      timeliness: Number,
      roi: Number
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  verification: {
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    documents: [{
      type: String,
      url: String
    }]
  },
  availability: {
    accepting: {
      type: Boolean,
      default: true
    },
    minimumBudget: Number,
    preferredCategories: [String],
    blacklistedBrands: [String]
  },
  analytics: {
    totalCampaigns: Number,
    completedCampaigns: Number,
    averageRating: Number,
    totalRevenueGenerated: Number,
    totalSalesGenerated: Number
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

influencerMarketplaceSchema.index({ influencer: 1 });
influencerMarketplaceSchema.index({ 'profile.categories': 1 });
influencerMarketplaceSchema.index({ 'profile.totalReach': -1 });
influencerMarketplaceSchema.index({ 'analytics.averageRating': -1 });

export default mongoose.model('InfluencerMarketplace', influencerMarketplaceSchema);
