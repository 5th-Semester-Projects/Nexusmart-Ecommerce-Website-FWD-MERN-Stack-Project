import mongoose from 'mongoose';

const arTryOnSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // AR Configuration
  arEnabled: {
    type: Boolean,
    default: false
  },
  arType: {
    type: String,
    enum: ['virtual-tryon', 'room-placement', '3d-viewer', 'size-measurement', 'color-preview'],
    required: true
  },

  // 3D Model Data
  modelData: {
    modelUrl: {
      type: String,
      required: true
    },
    modelFormat: {
      type: String,
      enum: ['glb', 'gltf', 'usdz', 'obj', 'fbx'],
      default: 'glb'
    },
    modelSize: {
      type: Number
    },
    thumbnailUrl: String,
    previewImages: [String],
    lowPolyVersion: String,
    highPolyVersion: String
  },

  // Product Dimensions
  dimensions: {
    length: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'inch', 'meter'],
        default: 'cm'
      }
    },
    width: {
      value: Number,
      unit: String
    },
    height: {
      value: Number,
      unit: String
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lb', 'g'],
        default: 'kg'
      }
    },
    volume: {
      value: Number,
      unit: String
    }
  },

  // Virtual Try-On Specific (Clothing, Accessories, Makeup)
  virtualTryOn: {
    enabled: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: ['clothing', 'eyewear', 'jewelry', 'watches', 'makeup', 'hair', 'shoes']
    },
    bodyParts: [{
      type: String,
      enum: ['face', 'eyes', 'lips', 'head', 'neck', 'wrist', 'finger', 'feet', 'body']
    }],
    skinToneAdaptive: {
      type: Boolean,
      default: false
    },
    facialLandmarks: {
      required: Boolean,
      points: Number
    },
    realTimeFitting: {
      type: Boolean,
      default: true
    }
  },

  // Room Placement (Furniture, Decor)
  roomPlacement: {
    enabled: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: ['furniture', 'decor', 'lighting', 'appliances', 'artwork']
    },
    floorRequired: {
      type: Boolean,
      default: false
    },
    wallMountable: {
      type: Boolean,
      default: false
    },
    scaleAdjustable: {
      type: Boolean,
      default: true
    },
    shadowCasting: {
      type: Boolean,
      default: true
    },
    minRoomSize: {
      width: Number,
      length: Number,
      height: Number
    }
  },

  // AR Measurement Tools
  measurements: {
    enabled: {
      type: Boolean,
      default: false
    },
    measurementPoints: [{
      name: String,
      coordinates: {
        x: Number,
        y: Number,
        z: Number
      },
      description: String
    }],
    autoMeasurement: {
      type: Boolean,
      default: false
    },
    accuracyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'precise'],
      default: 'medium'
    },
    calibrationRequired: {
      type: Boolean,
      default: false
    }
  },

  // Material & Texture
  materials: [{
    name: String,
    type: {
      type: String,
      enum: ['fabric', 'leather', 'metal', 'wood', 'plastic', 'glass', 'ceramic']
    },
    textureUrl: String,
    normalMapUrl: String,
    roughnessMapUrl: String,
    metallicMapUrl: String,
    emissiveMapUrl: String,
    properties: {
      reflectivity: Number,
      transparency: Number,
      roughness: Number,
      metallic: Number
    }
  }],

  // Color Variants for AR
  colorVariants: [{
    colorName: String,
    hexCode: String,
    modelUrl: String,
    textureUrl: String,
    available: {
      type: Boolean,
      default: true
    }
  }],

  // AR Animation
  animations: [{
    name: String,
    type: {
      type: String,
      enum: ['idle', 'interaction', 'showcase', 'rotation']
    },
    duration: Number,
    autoPlay: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: true
    }
  }],

  // Lighting Configuration
  lighting: {
    ambientLight: {
      intensity: {
        type: Number,
        default: 0.5
      },
      color: {
        type: String,
        default: '#ffffff'
      }
    },
    directionalLight: {
      intensity: {
        type: Number,
        default: 0.8
      },
      position: {
        x: Number,
        y: Number,
        z: Number
      },
      castShadow: {
        type: Boolean,
        default: true
      }
    },
    environmentMap: String
  },

  // Camera Settings
  cameraSettings: {
    defaultPosition: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 5 }
    },
    minDistance: {
      type: Number,
      default: 1
    },
    maxDistance: {
      type: Number,
      default: 10
    },
    enablePan: {
      type: Boolean,
      default: true
    },
    enableRotate: {
      type: Boolean,
      default: true
    },
    enableZoom: {
      type: Boolean,
      default: true
    },
    autoRotate: {
      type: Boolean,
      default: false
    },
    autoRotateSpeed: {
      type: Number,
      default: 2
    }
  },

  // Performance Settings
  performance: {
    maxPolygons: {
      type: Number,
      default: 50000
    },
    textureResolution: {
      type: String,
      enum: ['512', '1024', '2048', '4096'],
      default: '1024'
    },
    lodLevels: {
      type: Number,
      default: 3
    },
    compressionEnabled: {
      type: Boolean,
      default: true
    },
    lazyLoading: {
      type: Boolean,
      default: true
    }
  },

  // AR Session Data
  sessions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sessionId: {
      type: String,
      required: true
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    duration: Number,
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'ar-glasses']
    },
    browser: String,
    platform: {
      type: String,
      enum: ['iOS', 'Android', 'Web']
    },
    actions: [{
      action: {
        type: String,
        enum: ['view', 'rotate', 'zoom', 'place', 'measure', 'screenshot', 'share']
      },
      timestamp: Date
    }],
    screenshots: [{
      url: String,
      timestamp: Date
    }],
    wasConverted: {
      type: Boolean,
      default: false
    },
    addedToCart: {
      type: Boolean,
      default: false
    }
  }],

  // Analytics
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number,
      default: 0
    },
    uniqueUsers: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    },
    screenshotCount: {
      type: Number,
      default: 0
    },
    deviceBreakdown: {
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 }
    },
    platformBreakdown: {
      iOS: { type: Number, default: 0 },
      Android: { type: Number, default: 0 },
      Web: { type: Number, default: 0 }
    }
  },

  // Compatibility
  compatibility: {
    minIOSVersion: String,
    minAndroidVersion: String,
    webARSupport: {
      type: Boolean,
      default: true
    },
    requiredFeatures: [{
      type: String,
      enum: ['camera', 'gyroscope', 'accelerometer', 'depth-sensor', 'lidar']
    }],
    fallbackMode: {
      type: String,
      enum: ['3d-viewer', 'image-gallery', 'video'],
      default: '3d-viewer'
    }
  },

  // User Reviews & Feedback
  arFeedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    helpful: {
      type: Boolean,
      default: true
    },
    issues: [{
      type: String,
      enum: ['loading-slow', 'model-quality', 'placement-accuracy', 'scale-issues', 'lighting-issues']
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Status
  status: {
    type: String,
    enum: ['draft', 'processing', 'active', 'inactive', 'error'],
    default: 'draft',
    index: true
  },
  processingStatus: {
    modelOptimization: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed']
    },
    textureCompression: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed']
    },
    lodGeneration: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed']
    }
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
arTryOnSchema.index({ product: 1, arType: 1 });
arTryOnSchema.index({ status: 1 });
arTryOnSchema.index({ 'analytics.conversionRate': -1 });

