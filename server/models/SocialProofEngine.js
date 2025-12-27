import mongoose from 'mongoose';

const socialProofEngineSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Recent Purchases Popup
  recentPurchases: {
    enabled: {
      type: Boolean,
      default: true
    },
    displayDuration: {
      type: Number,
      default: 5000
    },
    displayInterval: {
      type: Number,
      default: 10000
    },
    maxDisplays: {
      type: Number,
      default: 3
    },
    position: {
      type: String,
      enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      default: 'bottom-left'
    },
    purchases: [{
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      user: {
        name: String,
        location: String,
        avatar: String,
        isVerified: Boolean
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        name: String,
        image: String
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      displayed: {
        type: Boolean,
        default: false
      },
      displayCount: {
        type: Number,
        default: 0
      },
      clicks: {
        type: Number,
        default: 0
      }
    }],
    template: {
      type: String,
      default: '{{userName}} from {{location}} just purchased {{productName}}'
    },
    anonymize: {
      type: Boolean,
      default: false
    }
  },

  // Live Visitor Count
  liveVisitors: {
    enabled: {
      type: Boolean,
      default: true
    },
    displayLocations: [{
      type: String,
      enum: ['homepage', 'product-page', 'category-page', 'checkout']
    }],
    currentCount: {
      type: Number,
      default: 0
    },
    peakCount: {
      type: Number,
      default: 0
    },
    historicalData: [{
      timestamp: Date,
      count: Number,
      page: String
    }],
    fakeBoost: {
      enabled: {
        type: Boolean,
        default: false
      },
      boostAmount: {
        type: Number,
        default: 0
      },
      boostPercentage: {
        type: Number,
        default: 0
      }
    },
    updateInterval: {
      type: Number,
      default: 5000
    },
    displayFormat: {
      type: String,
      default: '{{count}} people are viewing this right now'
    }
  },

  // Trust Badges
  trustBadges: {
    enabled: {
      type: Boolean,
      default: true
    },
    badges: [{
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['security', 'payment', 'shipping', 'guarantee', 'certification', 'award', 'custom']
      },
      icon: String,
      image: String,
      description: String,
      link: String,
      verified: {
        type: Boolean,
        default: false
      },
      displayLocations: [{
        type: String,
        enum: ['homepage', 'product-page', 'cart', 'checkout', 'footer']
      }],
      order: {
        type: Number,
        default: 0
      },
      active: {
        type: Boolean,
        default: true
      }
    }],
    customBadges: [{
      text: String,
      icon: String,
      color: String,
      backgroundColor: String
    }]
  },

  // Review Highlights
  reviewHighlights: {
    enabled: {
      type: Boolean,
      default: true
    },
    displayCount: {
      type: Number,
      default: 3
    },
    minRating: {
      type: Number,
      default: 4,
      min: 1,
      max: 5
    },
    highlights: [{
      review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      user: {
        name: String,
        avatar: String,
        verified: Boolean
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      text: String,
      excerpt: String,
      images: [String],
      helpfulCount: {
        type: Number,
        default: 0
      },
      featured: {
        type: Boolean,
        default: false
      },
      displayPriority: {
        type: Number,
        default: 0
      },
      createdAt: Date
    }],
    autoSelectCriteria: {
      highestRated: {
        type: Boolean,
        default: true
      },
      mostHelpful: {
        type: Boolean,
        default: true
      },
      recentVerified: {
        type: Boolean,
        default: true
      },
      withPhotos: {
        type: Boolean,
        default: false
      }
    }
  },

  // FOMO Triggers
  fomoTriggers: {
    enabled: {
      type: Boolean,
      default: true
    },
    triggers: [{
      type: {
        type: String,
        enum: ['stock-low', 'limited-time', 'high-demand', 'price-increase', 'exclusive-deal',
          'trending', 'selling-fast', 'last-chance', 'limited-quantity']
      },
      message: String,
      threshold: Number,
      active: {
        type: Boolean,
        default: true
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      category: String,
      priority: {
        type: Number,
        default: 1
      },
      expiresAt: Date,
      displayCount: {
        type: Number,
        default: 0
      },
      clickCount: {
        type: Number,
        default: 0
      },
      conversionCount: {
        type: Number,
        default: 0
      }
    }],
    stockLevelTriggers: {
      lowStock: {
        enabled: {
          type: Boolean,
          default: true
        },
        threshold: {
          type: Number,
          default: 10
        },
        message: {
          type: String,
          default: 'Only {{count}} left in stock!'
        }
      },
      veryLowStock: {
        enabled: {
          type: Boolean,
          default: true
        },
        threshold: {
          type: Number,
          default: 5
        },
        message: {
          type: String,
          default: 'Hurry! Only {{count}} remaining!'
        }
      },
      lastItems: {
        enabled: {
          type: Boolean,
          default: true
        },
        threshold: {
          type: Number,
          default: 3
        },
        message: {
          type: String,
          default: 'Almost gone! {{count}} left!'
        }
      }
    },
    timeLimitedOffers: [{
      title: String,
      description: String,
      startDate: Date,
      endDate: Date,
      countdownEnabled: {
        type: Boolean,
        default: true
      },
      products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      discountPercentage: Number,
      active: Boolean
    }]
  },

  // Sales Counter
  salesCounter: {
    enabled: {
      type: Boolean,
      default: false
    },
    displayFormat: {
      type: String,
      enum: ['total-sales', 'recent-sales', 'hourly-sales', 'daily-sales'],
      default: 'recent-sales'
    },
    timeframe: {
      type: String,
      enum: ['1h', '24h', '7d', '30d', 'all-time'],
      default: '24h'
    },
    products: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      salesCount: {
        type: Number,
        default: 0
      },
      lastUpdated: Date
    }],
    globalSalesCount: {
      type: Number,
      default: 0
    }
  },

  // Real-Time Activity Feed
  activityFeed: {
    enabled: {
      type: Boolean,
      default: false
    },
    activities: [{
      type: {
        type: String,
        enum: ['purchase', 'review', 'wishlist', 'view', 'cart-add']
      },
      user: {
        name: String,
        location: String
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        name: String
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      displayed: {
        type: Boolean,
        default: false
      }
    }],
    maxActivities: {
      type: Number,
      default: 50
    },
    displayDuration: {
      type: Number,
      default: 10000
    }
  },

  // Social Proof Metrics
  metrics: {
    totalCustomers: {
      type: Number,
      default: 0
    },
    satisfactionRate: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    returningCustomerRate: {
      type: Number,
      default: 0
    },
    displayMetrics: [{
      type: String,
      enum: ['customers', 'satisfaction', 'reviews', 'rating', 'orders', 'returning']
    }]
  },

  // Analytics
  analytics: {
    totalImpressions: {
      type: Number,
      default: 0
    },
    totalClicks: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    revenueImpact: {
      type: Number,
      default: 0
    },
    performanceByType: {
      recentPurchases: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 }
      },
      liveVisitors: {
        impressions: { type: Number, default: 0 },
        engagements: { type: Number, default: 0 }
      },
      trustBadges: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 }
      },
      reviewHighlights: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 }
      },
      fomoTriggers: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 }
      }
    }
  },

  // Configuration
  config: {
    globalEnabled: {
      type: Boolean,
      default: true
    },
    testMode: {
      type: Boolean,
      default: false
    },
    excludedPages: [String],
    mobileOptimized: {
      type: Boolean,
      default: true
    },
    loadPriority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

// Indexes
socialProofEngineSchema.index({ 'recentPurchases.timestamp': -1 });

// Methods
socialProofEngineSchema.methods.addRecentPurchase = function (orderData) {
  this.recentPurchases.purchases.unshift({
    order: orderData.orderId,
    user: {
      name: orderData.userName,
      location: orderData.location,
      isVerified: orderData.isVerified
    },
    product: {
      _id: orderData.productId,
      name: orderData.productName,
      image: orderData.productImage
    },
    timestamp: Date.now()
  });

  if (this.recentPurchases.purchases.length > 100) {
    this.recentPurchases.purchases = this.recentPurchases.purchases.slice(0, 100);
  }

  return this.save();
};

socialProofEngineSchema.methods.updateLiveVisitors = function (count, page) {
  this.liveVisitors.currentCount = count;

  if (count > this.liveVisitors.peakCount) {
    this.liveVisitors.peakCount = count;
  }

  this.liveVisitors.historicalData.push({
    timestamp: Date.now(),
    count: count,
    page: page
  });

  if (this.liveVisitors.historicalData.length > 1000) {
    this.liveVisitors.historicalData = this.liveVisitors.historicalData.slice(-1000);
  }

  return this.save();
};

socialProofEngineSchema.methods.trackImpression = function (type) {
  this.analytics.totalImpressions += 1;

  if (this.analytics.performanceByType[type]) {
    this.analytics.performanceByType[type].impressions += 1;
  }

  return this.save();
};

socialProofEngineSchema.methods.trackClick = function (type) {
  this.analytics.totalClicks += 1;

  if (this.analytics.performanceByType[type]) {
    this.analytics.performanceByType[type].clicks += 1;
  }

  this.analytics.clickThroughRate = (this.analytics.totalClicks / this.analytics.totalImpressions) * 100;

  return this.save();
};

// Statics
socialProofEngineSchema.statics.getBusinessSocialProof = function (businessId) {
  return this.findOne({ businessId: businessId });
};

const SocialProofEngine = mongoose.model('SocialProofEngine', socialProofEngineSchema);

export default SocialProofEngine;
