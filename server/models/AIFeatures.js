import mongoose from 'mongoose';
import PriceAlert from './PriceAlert.js';

// ==================== AI CHAT MESSAGE SCHEMA ====================
const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  metadata: {
    intent: String,
    entities: [String],
    confidence: Number,
    suggestedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
  },
}, { timestamps: true });

// ==================== AI CHAT SESSION SCHEMA ====================
const aiChatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  messages: [chatMessageSchema],
  context: {
    currentPage: String,
    viewedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    cartItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    userPreferences: mongoose.Schema.Types.Mixed,
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'escalated'],
    default: 'active',
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

aiChatSessionSchema.index({ user: 1, createdAt: -1 });

export const AIChatSession = mongoose.model('AIChatSession', aiChatSessionSchema);

// ==================== VISUAL SEARCH SCHEMA ====================
const visualSearchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imageHash: {
    type: String,
    required: true,
  },
  detectedFeatures: {
    colors: [String],
    patterns: [String],
    categories: [String],
    objects: [String],
    style: String,
  },
  matchedProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    similarity: {
      type: Number,
      min: 0,
      max: 100,
    },
  }],
  searchQuery: String,
}, { timestamps: true });

visualSearchSchema.index({ imageHash: 1 });

export const VisualSearch = mongoose.model('VisualSearch', visualSearchSchema);

// ==================== PRICE HISTORY SCHEMA ====================
const priceHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: Number,
  discount: Number,
  recordedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

priceHistorySchema.index({ product: 1, recordedAt: -1 });

export const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);

// ==================== PRICE PREDICTION SCHEMA ====================
const pricePredictionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  predictedPrice: {
    type: Number,
    required: true,
  },
  predictedDate: {
    type: Date,
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  trend: {
    type: String,
    enum: ['rising', 'falling', 'stable'],
    required: true,
  },
  recommendation: {
    type: String,
    enum: ['buy_now', 'wait', 'best_time'],
    required: true,
  },
  factors: [{
    name: String,
    impact: String, // positive, negative, neutral
    weight: Number,
  }],
  validUntil: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

pricePredictionSchema.index({ product: 1, validUntil: -1 });

export const PricePrediction = mongoose.model('PricePrediction', pricePredictionSchema);

// ==================== USER RECOMMENDATIONS SCHEMA ====================
const userRecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['similar', 'frequently_bought', 'trending', 'personalized', 'based_on_history', 'based_on_wishlist'],
    required: true,
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    reason: String,
  }],
  context: {
    sourceProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    category: String,
    tags: [String],
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

userRecommendationSchema.index({ user: 1, type: 1 });
userRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const UserRecommendation = mongoose.model('UserRecommendation', userRecommendationSchema);

// PriceAlert schema has been moved to its own file PriceAlert.js
// Import it from there instead

export default {
  AIChatSession,
  VisualSearch,
  PriceHistory,
  PricePrediction,
  UserRecommendation,
  PriceAlert,
};
