const mongoose = require('mongoose');

const emiSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
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
  downPayment: {
    type: Number,
    default: 0
  },
  loanAmount: {
    type: Number,
    required: true
  },
  tenure: {
    type: Number,
    required: true // months
  },
  interestRate: {
    type: Number,
    required: true // percentage per annum
  },
  processingFee: {
    type: Number,
    default: 0
  },
  emiAmount: {
    type: Number,
    required: true // monthly EMI
  },
  totalPayable: Number,
  provider: {
    type: String,
    enum: ['bank', 'card_issuer', 'third_party'],
    required: true
  },
  providerName: String,
  installments: [{
    installmentNumber: Number,
    dueDate: Date,
    amount: Number,
    principal: Number,
    interest: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'failed'],
      default: 'pending'
    },
    paidDate: Date,
    paidAmount: Number,
    paymentMethod: String,
    transactionId: String,
    lateFee: { type: Number, default: 0 }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'defaulted', 'cancelled'],
    default: 'active'
  },
  autoDebit: {
    enabled: Boolean,
    bankAccount: String,
    failureCount: { type: Number, default: 0 }
  },
  penalties: {
    lateFees: { type: Number, default: 0 },
    bounceCharges: { type: Number, default: 0 }
  },
  agreement: {
    url: String,
    signedAt: Date,
    ipAddress: String
  },
  creditCheck: {
    score: Number,
    status: String,
    checkedAt: Date
  }
}, {
  timestamps: true
});

emiSchema.index({ user: 1, status: 1 });
emiSchema.index({ order: 1 });

module.exports = mongoose.model('EMI', emiSchema);
