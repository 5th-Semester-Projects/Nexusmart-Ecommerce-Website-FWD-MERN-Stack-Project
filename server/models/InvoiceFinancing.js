import mongoose from 'mongoose';

const invoiceFinancingSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoice: {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    paymentTerms: {
      type: String,
      enum: ['net30', 'net60', 'net90', 'custom'],
      default: 'net30'
    }
  },
  financing: {
    requested: {
      type: Boolean,
      default: false
    },
    requestedAt: Date,
    approved: {
      type: Boolean,
      default: false
    },
    approvedAt: Date,
    approvedBy: String,
    advanceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    advanceAmount: Number,
    feeRate: {
      type: Number,
      default: 2
    },
    feeAmount: Number,
    netAmount: Number,
    disbursedAt: Date,
    paymentMethod: String,
    transactionId: String
  },
  repayment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'complete', 'defaulted'],
      default: 'pending'
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    remainingAmount: Number,
    payments: [{
      amount: Number,
      paidAt: Date,
      method: String,
      transactionId: String
    }],
    completedAt: Date
  },
  riskAssessment: {
    creditScore: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    factors: [{
      factor: String,
      impact: String,
      score: Number
    }],
    assessedAt: Date
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'funded', 'repaid', 'defaulted', 'cancelled'],
    default: 'draft'
  },
  documents: [{
    type: {
      type: String,
      enum: ['invoice', 'purchase_order', 'delivery_receipt', 'contract']
    },
    url: String,
    uploadedAt: Date
  }]
}, {
  timestamps: true, suppressReservedKeysWarning: true });

invoiceFinancingSchema.index({ business: 1 });
invoiceFinancingSchema.index({ status: 1 });
invoiceFinancingSchema.index({ 'invoice.dueDate': 1 });

export default mongoose.model('InvoiceFinancing', invoiceFinancingSchema);
