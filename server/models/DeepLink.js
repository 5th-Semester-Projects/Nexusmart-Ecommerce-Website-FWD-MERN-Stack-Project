const mongoose = require('mongoose');

const deepLinkSchema = new mongoose.Schema({
  linkId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['product', 'category', 'offer', 'cart', 'order', 'profile', 'custom'],
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  parameters: mongoose.Schema.Types.Mixed,
  shortUrl: {
    type: String,
    unique: true
  },
  qrCode: String, // URL to QR code image
  campaign: {
    name: String,
    source: String, // 'email', 'sms', 'social', 'ad'
    medium: String,
    content: String
  },
  targeting: {
    platform: [String], // ['ios', 'android', 'web']
    minAppVersion: String,
    geo: [String], // country codes
    language: [String]
  },
  fallback: {
    web: String,
    ios: String,
    android: String
  },
  analytics: {
    clicks: { type: Number, default: 0 },
    uniqueClicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    clicksByPlatform: {
      ios: { type: Number, default: 0 },
      android: { type: Number, default: 0 },
      web: { type: Number, default: 0 }
    },
    clicksByCountry: mongoose.Schema.Types.Mixed,
    lastClickedAt: Date
  },
  metadata: {
    title: String,
    description: String,
    image: String,
    keywords: [String]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
deepLinkSchema.index({ linkId: 1 });
deepLinkSchema.index({ shortUrl: 1 });
deepLinkSchema.index({ type: 1, isActive: 1 });

const DeepLink = mongoose.model('DeepLink', deepLinkSchema);`nexport default DeepLink;`nexport { DeepLink };
