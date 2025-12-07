const mongoose = require('mongoose');

const pwaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  installation: {
    isInstalled: {
      type: Boolean,
      default: false
    },
    installedAt: Date,
    installSource: {
      type: String,
      enum: ['browser_prompt', 'banner', 'menu', 'shortcut']
    },
    platform: {
      type: String,
      enum: ['android', 'ios', 'windows', 'mac', 'linux']
    },
    browser: String
  },
  serviceWorker: {
    version: String,
    isActive: Boolean,
    lastUpdated: Date,
    cacheSize: Number, // bytes
    cachedResources: [String]
  },
  offlineUsage: {
    offlineSessions: Number,
    lastOfflineAccess: Date,
    offlinePagesViewed: [String],
    offlineActionsQueued: [{
      action: String,
      data: mongoose.Schema.Types.Mixed,
      timestamp: Date,
      synced: Boolean,
      syncedAt: Date
    }]
  },
  pushNotifications: {
    isEnabled: Boolean,
    subscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String
      }
    },
    preferences: {
      orderUpdates: Boolean,
      promotions: Boolean,
      newArrivals: Boolean,
      priceDrops: Boolean,
      backInStock: Boolean
    },
    sentNotifications: Number,
    clickedNotifications: Number,
    lastSentAt: Date
  },
  performance: {
    loadTime: Number,
    timeToInteractive: Number,
    firstContentfulPaint: Number,
    largestContentfulPaint: Number,
    cumulativeLayoutShift: Number,
    firstInputDelay: Number
  },
  usage: {
    sessions: Number,
    pageViews: Number,
    averageSessionDuration: Number,
    lastActiveAt: Date,
    frequency: String // 'daily', 'weekly', 'monthly', 'rarely'
  },
  features: {
    addToHomeScreen: Boolean,
    offlineMode: Boolean,
    pushNotifications: Boolean,
    backgroundSync: Boolean,
    periodicSync: Boolean,
    caching: Boolean
  },
  device: {
    type: String,
    model: String,
    os: String,
    screenSize: String,
    connectionType: String
  },
  manifest: {
    name: String,
    shortName: String,
    themeColor: String,
    backgroundColor: String,
    display: String,
    orientation: String,
    scope: String,
    startUrl: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
pwaSchema.index({ user: 1 });
pwaSchema.index({ 'installation.isInstalled': 1 });

module.exports = mongoose.model('PWA', pwaSchema);
