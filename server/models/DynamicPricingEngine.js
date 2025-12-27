import mongoose from 'mongoose';

const dynamicPricingEngineSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // Base Pricing
  basePricing: {
    originalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    minimumPrice: {
      type: Number,
      required: true,
      min: 0
    },
    maximumPrice: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    profitMargin: {
      type: Number,
      default: 0
    }
  },

  // Current Dynamic Price
  currentPrice: {
    amount: {
      type: Number,
      required: true
    },
    adjustmentPercentage: {
      type: Number,
      default: 0
    },
    adjustmentReason: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    nextUpdateScheduled: Date
  },

  // Competitor Price Tracking
  competitorTracking: {
    enabled: {
      type: Boolean,
      default: false
    },
    competitors: [{
      name: String,
      url: String,
      productUrl: String,
      currentPrice: Number,
      currency: String,
      lastChecked: Date,
      priceHistory: [{
        price: Number,
        timestamp: Date
      }],
      availability: {
        type: String,
        enum: ['in-stock', 'out-of-stock', 'pre-order', 'discontinued']
      },
      shippingCost: Number,
      rating: Number
    }],
    lowestCompetitorPrice: Number,
    averageCompetitorPrice: Number,
    competitorPriceRange: {
      min: Number,
      max: Number
    },
    updateFrequency: {
      type: String,
      enum: ['hourly', 'daily', 'weekly'],
      default: 'daily'
    },
    lastScrapedAt: Date
  },

  // Demand-Based Pricing
  demandBasedPricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    demandLevel: {
      type: String,
      enum: ['very-low', 'low', 'medium', 'high', 'very-high'],
      default: 'medium'
    },
    demandScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    demandFactors: {
      pageViews: {
        weight: {
          type: Number,
          default: 0.2
        },
        count: {
          type: Number,
          default: 0
        }
      },
      cartAdds: {
        weight: {
          type: Number,
          default: 0.25
        },
        count: {
          type: Number,
          default: 0
        }
      },
      wishlistAdds: {
        weight: {
          type: Number,
          default: 0.15
        },
        count: {
          type: Number,
          default: 0
        }
      },
      searchFrequency: {
        weight: {
          type: Number,
          default: 0.15
        },
        count: {
          type: Number,
          default: 0
        }
      },
      conversionRate: {
        weight: {
          type: Number,
          default: 0.25
        },
        rate: {
          type: Number,
          default: 0
        }
      }
    },
    priceAdjustmentRules: [{
      demandLevel: {
        type: String,
        enum: ['very-low', 'low', 'medium', 'high', 'very-high']
      },
      adjustmentType: {
        type: String,
        enum: ['percentage', 'fixed-amount']
      },
      adjustmentValue: Number,
      maxAdjustment: Number
    }]
  },

  // Time-Based Pricing
  timeBasedPricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    schedules: [{
      name: String,
      dayOfWeek: [{
        type: Number,
        min: 0,
        max: 6
      }],
      startTime: String,
      endTime: String,
      priceAdjustment: {
        type: {
          type: String,
          enum: ['percentage', 'fixed-amount']
        },
        value: Number
      },
      active: {
        type: Boolean,
        default: true
      }
    }],
    seasonalPricing: [{
      name: String,
      startDate: Date,
      endDate: Date,
      priceAdjustment: {
        type: String,
        value: Number
      },
      active: Boolean
    }],
    holidayPricing: [{
      holiday: String,
      date: Date,
      priceAdjustment: {
        type: String,
        value: Number
      }
    }]
  },

  // Flash Sale Automation
  flashSales: {
    enabled: {
      type: Boolean,
      default: false
    },
    activeSale: {
      name: String,
      startDate: Date,
      endDate: Date,
      discountPercentage: Number,
      flashPrice: Number,
      quantityLimit: Number,
      quantitySold: {
        type: Number,
        default: 0
      },
      active: {
        type: Boolean,
        default: false
      }
    },
    upcomingSales: [{
      name: String,
      scheduledStart: Date,
      scheduledEnd: Date,
      discountPercentage: Number,
      autoActivate: {
        type: Boolean,
        default: true
      }
    }],
    autoTriggers: {
      lowStock: {
        enabled: {
          type: Boolean,
          default: false
        },
        threshold: Number,
        discountPercentage: Number
      },
      slowMoving: {
        enabled: {
          type: Boolean,
          default: false
        },
        daysThreshold: Number,
        discountPercentage: Number
      },
      competitorBeat: {
        enabled: {
          type: Boolean,
          default: false
        },
        beatByPercentage: Number
      }
    }
  },

  // Personalized Pricing
  personalizedPricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    userSegments: [{
      segmentName: String,
      criteria: {
        membershipLevel: String,
        totalOrders: Number,
        lifetimeValue: Number,
        loyaltyPoints: Number
      },
      priceAdjustment: {
        type: String,
        value: Number
      },
      active: Boolean
    }],
    newCustomerDiscount: {
      enabled: {
        type: Boolean,
        default: false
      },
      discountPercentage: Number,
      validFor: Number
    },
    returningCustomerDiscount: {
      enabled: {
        type: Boolean,
        default: false
      },
      discountPercentage: Number
    },
    vipPricing: {
      enabled: {
        type: Boolean,
        default: false
      },
      tiers: [{
        name: String,
        criteria: String,
        discountPercentage: Number
      }]
    }
  },

  // Inventory-Based Pricing
  inventoryBasedPricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    stockLevel: {
      current: Number,
      threshold: {
        low: Number,
        critical: Number,
        overstock: Number
      }
    },
    pricingRules: {
      lowStock: {
        enabled: Boolean,
        adjustmentType: String,
        adjustmentValue: Number
      },
      criticalStock: {
        enabled: Boolean,
        adjustmentType: String,
        adjustmentValue: Number
      },
      overstock: {
        enabled: Boolean,
        adjustmentType: String,
        adjustmentValue: Number
      }
    },
    expiryBasedPricing: {
      enabled: {
        type: Boolean,
        default: false
      },
      expiryDate: Date,
      daysBeforeExpiry: Number,
      discountSchedule: [{
        daysRemaining: Number,
        discountPercentage: Number
      }]
    }
  },

  // Price History
  priceHistory: [{
    price: {
      type: Number,
      required: true
    },
    adjustmentReason: String,
    adjustmentType: {
      type: String,
      enum: ['manual', 'competitor', 'demand', 'time', 'flash-sale', 'inventory', 'personalized']
    },
    triggeredBy: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    performance: {
      views: Number,
      sales: Number,
      revenue: Number,
      conversionRate: Number
    }
  }],

  // Rules & Constraints
  rules: {
    minProfitMargin: {
      type: Number,
      default: 0
    },
    maxDiscountPercentage: {
      type: Number,
      default: 50
    },
    neverBelowCost: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      enabled: {
        type: Boolean,
        default: false
      },
      threshold: Number
    },
    competitorMatching: {
      enabled: {
        type: Boolean,
        default: false
      },
      matchType: {
        type: String,
        enum: ['exact', 'beat-by-percentage', 'beat-by-amount']
      },
      value: Number
    }
  },

  // Analytics
  analytics: {
    averagePrice: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    priceElasticity: {
      type: Number,
      default: 0
    },
    optimalPricePoint: Number,
    performanceByPriceRange: [{
      priceRange: {
        min: Number,
        max: Number
      },
      sales: Number,
      revenue: Number,
      conversionRate: Number
    }],
    revenueImpact: {
      type: Number,
      default: 0
    },
    competitorComparison: {
      priceAdvantage: Number,
      salesImpact: Number
    }
  },

  // Alerts & Notifications
  alerts: [{
    type: {
      type: String,
      enum: ['competitor-price-drop', 'demand-spike', 'low-conversion', 'profit-margin-low', 'flash-sale-start']
    },
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    acknowledged: {
      type: Boolean,
      default: false
    }
  }],

  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'manual-override'],
    default: 'active'
  },
  lastCalculated: {
    type: Date,
    default: Date.now
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
dynamicPricingEngineSchema.index({ 'competitorTracking.lowestCompetitorPrice': 1 });
dynamicPricingEngineSchema.index({ 'currentPrice.amount': 1 });

// Methods
dynamicPricingEngineSchema.methods.calculateDemandScore = function () {
  const factors = this.demandBasedPricing.demandFactors;

  const score =
    (factors.pageViews.count * factors.pageViews.weight) +
    (factors.cartAdds.count * factors.cartAdds.weight) +
    (factors.wishlistAdds.count * factors.wishlistAdds.weight) +
    (factors.searchFrequency.count * factors.searchFrequency.weight) +
    (factors.conversionRate.rate * 100 * factors.conversionRate.weight);

  this.demandBasedPricing.demandScore = Math.min(score, 100);

  if (score >= 80) this.demandBasedPricing.demandLevel = 'very-high';
  else if (score >= 60) this.demandBasedPricing.demandLevel = 'high';
  else if (score >= 40) this.demandBasedPricing.demandLevel = 'medium';
  else if (score >= 20) this.demandBasedPricing.demandLevel = 'low';
  else this.demandBasedPricing.demandLevel = 'very-low';

  return this.save();
};

dynamicPricingEngineSchema.methods.updatePrice = function (reason, newPrice) {
  this.priceHistory.push({
    price: this.currentPrice.amount,
    adjustmentReason: reason,
    timestamp: Date.now()
  });

  const adjustmentPercentage = ((newPrice - this.basePricing.originalPrice) / this.basePricing.originalPrice) * 100;

  this.currentPrice = {
    amount: newPrice,
    adjustmentPercentage: adjustmentPercentage,
    adjustmentReason: reason,
    lastUpdated: Date.now()
  };

  return this.save();
};

dynamicPricingEngineSchema.methods.activateFlashSale = function (saleData) {
  this.flashSales.activeSale = {
    name: saleData.name,
    startDate: Date.now(),
    endDate: saleData.endDate,
    discountPercentage: saleData.discountPercentage,
    flashPrice: this.basePricing.originalPrice * (1 - saleData.discountPercentage / 100),
    quantityLimit: saleData.quantityLimit,
    quantitySold: 0,
    active: true
  };

  this.flashSales.enabled = true;
  this.updatePrice('flash-sale', this.flashSales.activeSale.flashPrice);

  return this.save();
};

// Statics
dynamicPricingEngineSchema.statics.getProductDynamicPrice = function (productId) {
  return this.findOne({ product: productId, status: 'active' });
};

dynamicPricingEngineSchema.statics.updateCompetitorPrices = function () {
  // This would be called by a cron job
  return this.find({ 'competitorTracking.enabled': true, status: 'active' });
};

const DynamicPricingEngine = mongoose.model('DynamicPricingEngine', dynamicPricingEngineSchema);

export default DynamicPricingEngine;
