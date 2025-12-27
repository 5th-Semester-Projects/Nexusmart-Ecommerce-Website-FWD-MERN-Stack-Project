import mongoose from 'mongoose';

const outfitBuilderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  description: {
    type: String,
    maxlength: 500
  },

  // Outfit Items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant'
    },
    category: {
      type: String,
      enum: ['top', 'bottom', 'dress', 'outerwear', 'footwear', 'accessory', 'bag', 'jewelry', 'hat', 'scarf', 'belt', 'sunglasses'],
      required: true
    },
    position: Number,
    isOptional: { type: Boolean, default: false },
    alternatives: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      reason: String
    }]
  }],

  // Outfit Details
  occasion: {
    type: String,
    enum: ['casual', 'formal', 'business', 'party', 'wedding', 'sports', 'travel', 'date', 'beach', 'festival', 'work', 'weekend', 'outdoor', 'evening'],
    required: true
  },

  season: {
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter', 'all-season'],
    required: true
  },

  weather: [{
    type: String,
    enum: ['sunny', 'rainy', 'cloudy', 'cold', 'hot', 'windy', 'snowy']
  }],

  style: [{
    type: String,
    enum: ['bohemian', 'classic', 'casual', 'chic', 'edgy', 'elegant', 'minimalist', 'preppy', 'romantic', 'sporty', 'street', 'vintage', 'modern', 'luxury']
  }],

  colorScheme: {
    primary: String,
    secondary: String,
    accent: String,
    palette: [String],
    harmony: { type: String, enum: ['monochromatic', 'complementary', 'analogous', 'triadic', 'neutral'] }
  },

  // Pricing
  pricing: {
    totalPrice: { type: Number, required: true },
    originalPrice: Number,
    discount: Number,
    savings: Number,
    currency: { type: String, default: 'USD' },
    priceRange: { type: String, enum: ['budget', 'moderate', 'premium', 'luxury'] }
  },

  // Images & Media
  images: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['main', 'detail', 'back', 'side', 'styled'], default: 'main' },
    isPrimary: { type: Boolean, default: false }
  }],

  lookbookImage: String, // Styled outfit image

  // AI Recommendations
  aiGenerated: {
    type: Boolean,
    default: false
  },

  aiConfidence: {
    type: Number,
    min: 0,
    max: 100
  },

  styleScore: {
    coordination: { type: Number, min: 0, max: 100 },
    colorHarmony: { type: Number, min: 0, max: 100 },
    occasionFit: { type: Number, min: 0, max: 100 },
    trendiness: { type: Number, min: 0, max: 100 },
    overall: { type: Number, min: 0, max: 100 }
  },

  recommendations: {
    styling: [String],
    accessories: [String],
    colorTips: [String],
    fitAdvice: [String]
  },

  // User Customizations
  customizations: {
    notes: String,
    tags: [String],
    isPublic: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false }
  },

  // Engagement Metrics
  engagement: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },

  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Comments
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
  }],

  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'featured'],
    default: 'draft'
  },

  visibility: {
    type: String,
    enum: ['private', 'friends', 'public'],
    default: 'private'
  },

  // Collections
  collections: [{
    type: String
  }],

  // Shopping
  shoppingLinks: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    url: String,
    inStock: { type: Boolean, default: true },
    lastChecked: Date
  }],

  totalItemsInCart: { type: Number, default: 0 },
  totalItemsPurchased: { type: Number, default: 0 },
  conversionRate: { type: Number, min: 0, max: 100 },

  // Related Outfits
  similarOutfits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OutfitBuilder'
  }],

  // Analytics
  analytics: {
    createdFrom: { type: String, enum: ['manual', 'ai', 'stylist', 'template'] },
    templateId: String,
    deviceType: String,
    location: String,
    clickThroughRate: { type: Number, min: 0, max: 100 },
    avgTimeSpent: Number,
    completionRate: { type: Number, min: 0, max: 100 }
  },

  // Featured
  featured: {
    isFeatured: { type: Boolean, default: false },
    featuredAt: Date,
    featuredUntil: Date,
    featuredCategory: String
  },

  // Seasonal Availability
  availableFrom: Date,
  availableUntil: Date,

  // Version Control
  version: { type: Number, default: 1 },
  lastModified: Date

}, {
  timestamps: true
});

