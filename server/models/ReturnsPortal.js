const mongoose = require('mongoose');

const returnsPortalSchema = new mongoose.Schema({
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

  // Return request details
  returnNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Items to return
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    orderItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: Number,
    variant: {
      color: String,
      size: String,
      sku: String
    },
    reason: {
      type: String,
      enum: ['wrong_item', 'defective', 'not_as_described', 'size_issue', 'quality_issue', 'changed_mind', 'arrived_late', 'damaged', 'missing_parts', 'other'],
      required: true
    },
    detailedReason: String,
    images: [{
      url: String,
      type: {
        type: String,
        enum: ['defect', 'damage', 'package', 'label', 'other']
      },
      description: String
    }],
    videos: [{
      url: String,
      description: String
    }],
    condition: {
      type: String,
      enum: ['unopened', 'opened_unused', 'lightly_used', 'heavily_used', 'damaged'],
      required: true
    },
    tags: [String],
    packaging: {
      hasOriginal: Boolean,
      condition: String
    }
  }],

  // Return type
  returnType: {
    type: String,
    enum: ['refund', 'exchange', 'store_credit', 'replacement'],
    required: true
  },

  // Exchange details (if applicable)
  exchange: {
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      variant: {
        color: String,
        size: String,
        sku: String
      },
      price: Number
    }],
    priceDifference: Number,
    additionalPayment: Boolean
  },

  // Refund details
  refund: {
    method: {
      type: String,
      enum: ['original_payment', 'store_credit', 'gift_card', 'bank_transfer'],
      default: 'original_payment'
    },
    amount: {
      subtotal: Number,
      shippingRefund: Number,
      restockingFee: Number,
      total: Number
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    processedAt: Date,
    estimatedDate: Date,
    transactionId: String
  },

  // Status tracking
  status: {
    type: String,
    enum: [
      'requested',
      'pending_approval',
      'approved',
      'rejected',
      'awaiting_shipment',
      'in_transit',
      'received',
      'inspecting',
      'inspection_passed',
      'inspection_failed',
      'processing_refund',
      'completed',
      'cancelled'
    ],
    default: 'requested'
  },

  // Status history
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Approval/rejection
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  rejectionReason: String,
  autoApproved: {
    type: Boolean,
    default: false
  },

  // Return shipping
  returnShipping: {
    method: {
      type: String,
      enum: ['prepaid_label', 'customer_arranged', 'drop_off', 'pickup']
    },
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    labelUrl: String,
    labelGeneratedAt: Date,
    shippingCost: Number,
    paidBy: {
      type: String,
      enum: ['seller', 'customer', 'shared']
    },
    pickupScheduled: {
      date: Date,
      timeWindow: {
        start: String,
        end: String
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      }
    },
    dropOffLocation: {
      name: String,
      address: String,
      hours: String,
      phone: String
    }
  },

  // Return address
  returnAddress: {
    name: String,
    company: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },

  // Inspection results
  inspection: {
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    inspectedAt: Date,
    passed: Boolean,
    notes: String,
    images: [String],
    defectsFound: [{
      type: String,
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'major']
      },
      description: String
    }],
    conditionRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Communication
  messages: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fromType: {
      type: String,
      enum: ['customer', 'admin', 'system'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    attachments: [{
      url: String,
      type: String,
      name: String
    }],
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],

  // Notifications
  notifications: {
    sent: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'push']
      },
      event: String,
      sentAt: Date,
      status: String
    }],
    preferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },

  // Timeline
  timeline: [{
    event: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    icon: String,
    color: String
  }],

  // Policies applied
  policiesApplied: {
    returnWindow: Number, // days
    restockingFeePercent: Number,
    shippingRefundable: Boolean,
    freeReturnShipping: Boolean,
    exchangeAllowed: Boolean,
    storeCreditBonus: Number
  },

  // Quality assurance
  qualityCheck: {
    passed: Boolean,
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedAt: Date,
    checklist: [{
      item: String,
      status: Boolean,
      notes: String
    }]
  },

  // Fraud detection
  fraudCheck: {
    riskScore: {
      type: Number,
      min: 0,
      max: 100
    },
    flags: [{
      type: String,
      severity: String,
      description: String
    }],
    reviewRequired: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    reviewedAt: Date,
    cleared: Boolean
  },

  // Customer history context
  customerContext: {
    totalOrders: Number,
    totalReturns: Number,
    returnRate: Number,
    accountAge: Number,
    loyaltyTier: String,
    previousReturns: [{
      returnNumber: String,
      date: Date,
      reason: String
    }]
  },

  // Analytics
  analytics: {
    processingTime: Number, // hours
    resolutionTime: Number, // hours
    customerSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String,
      submittedAt: Date
    }
  },

  // Admin notes
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    priority: String,
    tags: [String]
  }],

  // Expiration
  expiresAt: Date,

  // Special handling
  specialHandling: {
    priority: {
      type: String,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal'
    },
    vipCustomer: {
      type: Boolean,
      default: false
    },
    expeditedProcessing: {
      type: Boolean,
      default: false
    },
    requiresApproval: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
returnsPortalSchema.index({ returnNumber: 1 });
returnsPortalSchema.index({ order: 1 });
returnsPortalSchema.index({ user: 1, createdAt: -1 });
returnsPortalSchema.index({ status: 1 });
returnsPortalSchema.index({ 'returnShipping.trackingNumber': 1 });

// Virtual for total refund amount
returnsPortalSchema.virtual('totalRefundAmount').get(function () {
  return this.refund.amount.total || 0;
});

// Method to update status
returnsPortalSchema.methods.updateStatus = function (newStatus, notes, updatedBy) {
  this.statusHistory.push({
    status: newStatus,
    timestamp: Date.now(),
    notes,
    updatedBy
  });

  this.status = newStatus;

  this.timeline.push({
    event: newStatus,
    description: notes || `Return status changed to ${newStatus}`,
    timestamp: Date.now()
  });
};

// Method to approve return
returnsPortalSchema.methods.approve = function (adminId) {
  this.status = 'approved';
  this.reviewedBy = adminId;
  this.reviewedAt = Date.now();
  this.updateStatus('approved', 'Return request approved', adminId);
};

// Method to reject return
returnsPortalSchema.methods.reject = function (adminId, reason) {
  this.status = 'rejected';
  this.reviewedBy = adminId;
  this.reviewedAt = Date.now();
  this.rejectionReason = reason;
  this.updateStatus('rejected', reason, adminId);
};

// Method to calculate refund
returnsPortalSchema.methods.calculateRefund = function () {
  let subtotal = 0;

  this.items.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  const restockingFee = this.policiesApplied.restockingFeePercent
    ? (subtotal * this.policiesApplied.restockingFeePercent / 100)
    : 0;

  const shippingRefund = this.policiesApplied.shippingRefundable
    ? (this.order?.shippingCost || 0)
    : 0;

  this.refund.amount = {
    subtotal,
    shippingRefund,
    restockingFee,
    total: subtotal + shippingRefund - restockingFee
  };
};

// Static method to get pending returns
returnsPortalSchema.statics.getPendingReturns = function () {
  return this.find({
    status: { $in: ['requested', 'pending_approval'] }
  })
    .sort({ createdAt: 1 })
    .populate('order user');
};

const ReturnsPortal = mongoose.model('ReturnsPortal', returnsPortalSchema);`nexport default ReturnsPortal;`nexport { ReturnsPortal };
