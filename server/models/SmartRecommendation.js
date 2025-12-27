import mongoose from 'mongoose';

const smartRecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Recommendation types
  recommendationType: {
    type: String,
    enum: [
      'personalized', 'trending', 'similar_products',
      'frequently_bought_together', 'recently_viewed',
      'price_drop', 'back_in_stock', 'seasonal',
      'category_based', 'brand_based', 'new_arrivals'
    ],
    required: true
  },

  // User behavior tracking
  userBehavior: {
    viewHistory: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      viewedAt: Date,
      duration: Number, // seconds spent viewing
      scrollDepth: Number // percentage scrolled
    }],
    searchHistory: [{
      query: String,
      searchedAt: Date,
      resultsClicked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
    }],
    purchaseHistory: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      category: String,
      price: Number,
      purchasedAt: Date
    }],
    cartAdditions: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      addedAt: Date,
      completed: Boolean
    }],
    wishlistItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  },

  // Recommended products
  recommendations: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    reason: {
      type: String,
      enum: [
        'based_on_your_views',
        'customers_also_bought',
        'trending_now',
        'similar_to_your_purchases',
        'price_drop_alert',
        'recommended_for_you',
        'complete_the_look',
        'popular_in_your_area'
      ]
    },
    reasoning: String, // detailed explanation
    position: Number // display order
  }],

  // Context & targeting
  context: {
    page: {
      type: String,
      enum: ['homepage', 'product_detail', 'cart', 'checkout', 'email', 'category']
    },
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop']
    },
    location: {
      country: String,
      city: String,
      coordinates: {
        type: { type: String, enum: ['Point'] },
        coordinates: [Number] // [longitude, latitude]
      }
    },
    timeOfDay: String, // morning, afternoon, evening, night
    season: String,
    weather: String
  },

  // Performance metrics
  performance: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    addToCart: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    clickThroughRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 }
  },

  // A/B testing
  abTest: {
    experimentId: String,
    variant: String,
    isControl: Boolean
  },

  // Algorithm details
  algorithm: {
    type: {
      type: String,
      enum: [
        'collaborative_filtering',
        'content_based',
        'hybrid',
        'deep_learning',
        'matrix_factorization',
        'popularity_based',
        'association_rules'
      ],
      default: 'hybrid'
    },
    version: String,
    confidence: Number,
    features: [String], // features used for recommendation
    weights: mongoose.Schema.Types.Mixed
  },

  // Freshness & validity
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Feedback loop
  userFeedback: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    action: {
      type: String,
      enum: ['clicked', 'ignored', 'dismissed', 'purchased', 'added_to_cart', 'liked']
    },
    timestamp: Date
  }]
}, {
  timestamps: true, suppressReservedKeysWarning: true });

// Indexes
smartRecommendationSchema.index({ recommendationType: 1 });
smartRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
smartRecommendationSchema.index({ 'recommendations.product': 1 });
smartRecommendationSchema.index({ 'context.location.coordinates': '2dsphere' });
smartRecommendationSchema.index({ 'performance.conversionRate': -1 });

// Methods
smartRecommendationSchema.methods.updatePerformance = function (action, value = 0) {
  this.performance.impressions++;

  if (action === 'click') this.performance.clicks++;
  if (action === 'addToCart') this.performance.addToCart++;
  if (action === 'purchase') {
    this.performance.purchases++;
    this.performance.revenue += value;
  }

  // Calculate rates
  if (this.performance.impressions > 0) {
    this.performance.clickThroughRate =
      (this.performance.clicks / this.performance.impressions * 100).toFixed(2);
    this.performance.conversionRate =
      (this.performance.purchases / this.performance.impressions * 100).toFixed(2);
  }

  if (this.performance.purchases > 0) {
    this.performance.averageOrderValue =
      (this.performance.revenue / this.performance.purchases).toFixed(2);
  }

  return this.save();
};

// Statics
smartRecommendationSchema.statics.getPersonalizedRecommendations = async function (userId, context = {}) {
  return this.findOne({
    user: userId,
    recommendationType: 'personalized',
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('recommendations.product');
};

export default mongoose.model('SmartRecommendation', smartRecommendationSchema);
