import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  walletId: {
    type: String,
    required: true,
    unique: true
  },
  provider: {
    type: String,
    enum: ['paytm', 'phonepe', 'amazon_pay', 'mobikwik', 'freecharge', 'internal'],
    required: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  transactions: [{
    transactionId: String,
    type: {
      type: String,
      enum: ['credit', 'debit', 'refund', 'cashback', 'reward']
    },
    amount: Number,
    balance: Number,
    description: String,
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'reversed'],
      default: 'pending'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  linkedAccounts: [{
    type: {
      type: String,
      enum: ['bank', 'card', 'upi']
    },
    details: mongoose.Schema.Types.Mixed,
    isDefault: Boolean,
    addedAt: Date
  }],
  autoReload: {
    enabled: Boolean,
    threshold: Number,
    amount: Number,
    source: String
  },
  limits: {
    daily: { type: Number, default: 100000 },
    monthly: { type: Number, default: 500000 },
    perTransaction: { type: Number, default: 50000 }
  },
  kycStatus: {
    type: String,
    enum: ['not_started', 'pending', 'verified', 'rejected'],
    default: 'not_started'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedReason: String
}, {
  timestamps: true, suppressReservedKeysWarning: true });

walletSchema.index({ walletId: 1 });

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
export { Wallet };
