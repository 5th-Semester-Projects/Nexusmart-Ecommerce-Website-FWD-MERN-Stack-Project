import mongoose from 'mongoose';

const advancedAnalyticsDashboardSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },

  // Date Range for Analytics
  dateRange: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
      default: 'monthly'
    }
  },

  // Sales Forecasting
  salesForecast: {
    historical: [{
      date: Date,
      revenue: Number,
      orders: Number,
      avgOrderValue: Number
    }],

    predictions: [{
      date: Date,
      predictedRevenue: Number,
      confidenceLevel: { type: Number, min: 0, max: 100 },
      lowerBound: Number,
      upperBound: Number,
      predictedOrders: Number,
      factors: [{
        name: String,
        impact: Number // -1 to 1
      }]
    }],

    accuracy: {
      lastMonthAccuracy: Number,
      last3MonthsAccuracy: Number,
      overallAccuracy: Number
    },

    trends: {
      revenueGrowth: Number, // percentage
      orderGrowth: Number,
      seasonality: [{
        month: Number,
        multiplier: Number
      }],
      trendDirection: {
        type: String,
        enum: ['increasing', 'stable', 'decreasing']
      }
    },

    modelInfo: {
      algorithm: String,
      lastTrainingDate: Date,
      dataPoints: Number,
      features: [String]
    }
  },

  // Customer Behavior Heatmaps
  behaviorHeatmaps: {
    // Page Interactions
    pageInteractions: [{
      page: String,
      path: String,
      clicks: [{
        element: String,
        coordinates: { x: Number, y: Number },
        count: Number,
        avgTimeToClick: Number // seconds
      }],
      scrollDepth: [{
        percentage: Number,
        userCount: Number
      }],
      hoverAreas: [{
        element: String,
        duration: Number,
        count: Number
      }]
    }],

    // Time-based Activity
    timeHeatmap: [{
      dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
      hour: { type: Number, min: 0, max: 23 },
      visitors: Number,
      orders: Number,
      revenue: Number,
      conversionRate: Number
    }],

    // Geographic Heatmap
    geographicActivity: [{
      country: String,
      countryCode: String,
      city: String,
      visits: Number,
      orders: Number,
      revenue: Number,
      avgOrderValue: Number,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }],

    // Product Category Interactions
    categoryEngagement: [{
      category: String,
      views: Number,
      clicks: Number,
      addToCarts: Number,
      purchases: Number,
      avgTimeSpent: Number,
      bounceRate: Number
    }]
  },

  // Conversion Funnel Analysis
  conversionFunnel: {
    stages: [{
      name: String,
      order: Number,
      users: Number,
      dropoffRate: Number,
      avgTimeSpent: Number, // seconds
      conversionRate: Number,
      revenue: Number
    }],

    overallConversion: Number,

    // Step-by-step Analysis
    stepsAnalysis: [{
      from: String,
      to: String,
      users: Number,
      conversionRate: Number,
      avgTime: Number,
      dropoffReasons: [{
        reason: String,
        percentage: Number
      }]
    }],

    // Segments
    segments: [{
      segmentName: String,
      filters: mongoose.Schema.Types.Mixed,
      users: Number,
      conversionRate: Number,
      avgOrderValue: Number,
      topDropoffStage: String
    }],

    // A/B Test Results
    abTests: [{
      testName: String,
      variant: String,
      users: Number,
      conversions: Number,
      conversionRate: Number,
      revenue: Number,
      isWinner: Boolean,
      statisticalSignificance: Number
    }]
  },

  // Revenue Attribution
  revenueAttribution: {
    // Channel Attribution
    channels: [{
      channel: {
        type: String,
        enum: ['organic-search', 'paid-search', 'social-media', 'email', 'direct', 'referral', 'display-ads', 'affiliate']
      },

      // Attribution Models
      firstTouch: { revenue: Number, orders: Number, percentage: Number },
      lastTouch: { revenue: Number, orders: Number, percentage: Number },
      linear: { revenue: Number, orders: Number, percentage: Number },
      timeDecay: { revenue: Number, orders: Number, percentage: Number },
      positionBased: { revenue: Number, orders: Number, percentage: Number },

      // Metrics
      visits: Number,
      cost: Number,
      roi: Number,
      cpa: Number, // Cost per acquisition
      roas: Number // Return on ad spend
    }],

    // Campaign Attribution
    campaigns: [{
      campaignId: String,
      campaignName: String,
      channel: String,
      revenue: Number,
      orders: Number,
      clicks: Number,
      impressions: Number,
      spend: Number,
      roi: Number,
      conversionRate: Number,
      attributionModel: String
    }],

    // Customer Journey
    customerJourneys: [{
      journeyId: String,
      touchpoints: [{
        channel: String,
        timestamp: Date,
        interaction: String,
        attributionWeight: Number
      }],
      totalTouchpoints: Number,
      conversionTime: Number, // hours
      revenue: Number,
      attributionModel: String
    }],

    // Product Attribution
    productAttribution: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      topChannel: String,
      topCampaign: String,
      avgTouchpoints: Number,
      avgConversionTime: Number,
      revenue: Number
    }]
  },

  // Product Performance Metrics
  productPerformance: {
    topProducts: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      productName: String,
      sku: String,

      // Sales Metrics
      unitsSold: Number,
      revenue: Number,
      profit: Number,
      profitMargin: Number,

      // Engagement Metrics
      views: Number,
      clicks: Number,
      addToCartRate: Number,
      purchaseRate: Number,

      // Inventory Metrics
      stockTurnover: Number,
      daysInInventory: Number,
      stockoutDays: Number,

      // Customer Metrics
      avgRating: Number,
      reviewCount: Number,
      returnRate: Number,

      // Growth
      growthRate: Number,
      trend: {
        type: String,
        enum: ['rising', 'stable', 'declining']
      }
    }],

    underperformingProducts: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      productName: String,
      issues: [String],
      lowConversionRate: Boolean,
      highReturnRate: Boolean,
      poorRating: Boolean,
      slowMoving: Boolean,
      recommendations: [String]
    }],

    categoryPerformance: [{
      category: String,
      revenue: Number,
      unitsSold: Number,
      avgOrderValue: Number,
      conversionRate: Number,
      profitMargin: Number,
      growthRate: Number,
      marketShare: Number
    }],

    pricingInsights: [{
      priceRange: String,
      productCount: Number,
      revenue: Number,
      unitsSold: Number,
      conversionRate: Number,
      optimalPricePoint: Number
    }]
  },

  // Customer Analytics
  customerAnalytics: {
    // Lifetime Value
    ltv: {
      avgCustomerLifetimeValue: Number,
      ltvByCohort: [{
        cohortMonth: Date,
        customers: Number,
        avgLTV: Number,
        retentionRate: Number
      }],
      ltvBySegment: [{
        segment: String,
        avgLTV: Number,
        customers: Number
      }]
    },

    // Cohort Analysis
    cohorts: [{
      cohortMonth: Date,
      newCustomers: Number,
      retention: [{
        month: Number,
        retainedCustomers: Number,
        retentionRate: Number,
        revenue: Number
      }]
    }],

    // RFM Segmentation
    rfmSegments: [{
      segment: String,
      recency: Number,
      frequency: Number,
      monetary: Number,
      customers: Number,
      revenue: Number,
      avgOrderValue: Number
    }],

    // Churn Analysis
    churn: {
      churnRate: Number,
      churnedCustomers: Number,
      churnReasons: [{
        reason: String,
        percentage: Number
      }],
      predictedChurn: [{
        customerId: mongoose.Schema.Types.ObjectId,
        churnProbability: Number,
        riskFactors: [String]
      }]
    }
  },

  // Real-time Metrics
  realTimeMetrics: {
    currentVisitors: Number,
    visitorsByPage: [{
      page: String,
      visitors: Number
    }],
    activeOrders: Number,
    todayRevenue: Number,
    todayOrders: Number,
    conversionRateToday: Number,
    lastUpdated: { type: Date, default: Date.now }
  },

  // Dashboard Settings
  settings: {
    autoRefresh: { type: Boolean, default: true },
    refreshInterval: { type: Number, default: 300 }, // seconds
    defaultDateRange: String,
    widgets: [{
      widgetId: String,
      type: String,
      position: { x: Number, y: Number },
      size: { width: Number, height: Number },
      visible: { type: Boolean, default: true },
      config: mongoose.Schema.Types.Mixed
    }],
    alerts: [{
      metric: String,
      condition: String,
      threshold: Number,
      enabled: { type: Boolean, default: true }
    }]
  },

  // Generated Reports
  generatedReports: [{
    reportType: String,
    generatedAt: Date,
    fileUrl: String,
    format: {
      type: String,
      enum: ['pdf', 'excel', 'csv', 'json']
    },
    size: Number
  }],

  lastCalculated: { type: Date, default: Date.now },

  calculationStatus: {
    isCalculating: { type: Boolean, default: false },
    progress: { type: Number, default: 0 },
    startedAt: Date,
    completedAt: Date,
    errors: [String]
  }

}, {
  timestamps: true, suppressReservedKeysWarning: true });

