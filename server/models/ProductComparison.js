import mongoose from 'mongoose';

const productComparisonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: String, // for guest users

  // Products being compared
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: Date,
    position: Number // display order
  }],

  // Comparison criteria
  criteria: [{
    name: String, // "Price", "Rating", "Features", etc.
    type: {
      type: String,
      enum: ['numeric', 'text', 'boolean', 'rating', 'list']
    },
    weight: Number, // importance weight for scoring
    displayOrder: Number
  }],

  // Feature comparison matrix
  featureMatrix: [{
    feature: String,
    values: mongoose.Schema.Types.Mixed, // array of values per product
    importance: {
      type: String,
      enum: ['high', 'medium', 'low']
    }
  }],

  // Comparison scores
  scores: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    overallScore: Number,
    criteriaScores: [{
      criterion: String,
      score: Number,
      normalized: Number // 0-1 scale
    }],
    pros: [String],
    cons: [String],
    bestFor: [String] // "Best for budget", "Best features", etc.
  }],

  // Winner determination
  winner: {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    reason: String,
    confidence: Number // 0-1
  },

  // User preferences
  preferences: {
    maxPrice: Number,
    preferredBrands: [String],
    mustHaveFeatures: [String],
    dealBreakers: [String],
    weightedCriteria: mongoose.Schema.Types.Mixed
  },

  // Comparison view
  view: {
    layout: {
      type: String,
      enum: ['table', 'cards', 'side-by-side'],
      default: 'table'
    },
    visibleFields: [String],
    highlightDifferences: { type: Boolean, default: true },
    showOnlyDifferences: Boolean,
    compactMode: Boolean
  },

  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    timeSpent: Number, // seconds
    productsAdded: { type: Number, default: 0 },
    productsRemoved: { type: Number, default: 0 },
    criteriaChanged: { type: Number, default: 0 },
    shared: { type: Number, default: 0 },
    printed: Boolean,
    exported: Boolean
  },

  // User actions
  actions: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    action: {
      type: String,
      enum: ['viewed', 'added_to_cart', 'added_to_wishlist', 'purchased', 'dismissed']
    },
    timestamp: Date
  }],

  // Sharing
  sharing: {
    isPublic: Boolean,
    shareLink: String,
    shareCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },

  // Saved comparison
  saved: {
    isSaved: { type: Boolean, default: false },
    name: String,
    notes: String,
    tags: [String]
  },

  // Context
  context: {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    priceRange: {
      min: Number,
      max: Number
    },
    source: String, // where comparison was initiated
    device: String
  },

  isActive: { type: Boolean, default: true },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Indexes
productComparisonSchema.index({ user: 1, isActive: 1 });
productComparisonSchema.index({ sessionId: 1 });
productComparisonSchema.index({ 'products.product': 1 });
productComparisonSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
productComparisonSchema.index({ 'sharing.shareLink': 1 });

// Pre-save hook
productComparisonSchema.pre('save', function (next) {
  // Generate share link if public
  if (this.sharing.isPublic && !this.sharing.shareLink) {
    this.sharing.shareLink = `CMP-${this._id.toString().slice(-8).toUpperCase()}`;
  }
  next();
});

// Methods
productComparisonSchema.methods.addProduct = function (productId) {
  const maxProducts = 4;
  if (this.products.length >= maxProducts) {
    throw new Error(`Maximum ${maxProducts} products can be compared`);
  }

  const exists = this.products.some(p => p.product.toString() === productId.toString());
  if (exists) {
    throw new Error('Product already in comparison');
  }

  this.products.push({
    product: productId,
    addedAt: new Date(),
    position: this.products.length
  });

  this.analytics.productsAdded++;
  return this.save();
};

productComparisonSchema.methods.removeProduct = function (productId) {
  this.products = this.products.filter(p => p.product.toString() !== productId.toString());
  // Reorder positions
  this.products.forEach((p, index) => p.position = index);
  this.analytics.productsRemoved++;
  return this.save();
};

productComparisonSchema.methods.calculateScores = async function () {
  // Populate products first
  await this.populate('products.product');

  this.scores = this.products.map(item => {
    const product = item.product;
    const criteriaScores = [];
    let overallScore = 0;

    // Calculate score for each criterion
    if (this.criteria && this.criteria.length > 0) {
      this.criteria.forEach(criterion => {
        let score = 0;
        let normalized = 0;

        switch (criterion.name.toLowerCase()) {
          case 'price':
            // Lower price = higher score
            const prices = this.products.map(p => p.product.price);
            const minPrice = Math.min(...prices);
            normalized = minPrice / product.price;
            score = normalized * 100;
            break;
          case 'rating':
            score = product.rating || 0;
            normalized = score / 5;
            break;
          default:
            score = 50; // neutral
            normalized = 0.5;
        }

        criteriaScores.push({
          criterion: criterion.name,
          score: parseFloat(score.toFixed(2)),
          normalized: parseFloat(normalized.toFixed(2))
        });

        overallScore += normalized * (criterion.weight || 1);
      });

      overallScore = (overallScore / this.criteria.length * 100).toFixed(2);
    }

    return {
      product: product._id,
      overallScore: parseFloat(overallScore),
      criteriaScores,
      pros: [],
      cons: [],
      bestFor: []
    };
  });

  // Determine winner
  if (this.scores.length > 0) {
    const maxScore = Math.max(...this.scores.map(s => s.overallScore));
    const winner = this.scores.find(s => s.overallScore === maxScore);
    this.winner = {
      product: winner.product,
      reason: 'Best overall score',
      confidence: 0.8
    };
  }

  return this.save();
};

// Statics
productComparisonSchema.statics.findByShareLink = function (shareLink) {
  return this.findOne({
    'sharing.shareLink': shareLink,
    'sharing.isPublic': true,
    isActive: true
  }).populate('products.product');
};

productComparisonSchema.statics.getPopularComparisons = async function (limit = 10) {
  return this.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.product',
        comparisonCount: { $sum: 1 }
      }
    },
    { $sort: { comparisonCount: -1 } },
    { $limit: limit }
  ]);
};

export default mongoose.model('ProductComparison', productComparisonSchema);
