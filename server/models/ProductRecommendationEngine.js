import mongoose from 'mongoose';

const productRecommendationEngineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // User Profile for Recommendations
  userProfile: {
    // Browsing Behavior
    browsingHistory: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      category: String,
      timestamp: Date,
      duration: Number, // seconds
      interactions: Number
    }],

    // Purchase History
    purchaseHistory: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      category: String,
      price: Number,
      timestamp: Date,
      rating: Number
    }],

    // Search History
    searchHistory: [{
      query: String,
      timestamp: Date,
      resultsClicked: Number
    }],

    // Preferences
    preferences: {
      favoriteCategories: [String],
      favoriteBrands: [String],
      priceRange: {
        min: Number,
        max: Number
      },
      styles: [String],
      sizes: [String],
      colors: [String]
    },

    // Interaction Patterns
    patterns: {
      avgSessionDuration: Number,
      avgProductsViewed: Number,
      avgTimeToPurchase: Number, // days
      preferredShoppingTime: String,
      devicePreference: String
    }
  },

  // Collaborative Filtering Recommendations
  collaborativeFiltering: {
    // User-Based Collaborative Filtering
    userBased: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      score: { type: Number, min: 0, max: 1 },
      similarUsers: [{
        userId: mongoose.Schema.Types.ObjectId,
        similarity: Number
      }],
      reason: String
    }],

    // Item-Based Collaborative Filtering
    itemBased: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      score: { type: Number, min: 0, max: 1 },
      basedOnProducts: [{
        productId: mongoose.Schema.Types.ObjectId,
        similarity: Number
      }],
      reason: String
    }],

    lastUpdated: Date
  },

  // Deep Learning Recommendations
  deepLearning: {
    // Neural Network Predictions
    neuralNetworkPredictions: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      score: { type: Number, min: 0, max: 1 },
      confidence: { type: Number, min: 0, max: 1 },
      features: [{
        name: String,
        value: Number,
        importance: Number
      }],
      reason: String
    }],

    // Sequential Pattern Mining
    sequentialPatterns: [{
      sequence: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      nextPredicted: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      probability: Number
    }],

    // Embedding-based Recommendations
    embeddings: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      score: Number,
      embedding: [Number], // Vector representation
      distance: Number
    }],

    modelInfo: {
      version: String,
      algorithm: String,
      trainedOn: Date,
      accuracy: Number,
      dataPoints: Number
    },

    lastUpdated: Date
  },

  // Real-Time Personalization
  realTimePersonalization: {
    currentSession: {
      sessionId: String,
      startTime: Date,

      // Current context
      currentPage: String,
      currentCategory: String,
      viewedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      cartProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],

      // Real-time recommendations
      recommendations: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        score: Number,
        reason: String,
        displayedAt: Date,
        clicked: Boolean,
        addedToCart: Boolean
      }],

      // Context factors
      contextFactors: {
        timeOfDay: String,
        dayOfWeek: String,
        device: String,
        location: String,
        weather: String,
        isOnSale: Boolean,
        urgency: String // high, medium, low
      }
    },

    // Dynamic adjustments
    dynamicAdjustments: [{
      factor: String,
      adjustment: Number, // -1 to 1
      reason: String,
      appliedAt: Date
    }],

    lastUpdated: Date
  },

  // Cross-Sell Recommendations
  crossSell: [{
    baseProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },

    recommendations: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      score: Number,
      coOccurrenceRate: Number, // How often bought together
      averageOrderValue: Number,
      reason: String,
      category: String
    }],

    performance: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }
  }],

  // Up-Sell Recommendations
  upSell: [{
    baseProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },

    recommendations: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      score: Number,
      priceDifference: Number,
      upgradeReasons: [String], // Better features, higher quality, etc.
      conversionProbability: Number,
      category: String
    }],

    performance: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      additionalRevenue: { type: Number, default: 0 }
    }
  }],

  // Trending & Popular Recommendations
  trendingRecommendations: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    trendScore: Number,
    reason: {
      type: String,
      enum: ['trending-now', 'hot-deal', 'best-seller', 'new-arrival', 'frequently-bought']
    },
    timeframe: String,
    category: String
  }],

  // Personalized Bundles
  personalizedBundles: [{
    name: String,
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    totalPrice: Number,
    discountedPrice: Number,
    savings: Number,
    score: Number,
    reason: String,

    performance: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    }
  }],

  // Category-Specific Recommendations
  categoryRecommendations: [{
    category: String,

    recommendations: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      score: Number,
      reason: String
    }],

    lastUpdated: Date
  }],

  // Similar Items (Alternate Recommendations)
  similarItems: [{
    baseProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },

    alternatives: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      similarityScore: Number,
      priceDifference: Number,
      similarFeatures: [String],
      reason: String
    }]
  }],

  // Recommendation Performance Tracking
  performance: {
    totalRecommendations: { type: Number, default: 0 },
    totalImpressions: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    totalConversions: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    clickThroughRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },

    byAlgorithm: [{
      algorithm: String,
      impressions: Number,
      clicks: Number,
      conversions: Number,
      revenue: Number,
      ctr: Number,
      conversionRate: Number
    }],

    lastUpdated: Date
  },

  // A/B Testing for Recommendation Algorithms
  abTests: [{
    testName: String,
    startDate: Date,
    endDate: Date,

    variants: [{
      algorithm: String,
      percentage: Number,
      impressions: Number,
      clicks: Number,
      conversions: Number,
      revenue: Number,
      isControl: Boolean
    }],

    winner: String,
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active'
    }
  }],

  // Diversity & Exploration
  diversitySettings: {
    categoryDiversity: { type: Number, min: 0, max: 1, default: 0.3 },
    priceDiversity: { type: Number, min: 0, max: 1, default: 0.2 },
    brandDiversity: { type: Number, min: 0, max: 1, default: 0.2 },
    explorationRate: { type: Number, min: 0, max: 1, default: 0.1 }, // Explore new products

    // Serendipity (unexpected but relevant recommendations)
    serendipityEnabled: { type: Boolean, default: true },
    serendipityRate: { type: Number, min: 0, max: 1, default: 0.05 }
  },

  // Negative Signals (What not to recommend)
  negativeSignals: {
    dislikedProducts: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      reason: String,
      timestamp: Date
    }],

    returnedProducts: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      reason: String,
      timestamp: Date
    }],

    blacklistedCategories: [String],
    blacklistedBrands: [String]
  },

  // Model Retraining Schedule
  retrainingSchedule: {
    lastRetrained: Date,
    nextRetraining: Date,
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    autoRetrain: { type: Boolean, default: true }
  },

  lastUpdated: { type: Date, default: Date.now }

}, {
  timestamps: true
});

