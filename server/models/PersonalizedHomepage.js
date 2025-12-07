const mongoose = require('mongoose');

const personalizedHomepageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Layout configuration
  layout: {
    template: {
      type: String,
      enum: ['grid', 'masonry', 'list', 'carousel', 'magazine', 'minimal'],
      default: 'grid'
    },
    sections: [{
      id: String,
      type: {
        type: String,
        enum: ['hero_banner', 'product_grid', 'category_carousel', 'deals', 'trending', 'recommended', 'recently_viewed', 'wishlist', 'new_arrivals', 'brands', 'stories', 'social_proof', 'blog', 'custom']
      },
      title: String,
      position: Number,
      visible: {
        type: Boolean,
        default: true
      },
      size: {
        type: String,
        enum: ['small', 'medium', 'large', 'full'],
        default: 'medium'
      },
      config: mongoose.Schema.Types.Mixed
    }],
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    density: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: 'comfortable'
    }
  },

  // Personalization preferences
  preferences: {
    categories: [{
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      },
      interest: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      explicitPreference: Boolean
    }],
    brands: [{
      brand: String,
      interest: {
        type: Number,
        min: 0,
        max: 1
      },
      explicitPreference: Boolean
    }],
    priceRange: {
      min: Number,
      max: Number,
      preferred: {
        min: Number,
        max: Number
      }
    },
    styles: [{
      style: String,
      score: Number
    }],
    colors: [{
      color: String,
      preference: Number
    }],
    sizes: [String],
    excludedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    excludedBrands: [String],
    excludedCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }]
  },

  // Content blocks
  contentBlocks: [{
    id: String,
    type: {
      type: String,
      enum: ['products', 'banner', 'category', 'deals', 'video', 'story', 'blog', 'social', 'ugc']
    },
    title: String,
    subtitle: String,
    content: {
      products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      images: [{
        url: String,
        link: String,
        alt: String
      }],
      videos: [{
        url: String,
        thumbnail: String,
        title: String
      }],
      text: String,
      cta: {
        text: String,
        link: String,
        style: String
      }
    },
    personalizationScore: Number,
    algorithm: {
      type: String,
      enum: ['collaborative', 'content_based', 'trending', 'manual', 'ai_generated']
    },
    refreshRate: Number, // minutes
    lastRefreshed: Date,
    priority: {
      type: Number,
      default: 5
    },
    abTest: {
      variant: String,
      experimentId: String
    }
  }],

  // User behavior tracking
  behavior: {
    browsingHistory: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      timestamp: Date,
      duration: Number,
      interactions: Number
    }],
    searchHistory: [{
      query: String,
      timestamp: Date,
      clicked: Boolean
    }],
    clickPatterns: {
      topCategories: [String],
      topBrands: [String],
      avgSessionDuration: Number,
      avgProductsViewed: Number,
      conversionRate: Number
    },
    purchaseHistory: {
      totalOrders: Number,
      totalSpent: Number,
      avgOrderValue: Number,
      favoriteCategories: [String],
      lastPurchaseDate: Date
    },
    timePreferences: {
      mostActiveHours: [Number],
      mostActiveDays: [String],
      avgSessionsPerWeek: Number
    },
    devicePreferences: {
      primaryDevice: String,
      preferredScreenSize: String,
      hasAppInstalled: Boolean
    }
  },

  // Dynamic content scheduling
  scheduling: {
    timeBased: [{
      startTime: String,
      endTime: String,
      daysOfWeek: [Number],
      contentBlockId: String,
      priority: Number
    }],
    eventBased: [{
      event: {
        type: String,
        enum: ['birthday', 'anniversary', 'holiday', 'payday', 'weekend', 'season']
      },
      contentBlockId: String,
      startDate: Date,
      endDate: Date
    }],
    weatherBased: [{
      condition: {
        type: String,
        enum: ['sunny', 'rainy', 'snowy', 'hot', 'cold']
      },
      contentBlockId: String,
      priority: Number
    }]
  },

  // Recommendations
  recommendations: {
    algorithm: {
      type: String,
      enum: ['collaborative', 'content_based', 'hybrid', 'deep_learning'],
      default: 'hybrid'
    },
    products: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      score: Number,
      reason: String,
      algorithm: String,
      generatedAt: Date
    }],
    refreshInterval: {
      type: Number,
      default: 60
    },
    lastRefreshed: Date
  },

  // Social proof
  socialProof: {
    showRecentPurchases: {
      type: Boolean,
      default: true
    },
    showTrending: {
      type: Boolean,
      default: true
    },
    showPopular: {
      type: Boolean,
      default: true
    },
    showFriendActivity: {
      type: Boolean,
      default: false
    },
    friendsConnected: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  // Gamification
  gamification: {
    dailyDeals: {
      unlocked: [String],
      lastUnlock: Date
    },
    streaks: {
      current: Number,
      longest: Number,
      lastVisit: Date
    },
    achievements: [{
      type: String,
      unlockedAt: Date
    }],
    rewards: [{
      type: String,
      claimed: Boolean,
      claimedAt: Date
    }]
  },

  // A/B testing
  experiments: [{
    experimentId: String,
    variant: String,
    startedAt: Date,
    metrics: {
      impressions: Number,
      clicks: Number,
      conversions: Number,
      revenue: Number
    }
  }],

  // Performance metrics
  metrics: {
    totalImpressions: {
      type: Number,
      default: 0
    },
    totalClicks: {
      type: Number,
      default: 0
    },
    avgTimeOnPage: {
      type: Number,
      default: 0
    },
    bounceRate: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    revenueGenerated: {
      type: Number,
      default: 0
    },
    lastVisit: Date,
    visitCount: {
      type: Number,
      default: 0
    }
  },

  // Configuration
  settings: {
    autoPersonalize: {
      type: Boolean,
      default: true
    },
    dataCollection: {
      type: Boolean,
      default: true
    },
    showPersonalizedAds: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
personalizedHomepageSchema.index({ user: 1 });
personalizedHomepageSchema.index({ 'recommendations.lastRefreshed': 1 });
personalizedHomepageSchema.index({ 'metrics.lastVisit': -1 });

// Method to update metrics
personalizedHomepageSchema.methods.recordVisit = function (duration) {
  this.metrics.visitCount++;
  this.metrics.lastVisit = Date.now();

  if (this.gamification.streaks.lastVisit) {
    const daysSinceLastVisit = Math.floor((Date.now() - this.gamification.streaks.lastVisit) / (1000 * 60 * 60 * 24));
    if (daysSinceLastVisit === 1) {
      this.gamification.streaks.current++;
      if (this.gamification.streaks.current > this.gamification.streaks.longest) {
        this.gamification.streaks.longest = this.gamification.streaks.current;
      }
    } else if (daysSinceLastVisit > 1) {
      this.gamification.streaks.current = 1;
    }
  } else {
    this.gamification.streaks.current = 1;
  }

  this.gamification.streaks.lastVisit = Date.now();
};

// Method to refresh recommendations
personalizedHomepageSchema.methods.refreshRecommendations = async function () {
  this.recommendations.lastRefreshed = Date.now();
  // Recommendation logic would be implemented here
};

// Method to track interaction
personalizedHomepageSchema.methods.trackInteraction = function (blockId, action) {
  this.metrics.totalClicks++;

  const block = this.contentBlocks.find(b => b.id === blockId);
  if (block && block.abTest) {
    const experiment = this.experiments.find(e => e.experimentId === block.abTest.experimentId);
    if (experiment) {
      experiment.metrics.clicks++;
    }
  }
};

const PersonalizedHomepage = mongoose.model('PersonalizedHomepage', personalizedHomepageSchema);`nexport default PersonalizedHomepage;`nexport { PersonalizedHomepage };
