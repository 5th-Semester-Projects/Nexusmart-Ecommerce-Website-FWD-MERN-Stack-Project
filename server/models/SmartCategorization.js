const mongoose = require('mongoose');

const smartCategorizationSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  inputData: {
    title: String,
    description: String,
    images: [String],
    existingCategory: String,
    brand: String,
    attributes: mongoose.Schema.Types.Mixed
  },
  predictions: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    categoryPath: String, // e.g., "Electronics > Smartphones > Android"
    confidence: Number,
    reasoning: String,
    rank: Number
  }],
  recommendedCategory: {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    categoryPath: String,
    confidence: Number
  },
  attributes: [{
    name: String,
    value: String,
    confidence: Number,
    source: String // 'title', 'description', 'image', 'ai'
  }],
  tags: [{
    tag: String,
    relevance: Number,
    category: String
  }],
  similarProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    similarity: Number,
    category: String
  }],
  aiAnalysis: {
    model: String,
    version: String,
    features: [String],
    processingTime: Number
  },
  taxonomy: {
    level1: String,
    level2: String,
    level3: String,
    level4: String
  },
  verification: {
    isVerified: Boolean,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    correctedCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }
  },
  feedback: {
    wasAccurate: Boolean,
    userCorrectedTo: String,
    improveModel: Boolean
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
smartCategorizationSchema.index({ product: 1 });
smartCategorizationSchema.index({ 'recommendedCategory.category': 1 });
smartCategorizationSchema.index({ status: 1 });

const SmartCategorization = mongoose.model('SmartCategorization', smartCategorizationSchema);`nexport default SmartCategorization;`nexport { SmartCategorization };
