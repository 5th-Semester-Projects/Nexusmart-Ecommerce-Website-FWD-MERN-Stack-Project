import mongoose from 'mongoose';

const splitPaymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethods: [{
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'wallet', 'gift_card', 'loyalty_points', 'bank_transfer', 'crypto', 'bnpl'],
      required: true
    },
    provider: String,
    amount: {
      type: Number,
      required: true
    },
    percentage: Number,
    details: {
      cardLastFour: String,
      cardBrand: String,
      walletId: String,
      giftCardCode: String,
      pointsUsed: Number,
      cryptoAddress: String,
      bankAccount: String
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    processedAt: Date,
    failureReason: String
  }],
  splitStrategy: {
    type: {
      type: String,
      enum: ['manual', 'auto_optimize', 'loyalty_first', 'gift_card_first', 'lowest_fee']
    },
    description: String
  },
  processingOrder: [Number], // Index of payment methods in order of processing
  status: {
    type: String,
    enum: ['initiated', 'processing', 'partially_completed', 'completed', 'failed', 'refunded'],
    default: 'initiated'
  },
  amountByStatus: {
    pending: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    refunded: {
      type: Number,
      default: 0
    }
  },
  reconciliation: {
    reconciled: Boolean,
    reconciledAt: Date,
    discrepancy: Number,
    notes: String
  },
  refunds: [{
    paymentMethodIndex: Number,
    amount: Number,
    reason: String,
    refundId: String,
    initiatedAt: Date,
    completedAt: Date,
    status: String
  }],
  fees: {
    byMethod: [{
      methodIndex: Number,
      processingFee: Number,
      platformFee: Number,
      totalFee: Number
    }],
    total: Number
  },
  retryAttempts: [{
    paymentMethodIndex: Number,
    attemptNumber: Number,
    attemptedAt: Date,
    success: Boolean,
    errorMessage: String
  }],
  fallbackStrategy: {
    enabled: Boolean,
    fallbackMethods: [{
      method: String,
      priority: Number
    }]
  },
  notifications: [{
    type: {
      type: String,
      enum: ['payment_started', 'method_completed', 'method_failed', 'all_completed', 'requires_action']
    },
    sentAt: Date,
    channel: String
  }],
  audit: [{
    action: String,
    timestamp: Date,
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true, suppressReservedKeysWarning: true });

splitPaymentSchema.index({ user: 1, status: 1 });
splitPaymentSchema.index({ status: 1, createdAt: -1 });

const SplitPayment = mongoose.model('SplitPayment', splitPaymentSchema);
export default SplitPayment;
export { SplitPayment };
