import mongoose from 'mongoose';

const advancedSearchFiltersSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // Faceted Search Configuration
  facets: [{
    facetName: String,
    facetType: {
      type: String,
      enum: ['category', 'brand', 'price', 'rating', 'color', 'size', 'material', 'attribute', 'custom']
    },
    values: [{
      value: String,
      count: Number,
      selected: Boolean
    }],
    displayName: String,
    order: Number,
    collapsible: { type: Boolean, default: true },
    collapsed: { type: Boolean, default: false }
  }],

  // Search Query
  searchQuery: {
    keyword: String,
    originalQuery: String,
    correctedQuery: String,
    didYouMean: String,

    // Autocomplete Suggestions
    suggestions: [{
      text: String,
      score: Number,
      category: String,
      products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }]
    }],

    // Query Processing
    tokens: [String],
    stemmedTokens: [String],
    synonyms: [{
      original: String,
      synonyms: [String]
    }]
  },

  // Active Filters
  activeFilters: {
    // Category Filters
    categories: [String],
    subcategories: [String],

    // Price Range
    priceRange: {
      min: Number,
      max: Number,
      currency: String
    },

    // Brand Filters
    brands: [String],

    // Rating Filter
    minRating: { type: Number, min: 0, max: 5 },

    // Availability
    inStock: Boolean,
    onSale: Boolean,
    freeShipping: Boolean,

    // Color Filters
    colors: [String],

    // Size Filters
    sizes: [String],

    // Material
    materials: [String],

    // Custom Attributes
    customAttributes: [{
      name: String,
      values: [String]
    }],

    // Condition
    condition: {
      type: String,
      enum: ['new', 'refurbished', 'used', 'like-new']
    },

    // Seller
    sellers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller'
    }],

    // Shipping
    shipsFrom: [String],
    shippingTime: {
      max: Number, // days
      type: String
    }
  },

  // Sort Options
  sorting: {
    field: {
      type: String,
      enum: ['relevance', 'price', 'popularity', 'rating', 'newest', 'name', 'discount'],
      default: 'relevance'
    },
    order: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'desc'
    }
  },

  // Search Results
  results: {
    totalResults: { type: Number, default: 0 },

    products: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      relevanceScore: Number,
      matchedFields: [String],
      highlightedFields: mongoose.Schema.Types.Mixed,
      position: Number
    }],

    pagination: {
      currentPage: { type: Number, default: 1 },
      pageSize: { type: Number, default: 24 },
      totalPages: Number
    },

    // Search Metadata
    searchTime: Number, // milliseconds
    source: {
      type: String,
      enum: ['elasticsearch', 'mongodb', 'cache', 'algolia']
    }
  },

  // Search History for User
  searchHistory: [{
    query: String,
    timestamp: Date,
    filters: mongoose.Schema.Types.Mixed,
    resultsCount: Number,
    clicked: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      position: Number,
      timestamp: Date
    }],
    converted: Boolean
  }],

  // Trending Searches (Global)
  trendingSearches: [{
    query: String,
    count: Number,
    trend: {
      type: String,
      enum: ['rising', 'stable', 'falling']
    },
    category: String,
    lastUpdated: Date
  }],

  // Popular Filters
  popularFilters: [{
    filterType: String,
    filterValue: String,
    usageCount: Number,
    conversionRate: Number
  }],

  // Filter Combinations
  filterCombinations: [{
    filters: mongoose.Schema.Types.Mixed,
    usageCount: Number,
    avgResultsCount: Number,
    conversionRate: Number
  }],

  // Search Analytics
  analytics: {
    // User-specific
    totalSearches: { type: Number, default: 0 },
    uniqueQueries: { type: Number, default: 0 },
    avgResultsPerSearch: Number,
    avgClickPosition: Number,
    searchToCartRate: Number,
    searchToConversionRate: Number,

    // Popular Queries
    topQueries: [{
      query: String,
      count: Number,
      conversionRate: Number
    }],

    // Zero Results Queries
    zeroResultQueries: [{
      query: String,
      count: Number,
      timestamp: Date
    }],

    // Search Refinements
    refinements: [{
      originalQuery: String,
      refinedQuery: String,
      count: Number
    }],

    lastUpdated: Date
  },

  // AI-Powered Search Features
  aiFeatures: {
    // Visual Search
    visualSearch: {
      enabled: Boolean,
      imageUrl: String,
      similarProducts: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        similarity: Number
      }]
    },

    // Natural Language Processing
    nlp: {
      intent: {
        type: String,
        enum: ['browse', 'buy', 'compare', 'research']
      },
      entities: [{
        type: String,
        value: String,
        confidence: Number
      }],
      sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative']
      }
    },

    // Semantic Search
    semanticSearch: {
      enabled: Boolean,
      embedding: [Number],
      similarQueries: [String]
    },

    // Personalization
    personalization: {
      enabled: { type: Boolean, default: true },
      userPreferences: mongoose.Schema.Types.Mixed,
      boostFactors: [{
        field: String,
        boost: Number
      }]
    }
  },

  // Advanced Features
  advancedFeatures: {
    // Fuzzy Matching
    fuzzyMatch: {
      enabled: { type: Boolean, default: true },
      threshold: { type: Number, default: 0.7 }
    },

    // Spell Check
    spellCheck: {
      enabled: { type: Boolean, default: true },
      suggestions: [String]
    },

    // Query Expansion
    queryExpansion: {
      enabled: { type: Boolean, default: true },
      expandedTerms: [String]
    },

    // Boosting Rules
    boostingRules: [{
      field: String,
      value: String,
      boostFactor: Number,
      condition: String
    }]
  },

  // Saved Searches
  savedSearches: [{
    name: String,
    query: String,
    filters: mongoose.Schema.Types.Mixed,
    alertEnabled: { type: Boolean, default: false },
    alertFrequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly']
    },
    lastNotified: Date,
    createdAt: { type: Date, default: Date.now }
  }],

  // A/B Testing
  abTests: [{
    testName: String,
    variant: String,
    exposed: Boolean,
    converted: Boolean,
    metrics: mongoose.Schema.Types.Mixed
  }],

  // Performance Metrics
  performance: {
    avgSearchTime: Number,
    cacheHitRate: Number,
    errorRate: Number,

    byQuery: [{
      query: String,
      avgTime: Number,
      count: Number,
      cached: Boolean
    }]
  },

  sessionId: String,

  lastSearched: { type: Date, default: Date.now }

}, {
  timestamps: true, suppressReservedKeysWarning: true });

