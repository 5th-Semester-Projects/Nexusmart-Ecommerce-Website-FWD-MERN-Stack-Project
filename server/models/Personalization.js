import mongoose from 'mongoose';

// ==================== STYLE QUIZ ====================
const styleQuizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  responses: [{
    question: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: ['single', 'multiple', 'scale', 'image_select'],
    },
    answer: mongoose.Schema.Types.Mixed,
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  }],
  results: {
    primaryStyle: {
      type: String,
      enum: ['classic', 'casual', 'bohemian', 'minimalist', 'sporty', 'glamorous', 'edgy', 'romantic', 'preppy', 'vintage'],
    },
    secondaryStyles: [String],
    colorPalette: {
      primary: [String],
      accent: [String],
      avoid: [String],
    },
    patterns: {
      preferred: [String],
      avoid: [String],
    },
    fitPreference: {
      type: String,
      enum: ['loose', 'regular', 'fitted', 'tight'],
    },
    priceRange: {
      min: Number,
      max: Number,
    },
    brands: {
      preferred: [String],
      avoid: [String],
    },
    occasions: [String],
    lifestyle: [String],
  },
  completedAt: Date,
  version: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

styleQuizSchema.index({ user: 1, isActive: 1 });

export const StyleQuiz = mongoose.model('StyleQuiz', styleQuizSchema);

// ==================== PERSONALIZED HOMEPAGE ====================
const personalizedHomepageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  layout: {
    type: String,
    enum: ['grid', 'list', 'mixed'],
    default: 'grid',
  },
  sections: [{
    type: {
      type: String,
      enum: ['recommended', 'recently_viewed', 'wishlist_picks', 'category', 'brand', 'trending', 'deals', 'new_arrivals', 'complete_look', 'reorder'],
    },
    title: String,
    order: Number,
    visible: {
      type: Boolean,
      default: true,
    },
    config: mongoose.Schema.Types.Mixed,
  }],
  featuredCategories: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    weight: Number,
  }],
  featuredBrands: [String],
  bannersPreferences: {
    showPromotional: {
      type: Boolean,
      default: true,
    },
    showPersonalized: {
      type: Boolean,
      default: true,
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

export const PersonalizedHomepage = mongoose.model('PersonalizedHomepage', personalizedHomepageSchema);

// ==================== SMART PRODUCT BUNDLES ====================
const smartBundleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ['ai_generated', 'purchase_based', 'style_based', 'frequently_bought', 'manual'],
    required: true,
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    reason: String,
    order: Number,
  }],
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 50,
  },
  originalPrice: Number,
  bundlePrice: Number,
  savings: Number,
  image: {
    public_id: String,
    url: String,
  },
  basedOn: {
    purchaseHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    }],
    styleQuiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StyleQuiz',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  },
  relevanceScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  purchases: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  isPersonalized: {
    type: Boolean,
    default: false,
  },
  validUntil: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

smartBundleSchema.index({ user: 1, isActive: 1 });
smartBundleSchema.index({ type: 1 });

export const SmartBundle = mongoose.model('SmartBundle', smartBundleSchema);

// ==================== COMPLETE THE LOOK ====================
const completeTheLookSchema = new mongoose.Schema({
  baseProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  suggestions: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    category: String,
    reason: String,
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    order: Number,
  }],
  lookName: String,
  lookImage: {
    public_id: String,
    url: String,
  },
  style: String,
  occasion: String,
  season: String,
  totalPrice: Number,
  views: {
    type: Number,
    default: 0,
  },
  conversions: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

completeTheLookSchema.index({ baseProduct: 1, isActive: 1 });

export const CompleteTheLook = mongoose.model('CompleteTheLook', completeTheLookSchema);

// ==================== USER PREFERENCE LEARNING ====================
const userPreferenceLearningSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  categoryPreferences: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    score: {
      type: Number,
      default: 0,
    },
    interactions: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
      wishlist: { type: Number, default: 0 },
    },
  }],
  brandPreferences: [{
    brand: String,
    score: {
      type: Number,
      default: 0,
    },
    interactions: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
      wishlist: { type: Number, default: 0 },
    },
  }],
  pricePreference: {
    average: Number,
    min: Number,
    max: Number,
    sensitivity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  colorPreferences: [{
    color: String,
    score: Number,
  }],
  sizePreferences: {
    tops: String,
    bottoms: String,
    shoes: String,
  },
  shoppingPatterns: {
    preferredDays: [String],
    preferredTimes: [String],
    averageSessionDuration: Number,
    devicePreference: String,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

export const UserPreferenceLearning = mongoose.model('UserPreferenceLearning', userPreferenceLearningSchema);

export default { StyleQuiz, PersonalizedHomepage, SmartBundle, CompleteTheLook, UserPreferenceLearning };
