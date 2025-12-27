import mongoose from 'mongoose';

const giftCardStoreCreditSchema = new mongoose.Schema({
  // Gift Card Details
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  cardType: {
    type: String,
    enum: ['digital', 'physical'],
    required: true
  },

  cardStatus: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'used', 'cancelled', 'pending'],
    default: 'pending',
    index: true
  },

  // Issuer & Owner
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  },

  purchasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // Recipient Information
  recipient: {
    name: String,
    email: String,
    phone: String,
    message: String,

    // For physical cards
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },

    deliveryStatus: {
      type: String,
      enum: ['pending', 'shipped', 'delivered', 'failed']
    },

    trackingNumber: String,
    deliveredAt: Date
  },

  // Balance & Amounts
  balance: {
    original: {
      type: Number,
      required: true,
      min: 0
    },

    current: {
      type: Number,
      required: true,
      min: 0
    },

    used: {
      type: Number,
      default: 0,
      min: 0
    },

    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Transaction History
  transactions: [{
    transactionId: String,

    type: {
      type: String,
      enum: ['purchase', 'redemption', 'partial-redemption', 'refund', 'reload', 'transfer', 'adjustment'],
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    balanceBefore: Number,
    balanceAfter: Number,

    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },

    relatedPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },

    description: String,

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    timestamp: {
      type: Date,
      default: Date.now
    },

    metadata: mongoose.Schema.Types.Mixed
  }],

  // Partial Redemption Support
  partialRedemptionAllowed: {
    type: Boolean,
    default: true
  },

  minimumRedemptionAmount: {
    type: Number,
    default: 0
  },

  // Security
  pin: {
    type: String,
    select: false
  },

  securityCode: {
    type: String,
    select: false
  },

  // Expiry
  expiryDate: Date,

  isExpired: {
    type: Boolean,
    default: false
  },

  // Reloadable
  isReloadable: {
    type: Boolean,
    default: false
  },

  reloadHistory: [{
    amount: Number,
    reloadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reloadedAt: Date,
    paymentMethod: String
  }],

  maxBalance: Number,

  // Store Credit Specific
  storeCredit: {
    isStoreCredit: {
      type: Boolean,
      default: false
    },

    source: {
      type: String,
      enum: ['refund', 'return', 'compensation', 'promotion', 'loyalty', 'gift', 'manual'],
    },

    sourceReference: String, // Order ID, Return ID, etc.

    restrictions: {
      applicableCategories: [String],
      excludedCategories: [String],
      applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      excludedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      minimumPurchaseAmount: Number,
      canCombineWithOtherOffers: { type: Boolean, default: true }
    }
  },

  // Usage Restrictions
  restrictions: {
    // Where it can be used
    channels: [{
      type: String,
      enum: ['website', 'mobile-app', 'in-store', 'all']
    }],

    // Geographic restrictions
    countries: [String],
    regions: [String],

    // Category/Product restrictions
    categories: [String],
    excludedCategories: [String],

    specificProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],

    // User restrictions
    limitPerUser: Number,
    maxUsesPerTransaction: Number,

    // Time restrictions
    validFrom: Date,
    validUntil: Date,

    // Day/Time restrictions
    validDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],

    validHours: {
      start: String,
      end: String
    }
  },

  // Design & Presentation
  design: {
    template: String,
    theme: {
      type: String,
      enum: ['birthday', 'christmas', 'anniversary', 'general', 'corporate', 'custom']
    },

    imageUrl: String,
    backgroundImage: String,
    logoUrl: String,

    colors: {
      primary: String,
      secondary: String,
      text: String
    },

    customMessage: String
  },

  // Delivery
  delivery: {
    method: {
      type: String,
      enum: ['email', 'sms', 'physical-mail', 'in-person']
    },

    scheduledDelivery: Date,

    deliveredAt: Date,

    emailSent: Boolean,
    smsSent: Boolean,

    deliveryAttempts: Number,
    lastAttemptAt: Date
  },

  // Activation
  activation: {
    requiresActivation: { type: Boolean, default: false },
    activatedAt: Date,
    activatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Transfer & Gifting
  transferable: {
    type: Boolean,
    default: true
  },

  transferHistory: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transferredAt: Date,
    reason: String
  }],

  // Analytics
  analytics: {
    timesChecked: { type: Number, default: 0 },
    lastChecked: Date,

    redemptions: { type: Number, default: 0 },
    totalRedeemed: { type: Number, default: 0 },

    avgRedemptionAmount: Number,
    avgDaysToFirstUse: Number,
    avgDaysToFullyUsed: Number
  },

  // Promotion & Campaign
  campaign: {
    campaignId: String,
    campaignName: String,
    promoCode: String
  },

  // Notes & Metadata
  internalNotes: String,
  metadata: mongoose.Schema.Types.Mixed,

  // Audit Trail
  auditLog: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String
  }],

  // Dates
  purchasedAt: Date,
  activatedAt: Date,
  firstUsedAt: Date,
  lastUsedAt: Date,
  fullyUsedAt: Date,
  cancelledAt: Date

}, {
  timestamps: true
});

