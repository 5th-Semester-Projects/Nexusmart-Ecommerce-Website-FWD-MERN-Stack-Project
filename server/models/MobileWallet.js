const mongoose = require('mongoose');

const mobileWalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletType: {
    type: String,
    enum: ['apple_pay', 'google_pay', 'samsung_pay', 'paytm', 'phonepe', 'amazon_pay'],
    required: true
  },
  token: {
    encrypted: String,
    lastFour: String,
    expiresAt: Date
  },
  deviceInfo: {
    deviceId: String,
    deviceName: String,
    platform: String,
    osVersion: String
  },
  cards: [{
    cardToken: String,
    cardType: String, // 'credit', 'debit'
    network: String, // 'visa', 'mastercard', 'amex'
    lastFour: String,
    expiryMonth: Number,
    expiryYear: Number,
    isDefault: Boolean,
    nickname: String,
    addedAt: Date
  }],
  transactions: [{
    transactionId: String,
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    amount: Number,
    currency: String,
    status: String,
    timestamp: Date
  }],
  preferences: {
    autoReload: Boolean,
    reloadAmount: Number,
    reloadThreshold: Number,
    defaultCard: String
  },
  security: {
    biometricEnabled: Boolean,
    pinEnabled: Boolean,
    lastVerifiedAt: Date,
    failedAttempts: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date
}, {
  timestamps: true
});

// Indexes
mobileWalletSchema.index({ user: 1, walletType: 1 });
mobileWalletSchema.index({ 'deviceInfo.deviceId': 1 });

const MobileWallet = mongoose.model('MobileWallet', mobileWalletSchema);
export default MobileWallet;
export { MobileWallet };
