import mongoose from 'mongoose';

const socialProofSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  realTimeMetrics: {
    viewingNow: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  recentActivity: [{
    type: {
      type: String,
      enum: ['purchase', 'view', 'add_to_cart', 'wishlist', 'review']
    },
    timestamp: Date,
    location: {
      city: String,
      country: String
    },
    user: {
      firstName: String,
      isVerified: Boolean
    },
    quantity: Number,
    variant: String
  }],
  popularitySignals: {
    hourlyPurchases: {
      type: Number,
      default: 0
    },
    dailyPurchases: {
      type: Number,
      default: 0
    },
    weeklyPurchases: {
      type: Number,
      default: 0
    },
    trendingScore: {
      type: Number,
      default: 0
    },
    velocityScore: Number // Purchase rate increase
  },
  scarcityIndicators: {
    stockLevel: {
      type: String,
      enum: ['high', 'medium', 'low', 'critical']
    },
    itemsRemaining: Number,
    lastRestockDate: Date,
    nextRestockDate: Date,
    sellingFast: Boolean,
    almostGone: Boolean
  },
  urgencyTriggers: {
    limitedTimeOffer: {
      active: Boolean,
      endsAt: Date
    },
    flashSale: {
      active: Boolean,
      originalPrice: Number,
      salePrice: Number,
      endsAt: Date
    },
    seasonalDemand: {
      active: Boolean,
      reason: String
    }
  },
  socialValidation: {
    totalPurchases: Number,
    verifiedPurchases: Number,
    averageRating: Number,
    totalReviews: Number,
    photoReviews: Number,
    videoReviews: Number,
    expertReviews: Number
  },
  trustBadges: [{
    type: {
      type: String,
      enum: ['best_seller', 'trending', 'verified_quality', 'eco_friendly', 'locally_made', 'award_winner']
    },
    title: String,
    icon: String,
    expiresAt: Date
  }],
  influencerEndorsements: [{
    influencer: {
      name: String,
      platform: String,
      followersCount: Number,
      verified: Boolean
    },
    endorsementType: String,
    date: Date,
    postUrl: String
  }],
  comparativeMetrics: {
    categoryRank: Number,
    comparedToSimilar: {
      morePopular: Number, // percentage
      betterRated: Number,
      fasterShipping: Number
    }
  },
  notificationSettings: {
    enabled: Boolean,
    showLocation: Boolean,
    showNames: Boolean,
    anonymousMode: Boolean,
    updateFrequency: Number // seconds
  }
}, {
  timestamps: true
});

socialProofSchema.index({ product: 1 });
socialProofSchema.index({ 'popularitySignals.trendingScore': -1 });
socialProofSchema.index({ 'recentActivity.timestamp': -1 });

const SocialProof = mongoose.model('SocialProof', socialProofSchema);
export default SocialProof;
export { SocialProof };
