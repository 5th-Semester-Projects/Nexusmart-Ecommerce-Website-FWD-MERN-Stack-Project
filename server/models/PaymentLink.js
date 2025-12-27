import mongoose from 'mongoose';

const paymentLinkSchema = new mongoose.Schema({
  linkId: {
    type: String,
    required: true,
    unique: true
  },
  shortUrl: {
    type: String,
    unique: true
  },
  type: {
    type: String,
    enum: ['invoice', 'order', 'custom', 'subscription', 'donation'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  description: String,
  customer: {
    name: String,
    email: String,
    phone: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  invoice: {
    invoiceNumber: String,
    invoiceDate: Date,
    dueDate: Date,
    items: [{
      description: String,
      quantity: Number,
      rate: Number,
      amount: Number
    }]
  },
  paymentMethods: [{
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'emi']
  }],
  settings: {
    partialPayment: Boolean,
    minimumAmount: Number,
    reminder: Boolean,
    reminderSchedule: [Date],
    customization: {
      logo: String,
      theme: String,
      message: String
    }
  },
  status: {
    type: String,
    enum: ['active', 'paid', 'partially_paid', 'expired', 'cancelled'],
    default: 'active'
  },
  payments: [{
    transactionId: String,
    amount: Number,
    method: String,
    status: String,
    paidAt: Date
  }],
  paidAmount: {
    type: Number,
    default: 0
  },
  balanceAmount: Number,
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 }
  },
  expiresAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

paymentLinkSchema.index({ linkId: 1 });
paymentLinkSchema.index({ shortUrl: 1 });
paymentLinkSchema.index({ status: 1 });
paymentLinkSchema.index({ 'customer.email': 1 });

const PaymentLink = mongoose.model('PaymentLink', splitPaymentSchema);
export default PaymentLink;
export { PaymentLink };
