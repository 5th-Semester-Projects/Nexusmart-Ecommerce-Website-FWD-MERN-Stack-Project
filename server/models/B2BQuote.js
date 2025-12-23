import mongoose from 'mongoose';

const b2bQuoteSchema = new mongoose.Schema({
  quoteNumber: {
    type: String,
    required: true,
    unique: true
  },
  rfq: {
    rfqNumber: String,
    receivedDate: Date,
    dueDate: Date,
    documents: [String]
  },
  buyer: {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    department: String,
    billingAddress: mongoose.Schema.Types.Mixed,
    shippingAddress: mongoose.Schema.Types.Mixed
  },
  seller: {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true
    },
    salesRep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    sku: String,
    description: String,
    quantity: {
      type: Number,
      required: true
    },
    unitPrice: Number,
    discount: {
      type: String,
      percentage: Number,
      amount: Number
    },
    tax: Number,
    totalPrice: Number,
    leadTime: Number, // days
    specifications: mongoose.Schema.Types.Mixed,
    customization: String
  }],
  pricing: {
    subtotal: Number,
    totalDiscount: Number,
    totalTax: Number,
    shippingCost: Number,
    handlingFee: Number,
    total: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  terms: {
    paymentTerms: {
      type: String,
      enum: ['net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'cod', 'advance', 'custom']
    },
    customPaymentTerms: String,
    deliveryTerms: String,
    incoterms: {
      type: String,
      enum: ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']
    },
    warranty: String,
    validUntil: {
      type: Date,
      required: true
    }
  },
  volumeDiscounts: [{
    minQuantity: Number,
    maxQuantity: Number,
    discountPercentage: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'negotiating', 'accepted', 'rejected', 'expired', 'converted'],
    default: 'draft'
  },
  workflow: {
    approvals: [{
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
      },
      comments: String,
      timestamp: Date
    }],
    currentStage: String,
    history: [{
      action: String,
      user: mongoose.Schema.Types.ObjectId,
      timestamp: Date,
      notes: String
    }]
  },
  negotiation: {
    rounds: [{
      roundNumber: Number,
      initiator: {
        type: String,
        enum: ['buyer', 'seller']
      },
      changes: mongoose.Schema.Types.Mixed,
      message: String,
      timestamp: Date
    }],
    buyerCounterOffer: mongoose.Schema.Types.Mixed,
    sellerCounterOffer: mongoose.Schema.Types.Mixed
  },
  attachments: [{
    filename: String,
    url: String,
    type: String,
    uploadedAt: Date
  }],
  notes: [{
    author: mongoose.Schema.Types.ObjectId,
    content: String,
    private: Boolean,
    timestamp: Date
  }],
  contract: {
    generated: Boolean,
    contractId: mongoose.Schema.Types.ObjectId,
    signedAt: Date
  },
  conversion: {
    convertedToOrder: Boolean,
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    convertedAt: Date
  }
}, {
  timestamps: true
});

b2bQuoteSchema.index({ quoteNumber: 1 });
b2bQuoteSchema.index({ 'buyer.company': 1, status: 1 });
b2bQuoteSchema.index({ 'seller.company': 1, createdAt: -1 });
b2bQuoteSchema.index({ status: 1, 'terms.validUntil': 1 });

const B2BQuote = mongoose.model('B2BQuote', b2bQuoteSchema);
export default B2BQuote;
export { B2BQuote };