// Indexes
giftCardStoreCreditSchema.index({ currentOwner: 1, cardStatus: 1 });
giftCardStoreCreditSchema.index({ 'recipient.email': 1 });
giftCardStoreCreditSchema.index({ expiryDate: 1 });
giftCardStoreCreditSchema.index({ cardStatus: 1, cardType: 1 });

// Virtual: Is Valid
giftCardStoreCreditSchema.virtual('isValid').get(function () {
  if (this.cardStatus !== 'active') return false;
  if (this.balance.current <= 0) return false;
  if (this.isExpired) return false;
  if (this.expiryDate && this.expiryDate < new Date()) return false;
  return true;
});

// Virtual: Remaining Percentage
giftCardStoreCreditSchema.virtual('remainingPercentage').get(function () {
  if (this.balance.original === 0) return 0;
  return (this.balance.current / this.balance.original) * 100;
});

// Method: Check Balance
giftCardStoreCreditSchema.methods.checkBalance = function () {
  this.analytics.timesChecked += 1;
  this.analytics.lastChecked = Date.now();

  return {
    cardNumber: this.cardNumber,
    balance: this.balance.current,
    currency: this.balance.currency,
    status: this.cardStatus,
    expiryDate: this.expiryDate,
    isValid: this.isValid
  };
};

// Method: Redeem (Full or Partial)
giftCardStoreCreditSchema.methods.redeem = function (amount, orderId, userId) {
  // Validation
  if (!this.isValid) {
    throw new Error('Gift card is not valid for redemption');
  }

  if (amount > this.balance.current) {
    throw new Error('Insufficient balance');
  }

  if (!this.partialRedemptionAllowed && amount < this.balance.current) {
    throw new Error('Partial redemption not allowed');
  }

  if (amount < this.minimumRedemptionAmount) {
    throw new Error(`Minimum redemption amount is ${this.minimumRedemptionAmount}`);
  }

  // Record transaction
  const balanceBefore = this.balance.current;
  this.balance.current -= amount;
  this.balance.used += amount;
  const balanceAfter = this.balance.current;

  const transaction = {
    transactionId: new mongoose.Types.ObjectId().toString(),
    type: amount === balanceBefore ? 'redemption' : 'partial-redemption',
    amount: -amount,
    balanceBefore,
    balanceAfter,
    relatedOrder: orderId,
    performedBy: userId,
    timestamp: Date.now(),
    description: `Redeemed ${amount} ${this.balance.currency}`
  };

  this.transactions.push(transaction);

  // Update analytics
  this.analytics.redemptions += 1;
  this.analytics.totalRedeemed += amount;
  this.analytics.avgRedemptionAmount = this.analytics.totalRedeemed / this.analytics.redemptions;

  if (!this.firstUsedAt) {
    this.firstUsedAt = Date.now();
    if (this.purchasedAt) {
      this.analytics.avgDaysToFirstUse = Math.floor(
        (this.firstUsedAt - this.purchasedAt) / (1000 * 60 * 60 * 24)
      );
    }
  }

  this.lastUsedAt = Date.now();

  // Check if fully used
  if (this.balance.current === 0) {
    this.cardStatus = 'used';
    this.fullyUsedAt = Date.now();

    if (this.purchasedAt) {
      this.analytics.avgDaysToFullyUsed = Math.floor(
        (this.fullyUsedAt - this.purchasedAt) / (1000 * 60 * 60 * 24)
      );
    }
  }

  // Audit log
  this.auditLog.push({
    action: 'redemption',
    performedBy: userId,
    timestamp: Date.now(),
    details: { amount, orderId, balanceBefore, balanceAfter }
  });

  return transaction;
};

