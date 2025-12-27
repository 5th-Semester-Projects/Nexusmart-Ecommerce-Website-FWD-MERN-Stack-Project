import mongoose from 'mongoose';

const quoteManagementSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quoteNumber: {
    type: String,
    required: true,
    unique: true
  },
  rfq: {
    title: String,
    description: String,
    category: String,
    quantity: Number,
    targetPrice: Number,
    deliveryDate: Date,
    specifications: mongoose.Schema.Types.Mixed,
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    description: String,
    quantity: {
      type: Number,
      required: true
    },
    unitPrice: Number,
    discount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed']
      },
      value: Number
    },
    tax: Number,
    totalPrice: Number,
    specifications: mongoose.Schema.Types.Mixed
  }],
  pricing: {
    subtotal: Number,
    discount: Number,
    tax: Number,
    shipping: Number,
    total: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  terms: {
    paymentTerms: String,
    deliveryTerms: String,
    warranty: String,
    validUntil: Date,
    minimumOrder: Number,
    leadTime: Number
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'negotiating', 'accepted', 'rejected', 'expired', 'converted'],
    default: 'draft'
  },
  workflow: [{
    stage: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: String,
    timestamp: Date,
    notes: String
  }],
  approvals: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    level: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    timestamp: Date,
    comments: String
  }],
  negotiations: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    proposedChanges: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  convertedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, {
  timestamps: true
});

quoteManagementSchema.index({ business: 1 });
quoteManagementSchema.index({ status: 1 });

export default mongoose.model('QuoteManagement', quoteManagementSchema);