// Indexes
productRecommendationEngineSchema.index({ 'realTimePersonalization.currentSession.sessionId': 1 });
productRecommendationEngineSchema.index({ lastUpdated: -1 });

// Virtual: Overall Recommendation Score
productRecommendationEngineSchema.virtual('overallScore').get(function () {
  const ctr = this.performance.clickThroughRate || 0;
  const cr = this.performance.conversionRate || 0;
  return (ctr * 0.3) + (cr * 0.7);
});

// Method: Get Personalized Recommendations
productRecommendationEngineSchema.methods.getPersonalizedRecommendations = function (context = {}) {
  const recommendations = [];

  // Combine different recommendation sources
  const sources = [
    { items: this.collaborativeFiltering.userBased, weight: 0.25, algorithm: 'collaborative-user' },
    { items: this.collaborativeFiltering.itemBased, weight: 0.25, algorithm: 'collaborative-item' },
    { items: this.deepLearning.neuralNetworkPredictions, weight: 0.3, algorithm: 'deep-learning' },
    { items: this.realTimePersonalization.currentSession.recommendations, weight: 0.2, algorithm: 'real-time' }
  ];

  sources.forEach(source => {
    source.items.forEach(item => {
      const existingIndex = recommendations.findIndex(
        r => r.product.toString() === item.product.toString()
      );

      if (existingIndex >= 0) {
        // Boost score if multiple algorithms recommend the same product
        recommendations[existingIndex].score += item.score * source.weight;
        recommendations[existingIndex].algorithms.push(source.algorithm);
      } else {
        recommendations.push({
          product: item.product,
          score: item.score * source.weight,
          reason: item.reason,
          algorithms: [source.algorithm]
        });
      }
    });
  });

  // Apply diversity and exploration
  const diversifiedRecommendations = this.applyDiversity(recommendations);

  // Sort by score
  diversifiedRecommendations.sort((a, b) => b.score - a.score);

  return diversifiedRecommendations.slice(0, 20);
};

