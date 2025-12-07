const mongoose = require('mongoose');

const dynamicPricingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  minPrice: {
    type: Number,
    required: true
  },
  maxPrice: {
    type: Number,
    required: true
  },
  pricingStrategy: {
    type: String,
    enum: ['demand_based', 'time_based', 'competitor_based', 'inventory_based', 'segment_based', 'ai_optimized'],
    default: 'ai_optimized'
  },
  factors: {
    demand: {
      score: Number,
      trend: String, // 'increasing', 'stable', 'decreasing'
      viewsLast24h: Number,
      addToCartRate: Number,
      conversionRate: Number
    },
    inventory: {
      currentStock: Number,
      turnoverRate: Number,
      daysOfInventory: Number,
      isOverstock: Boolean,
      isLowStock: Boolean
    },
    competition: {
      averageMarketPrice: Number,
      lowestCompetitorPrice: Number,
      pricePosition: String, // 'lowest', 'below_average', 'average', 'above_average', 'highest'
    },
    seasonality: {
      season: String,
      isHighSeason: Boolean,
      seasonalityFactor: Number
    },
    timeOfDay: {
      hour: Number,
      isPeakTime: Boolean,
      timeFactor: Number
    },
    customerSegment: {
      isVIP: Boolean,
      loyaltyTier: String,
      purchaseHistory: Number
    },
    external: {
      weather: String,
      events: [String],
      economicIndicator: Number
    }
  },
  aiPrediction: {
    predictedDemand: Number,
    optimalPrice: Number,
    expectedRevenue: Number,
    confidence: Number,
    model: String
  },
  priceHistory: [{
    price: Number,
    reason: String,
    timestamp: Date,
    performance: {
      views: Number,
      sales: Number,
      revenue: Number
    }
  }],
  rules: [{
    condition: String,
    action: String,
    priority: Number,
    isActive: Boolean
  }],
  performance: {
    revenueImpact: Number,
    salesImpact: Number,
    marginImpact: Number,
    competitivenessScore: Number
  },
  nextPriceUpdate: Date,
  updateFrequency: {
    type: String,
    enum: ['realtime', 'hourly', 'daily', 'weekly'],
    default: 'hourly'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: Date,
  validUntil: Date
}, {
  timestamps: true
});

// Indexes
dynamicPricingSchema.index({ product: 1, isActive: 1 });
dynamicPricingSchema.index({ nextPriceUpdate: 1 });

const DynamicPricing = mongoose.model('DynamicPricing', dynamicPricingSchema);`nexport default DynamicPricing;`nexport { DynamicPricing };
