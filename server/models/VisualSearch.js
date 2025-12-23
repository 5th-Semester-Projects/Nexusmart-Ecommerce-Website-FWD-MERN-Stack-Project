import mongoose from 'mongoose';

const visualSearchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  searchImage: {
    url: {
      type: String,
      required: true
    },
    uploadedUrl: String,
    source: {
      type: String,
      enum: ['upload', 'camera', 'url', 'screenshot'],
      default: 'upload'
    }
  },
  analysis: {
    dominantColors: [{
      color: String,
      percentage: Number,
      hex: String
    }],
    detectedObjects: [{
      name: String,
      confidence: Number,
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      }
    }],
    categories: [String],
    tags: [String],
    style: String,
    pattern: String
  },
  results: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    similarityScore: Number,
    matchType: {
      type: String,
      enum: ['exact', 'color', 'style', 'pattern', 'category']
    },
    visualSimilarity: Number,
    priceMatch: Boolean
  }],
  filters: {
    priceRange: {
      min: Number,
      max: Number
    },
    categories: [String],
    brands: [String],
    colors: [String]
  },
  metadata: {
    resultsCount: Number,
    searchDuration: Number,
    aiModel: String,
    confidence: Number
  },
  searchedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

visualSearchSchema.index({ user: 1, searchedAt: -1 });

export default mongoose.models.VisualSearch || mongoose.model('VisualSearch', visualSearchSchema);
