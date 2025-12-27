import mongoose from 'mongoose';

const priceAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  // Alert conditions
  alertType: {
    type: String,
    enum: ['price_drop', 'target_price', 'percentage_drop', 'back_in_stock', 'price_rise'],
    required: true
  },

  // Price conditions
  priceConditions: {
    currentPrice: {
      type: Number,
      required: true
    },
    targetPrice: Number,
    dropPercentage: Number, // e.g., 20 for 20% drop
    dropAmount: Number,
    triggerPrice: Number
  },

  // Variant-specific (optional)
  variant: {
    color: String,
    size: String,
    sku: String
  },

  // Alert status
  status: {
    type: String,
    enum: ['active', 'triggered', 'expired', 'cancelled', 'paused'],
    default: 'active'
  },

  // Trigger information
  triggered: {
    isTriggered: {
      type: Boolean,
      default: false
    },
    triggeredAt: Date,
    triggerPrice: Number,
    priceChange: {
      amount: Number,
      percentage: Number
    },
    notificationSent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  },

  // Notification preferences
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },

  // Frequency settings
  frequency: {
    type: String,
    enum: ['instant', 'daily', 'weekly'],
    default: 'instant'
  },

  // Price history tracking
  priceHistory: [{
    price: Number,
    checkedAt: {
      type: Date,
      default: Date.now
    },
    priceChange: Number,
    changePercentage: Number
  }],

  // Monitoring
  monitoring: {
    lastChecked: Date,
    checkCount: {
      type: Number,
      default: 0
    },
    nextCheck: Date
  },

  // Expiration
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  },

  // User interaction
  interaction: {
    viewed: {
      type: Boolean,
      default: false
    },
    viewedAt: Date,
    clickedThrough: {
      type: Boolean,
      default: false
    },
    clickedAt: Date,
    addedToCart: {
      type: Boolean,
      default: false
    },
    purchased: {
      type: Boolean,
      default: false
    },
    purchasedAt: Date
  },

  // Analytics
  analytics: {
    priceAtCreation: Number,
    lowestPriceSeen: Number,
    highestPriceSeen: Number,
    avgPrice: Number,
    totalPriceChanges: {
      type: Number,
      default: 0
    }
  },

  // Settings
  settings: {
    autoCancel: {
      type: Boolean,
      default: false
    },
    autoCancelAfterTrigger: {
      type: Boolean,
      default: true
    },
    maxNotifications: {
      type: Number,
      default: 1
    },
    notificationsSent: {
      type: Number,
      default: 0
    }
  },

  // Notes
  notes: String
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

// Indexes
priceAlertSchema.index({ user: 1, product: 1 });
priceAlertSchema.index({ status: 1 });
priceAlertSchema.index({ 'monitoring.nextCheck': 1 });
priceAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for should trigger
priceAlertSchema.virtual('shouldTrigger').get(function () {
  if (this.status !== 'active' || this.triggered.isTriggered) return false;

  const currentPrice = this.priceConditions.currentPrice;

  switch (this.alertType) {
    case 'target_price':
      return currentPrice <= this.priceConditions.targetPrice;

    case 'percentage_drop':
      const dropPercent = ((this.analytics.priceAtCreation - currentPrice) / this.analytics.priceAtCreation) * 100;
      return dropPercent >= this.priceConditions.dropPercentage;

    case 'price_drop':
      const dropAmount = this.analytics.priceAtCreation - currentPrice;
      return dropAmount >= (this.priceConditions.dropAmount || 0);

    default:
      return false;
  }
});

// Method to check and trigger alert
priceAlertSchema.methods.checkPrice = function (newPrice) {
  // Update price history
  const lastPrice = this.priceConditions.currentPrice;
  const priceChange = newPrice - lastPrice;
  const changePercentage = ((priceChange / lastPrice) * 100).toFixed(2);

  this.priceHistory.push({
    price: newPrice,
    checkedAt: Date.now(),
    priceChange,
    changePercentage
  });

  // Update current price
  this.priceConditions.currentPrice = newPrice;

  // Update analytics
  if (!this.analytics.lowestPriceSeen || newPrice < this.analytics.lowestPriceSeen) {
    this.analytics.lowestPriceSeen = newPrice;
  }
  if (!this.analytics.highestPriceSeen || newPrice > this.analytics.highestPriceSeen) {
    this.analytics.highestPriceSeen = newPrice;
  }
  if (priceChange !== 0) {
    this.analytics.totalPriceChanges++;
  }

  // Calculate average price
  const totalPrice = this.priceHistory.reduce((sum, record) => sum + record.price, 0);
  this.analytics.avgPrice = totalPrice / this.priceHistory.length;

  // Update monitoring
  this.monitoring.lastChecked = Date.now();
  this.monitoring.checkCount++;

  // Check if should trigger
  if (this.shouldTrigger) {
    this.trigger(newPrice);
  }
};

// Method to trigger alert
priceAlertSchema.methods.trigger = function (currentPrice) {
  if (this.triggered.isTriggered) return;

  const priceChange = this.analytics.priceAtCreation - currentPrice;
  const changePercentage = ((priceChange / this.analytics.priceAtCreation) * 100).toFixed(2);

  this.triggered = {
    isTriggered: true,
    triggeredAt: Date.now(),
    triggerPrice: currentPrice,
    priceChange: {
      amount: priceChange,
      percentage: changePercentage
    },
    notificationSent: false
  };

  this.status = 'triggered';

  // Auto-cancel if configured
  if (this.settings.autoCancelAfterTrigger) {
    this.status = 'cancelled';
  }
};

// Method to send notification
priceAlertSchema.methods.sendNotification = async function () {
  if (this.settings.notificationsSent >= this.settings.maxNotifications) {
    return false;
  }

  this.triggered.notificationSent = true;
  this.triggered.sentAt = Date.now();
  this.settings.notificationsSent++;

  // Notification logic would be implemented here
  return true;
};

// Method to cancel alert
priceAlertSchema.methods.cancel = function () {
  this.status = 'cancelled';
};

// Method to pause alert
priceAlertSchema.methods.pause = function () {
  this.status = 'paused';
};

// Method to resume alert
priceAlertSchema.methods.resume = function () {
  if (this.status === 'paused') {
    this.status = 'active';
  }
};

// Static method to get active alerts for price checking
priceAlertSchema.statics.getAlertsToCheck = function () {
  const now = new Date();
  return this.find({
    status: 'active',
    $or: [
      { 'monitoring.nextCheck': { $lte: now } },
      { 'monitoring.nextCheck': null }
    ]
  }).populate('product user');
};

// Static method to get triggered alerts pending notification
priceAlertSchema.statics.getPendingNotifications = function () {
  return this.find({
    status: 'triggered',
    'triggered.isTriggered': true,
    'triggered.notificationSent': false
  }).populate('product user');
};

// Pre-save middleware
priceAlertSchema.pre('save', function (next) {
  // Set price at creation
  if (this.isNew && !this.analytics.priceAtCreation) {
    this.analytics.priceAtCreation = this.priceConditions.currentPrice;
  }

  // Calculate trigger price for display
  if (this.alertType === 'target_price') {
    this.priceConditions.triggerPrice = this.priceConditions.targetPrice;
  } else if (this.alertType === 'percentage_drop') {
    this.priceConditions.triggerPrice = this.analytics.priceAtCreation * (1 - this.priceConditions.dropPercentage / 100);
  }

  next();
});

const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);
export default PriceAlert;
export { PriceAlert };