// Indexes
advancedAnalyticsDashboardSchema.index({ businessId: 1, 'dateRange.startDate': 1, 'dateRange.endDate': 1 });
advancedAnalyticsDashboardSchema.index({ 'dateRange.period': 1 });
advancedAnalyticsDashboardSchema.index({ lastCalculated: -1 });

// Method: Calculate Overall Conversion Rate
advancedAnalyticsDashboardSchema.methods.calculateOverallConversionRate = function () {
  if (!this.conversionFunnel.stages || this.conversionFunnel.stages.length === 0) {
    return 0;
  }

  const firstStage = this.conversionFunnel.stages[0];
  const lastStage = this.conversionFunnel.stages[this.conversionFunnel.stages.length - 1];

  if (firstStage.users === 0) return 0;

  return (lastStage.users / firstStage.users) * 100;
};

// Method: Get Top Revenue Channel
advancedAnalyticsDashboardSchema.methods.getTopRevenueChannel = function () {
  if (!this.revenueAttribution.channels || this.revenueAttribution.channels.length === 0) {
    return null;
  }

  return this.revenueAttribution.channels.reduce((top, channel) => {
    return (channel.lastTouch.revenue > top.lastTouch.revenue) ? channel : top;
  }, this.revenueAttribution.channels[0]);
};

// Method: Predict Next Month Revenue
advancedAnalyticsDashboardSchema.methods.predictNextMonthRevenue = function () {
  if (!this.salesForecast.predictions || this.salesForecast.predictions.length === 0) {
    return null;
  }

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const prediction = this.salesForecast.predictions.find(p => {
    const predDate = new Date(p.date);
    return predDate.getMonth() === nextMonth.getMonth() &&
      predDate.getFullYear() === nextMonth.getFullYear();
  });

  return prediction || this.salesForecast.predictions[0];
};

// Static: Get Recent Dashboards
advancedAnalyticsDashboardSchema.statics.getRecentDashboards = function (businessId, limit = 10) {
  return this.find({ businessId })
    .sort({ lastCalculated: -1 })
    .limit(limit);
};

// Static: Get Dashboard by Period
advancedAnalyticsDashboardSchema.statics.getDashboardByPeriod = function (businessId, period) {
  return this.findOne({ businessId, 'dateRange.period': period })
    .sort({ lastCalculated: -1 });
};

const AdvancedAnalyticsDashboard = mongoose.model('AdvancedAnalyticsDashboard', advancedAnalyticsDashboardSchema);
export default AdvancedAnalyticsDashboard;
export { AdvancedAnalyticsDashboard };
