import mongoose from 'mongoose';

const installmentPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  downPayment: {
    amount: Number,
    paidAt: Date,
    transactionId: String
  },
  numberOfInstallments: {
    type: Number,
    required: true,
    min: 2,
    max: 36
  },
  installmentAmount: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    default: 0
  },
  totalInterest: Number,
  totalPayable: Number,
  installments: [{
    number: Number,
    amount: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'skipped'],
      default: 'pending'
    },
    paidAmount: Number,
    paidAt: Date,
    transactionId: String,
    lateFee: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'defaulted', 'cancelled'],
    default: 'active'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  autoPayEnabled: {
    type: Boolean,
    default: false
  },
  reminders: [{
    installmentNumber: Number,
    sentAt: Date,
    channel: {
      type: String,
      enum: ['email', 'sms', 'push']
    }
  }],
  provider: {
    name: String,
    terms: String,
    fee: Number
  }
}, {
  timestamps: true
});

installmentPlanSchema.index({ user: 1 });
installmentPlanSchema.index({ order: 1 });
installmentPlanSchema.index({ status: 1 });
installmentPlanSchema.index({ 'installments.dueDate': 1 });

export default mongoose.models.InstallmentPlan || mongoose.model('InstallmentPlan', installmentPlanSchema);
