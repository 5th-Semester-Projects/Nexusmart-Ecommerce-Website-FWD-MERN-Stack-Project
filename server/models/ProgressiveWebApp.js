import mongoose from 'mongoose';

const progressiveWebAppSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },

  // Installation tracking
  installation: {
    isInstalled: {
      type: Boolean,
      default: false
    },
    installedAt: Date,
    installPromptShown: {
      type: Boolean,
      default: false
    },
    installPromptAccepted: Boolean,
    installSource: {
      type: String,
      enum: ['browser_prompt', 'custom_prompt', 'share_action']
    },
    uninstalledAt: Date
  },

  // Device information
  device: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop']
    },
    os: String,
    osVersion: String,
    browser: String,
    browserVersion: String,
    screenResolution: String,
    standalone: Boolean, // Running in standalone mode
    displayMode: {
      type: String,
      enum: ['browser', 'standalone', 'minimal-ui', 'fullscreen']
    }
  },

  // Service Worker status
  serviceWorker: {
    registered: {
      type: Boolean,
      default: false
    },
    version: String,
    lastUpdated: Date,
    state: {
      type: String,
      enum: ['installing', 'waiting', 'active', 'redundant']
    },
    cacheSize: Number, // in MB
    assetsСached: Number
  },

  // Offline functionality
  offline: {
    capable: {
      type: Boolean,
      default: false
    },
    offlineSessions: [{
      startTime: Date,
      endTime: Date,
      duration: Number,
      pagesViewed: Number,
      actionsPerformed: [String]
    }],
    offlineOrders: [{
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      createdOffline: Date,
      syncedAt: Date
    }],
    syncPending: {
      type: Boolean,
      default: false
    },
    lastSync: Date
  },

  // Push notifications
  pushNotifications: {
    subscribed: {
      type: Boolean,
      default: false
    },
    subscribedAt: Date,
    unsubscribedAt: Date,
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    },
    notificationsSent: {
      type: Number,
      default: 0
    },
    notificationsClicked: {
      type: Number,
      default: 0
    },
    clickRate: {
      type: Number,
      default: 0
    },
    preferences: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      newArrivals: { type: Boolean, default: false },
      priceDrops: { type: Boolean, default: true },
      backInStock: { type: Boolean, default: true }
    }
  },

  // App features usage
  features: {
    addToHomeScreen: {
      prompted: Boolean,
      accepted: Boolean,
      promptedAt: Date
    },
    backgroundSync: {
      enabled: Boolean,
      lastSync: Date,
      syncCount: Number
    },
    periodicBackgroundSync: {
      enabled: Boolean,
      interval: Number,
      lastSync: Date
    },
    webShare: {
      used: Boolean,
      shareCount: Number,
      lastShared: Date
    },
    paymentRequest: {
      used: Boolean,
      successfulPayments: Number
    },
    credentials: {
      saved: Boolean,
      autoFillUsed: Number
    },
    contacts: {
      accessGranted: Boolean,
      used: Boolean
    },
    geolocation: {
      accessGranted: Boolean,
      used: Boolean
    }
  },

  // Performance metrics
  performance: {
    loadTimes: [{
      page: String,
      loadTime: Number, // milliseconds
      timestamp: Date,
      cached: Boolean
    }],
    avgLoadTime: Number,
    firstContentfulPaint: Number,
    timeToInteractive: Number,
    speedIndex: Number,
    cacheHitRate: {
      type: Number,
      default: 0
    }
  },

  // User engagement
  engagement: {
    sessions: [{
      startTime: Date,
      endTime: Date,
      duration: Number,
      pagesViewed: Number,
      standalone: Boolean,
      offline: Boolean
    }],
    totalSessions: {
      type: Number,
      default: 0
    },
    avgSessionDuration: Number,
    totalPageViews: {
      type: Number,
      default: 0
    },
    lastActive: Date,
    dailyActiveStreak: {
      type: Number,
      default: 0
    }
  },

  // App updates
  updates: {
    availableUpdate: {
      type: Boolean,
      default: false
    },
    updateVersion: String,
    updatePromptShown: Boolean,
    updateAccepted: Boolean,
    lastUpdateCheck: Date,
    updateHistory: [{
      version: String,
      installedAt: Date,
      fromVersion: String
    }]
  },

  // Storage usage
  storage: {
    quota: Number, // in bytes
    usage: Number, // in bytes
    persistent: {
      type: Boolean,
      default: false
    },
    estimatedAvailable: Number,
    caches: [{
      name: String,
      size: Number,
      itemCount: Number
    }],
    indexedDB: {
      size: Number,
      databases: [String]
    }
  },

  // Capabilities
  capabilities: {
    serviceWorkerSupport: Boolean,
    pushSupport: Boolean,
    notificationSupport: Boolean,
    backgroundSyncSupport: Boolean,
    paymentRequestSupport: Boolean,
    credentialsSupport: Boolean,
    webShareSupport: Boolean,
    badgingSupport: Boolean,
    shortcutsSupport: Boolean,
    fileSystemSupport: Boolean
  },

  // Shortcuts usage
  shortcuts: [{
    name: String,
    url: String,
    usageCount: {
      type: Number,
      default: 0
    },
    lastUsed: Date
  }],

  // App icons
  icons: [{
    size: String,
    type: String,
    purpose: String
  }],

  // Manifest data
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

  // Analytics
  analytics: {
    installConversionRate: Number,
    retentionRate: {
      day1: Number,
      day7: Number,
      day30: Number
    },
    reEngagementRate: Number,
    offlineUsageRate: Number,
    pushNotificationEngagement: Number
  },

  // Errors and issues
  errors: [{
    type: {
      type: String,
      enum: ['service_worker', 'cache', 'sync', 'notification', 'payment', 'other']
    },
    message: String,
    stack: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }],

  // User feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    submittedAt: Date,
    issues: [String],
    suggestions: [String]
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'uninstalled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
progressiveWebAppSchema.index({ user: 1 });
progressiveWebAppSchema.index({ 'installation.isInstalled': 1 });
progressiveWebAppSchema.index({ 'pushNotifications.subscribed': 1 });
progressiveWebAppSchema.index({ status: 1 });

