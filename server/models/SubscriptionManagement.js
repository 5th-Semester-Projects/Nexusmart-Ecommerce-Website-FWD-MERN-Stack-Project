import mongoose from 'mongoose';

const subscriptionManagementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionType: {
    type: String,
    enum: ['recurring-order', 'subscription-box', 'membership', 'service-plan'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },

  // Products/Items in subscription
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    variant: {
      size: String,
      color: String,
      material: String
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    priceAtSubscription: {
      type: Number,
      required: true
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    isCustomizable: {
      type: Boolean,
      default: false
    }
  }],

  // Subscription Box Details (for curated boxes)
  boxDetails: {
    isBox: {
      type: Boolean,
      default: false
    },
    boxType: {
      type: String,
      enum: ['curated', 'surprise', 'personalized', 'themed']
    },
    theme: String,
    itemsPerBox: {
      type: Number,
      min: 1
    },
    allowCustomization: {
      type: Boolean,
      default: false
    },
    preferences: {
      categories: [String],
      brands: [String],
      priceRange: {
        min: Number,
        max: Number
      },
      excludedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }]
    }
  },

  // Billing & Pricing
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    discountedPrice: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    promoCode: {
      code: String,
      discountAmount: Number,
      discountPercentage: Number
    }
  },

  // Frequency & Schedule
  frequency: {
    interval: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'semi-annual', 'annual'],
      required: true
    },
    intervalCount: {
      type: Number,
      default: 1,
      min: 1
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31
    },
    specificDates: [Date]
  },

  // Delivery Schedule
  deliverySchedule: {
    nextDeliveryDate: {
      type: Date,
      required: true
    },
    lastDeliveryDate: Date,
    preferredDeliveryTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime']
    },
    deliveryInstructions: String,
    upcomingDeliveries: [{
      scheduledDate: Date,
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'skipped', 'failed']
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      trackingNumber: String,
      estimatedDelivery: Date,
      actualDelivery: Date
    }]
  },

  // Subscription Status & Control
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired', 'payment-failed', 'on-hold'],
    default: 'active',
    index: true
  },
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String,
    changedBy: String
  }],

  // Pause/Resume Functionality
  pauseDetails: {
    isPaused: {
      type: Boolean,
      default: false
    },
    pausedAt: Date,
    pauseReason: String,
    pauseDuration: {
      startDate: Date,
      endDate: Date,
      autoResume: {
        type: Boolean,
        default: true
      }
    },
    skippedDeliveries: [{
      scheduledDate: Date,
      skippedAt: Date,
      reason: String
    }]
  },

  // Contract & Duration
  contract: {
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: Date,
    minimumCommitment: {
      type: Number,
      default: 0
    },
    autoRenew: {
      type: Boolean,
      default: true
    },
    renewalCount: {
      type: Number,
      default: 0
    },
    cancellationPolicy: {
      noticePeriod: {
        type: Number,
        default: 7
      },
      penaltyAmount: {
        type: Number,
        default: 0
      },
      refundPolicy: String
    }
  },

  // Payment Details
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'paypal', 'bank-transfer', 'wallet'],
      required: true
    },
    cardLast4: String,
    expiryMonth: Number,
    expiryYear: Number,
    paymentGatewayId: String,
    isDefault: {
      type: Boolean,
      default: true
    },
    autoChargeEnabled: {
      type: Boolean,
      default: true
    }
  },

  // Billing History
  billingHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'disputed']
    },
    transactionId: String,
    invoiceNumber: String,
    invoiceUrl: String,
    paymentMethod: String,
    failureReason: String,
    retryAttempts: {
      type: Number,
      default: 0
    },
    nextRetryDate: Date
  }],

  // Shipping Address
  shippingAddress: {
    firstName: String,
    lastName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    phone: String,
    isDefault: Boolean
  },

  // Analytics & Metrics
  analytics: {
    totalOrders: {
      type: Number,
      default: 0
    },
    successfulDeliveries: {
      type: Number,
      default: 0
    },
    failedDeliveries: {
      type: Number,
      default: 0
    },
    skippedDeliveries: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    lifetimeValue: {
      type: Number,
      default: 0
    },
    churnRisk: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    satisfactionScore: {
      type: Number,
      min: 1,
      max: 5
    },
    lastInteractionDate: Date
  },

  // Customer Preferences
  preferences: {
    emailNotifications: {
      orderConfirmation: { type: Boolean, default: true },
      deliveryReminder: { type: Boolean, default: true },
      paymentReceipt: { type: Boolean, default: true },
      pauseConfirmation: { type: Boolean, default: true },
      renewalReminder: { type: Boolean, default: true }
    },
    smsNotifications: {
      enabled: { type: Boolean, default: false },
      deliveryUpdates: { type: Boolean, default: false },
      paymentReminders: { type: Boolean, default: false }
    },
    allowSubstitutions: {
      type: Boolean,
      default: false
    },
    substitutionPreferences: {
      similarProducts: Boolean,
      sameBrand: Boolean,
      priceRange: {
        min: Number,
        max: Number
      }
    }
  },

  // Gift Subscription
  isGift: {
    type: Boolean,
    default: false
  },
  giftDetails: {
    fromName: String,
    fromEmail: String,
    toName: String,
    toEmail: String,
    message: String,
    giftWrap: Boolean,
    giftCard: String,
    giftDuration: {
      type: String,
      enum: ['1-month', '3-months', '6-months', '12-months', 'ongoing']
    }
  },

  // Referral & Rewards
  referral: {
    referralCode: String,
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    referralDiscount: Number,
    referralCredits: Number
  },

  // Notes & Support
  notes: [{
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    addedBy: {
      type: String,
      enum: ['customer', 'support', 'system']
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],

  // Timestamps
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
, suppressReservedKeysWarning: true });

