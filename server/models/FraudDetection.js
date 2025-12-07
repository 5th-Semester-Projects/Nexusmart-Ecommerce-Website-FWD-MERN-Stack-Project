const mongoose = require('mongoose');

const fraudDetectionSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  fraudIndicators: [{
    type: {
      type: String,
      enum: ['velocity', 'geolocation', 'device_fingerprint', 'email_domain', 'billing_shipping_mismatch', 'high_value', 'suspicious_pattern', 'blacklist', 'card_testing', 'proxy_vpn']
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    score: Number
  }],
  checks: {
    velocityCheck: {
      passed: Boolean,
      ordersInLast24h: Number,
      ordersInLastHour: Number,
      totalAmount24h: Number
    },
    geolocationCheck: {
      passed: Boolean,
      ipCountry: String,
      billingCountry: String,
      distance: Number, // km
      usingVPN: Boolean,
      usingProxy: Boolean
    },
    deviceCheck: {
      passed: Boolean,
      deviceFingerprint: String,
      isNewDevice: Boolean,
      deviceReputation: Number,
      multipleAccounts: Boolean
    },
    emailCheck: {
      passed: Boolean,
      disposableEmail: Boolean,
      emailAge: Number, // days
      emailReputation: Number
    },
    billingCheck: {
      passed: Boolean,
      addressMatch: Boolean,
      nameMatch: Boolean,
      phoneMatch: Boolean
    },
    behavioralCheck: {
      passed: Boolean,
      sessionDuration: Number,
      pagesViewed: Number,
      normalBrowsingPattern: Boolean
    },
    cardCheck: {
      passed: Boolean,
      cardBin: String,
      cardCountry: String,
      cardType: String,
      previouslyUsed: Boolean
    },
    blacklistCheck: {
      passed: Boolean,
      inBlacklist: Boolean,
      reason: String
    }
  },
  aiPrediction: {
    model: String,
    version: String,
    confidence: Number,
    features: mongoose.Schema.Types.Mixed
  },
  decision: {
    type: String,
    enum: ['approve', 'review', 'decline', 'challenge'],
    required: true
  },
  action: {
    type: String,
    enum: ['processed', 'flagged', 'blocked', '3ds_required', 'manual_review']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  reviewedAt: Date,
  falsePositive: Boolean,
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
    sessionId: String
  }
}, {
  timestamps: true
});

// Indexes
fraudDetectionSchema.index({ order: 1 });
fraudDetectionSchema.index({ user: 1 });
fraudDetectionSchema.index({ riskLevel: 1, decision: 1 });
fraudDetectionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FraudDetection', fraudDetectionSchema);
