const mongoose = require('mongoose');

const customerSegmentationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Primary segment
  primarySegment: {
    type: String,
    enum: ['vip', 'loyal', 'at_risk', 'new', 'occasional', 'dormant', 'champion', 'potential_loyalist', 'needs_attention', 'promising', 'about_to_sleep', 'cant_lose_them', 'hibernating', 'lost'],
    required: true
  },

  // RFM Analysis (Recency, Frequency, Monetary)
  rfm: {
    recency: {
      daysSinceLastPurchase: Number,
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      lastPurchaseDate: Date
    },
    frequency: {
      totalOrders: {
        type: Number,
        default: 0
      },
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      avgDaysBetweenOrders: Number
    },
    monetary: {
      totalSpent: {
        type: Number,
        default: 0
      },
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      avgOrderValue: Number
    },
    combinedScore: {
      type: Number,
      min: 3,
      max: 15
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },

  // Behavioral segments
  behavioral: {
    browserType: {
      type: String,
      enum: ['researcher', 'impulse_buyer', 'deal_seeker', 'loyal', 'window_shopper']
    },
    purchasePattern: {
      type: String,
      enum: ['seasonal', 'regular', 'sporadic', 'bulk', 'subscription']
    },
    priceСensitivity: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    brandLoyalty: {
      type: String,
      enum: ['brand_loyal', 'variety_seeker', 'opportunistic']
    },
    channelPreference: {
      type: String,
      enum: ['mobile', 'desktop', 'app', 'multi_channel']
    }
  },

  // Demographic data
  demographics: {
    ageGroup: {
      type: String,
      enum: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    location: {
      country: String,
      region: String,
      city: String,
      urbanRural: {
        type: String,
        enum: ['urban', 'suburban', 'rural']
      }
    },
    incomeLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'very_high']
    },
    education: {
      type: String,
      enum: ['high_school', 'bachelors', 'masters', 'doctorate', 'other']
    },
    occupation: String,
    familyStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed']
    },
    hasChildren: Boolean,
    numberOfChildren: Number
  },

  // Psychographic data
  psychographics: {
    lifestyle: [String],
    interests: [String],
    values: [String],
    personality: {
      type: String,
      enum: ['adventurous', 'practical', 'trendy', 'traditional', 'eco_conscious', 'luxury_seeker']
    },
    shoppingMotivation: [String]
  },

  // Product preferences
  preferences: {
    favoriteCategories: [{
      category: String,
      orderCount: Number,
      totalSpent: Number,
      lastPurchase: Date
    }],
    favoriteBrands: [{
      brand: String,
      orderCount: Number,
      totalSpent: Number
    }],
    priceRange: {
      min: Number,
      max: Number,
      preferred: Number
    },
    sizePreferences: [String],
    colorPreferences: [String],
    stylePreferences: [String]
  },

  // Engagement metrics
  engagement: {
    emailOpenRate: {
      type: Number,
      default: 0
    },
    emailClickRate: {
      type: Number,
      default: 0
    },
    smsResponseRate: {
      type: Number,
      default: 0
    },
    pushNotificationEngagement: {
      type: Number,
      default: 0
    },
    websiteVisits: {
      total: {
        type: Number,
        default: 0
      },
      last30Days: {
        type: Number,
        default: 0
      },
      avgDuration: Number
    },
    socialEngagement: {
      shares: {
        type: Number,
        default: 0
      },
      likes: {
        type: Number,
        default: 0
      },
      comments: {
        type: Number,
        default: 0
      }
    }
  },

  // Customer lifecycle stage
  lifecycle: {
    stage: {
      type: String,
      enum: ['prospect', 'first_time', 'repeat', 'loyal', 'at_risk', 'churned'],
      required: true
    },
    daysSinceFirstPurchase: Number,
    predictedLifetimeValue: Number,
    currentLifetimeValue: Number,
    churnRisk: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      risk Level: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      factors: [String]
    }
  },

  // Value tier
  valueTier: {
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      required: true
    },
    tierSince: Date,
    nextTierThreshold: Number,
    benefits: [String]
  },

  // Marketing personas
  personas: [{
    personaName: String,
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    characteristics: [String],
    recommendedContent: [String],
    preferredChannels: [String]
  }],

  // Predictive scores
  predictive: {
    nextPurchaseProbability: {
      score: {
        type: Number,
        min: 0,
        max: 1
      },
      expectedDate: Date,
      confidence: Number
    },
    crossSellPotential: {
      score: Number,
      suggestedCategories: [String]
    },
    upsellPotential: {
      score: Number,
      suggestedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }]
    },
    referralPotential: {
      score: Number,
      likelihood: String
    }
  },

  // Campaign responsiveness
  campaignResponse: {
    totalCampaignsReceived: {
      type: Number,
      default: 0
    },
    totalCampaignsEngaged: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    bestPerformingCampaignTypes: [String],
    preferredContactTime: {
      dayOfWeek: [Number],
      hourOfDay: [Number]
    }
  },

  // Segmentation history
  segmentHistory: [{
    segment: String,
    startDate: Date,
    endDate: Date,
    reason: String
  }],

  // Custom attributes
  customAttributes: mongoose.Schema.Types.Mixed,

  // Tags
  tags: [String],

  // Scores and indexes
  scores: {
    satisfaction: {
      type: Number,
      min: 0,
      max: 100
    },
    loyalty: {
      type: Number,
      min: 0,
      max: 100
    },
    engagement: {
      type: Number,
      min: 0,
      max: 100
    },
    advocacy: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Last update
  lastSegmented: {
    type: Date,
    default: Date.now
  },

  // Automated actions
  automatedActions: [{
    action: String,
    triggeredAt: Date,
    status: String,
    result: String
  }]
}, {
  timestamps: true
});