// Indexes
advancedSearchFiltersSchema.index({ userId: 1, lastSearched: -1 });
advancedSearchFiltersSchema.index({ 'searchQuery.keyword': 'text' });
advancedSearchFiltersSchema.index({ 'trendingSearches.count': -1 });
advancedSearchFiltersSchema.index({ 'results.products.product': 1 });

// Virtual: Has Active Filters
advancedSearchFiltersSchema.virtual('hasActiveFilters').get(function () {
  const filters = this.activeFilters;
  return (
    (filters.categories && filters.categories.length > 0) ||
    (filters.brands && filters.brands.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    (filters.sizes && filters.sizes.length > 0) ||
    filters.priceRange ||
    filters.minRating ||
    filters.inStock !== undefined
  );
});

// Method: Apply Filters
advancedSearchFiltersSchema.methods.applyFilters = async function (Product) {
  const query = {};

  // Category filter
  if (this.activeFilters.categories && this.activeFilters.categories.length > 0) {
    query.category = { $in: this.activeFilters.categories };
  }

  // Brand filter
  if (this.activeFilters.brands && this.activeFilters.brands.length > 0) {
    query.brand = { $in: this.activeFilters.brands };
  }

  // Price range
  if (this.activeFilters.priceRange) {
    query.price = {
      $gte: this.activeFilters.priceRange.min || 0,
      $lte: this.activeFilters.priceRange.max || Number.MAX_VALUE
    };
  }

  // Rating filter
  if (this.activeFilters.minRating) {
    query.averageRating = { $gte: this.activeFilters.minRating };
  }

  // Stock filter
  if (this.activeFilters.inStock) {
    query.stock = { $gt: 0 };
  }

  // On sale filter
  if (this.activeFilters.onSale) {
    query.isOnSale = true;
  }

  // Search keyword
  if (this.searchQuery.keyword) {
    query.$text = { $search: this.searchQuery.keyword };
  }

  return query;
};

// Method: Add to Search History
advancedSearchFiltersSchema.methods.addToHistory = function (clicked = [], converted = false) {
  this.searchHistory.push({
    query: this.searchQuery.keyword,
    timestamp: Date.now(),
    filters: this.activeFilters,
    resultsCount: this.results.totalResults,
    clicked,
    converted
  });

  // Keep only last 50 searches
  if (this.searchHistory.length > 50) {
    this.searchHistory = this.searchHistory.slice(-50);
  }

  this.analytics.totalSearches += 1;
};

// Method: Track Click
advancedSearchFiltersSchema.methods.trackClick = function (productId, position) {
  const result = this.results.products.find(
    r => r.product.toString() === productId.toString()
  );

  if (result) {
    // Add to search history
    const lastSearch = this.searchHistory[this.searchHistory.length - 1];
    if (lastSearch) {
      lastSearch.clicked.push({
        product: productId,
        position,
        timestamp: Date.now()
      });
    }
  }
};

// Method: Calculate Relevance Score
advancedSearchFiltersSchema.methods.calculateRelevanceScore = function (product, query) {
  let score = 0;

  // Exact match in title
  if (product.name.toLowerCase().includes(query.toLowerCase())) {
    score += 10;
  }

  // Match in description
  if (product.description && product.description.toLowerCase().includes(query.toLowerCase())) {
    score += 5;
  }

  // Match in tags
  if (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) {
    score += 3;
  }

  // Popularity boost
  score += (product.soldCount || 0) * 0.01;

  // Rating boost
  score += (product.averageRating || 0) * 2;

  return score;
};

// Static: Get Trending Searches
advancedSearchFiltersSchema.statics.getTrendingSearches = function (limit = 10) {
  return this.aggregate([
    { $unwind: '$trendingSearches' },
    { $sort: { 'trendingSearches.count': -1 } },
    { $limit: limit },
    { $project: { query: '$trendingSearches.query', count: '$trendingSearches.count' } }
  ]);
};

// Static: Get Zero Result Queries
advancedSearchFiltersSchema.statics.getZeroResultQueries = function (limit = 20) {
  return this.aggregate([
    { $unwind: '$analytics.zeroResultQueries' },
    { $sort: { 'analytics.zeroResultQueries.count': -1 } },
    { $limit: limit },
    { $project: { query: '$analytics.zeroResultQueries.query', count: '$analytics.zeroResultQueries.count' } }
  ]);
};

// Static: Update Trending Searches
advancedSearchFiltersSchema.statics.updateTrendingSearches = async function (query) {
  // Find or create trending search entry
  const result = await this.findOneAndUpdate(
    { 'trendingSearches.query': query },
    {
      $inc: { 'trendingSearches.$.count': 1 },
      $set: { 'trendingSearches.$.lastUpdated': Date.now() }
    },
    { new: true }
  );

  if (!result) {
    // Create new trending search entry
    await this.updateOne(
      {},
      {
        $push: {
          trendingSearches: {
            query,
            count: 1,
            trend: 'rising',
            lastUpdated: Date.now()
          }
        }
      },
      { upsert: true }
    );
  }
};

const AdvancedSearchFilters = mongoose.model('AdvancedSearchFilters', advancedSearchFiltersSchema);
export default AdvancedSearchFilters;
export { AdvancedSearchFilters };
