import mongoose from 'mongoose';

const lifestyleClusteringSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cluster: {
    id: String,
    name: {
      type: String,
      enum: [
        'luxury_seekers', 'bargain_hunters', 'eco_conscious', 'tech_enthusiasts',
        'fashion_forward', 'health_focused', 'family_oriented', 'minimalists',
        'trendsetters', 'practical_shoppers', 'impulse_buyers', 'research_driven'
      ]
    },
    description: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  behaviorProfile: {
    browsingPatterns: {
      avgSessionDuration: Number,
      pagesPerSession: Number,
      peakShoppingHours: [Number],
      peakShoppingDays: [String],
      devicePreference: String
    },
    purchasePatterns: {
      avgOrderValue: Number,
      avgItemsPerOrder: Number,
      purchaseFrequency: String,
      preferredPaymentMethod: String,
      usesDiscounts: Boolean,
      cartAbandonmentRate: Number
    },
    productPreferences: {
      topCategories: [{
        category: String,
        weight: Number
      }],
      topBrands: [{
        brand: String,
        weight: Number
      }],
      priceRange: {
        min: Number,
        max: Number,
        avg: Number
      },
      preferredColors: [String],
      preferredSizes: [String]
    }
  },
  similarUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    similarityScore: Number,
    sharedBehaviors: [String]
  }],
  recommendations: [{
    type: {
      type: String,
      enum: ['product', 'category', 'brand', 'style', 'bundle']
    },
    referenceId: String,
    reason: String,
    score: Number,
    generatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  insights: [{
    insight: String,
    category: String,
    confidence: Number,
    actionable: Boolean,
    discoveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  clusterMigration: [{
    fromCluster: String,
    toCluster: String,
    migratedAt: Date,
    reason: String
  }],
  lastAnalyzed: {
    type: Date,
    default: Date.now
  },
  analysisVersion: {
    type: String,
    default: '1.0'
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

lifestyleClusteringSchema.index({ user: 1 });
lifestyleClusteringSchema.index({ 'cluster.name': 1 });
lifestyleClusteringSchema.index({ lastAnalyzed: -1 });

export default mongoose.model('LifestyleClustering', lifestyleClusteringSchema);
