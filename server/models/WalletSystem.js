const mongoose = require('mongoose');

const walletSystemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Balance
  balance: {
    available: { type: Number, default: 0, min: 0 },
    pending: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    lifetime: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },

  // Wallet Status
  status: {
    type: String,
    enum: ['active', 'frozen', 'suspended', 'closed'],
    default: 'active'
  },

  isVerified: { type: Boolean, default: false },
  verificationLevel: { type: String, enum: ['none', 'basic', 'advanced', 'premium'], default: 'none' },

  // Transactions
  transactions: [{
    transactionId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['credit', 'debit', 'refund', 'reward', 'cashback', 'bonus', 'transfer', 'withdrawal', 'topup', 'reversal'],
      required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },

    // Transaction Details
    description: String,
    category: {
      type: String,
      enum: ['purchase', 'refund', 'reward', 'cashback', 'gift', 'promotion', 'referral', 'bonus', 'withdrawal', 'topup', 'transfer', 'adjustment']
    },

    // Related References
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    relatedPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    relatedRefund: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Refund'
    },

    // Transfer Details
    transferTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transferFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Balance Snapshot
    balanceBefore: Number,
    balanceAfter: Number,

    // Status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'reversed'],
      default: 'completed'
    },

    // Timestamps
    timestamp: { type: Date, default: Date.now },
    completedAt: Date,
    failedAt: Date,

    // Additional Info
    metadata: mongoose.Schema.Types.Mixed,
    notes: String,

    // Processing
    processingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },

    // Security
    ipAddress: String,
    deviceInfo: String
  }],

  // Auto Top-up Settings
  autoTopup: {
    enabled: { type: Boolean, default: false },
    threshold: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    paymentMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentMethod'
    },
    lastTopup: Date,
    failedAttempts: { type: Number, default: 0 }
  },

  // Limits & Restrictions
  limits: {
    daily: {
      spending: { type: Number, default: 1000 },
      withdrawal: { type: Number, default: 500 },
      transfer: { type: Number, default: 500 }
    },
    monthly: {
      spending: { type: Number, default: 10000 },
      withdrawal: { type: Number, default: 5000 },
      transfer: { type: Number, default: 5000 }
    },
    perTransaction: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 5000 }
    }
  },

  // Usage Tracking
  usage: {
    today: {
      spending: { type: Number, default: 0 },
      withdrawal: { type: Number, default: 0 },
      transfer: { type: Number, default: 0 },
      lastReset: Date
    },
    thisMonth: {
      spending: { type: Number, default: 0 },
      withdrawal: { type: Number, default: 0 },
      transfer: { type: Number, default: 0 },
      lastReset: Date
    }
  },

  // Rewards & Cashback
  rewards: {
    totalEarned: { type: Number, default: 0 },
    totalRedeemed: { type: Number, default: 0 },
    expiringPoints: [{
      amount: Number,
      expiresAt: Date
    }],
    tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
    nextTierRequirement: Number
  },

  // Linked Accounts
  linkedAccounts: [{
    type: { type: String, enum: ['bank', 'card', 'paypal', 'crypto'], required: true },
    accountNumber: String,
    accountName: String,
    isDefault: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    addedAt: { type: Date, default: Date.now },
    lastUsed: Date
  }],

  // Scheduled Payments
  scheduledPayments: [{
    name: String,
    amount: Number,
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    nextPaymentDate: Date,
    isActive: { type: Boolean, default: true },
    autoDebit: { type: Boolean, default: false }
  }],

  // Security
  security: {
    pin: String, // Hashed
    isPinSet: { type: Boolean, default: false },
    biometricEnabled: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    lastPinChange: Date,
    failedPinAttempts: { type: Number, default: 0 },
    lockedUntil: Date
  },

  // Notifications
  notifications: {
    transactionAlerts: { type: Boolean, default: true },
    lowBalanceAlert: { type: Boolean, default: true },
    lowBalanceThreshold: { type: Number, default: 10 },
    monthlyStatement: { type: Boolean, default: true },
    promotionalOffers: { type: Boolean, default: false }
  },

  // Analytics
  analytics: {
    totalTransactions: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalRefunded: { type: Number, default: 0 },
    totalRewarded: { type: Number, default: 0 },
    avgTransactionValue: { type: Number, default: 0 },
    mostUsedCategory: String,
    lastTransactionDate: Date,
    firstTransactionDate: Date
  },

  // Referral
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },

  referralEarnings: { type: Number, default: 0 },

  // KYC Documents
  kycDocuments: [{
    type: { type: String, enum: ['id_card', 'passport', 'driving_license', 'utility_bill', 'bank_statement'] },
    url: String,
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    uploadedAt: { type: Date, default: Date.now },
    verifiedAt: Date,
    rejectionReason: String
  }],

  // Promotional Balance
  promotional: {
    balance: { type: Number, default: 0 },
    expiresAt: Date,
    source: String
  }

}, {
  timestamps: true
});

