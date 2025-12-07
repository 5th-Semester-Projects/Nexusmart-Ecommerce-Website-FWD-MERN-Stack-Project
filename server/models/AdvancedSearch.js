import mongoose from 'mongoose';

const advancedSearchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // Search query
  query: {
    original: { type: String, required: true },
    normalized: String, // cleaned & processed
    tokens: [String], // tokenized words
    language: { type: String, default: 'en' }
  },

  // Search type
  searchType: {
    type: String,
    enum: ['text', 'voice', 'visual', 'barcode', 'autocomplete'],
    default: 'text'
  },

  // Filters applied
  filters: {
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    priceRange: {
      min: Number,
      max: Number
    },
    brands: [String],
    ratings: { type: Number, min: 0, max: 5 },
    inStock: Boolean,
    discount: Boolean,
    freeShipping: Boolean,
    attributes: mongoose.Schema.Types.Mixed, // dynamic filters
    sortBy: {
      type: String,
      enum: ['relevance', 'price_asc', 'price_desc', 'rating', 'newest', 'popular']
    }
  },

  // Search results
  results: {
    products: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      relevanceScore: Number,
      matchType: {
        type: String,
        enum: ['exact', 'partial', 'fuzzy', 'semantic', 'synonym']
      },
      matchedFields: [String], // which fields matched
      position: Number
    }],
    totalResults: Number,
    resultsFetched: Number,
    hasMore: Boolean,
    searchTime: Number, // milliseconds
    suggestions: [{
      text: String,
      score: Number,
      type: { type: String, enum: ['spelling', 'alternative', 'related'] }
    }]
  },

  // Autocomplete suggestions
  suggestions: [{
    text: String,
    category: String,
    popularity: Number,
    imageUrl: String
  }],

  // Voice search specific
  voiceSearch: {
    audioUrl: String,
    duration: Number,
    transcription: String,
    confidence: Number,
    language: String,
    accent: String
  },

  // Visual search specific
  visualSearch: {
    imageUrl: String,
    imageHash: String,
    detectedObjects: [String],
    colors: [String],
    similarityThreshold: Number
  },

  // User interaction
  interaction: {
    clickedResults: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      position: Number,
      clickedAt: Date
    }],
    addedToCart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    purchased: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    timeSpent: Number, // seconds on results page
    scrollDepth: Number, // percentage scrolled
    refinements: Number, // how many times filters changed
    abandoned: Boolean,
    bounced: Boolean // left without clicking
  },

  // Context
  context: {
    page: String, // where search initiated
    device: String,
    location: {
      country: String,
      city: String
    },
    referrer: String,
    sessionId: String
  },

  // Search quality metrics
  metrics: {
    zeroResults: Boolean,
    avgRelevanceScore: Number,
    clickThroughRate: Number,
    conversionRate: Number,
    timeToFirstClick: Number,
    satisfactionScore: Number
  },

  // Personalization
  personalization: {
    usedHistory: Boolean,
    usedPreferences: Boolean,
    boostFactors: mongoose.Schema.Types.Mixed,
    userSegment: String
  },

  searchedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
advancedSearchSchema.index({ 'query.original': 'text' });
advancedSearchSchema.index({ user: 1, searchedAt: -1 });
advancedSearchSchema.index({ 'results.products.product': 1 });
advancedSearchSchema.index({ 'metrics.conversionRate': -1 });

// Methods
advancedSearchSchema.methods.trackClick = function (productId, position) {
  this.interaction.clickedResults.push({
    product: productId,
    position,
    clickedAt: new Date()
  });
  return this.save();
};

// Statics
advancedSearchSchema.statics.getPopularSearches = async function (limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: '$query.normalized',
        count: { $sum: 1 },
        avgResults: { $avg: '$results.totalResults' },
        avgCTR: { $avg: '$metrics.clickThroughRate' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

advancedSearchSchema.statics.getTrendingSearches = async function (hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.aggregate([
    { $match: { searchedAt: { $gte: since } } },
    {
      $group: {
        _id: '$query.normalized',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
};

export default mongoose.model('AdvancedSearch', advancedSearchSchema);