// Indexes
outfitBuilderSchema.index({ status: 1 });
outfitBuilderSchema.index({ occasion: 1, season: 1 });
outfitBuilderSchema.index({ 'engagement.likes': -1 });
outfitBuilderSchema.index({ 'engagement.views': -1 });
outfitBuilderSchema.index({ status: 1, visibility: 1 });
outfitBuilderSchema.index({ 'style': 1 });

// Virtual: Total Items
outfitBuilderSchema.virtual('totalItems').get(function () {
  return this.items.length;
});

// Virtual: Is Complete
outfitBuilderSchema.virtual('isComplete').get(function () {
  const hasEssentials = this.items.some(item => ['top', 'bottom', 'dress'].includes(item.category));
  return hasEssentials && this.items.length >= 2;
});

// Method: Calculate Total Price
outfitBuilderSchema.methods.calculateTotalPrice = async function () {
  await this.populate('items.product');

  let total = 0;
  let original = 0;

  for (const item of this.items) {
    if (item.product) {
      total += item.product.salePrice || item.product.price || 0;
      original += item.product.price || 0;
    }
  }

  this.pricing.totalPrice = total;
  this.pricing.originalPrice = original;
  this.pricing.discount = original - total;
  this.pricing.savings = original > 0 ? ((original - total) / original * 100) : 0;

  return this.pricing;
};

// Method: Toggle Like
outfitBuilderSchema.methods.toggleLike = function (userId) {
  const index = this.likedBy.indexOf(userId);

  if (index > -1) {
    this.likedBy.splice(index, 1);
    this.engagement.likes = Math.max(0, this.engagement.likes - 1);
  } else {
    this.likedBy.push(userId);
    this.engagement.likes += 1;
  }
};

// Method: Toggle Save
outfitBuilderSchema.methods.toggleSave = function (userId) {
  const index = this.savedBy.indexOf(userId);

  if (index > -1) {
    this.savedBy.splice(index, 1);
    this.engagement.saves = Math.max(0, this.engagement.saves - 1);
  } else {
    this.savedBy.push(userId);
    this.engagement.saves += 1;
  }
};

// Method: Add Comment
outfitBuilderSchema.methods.addComment = function (userId, text) {
  this.comments.push({
    user: userId,
    text,
    createdAt: Date.now()
  });
  this.engagement.comments += 1;
};

// Method: Calculate Style Score
outfitBuilderSchema.methods.calculateStyleScore = function () {
  // Simplified scoring - in production, use ML model
  const scores = {
    coordination: 75 + Math.random() * 25,
    colorHarmony: 70 + Math.random() * 30,
    occasionFit: 80 + Math.random() * 20,
    trendiness: 65 + Math.random() * 35
  };

  scores.overall = (scores.coordination + scores.colorHarmony + scores.occasionFit + scores.trendiness) / 4;

  this.styleScore = scores;
  return scores;
};

// Static: Get Trending Outfits
outfitBuilderSchema.statics.getTrendingOutfits = function (limit = 10) {
  return this.find({
    status: 'published',
    visibility: 'public'
  })
    .sort({ 'engagement.likes': -1, 'engagement.views': -1 })
    .limit(limit)
    .populate('user', 'name avatar')
    .populate('items.product');
};

// Static: Get Featured Outfits
outfitBuilderSchema.statics.getFeaturedOutfits = function () {
  return this.find({
    'featured.isFeatured': true,
    'featured.featuredUntil': { $gt: Date.now() },
    status: 'published'
  })
    .sort({ 'featured.featuredAt': -1 })
    .populate('items.product');
};

// Static: Get Outfits by Occasion
outfitBuilderSchema.statics.getByOccasion = function (occasion, limit = 20) {
  return this.find({
    occasion,
    status: 'published',
    visibility: 'public'
  })
    .sort({ 'engagement.likes': -1 })
    .limit(limit)
    .populate('items.product');
};

// Pre-save middleware
outfitBuilderSchema.pre('save', function (next) {
  if (this.isModified('items')) {
    this.version += 1;
    this.lastModified = Date.now();
  }
  next();
});

const OutfitBuilder = mongoose.model('OutfitBuilder', outfitBuilderSchema);
export default OutfitBuilder;
export { OutfitBuilder };