// Indexes
walletSystemSchema.index({ user: 1 }, { unique: true });
walletSystemSchema.index({ 'transactions.transactionId': 1 });
walletSystemSchema.index({ status: 1 });
walletSystemSchema.index({ referralCode: 1 });

// Virtual: Total Balance
walletSystemSchema.virtual('totalBalance').get(function () {
  return this.balance.available + this.balance.pending;
});

// Method: Add Funds
walletSystemSchema.methods.addFunds = function (amount, type, description, metadata = {}) {
  const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

  const transaction = {
    transactionId,
    type: 'credit',
    amount,
    description,
    category: type,
    balanceBefore: this.balance.available,
    balanceAfter: this.balance.available + amount,
    status: 'completed',
    timestamp: Date.now(),
    completedAt: Date.now(),
    metadata
  };

  this.balance.available += amount;
  this.balance.lifetime += amount;
  this.transactions.push(transaction);
  this.analytics.totalTransactions += 1;
  this.analytics.lastTransactionDate = Date.now();

  if (!this.analytics.firstTransactionDate) {
    this.analytics.firstTransactionDate = Date.now();
  }

  return transaction;
};

// Method: Deduct Funds
walletSystemSchema.methods.deductFunds = function (amount, type, description, metadata = {}) {
  if (this.balance.available < amount) {
    throw new Error('Insufficient balance');
  }

  const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

  const transaction = {
    transactionId,
    type: 'debit',
    amount,
    description,
    category: type,
    balanceBefore: this.balance.available,
    balanceAfter: this.balance.available - amount,
    status: 'completed',
    timestamp: Date.now(),
    completedAt: Date.now(),
    metadata
  };

  this.balance.available -= amount;
  this.transactions.push(transaction);
  this.analytics.totalTransactions += 1;
  this.analytics.totalSpent += amount;
  this.analytics.lastTransactionDate = Date.now();

  // Update usage tracking
  this.usage.today.spending += amount;
  this.usage.thisMonth.spending += amount;

  return transaction;
};

// Method: Transfer Funds
walletSystemSchema.methods.transferFunds = async function (toUserId, amount, description) {
  if (this.balance.available < amount) {
    throw new Error('Insufficient balance');
  }

  if (amount > this.limits.perTransaction.max) {
    throw new Error('Transfer amount exceeds limit');
  }

  const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

  const transaction = {
    transactionId,
    type: 'transfer',
    amount,
    description: description || 'Wallet transfer',
    category: 'transfer',
    balanceBefore: this.balance.available,
    balanceAfter: this.balance.available - amount,
    transferTo: toUserId,
    status: 'completed',
    timestamp: Date.now(),
    completedAt: Date.now()
  };

  this.balance.available -= amount;
  this.transactions.push(transaction);
  this.usage.today.transfer += amount;
  this.usage.thisMonth.transfer += amount;

  return transaction;
};

// Method: Check Daily Limit
walletSystemSchema.methods.checkDailyLimit = function (amount, type) {
  const today = new Date().toDateString();
  const lastReset = this.usage.today.lastReset ? new Date(this.usage.today.lastReset).toDateString() : null;

  if (today !== lastReset) {
    this.usage.today = {
      spending: 0,
      withdrawal: 0,
      transfer: 0,
      lastReset: Date.now()
    };
  }

  const currentUsage = this.usage.today[type] || 0;
  const limit = this.limits.daily[type] || Infinity;

  return (currentUsage + amount) <= limit;
};

// Static: Get Total Wallet Balance
walletSystemSchema.statics.getTotalBalance = async function () {
  const result = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        totalAvailable: { $sum: '$balance.available' },
        totalPending: { $sum: '$balance.pending' },
        totalLifetime: { $sum: '$balance.lifetime' }
      }
    }
  ]);

  return result[0] || { totalAvailable: 0, totalPending: 0, totalLifetime: 0 };
};

// Pre-save middleware
walletSystemSchema.pre('save', function (next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = `REF${this.user.toString().slice(-8).toUpperCase()}`;
  }
  next();
});

const WalletSystem = mongoose.model('WalletSystem', walletSystemSchema);
export default WalletSystem;
export { WalletSystem };