// Method: Apply Diversity
productRecommendationEngineSchema.methods.applyDiversity = function (recommendations) {
  // Apply exploration rate (add random products)
  const explorationCount = Math.floor(recommendations.length * this.diversitySettings.explorationRate);

  // Apply serendipity (unexpected recommendations)
  if (this.diversitySettings.serendipityEnabled) {
    const serendipityCount = Math.floor(recommendations.length * this.diversitySettings.serendipityRate);
    // Logic to add serendipitous items
  }

  return recommendations;
};

// Method: Record Impression
productRecommendationEngineSchema.methods.recordImpression = function (productId, algorithm) {
  this.performance.totalImpressions += 1;

  const algoPerf = this.performance.byAlgorithm.find(a => a.algorithm === algorithm);
  if (algoPerf) {
    algoPerf.impressions += 1;
  } else {
    this.performance.byAlgorithm.push({
      algorithm,
      impressions: 1,
      clicks: 0,
      conversions: 0,
      revenue: 0
    });
  }

  this.performance.lastUpdated = Date.now();
};

// Method: Record Click
productRecommendationEngineSchema.methods.recordClick = function (productId, algorithm) {
  this.performance.totalClicks += 1;

  const algoPerf = this.performance.byAlgorithm.find(a => a.algorithm === algorithm);
  if (algoPerf) {
    algoPerf.clicks += 1;
    algoPerf.ctr = (algoPerf.clicks / algoPerf.impressions) * 100;
  }

  this.performance.clickThroughRate = (this.performance.totalClicks / this.performance.totalImpressions) * 100;
  this.performance.lastUpdated = Date.now();
};

// Method: Record Conversion
productRecommendationEngineSchema.methods.recordConversion = function (productId, algorithm, revenue) {
  this.performance.totalConversions += 1;
  this.performance.totalRevenue += revenue;

  const algoPerf = this.performance.byAlgorithm.find(a => a.algorithm === algorithm);
  if (algoPerf) {
    algoPerf.conversions += 1;
    algoPerf.revenue += revenue;
    algoPerf.conversionRate = (algoPerf.conversions / algoPerf.clicks) * 100;
  }

  this.performance.conversionRate = (this.performance.totalConversions / this.performance.totalClicks) * 100;
  this.performance.averageOrderValue = this.performance.totalRevenue / this.performance.totalConversions;
  this.performance.lastUpdated = Date.now();
};

// Static: Get Top Performers
productRecommendationEngineSchema.statics.getTopPerformers = function (limit = 10) {
  return this.find()
    .sort({ 'performance.conversionRate': -1 })
    .limit(limit)
    .populate('user');
};

// Static: Get Users Needing Retraining
productRecommendationEngineSchema.statics.getUsersNeedingRetraining = function () {
  return this.find({
    'retrainingSchedule.autoRetrain': true,
    'retrainingSchedule.nextRetraining': { $lte: new Date() }
  });
};

const ProductRecommendationEngine = mongoose.model('ProductRecommendationEngine', productRecommendationEngineSchema);
export default ProductRecommendationEngine;
export { ProductRecommendationEngine };