// Methods
arTryOnSchema.methods.startSession = function (userId, deviceInfo) {
  const session = {
    user: userId,
    sessionId: `AR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    startTime: Date.now(),
    device: deviceInfo.device,
    browser: deviceInfo.browser,
    platform: deviceInfo.platform,
    actions: []
  };

  this.sessions.push(session);
  this.analytics.totalSessions += 1;
  this.analytics.totalViews += 1;

  return this.save();
};

arTryOnSchema.methods.trackAction = function (sessionId, action) {
  const session = this.sessions.find(s => s.sessionId === sessionId);

  if (session) {
    session.actions.push({
      action: action,
      timestamp: Date.now()
    });

    if (action === 'share') {
      this.analytics.shareCount += 1;
    }

    if (action === 'screenshot') {
      this.analytics.screenshotCount += 1;
    }
  }

  return this.save();
};

arTryOnSchema.methods.endSession = function (sessionId, converted) {
  const session = this.sessions.find(s => s.sessionId === sessionId);

  if (session) {
    session.endTime = Date.now();
    session.duration = (session.endTime - session.startTime) / 1000;
    session.wasConverted = converted || false;

    // Update analytics
    const totalDuration = this.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    this.analytics.averageSessionDuration = totalDuration / this.sessions.length;

    if (converted) {
      const conversions = this.sessions.filter(s => s.wasConverted).length;
      this.analytics.conversionRate = (conversions / this.sessions.length) * 100;
    }
  }

  return this.save();
};

arTryOnSchema.methods.updateAnalytics = function () {
  this.analytics.uniqueUsers = new Set(this.sessions.map(s => s.user?.toString())).size;

  const deviceCounts = this.sessions.reduce((acc, s) => {
    acc[s.device] = (acc[s.device] || 0) + 1;
    return acc;
  }, {});

  this.analytics.deviceBreakdown = {
    mobile: deviceCounts.mobile || 0,
    tablet: deviceCounts.tablet || 0,
    desktop: deviceCounts.desktop || 0
  };

  const platformCounts = this.sessions.reduce((acc, s) => {
    acc[s.platform] = (acc[s.platform] || 0) + 1;
    return acc;
  }, {});

  this.analytics.platformBreakdown = {
    iOS: platformCounts.iOS || 0,
    Android: platformCounts.Android || 0,
    Web: platformCounts.Web || 0
  };

  return this.save();
};

// Statics
arTryOnSchema.statics.getTopPerformingAR = function (limit = 10) {
  return this.find({ status: 'active' })
    .populate('product')
    .sort({ 'analytics.conversionRate': -1 })
    .limit(limit);
};

arTryOnSchema.statics.getARAnalytics = function (productId) {
  return this.findOne({ product: productId })
    .select('analytics arType');
};

// Virtuals
arTryOnSchema.virtual('isReady').get(function () {
  return this.status === 'active' && this.arEnabled;
});

const ARTryOn = mongoose.model('ARTryOn', arTryOnSchema);

export default ARTryOn;
