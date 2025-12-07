const mongoose = require('mongoose');

const offlinePaymentSchema = new mongoose.Schema({
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
  paymentMethod: {
    type: String,
    enum: ['cash', 'cheque', 'bank_transfer', 'demand_draft', 'money_order'],
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
  details: {
    chequeNumber: String,
    chequeDate: Date,
    bankName: String,
    branchName: String,
    accountNumber: String,
    ifscCode: String,
    transactionReference: String,
    ddNumber: String
  },
  proof: [{
    type: String,
    url: String,
    uploadedAt: Date
  }],
  verification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'on_hold'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    notes: String,
    rejectionReason: String
  },
  deposit: {
    depositedAt: Date,
    depositedBy: String,
    bankReference: String,
    cleared: Boolean,
    clearedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'cleared', 'bounced', 'cancelled'],
    default: 'pending'
  },
  notifications: [{
    type: String,
    sentAt: Date,
    recipient: String
  }]
}, {
  timestamps: true
});

offlinePaymentSchema.index({ order: 1 });
offlinePaymentSchema.index({ user: 1, status: 1 });
offlinePaymentSchema.index({ 'verification.status': 1 });

const OfflinePayment = mongoose.model('OfflinePayment', offlinePaymentSchema);
export default OfflinePayment;
export { OfflinePayment };
