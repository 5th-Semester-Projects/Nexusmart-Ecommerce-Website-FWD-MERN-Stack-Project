import mongoose from 'mongoose';

const qrPaymentSchema = new mongoose.Schema({
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  qrImage: String,
  type: {
    type: String,
    enum: ['static', 'dynamic'],
    default: 'dynamic'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'bhim', 'paytm', 'phonepe', 'gpay', 'multi'],
    required: true
  },
  merchant: {
    name: String,
    vpa: String, // UPI ID
    merchantId: String
  },
  amount: {
    fixed: Boolean,
    value: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  reference: String,
  description: String,
  transactions: [{
    transactionId: String,
    utr: String, // Unique Transaction Reference
    payer: {
      vpa: String,
      name: String
    },
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'success', 'failed']
    },
    timestamp: Date
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'cancelled'],
    default: 'active'
  },
  analytics: {
    scans: { type: Number, default: 0 },
    payments: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }
  },
  expiresAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

qrPaymentSchema.index({ qrCode: 1 });
qrPaymentSchema.index({ order: 1 });
qrPaymentSchema.index({ status: 1 });

const QRPayment = mongoose.model('QRPayment', qrPaymentSchema);
export default QRPayment;
export { QRPayment };