// Indexes
subscriptionManagementSchema.index({ 'deliverySchedule.nextDeliveryDate': 1 });
subscriptionManagementSchema.index({ status: 1, 'contract.endDate': 1 });

// Methods
subscriptionManagementSchema.methods.pauseSubscription = function (reason, duration) {
  this.pauseDetails.isPaused = true;
  this.pauseDetails.pausedAt = Date.now();
  this.pauseDetails.pauseReason = reason;

  if (duration) {
    this.pauseDetails.pauseDuration.startDate = Date.now();
    this.pauseDetails.pauseDuration.endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
  }

  this.status = 'paused';
  this.statusHistory.push({
    status: 'paused',
    changedAt: Date.now(),
    reason: reason
  });

  return this.save();
};

subscriptionManagementSchema.methods.resumeSubscription = function () {
  this.pauseDetails.isPaused = false;
  this.pauseDetails.pauseDuration = {};
  this.status = 'active';

  this.statusHistory.push({
    status: 'active',
    changedAt: Date.now(),
    reason: 'Subscription resumed'
  });

  return this.save();
};

subscriptionManagementSchema.methods.skipNextDelivery = function (reason) {
  const nextDelivery = this.deliverySchedule.upcomingDeliveries[0];

  if (nextDelivery) {
    nextDelivery.status = 'skipped';

    this.pauseDetails.skippedDeliveries.push({
      scheduledDate: nextDelivery.scheduledDate,
      skippedAt: Date.now(),
      reason: reason || 'Customer request'
    });

    this.analytics.skippedDeliveries += 1;
  }

  return this.save();
};

subscriptionManagementSchema.methods.cancelSubscription = function (reason) {
  this.status = 'cancelled';
  this.statusHistory.push({
    status: 'cancelled',
    changedAt: Date.now(),
    reason: reason || 'Customer request'
  });

  return this.save();
};

subscriptionManagementSchema.methods.calculateNextDeliveryDate = function () {
  const lastDate = this.deliverySchedule.lastDeliveryDate || this.contract.startDate;
  let nextDate = new Date(lastDate);

  const { interval, intervalCount } = this.frequency;

  switch (interval) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + intervalCount);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * intervalCount));
      break;
    case 'bi-weekly':
      nextDate.setDate(nextDate.getDate() + (14 * intervalCount));
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + intervalCount);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + (3 * intervalCount));
      break;
    case 'semi-annual':
      nextDate.setMonth(nextDate.getMonth() + (6 * intervalCount));
      break;
    case 'annual':
      nextDate.setFullYear(nextDate.getFullYear() + intervalCount);
      break;
  }

  this.deliverySchedule.nextDeliveryDate = nextDate;
  return nextDate;
};

subscriptionManagementSchema.methods.updateAnalytics = function () {
  const successfulOrders = this.billingHistory.filter(b => b.status === 'paid').length;
  const totalRevenue = this.billingHistory
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  this.analytics.totalOrders = this.billingHistory.length;
  this.analytics.successfulDeliveries = successfulOrders;
  this.analytics.totalRevenue = totalRevenue;
  this.analytics.averageOrderValue = successfulOrders > 0 ? totalRevenue / successfulOrders : 0;
  this.analytics.lifetimeValue = totalRevenue;
  this.analytics.lastInteractionDate = Date.now();

  return this.save();
};

// Statics
subscriptionManagementSchema.statics.getActiveSubscriptions = function (userId) {
  return this.find({ user: userId, status: 'active' })
    .populate('items.product')
    .sort({ 'deliverySchedule.nextDeliveryDate': 1 });
};

subscriptionManagementSchema.statics.getDueForDelivery = function (date) {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    status: 'active',
    'deliverySchedule.nextDeliveryDate': { $lte: endOfDay }
  }).populate('user items.product');
};

subscriptionManagementSchema.statics.getSubscriptionAnalytics = function (userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$analytics.totalRevenue' },
        avgLifetimeValue: { $avg: '$analytics.lifetimeValue' }
      }
    }
  ]);
};

// Virtuals
subscriptionManagementSchema.virtual('isActive').get(function () {
  return this.status === 'active';
});

subscriptionManagementSchema.virtual('daysUntilNextDelivery').get(function () {
  if (!this.deliverySchedule.nextDeliveryDate) return null;

  const now = new Date();
  const nextDelivery = new Date(this.deliverySchedule.nextDeliveryDate);
  const diffTime = nextDelivery - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
});

const SubscriptionManagement = mongoose.model('SubscriptionManagement', subscriptionManagementSchema);

export default SubscriptionManagement;