// Indexes
customerSegmentationSchema.index({ user: 1 });
customerSegmentationSchema.index({ primarySegment: 1 });
customerSegmentationSchema.index({ 'rfm.combinedScore': -1 });
customerSegmentationSchema.index({ 'valueTier.tier': 1 });
customerSegmentationSchema.index({ 'lifecycle.stage': 1 });

// Method to calculate RFM scores
customerSegmentationSchema.methods.calculateRFM = function () {
  // Recency score (lower days = higher score)
  const recencyDays = this.rfm.recency.daysSinceLastPurchase;
  if (recencyDays <= 30) this.rfm.recency.score = 5;
  else if (recencyDays <= 60) this.rfm.recency.score = 4;
  else if (recencyDays <= 90) this.rfm.recency.score = 3;
  else if (recencyDays <= 180) this.rfm.recency.score = 2;
  else this.rfm.recency.score = 1;

  // Frequency score
  const frequency = this.rfm.frequency.totalOrders;
  if (frequency >= 20) this.rfm.frequency.score = 5;
  else if (frequency >= 10) this.rfm.frequency.score = 4;
  else if (frequency >= 5) this.rfm.frequency.score = 3;
  else if (frequency >= 2) this.rfm.frequency.score = 2;
  else this.rfm.frequency.score = 1;

  // Monetary score
  const monetary = this.rfm.monetary.totalSpent;
  if (monetary >= 5000) this.rfm.monetary.score = 5;
  else if (monetary >= 2000) this.rfm.monetary.score = 4;
  else if (monetary >= 1000) this.rfm.monetary.score = 3;
  else if (monetary >= 500) this.rfm.monetary.score = 2;
  else this.rfm.monetary.score = 1;

  // Combined score
  this.rfm.combinedScore = this.rfm.recency.score + this.rfm.frequency.score + this.rfm.monetary.score;
  this.rfm.lastCalculated = Date.now();
};

// Method to determine primary segment
customerSegmentationSchema.methods.determineSegment = function () {
  const R = this.rfm.recency.score;
  const F = this.rfm.frequency.score;
  const M = this.rfm.monetary.score;

  // Champion customers
  if (R >= 4 && F >= 4 && M >= 4) {
    this.primarySegment = 'champion';
  }
  // Loyal customers
  else if (R >= 3 && F >= 4) {
    this.primarySegment = 'loyal';
  }
  // Potential loyalist
  else if (R >= 4 && F >= 2 && M >= 3) {
    this.primarySegment = 'potential_loyalist';
  }
  // New customers
  else if (R >= 4 && F === 1) {
    this.primarySegment = 'new';
  }
  // Promising
  else if (R >= 3 && F === 1) {
    this.primarySegment = 'promising';
  }
  // Need attention
  else if (R === 3 && F >= 2 && M >= 2) {
    this.primarySegment = 'needs_attention';
  }
  // About to sleep
  else if (R === 2 && F >= 2) {
    this.primarySegment = 'about_to_sleep';
  }
  // At risk
  else if (R === 2 && F >= 3 && M >= 3) {
    this.primarySegment = 'at_risk';
  }
  // Can't lose them
  else if (R <= 2 && F >= 4 && M >= 4) {
    this.primarySegment = 'cant_lose_them';
  }
  // Hibernating
  else if (R === 1 && F >= 2) {
    this.primarySegment = 'hibernating';
  }
  // Lost
  else if (R === 1 && F === 1) {
    this.primarySegment = 'lost';
  }
  else {
    this.primarySegment = 'occasional';
  }

  // Add to history
  this.segmentHistory.push({
    segment: this.primarySegment,
    startDate: Date.now(),
    reason: 'RFM Analysis'
  });
};

// Method to update segment
customerSegmentationSchema.methods.updateSegmentation = function (orderData) {
  // Update RFM data
  if (orderData) {
    this.rfm.recency.daysSinceLastPurchase = 0;
    this.rfm.recency.lastPurchaseDate = Date.now();
    this.rfm.frequency.totalOrders++;
    this.rfm.monetary.totalSpent += orderData.total;
    this.rfm.monetary.avgOrderValue = this.rfm.monetary.totalSpent / this.rfm.frequency.totalOrders;
  }

  // Recalculate RFM scores
  this.calculateRFM();

  // Determine new segment
  this.determineSegment();

  this.lastSegmented = Date.now();
};

// Static method to get segment distribution
customerSegmentationSchema.statics.getSegmentDistribution = async function () {
  return this.aggregate([
    { $group: { _id: '$primarySegment', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

const CustomerSegmentation = mongoose.model('CustomerSegmentation', customerSegmentationSchema);`nexport default CustomerSegmentation;`nexport { CustomerSegmentation };
