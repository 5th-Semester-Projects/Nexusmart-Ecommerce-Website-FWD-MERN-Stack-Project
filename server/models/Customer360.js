import mongoose from 'mongoose';

const customer360Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profile: {
    demographics: {
      age: Number,
      gender: String,
      location: mongoose.Schema.Types.Mixed,
      occupation: String,
      education: String,
      income: String,
      lifeStage: String
    },
    psychographics: {
      interests: [String],
      values: [String],
      lifestyle: String,
      personality: mongoose.Schema.Types.Mixed
    }
  },
  behavior: {
    purchaseHistory: {
      totalOrders: Number,
      totalSpent: Number,
      averageOrderValue: Number,
      firstPurchaseDate: Date,
      lastPurchaseDate: Date,
      purchaseFrequency: Number,
      favoriteCategories: [String],
      favoriteBrands: [String]
    },
    browsing: {
      totalSessions: Number,
      averageSessionDuration: Number,
      pagesPerSession: Number,
      mostViewedProducts: [{
        product: mongoose.Schema.Types.ObjectId,
        views: Number
      }],
      searchHistory: [String],
      lastVisit: Date
    },
    engagement: {
      emailOpenRate: Number,
      emailClickRate: Number,
      smsResponseRate: Number,
      pushNotificationClickRate: Number,
      socialMediaInteractions: Number,
      reviewsWritten: Number,
      questionsAsked: Number
    }
  },
  lifecycle: {
    stage: {
      type: String,
      enum: ['prospect', 'first_time', 'active', 'at_risk', 'churned', 'win_back']
    },
    ltv: {
      predicted: Number,
      actual: Number,
      confidence: Number
    },
    clv: Number, // Customer Lifetime Value
    churnRisk: Number,
    nextBestAction: String
  },
  preferences: {
    communication: {
      channels: [String],
      frequency: String,
      bestTime: String
    },
    products: {
      categories: [String],
      brands: [String],
      priceRange: {
        min: Number,
        max: Number
      }
    },
    shopping: {
      preferredDevices: [String],
      paymentMethods: [String],
      shippingPreference: String
    }
  },
  sentiment: {
    overall: {
      score: Number,
      label: String
    },
    byCategory: [{
      category: String,
      score: Number
    }],
    recentInteractions: [{
      date: Date,
      type: String,
      sentiment: Number
    }]
  },
  segmentation: {
    rfm: {
      recency: Number,
      frequency: Number,
      monetary: Number,
      score: String
    },
    behavioralSegments: [String],
    valueSegment: String,
    riskSegment: String
  },
  interactions: {
    support: {
      totalTickets: Number,
      openTickets: Number,
      averageResolutionTime: Number,
      satisfaction: Number,
      lastContact: Date
    },
    marketing: {
      campaignsReceived: Number,
      campaignsEngaged: Number,
      conversionRate: Number
    },
    social: {
      following: Boolean,
      mentions: Number,
      influence: Number
    }
  },
  predictions: {
    nextPurchaseDate: Date,
    nextPurchaseCategory: String,
    nextPurchaseAmount: Number,
    churnDate: Date,
    upsellOpportunities: [mongoose.Schema.Types.Mixed],
    crossSellOpportunities: [mongoose.Schema.Types.Mixed]
  },
  scores: {
    healthScore: Number,
    engagementScore: Number,
    loyaltyScore: Number,
    influenceScore: Number,
    riskScore: Number
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// customer360Schema.index({ user: 1 }); // Removed: user already has unique:true
customer360Schema.index({ 'lifecycle.stage': 1 });
customer360Schema.index({ 'scores.healthScore': -1 });

const Customer360 = mongoose.model('Customer360', customer360Schema);
export default Customer360;
export { Customer360 };
