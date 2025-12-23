import mongoose from 'mongoose';

const aiRecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recommendationType: {
    type: String,
    enum: ['product', 'bundle', 'category', 'brand', 'complementary', 'alternative'],
    default: 'product'
  },
  basedOn: {
    type: String,
    enum: ['browsing_history', 'purchase_history', 'cart_items', 'wishlist', 'similar_users', 'trending', 'ai_prediction'],
    required: true
  },
  sourceProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  recommendedProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    position: Number
  }],
  algorithm: {
    type: String,
    enum: ['collaborative_filtering', 'content_based', 'hybrid', 'deep_learning', 'matrix_factorization'],
    default: 'hybrid'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  context: {
    page: String,
    device: String,
    location: String,
    timeOfDay: String,
    season: String
  },
  performance: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    addToCart: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000) // 24 hours
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for fast queries
aiRecommendationSchema.index({ user: 1, isActive: 1, expiresAt: 1 });
aiRecommendationSchema.index({ 'recommendedProducts.product': 1 });

const AIRecommendation = mongoose.model('AIRecommendation', aiRecommendationSchema);
export default AIRecommendation;
export { AIRecommendation };
