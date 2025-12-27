import mongoose from 'mongoose';

const deviceFingerprintingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fingerprint: {
    hash: {
      type: String,
      required: true,
      unique: true
    },
    components: {
      userAgent: String,
      language: String,
      colorDepth: Number,
      deviceMemory: Number,
      hardwareConcurrency: Number,
      screenResolution: String,
      availableScreenResolution: String,
      timezoneOffset: Number,
      timezone: String,
      sessionStorage: Boolean,
      localStorage: Boolean,
      indexedDb: Boolean,
      addBehavior: Boolean,
      openDatabase: Boolean,
      cpuClass: String,
      platform: String,
      plugins: [String],
      canvas: String,
      webgl: String,
      webglVendor: String,
      adBlock: Boolean,
      hasLiedLanguages: Boolean,
      hasLiedResolution: Boolean,
      hasLiedOs: Boolean,
      hasLiedBrowser: Boolean,
      touchSupport: {
        maxTouchPoints: Number,
        touchEvent: Boolean,
        touchStart: Boolean
      },
      fonts: [String],
      audio: String
    }
  },
  deviceInfo: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'smarttv', 'wearable', 'embedded']
    },
    os: String,
    osVersion: String,
    browser: String,
    browserVersion: String,
    isMobile: Boolean,
    isTablet: Boolean,
    isDesktop: Boolean
  },
  riskAssessment: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    factors: [{
      factor: String,
      impact: Number,
      reason: String
    }],
    suspicious: {
      type: Boolean,
      default: false
    },
    reasons: [String]
  },
  history: [{
    ipAddress: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: String,
    suspicious: Boolean
  }],
  associations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    confidence: Number,
    firstSeen: Date,
    lastSeen: Date,
    frequency: Number
  }],
  flags: [{
    type: {
      type: String,
      enum: ['vpn', 'proxy', 'tor', 'emulator', 'bot', 'multiple_accounts']
    },
    detected: Boolean,
    detectedAt: Date,
    confidence: Number
  }],
  status: {
    type: String,
    enum: ['trusted', 'monitoring', 'suspicious', 'blocked'],
    default: 'trusted'
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

deviceFingerprintingSchema.index({ user: 1 });
deviceFingerprintingSchema.index({ status: 1 });

export default mongoose.model('DeviceFingerprinting', deviceFingerprintingSchema);