// Method: Reload Balance
giftCardStoreCreditSchema.methods.reload = function (amount, userId, paymentMethod) {
  if (!this.isReloadable) {
    throw new Error('This gift card is not reloadable');
  }

  if (this.maxBalance && (this.balance.current + amount) > this.maxBalance) {
    throw new Error(`Cannot exceed maximum balance of ${this.maxBalance}`);
  }

  const balanceBefore = this.balance.current;
  this.balance.current += amount;
  this.balance.original += amount;
  const balanceAfter = this.balance.current;

  // Record transaction
  this.transactions.push({
    transactionId: new mongoose.Types.ObjectId().toString(),
    type: 'reload',
    amount,
    balanceBefore,
    balanceAfter,
    performedBy: userId,
    timestamp: Date.now(),
    description: `Reloaded ${amount} ${this.balance.currency}`
  });

  // Record reload history
  this.reloadHistory.push({
    amount,
    reloadedBy: userId,
    reloadedAt: Date.now(),
    paymentMethod
  });

  // Audit log
  this.auditLog.push({
    action: 'reload',
    performedBy: userId,
    timestamp: Date.now(),
    details: { amount, paymentMethod, balanceBefore, balanceAfter }
  });

  return { success: true, newBalance: this.balance.current };
};

// Method: Transfer to Another User
giftCardStoreCreditSchema.methods.transferTo = function (toUserId, fromUserId, reason = '') {
  if (!this.transferable) {
    throw new Error('This gift card is not transferable');
  }

  this.transferHistory.push({
    from: fromUserId,
    to: toUserId,
    transferredAt: Date.now(),
    reason
  });

  this.currentOwner = toUserId;

  this.auditLog.push({
    action: 'transfer',
    performedBy: fromUserId,
    timestamp: Date.now(),
    details: { toUserId, reason }
  });

  return { success: true, newOwner: toUserId };
};

// Method: Cancel Gift Card
giftCardStoreCreditSchema.methods.cancel = function (userId, reason) {
  this.cardStatus = 'cancelled';
  this.cancelledAt = Date.now();

  this.auditLog.push({
    action: 'cancel',
    performedBy: userId,
    timestamp: Date.now(),
    details: { reason, balanceAtCancellation: this.balance.current }
  });

  return { success: true, refundAmount: this.balance.current };
};

// Static: Generate Card Number
giftCardStoreCreditSchema.statics.generateCardNumber = function () {
  const prefix = 'GC';
  const randomPart = Math.random().toString().substring(2, 18);
  return `${prefix}${randomPart}`;
};

// Static: Find Active Cards by User
giftCardStoreCreditSchema.statics.findActiveByUser = function (userId) {
  return this.find({
    currentOwner: userId,
    cardStatus: 'active',
    'balance.current': { $gt: 0 }
  }).sort({ expiryDate: 1 });
};

// Static: Find Expiring Soon
giftCardStoreCreditSchema.statics.findExpiringSoon = function (days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    cardStatus: 'active',
    expiryDate: { $lte: futureDate, $gte: new Date() },
    'balance.current': { $gt: 0 }
  }).populate('currentOwner');
};

// Pre-save: Check Expiry
giftCardStoreCreditSchema.pre('save', function (next) {
  if (this.expiryDate && this.expiryDate < new Date()) {
    this.isExpired = true;
    if (this.cardStatus === 'active') {
      this.cardStatus = 'expired';
    }
  }
  next();
});

const GiftCardStoreCredit = mongoose.model('GiftCardStoreCredit', giftCardStoreCreditSchema);
export default GiftCardStoreCredit;
export { GiftCardStoreCredit };