// Virtual for is active PWA user
progressiveWebAppSchema.virtual('isActivePWA').get(function () {
  return this.installation.isInstalled && this.status === 'active';
});

// Method to record session
progressiveWebAppSchema.methods.recordSession = function (startTime, endTime, pagesViewed, isStandalone, isOffline) {
  const duration = (endTime - startTime) / 1000; // in seconds

  this.engagement.sessions.push({
    startTime,
    endTime,
    duration,
    pagesViewed,
    standalone: isStandalone,
    offline: isOffline
  });

  this.engagement.totalSessions++;
  this.engagement.totalPageViews += pagesViewed;
  this.engagement.lastActive = endTime;

  // Calculate average session duration
  const totalDuration = this.engagement.sessions.reduce((sum, session) => sum + session.duration, 0);
  this.engagement.avgSessionDuration = totalDuration / this.engagement.sessions.length;
};

// Method to track push notification
progressiveWebAppSchema.methods.trackPushNotification = function (clicked = false) {
  this.pushNotifications.notificationsSent++;
  if (clicked) {
    this.pushNotifications.notificationsClicked++;
  }

  // Calculate click rate
  if (this.pushNotifications.notificationsSent > 0) {
    this.pushNotifications.clickRate =
      (this.pushNotifications.notificationsClicked / this.pushNotifications.notificationsSent) * 100;
  }
};

// Method to calculate retention
progressiveWebAppSchema.methods.calculateRetention = function () {
  if (!this.installation.installedAt) return;

  const installDate = new Date(this.installation.installedAt);
  const now = new Date();

  // Day 1 retention
  const day1 = new Date(installDate);
  day1.setDate(day1.getDate() + 1);
  const day1Sessions = this.engagement.sessions.filter(s =>
    new Date(s.startTime) >= installDate && new Date(s.startTime) <= day1
  );
  this.analytics.retentionRate.day1 = day1Sessions.length > 0 ? 100 : 0;

  // Day 7 retention
  const day7 = new Date(installDate);
  day7.setDate(day7.getDate() + 7);
  const day7Sessions = this.engagement.sessions.filter(s =>
    new Date(s.startTime) >= day1 && new Date(s.startTime) <= day7
  );
  this.analytics.retentionRate.day7 = day7Sessions.length > 0 ? 100 : 0;

  // Day 30 retention
  const day30 = new Date(installDate);
  day30.setDate(day30.getDate() + 30);
  if (now >= day30) {
    const day30Sessions = this.engagement.sessions.filter(s =>
      new Date(s.startTime) >= day7 && new Date(s.startTime) <= day30
    );
    this.analytics.retentionRate.day30 = day30Sessions.length > 0 ? 100 : 0;
  }
};

// Static method to get installation rate
progressiveWebAppSchema.statics.getInstallationRate = async function () {
  const total = await this.countDocuments();
  const installed = await this.countDocuments({ 'installation.isInstalled': true });
  return total > 0 ? (installed / total) * 100 : 0;
};

// Static method to get active PWA users
progressiveWebAppSchema.statics.getActivePWAUsers = function () {
  return this.find({
    'installation.isInstalled': true,
    status: 'active',
    'engagement.lastActive': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });
};

const ProgressiveWebApp = mongoose.model('ProgressiveWebApp', progressiveWebAppSchema);
export default ProgressiveWebApp;
export { ProgressiveWebApp };
