import mongoose from 'mongoose';

const virtualTryOnSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },

  // Product details
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    color: String,
    size: String,
    style: String,
    sku: String
  },

  // Try-on type
  tryOnType: {
    type: String,
    enum: ['ar_camera', 'photo_upload', 'avatar', '3d_model', 'virtual_room'],
    required: true
  },

  // User input (photo/avatar)
  userInput: {
    type: {
      type: String,
      enum: ['live_camera', 'uploaded_photo', 'avatar', 'body_scan']
    },
    photoUrl: String,
    avatarId: String,
    bodyScan: {
      measurements: {
        height: Number,
        weight: Number,
        chest: Number,
        waist: Number,
        hips: Number,
        inseam: Number,
        shoulderWidth: Number,
        armLength: Number
      },
      bodyType: String,
      skinTone: String,
      hairColor: String
    },
    uploadedAt: Date
  },

  // AR/VR data
  arData: {
    facePoints: [{
      x: Number,
      y: Number,
      z: Number
    }],
    bodyPoints: [{
      x: Number,
      y: Number,
      z: Number
    }],
    environmentLighting: {
      brightness: Number,
      direction: String,
      colorTemp: Number
    },
    cameraDistance: Number,
    angle: Number,
    scale: Number
  },

  // Generated try-on result
  result: {
    imageUrl: {
      type: String,
      required: true
    },
    thumbnailUrl: String,
    videoUrl: String,
    modelUrl: String, // 3D model URL
    generatedAt: {
      type: Date,
      default: Date.now
    },
    processingTime: Number, // milliseconds
    quality: {
      type: String,
      enum: ['low', 'medium', 'high', 'ultra'],
      default: 'high'
    }
  },

  // AI analysis
  aiAnalysis: {
    fitScore: {
      type: Number,
      min: 0,
      max: 100
    },
    sizeRecommendation: {
      recommended: String,
      confidence: Number,
      reasoning: String
    },
    styleMatch: {
      score: Number,
      comments: [String]
    },
    colorMatch: {
      score: Number,
      skinToneCompatibility: Number,
      suggestions: [String]
    },
    proportions: {
      balanced: Boolean,
      suggestions: [String]
    },
    alterations: [{
      type: String,
      description: String,
      estimatedCost: Number
    }]
  },

  // User interaction
  interaction: {
    viewDuration: {
      type: Number,
      default: 0
    },
    rotations: {
      type: Number,
      default: 0
    },
    zooms: {
      type: Number,
      default: 0
    },
    angleChanges: {
      type: Number,
      default: 0
    },
    colorChanges: {
      type: Number,
      default: 0
    },
    saved: {
      type: Boolean,
      default: false
    },
    shared: {
      type: Boolean,
      default: false
    },
    addedToCart: {
      type: Boolean,
      default: false
    },
    purchased: {
      type: Boolean,
      default: false
    }
  },

  // Comparison mode
  comparison: {
    enabled: {
      type: Boolean,
      default: false
    },
    products: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      imageUrl: String,
      fitScore: Number
    }],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  },

  // Social features
  social: {
    shareLink: {
      type: String,
      unique: true,
      sparse: true
    },
    shareCount: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    visibility: {
      type: String,
      enum: ['private', 'friends', 'public'],
      default: 'private'
    }
  },

  // Feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    accuracyRating: {
      type: Number,
      min: 1,
      max: 5
    },
    helpful: Boolean,
    comments: String,
    issues: [{
      type: String,
      enum: ['poor_fit', 'unrealistic', 'slow_loading', 'wrong_color', 'technical_error', 'other']
    }],
    submittedAt: Date
  },

  // Device info
  device: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'vr_headset', 'ar_glasses']
    },
    os: String,
    browser: String,
    camera: {
      resolution: String,
      hasDepthSensor: Boolean,
      hasARSupport: Boolean
    },
    gpuSupport: Boolean
  },

  // Analytics
  analytics: {
    entryPoint: {
      type: String,
      enum: ['product_page', 'search_results', 'category', 'home', 'direct_link', 'social']
    },
    previousPage: String,
    referrer: String,
    utmSource: String,
    utmCampaign: String,
    completionRate: Number,
    exitPoint: String
  },

  // Status
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'expired'],
    default: 'processing'
  },
  errorMessage: String,

  // Expiration
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

// Indexes
virtualTryOnSchema.index({ user: 1, createdAt: -1 });
virtualTryOnSchema.index({ product: 1 });
virtualTryOnSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
virtualTryOnSchema.index({ status: 1 });

// Virtual for conversion
virtualTryOnSchema.virtual('converted').get(function () {
  return this.interaction.addedToCart || this.interaction.purchased;
});

// Method to update interaction
virtualTryOnSchema.methods.trackInteraction = function (action, value = 1) {
  if (this.interaction[action] !== undefined) {
    if (typeof this.interaction[action] === 'number') {
      this.interaction[action] += value;
    } else {
      this.interaction[action] = value;
    }
  }
};

// Method to generate share link
virtualTryOnSchema.methods.generateShareLink = function () {
  const randomString = Math.random().toString(36).substring(2, 15);
  this.social.shareLink = `vto-${this._id}-${randomString}`;
  this.social.visibility = 'public';
  return this.social.shareLink;
};

// Static method to get popular try-ons
virtualTryOnSchema.statics.getPopularTryOns = function (limit = 10) {
  return this.find({
    status: 'completed',
    'social.visibility': 'public'
  })
    .sort({ 'social.likes': -1, 'social.shareCount': -1 })
    .limit(limit)
    .populate('product', 'name images price')
    .populate('user', 'name avatar');
};

// Static method to get conversion rate
virtualTryOnSchema.statics.getConversionRate = async function (productId) {
  const total = await this.countDocuments({ product: productId, status: 'completed' });
  const converted = await this.countDocuments({
    product: productId,
    status: 'completed',
    $or: [
      { 'interaction.addedToCart': true },
      { 'interaction.purchased': true }
    ]
  });

  return total > 0 ? (converted / total) * 100 : 0;
};

const VirtualTryOn = mongoose.model('VirtualTryOn', virtualTryOnSchema);
export default VirtualTryOn;
export { VirtualTryOn };
