import mongoose from 'mongoose';

const smartSizingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Body Measurements
  bodyMeasurements: {
    height: {
      value: { type: Number, required: true }, // in cm
      unit: { type: String, enum: ['cm', 'inch'], default: 'cm' }
    },
    weight: {
      value: { type: Number, required: true }, // in kg
      unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' }
    },
    chest: { type: Number }, // in cm
    waist: { type: Number },
    hips: { type: Number },
    inseam: { type: Number },
    shoulders: { type: Number },
    armLength: { type: Number },
    neck: { type: Number },
    thigh: { type: Number },
    calf: { type: Number }
  },

  // Standard Size Preferences
  sizePreferences: {
    tops: {
      size: { type: String, enum: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
      fit: { type: String, enum: ['slim', 'regular', 'loose', 'oversized'] },
      confidence: { type: Number, min: 0, max: 100 }
    },
    bottoms: {
      size: { type: String },
      waistSize: { type: Number },
      inseamLength: { type: Number },
      fit: { type: String, enum: ['skinny', 'slim', 'regular', 'relaxed', 'loose'] },
      confidence: { type: Number, min: 0, max: 100 }
    },
    footwear: {
      size: { type: Number },
      width: { type: String, enum: ['narrow', 'medium', 'wide', 'extra-wide'] },
      system: { type: String, enum: ['US', 'UK', 'EU', 'CM'], default: 'US' },
      confidence: { type: Number, min: 0, max: 100 }
    },
    dresses: {
      size: { type: String },
      length: { type: String, enum: ['mini', 'knee', 'midi', 'maxi'] },
      confidence: { type: Number, min: 0, max: 100 }
    }
  },

  // Body Type Analysis
  bodyTypeAnalysis: {
    bodyShape: {
      type: String,
      enum: ['hourglass', 'pear', 'apple', 'rectangle', 'inverted-triangle', 'athletic']
    },
    bodyType: {
      type: String,
      enum: ['ectomorph', 'mesomorph', 'endomorph']
    },
    proportions: {
      torsoLength: { type: String, enum: ['short', 'average', 'long'] },
      legLength: { type: String, enum: ['short', 'average', 'long'] },
      armLength: { type: String, enum: ['short', 'average', 'long'] }
    },
    posture: {
      type: { type: String, enum: ['forward', 'neutral', 'backward'] },
      notes: String
    }
  },

  // Size Recommendation History
  recommendations: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    category: String,
    brand: String,
    recommendedSize: String,
    alternativeSizes: [String],
    confidence: { type: Number, min: 0, max: 100 },
    reasoning: String,
    fitPrediction: {
      chest: { type: String, enum: ['too-tight', 'snug', 'perfect', 'loose', 'too-loose'] },
      waist: { type: String, enum: ['too-tight', 'snug', 'perfect', 'loose', 'too-loose'] },
      length: { type: String, enum: ['too-short', 'slightly-short', 'perfect', 'slightly-long', 'too-long'] },
      shoulders: { type: String, enum: ['too-tight', 'snug', 'perfect', 'loose', 'too-loose'] },
      overall: { type: String, enum: ['poor', 'fair', 'good', 'excellent'] }
    },
    createdAt: { type: Date, default: Date.now }
  }],

  // Purchase History with Size Feedback
  purchaseHistory: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    brand: String,
    category: String,
    sizePurchased: String,
    fitFeedback: {
      overall: { type: String, enum: ['too-small', 'slightly-small', 'perfect', 'slightly-large', 'too-large'] },
      chest: { type: String, enum: ['too-tight', 'snug', 'perfect', 'loose', 'too-loose'] },
      waist: { type: String, enum: ['too-tight', 'snug', 'perfect', 'loose', 'too-loose'] },
      length: { type: String, enum: ['too-short', 'slightly-short', 'perfect', 'slightly-long', 'too-long'] },
      comfort: { type: Number, min: 1, max: 5 },
      quality: { type: Number, min: 1, max: 5 }
    },
    kept: { type: Boolean, default: true },
    returned: { type: Boolean, default: false },
    returnReason: String,
    reviewText: String,
    images: [String],
    purchaseDate: Date,
    feedbackDate: Date
  }],

  // Brand-Specific Size Mappings
  brandSizeMappings: [{
    brand: String,
    category: String,
    sizeChart: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    preferredSize: String,
    fitNotes: String,
    lastUpdated: Date
  }],

  // AI Model Data
  aiModelData: {
    modelVersion: { type: String, default: '1.0' },
    lastTrainingDate: Date,
    accuracy: { type: Number, min: 0, max: 100 },
    features: {
      type: Map,
      of: Number
    },
    predictions: {
      successRate: { type: Number, min: 0, max: 100 },
      totalPredictions: { type: Number, default: 0 },
      correctPredictions: { type: Number, default: 0 }
    }
  },

  // 3D Body Scan Data (if available)
  bodyScan: {
    scanDate: Date,
    scanType: { type: String, enum: ['manual', 'app-camera', 'professional', '3d-scanner'] },
    meshData: String, // URL or reference to 3D mesh
    measurements: {
      type: Map,
      of: Number
    },
    accuracy: { type: Number, min: 0, max: 100 },
    expiresAt: Date
  },

  // Privacy & Preferences
  privacy: {
    shareDataForImprovement: { type: Boolean, default: true },
    allowBrandAccess: { type: Boolean, default: false },
    profileVisibility: { type: String, enum: ['private', 'friends', 'public'], default: 'private' }
  },

  // Notifications
  notifications: {
    sizeRecommendations: { type: Boolean, default: true },
    fitTips: { type: Boolean, default: true },
    newBrandSizes: { type: Boolean, default: false }
  },

  // Analytics
  analytics: {
    profileCompleteness: { type: Number, min: 0, max: 100, default: 0 },
    lastMeasurementUpdate: Date,
    totalRecommendations: { type: Number, default: 0 },
    recommendationAccuracy: { type: Number, min: 0, max: 100 },
    returnsAvoided: { type: Number, default: 0 },
    moneySaved: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
smartSizingSchema.index({ 'bodyTypeAnalysis.bodyShape': 1 });
smartSizingSchema.index({ 'analytics.profileCompleteness': -1 });

// Virtual: Is Profile Complete
smartSizingSchema.virtual('isProfileComplete').get(function () {
  const hasBasicMeasurements = this.bodyMeasurements.height.value && this.bodyMeasurements.weight.value;
  const hasSizePreferences = this.sizePreferences.tops.size || this.sizePreferences.bottoms.size;
  return hasBasicMeasurements && hasSizePreferences;
});

// Method: Calculate Profile Completeness
smartSizingSchema.methods.calculateCompleteness = function () {
  let score = 0;
  const weights = {
    basicMeasurements: 30,
    detailedMeasurements: 20,
    sizePreferences: 20,
    bodyType: 10,
    purchaseHistory: 10,
    bodyScan: 10
  };

  // Basic measurements
  if (this.bodyMeasurements.height.value && this.bodyMeasurements.weight.value) {
    score += weights.basicMeasurements;
  }

  // Detailed measurements
  const detailedCount = ['chest', 'waist', 'hips', 'inseam', 'shoulders'].filter(
    key => this.bodyMeasurements[key]
  ).length;
  score += (detailedCount / 5) * weights.detailedMeasurements;

  // Size preferences
  const prefCount = ['tops', 'bottoms', 'footwear'].filter(
    key => this.sizePreferences[key].size
  ).length;
  score += (prefCount / 3) * weights.sizePreferences;

  // Body type
  if (this.bodyTypeAnalysis.bodyShape) score += weights.bodyType;

  // Purchase history
  if (this.purchaseHistory.length > 0) score += weights.purchaseHistory;

  // Body scan
  if (this.bodyScan && this.bodyScan.scanDate) score += weights.bodyScan;

  this.analytics.profileCompleteness = Math.round(score);
  return this.analytics.profileCompleteness;
};

// Method: Get Size Recommendation
smartSizingSchema.methods.getSizeRecommendation = function (product, category, brand) {
  // Find brand-specific mapping
  const brandMapping = this.brandSizeMappings.find(
    bm => bm.brand === brand && bm.category === category
  );

  if (brandMapping) {
    return {
      recommendedSize: brandMapping.preferredSize,
      confidence: 85,
      source: 'brand-history'
    };
  }

  // Use category preferences
  let recommendedSize, confidence;
  if (category === 'tops' && this.sizePreferences.tops.size) {
    recommendedSize = this.sizePreferences.tops.size;
    confidence = this.sizePreferences.tops.confidence || 70;
  } else if (category === 'bottoms' && this.sizePreferences.bottoms.size) {
    recommendedSize = this.sizePreferences.bottoms.size;
    confidence = this.sizePreferences.bottoms.confidence || 70;
  }

  return {
    recommendedSize: recommendedSize || 'M',
    confidence: confidence || 50,
    source: 'preferences'
  };
};

// Method: Add Purchase Feedback
smartSizingSchema.methods.addPurchaseFeedback = function (feedbackData) {
  this.purchaseHistory.push(feedbackData);

  // Update brand mapping
  const existingMapping = this.brandSizeMappings.find(
    bm => bm.brand === feedbackData.brand && bm.category === feedbackData.category
  );

  if (existingMapping && feedbackData.fitFeedback.overall === 'perfect') {
    existingMapping.preferredSize = feedbackData.sizePurchased;
    existingMapping.lastUpdated = Date.now();
  } else if (!existingMapping && feedbackData.fitFeedback.overall === 'perfect') {
    this.brandSizeMappings.push({
      brand: feedbackData.brand,
      category: feedbackData.category,
      preferredSize: feedbackData.sizePurchased,
      lastUpdated: Date.now()
    });
  }

  // Update analytics
  this.analytics.totalRecommendations += 1;
  if (feedbackData.kept && !feedbackData.returned) {
    this.analytics.recommendationAccuracy =
      (this.analytics.recommendationAccuracy * (this.analytics.totalRecommendations - 1) + 100) /
      this.analytics.totalRecommendations;
  }
};

// Static: Get Users Needing Size Updates
smartSizingSchema.statics.getUsersNeedingUpdates = function () {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return this.find({
    'analytics.lastMeasurementUpdate': { $lt: sixMonthsAgo }
  });
};

const SmartSizing = mongoose.model('SmartSizing', smartSizingSchema);
export default SmartSizing;
export { SmartSizing };
