import mongoose from 'mongoose';

const preOrderBackorderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Pre-Order Configuration
  preOrder: {
    enabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['pre-order', 'pre-launch', 'coming-soon'],
      default: 'pre-order'
    },
    startDate: Date,
    endDate: Date,
    estimatedDelivery: {
      date: Date,
      description: String
    },
    maxQuantity: Number,
    currentQuantity: {
      type: Number,
      default: 0
    },
    pricing: {
      regularPrice: Number,
      preOrderPrice: Number,
      discount: Number,
      discountPercentage: Number
    },
    paymentOptions: {
      fullPayment: {
        enabled: {
          type: Boolean,
          default: true
        },
        discount: Number
      },
      deposit: {
        enabled: {
          type: Boolean,
          default: false
        },
        amount: Number,
        percentage: Number,
        remainingPaymentDue: {
          type: String,
          enum: ['on-shipping', 'before-delivery', 'custom-date']
        },
        dueDate: Date
      }
    },
    restrictions: {
      maxPerCustomer: Number,
      minOrderQuantity: {
        type: Number,
        default: 1
      }
    }
  },

  // Backorder Configuration
  backorder: {
    enabled: {
      type: Boolean,
      default: false
    },
    maxQuantity: Number,
    currentQuantity: {
      type: Number,
      default: 0
    },
    estimatedRestockDate: Date,
    autoNotify: {
      type: Boolean,
      default: true
    },
    priority: {
      type: String,
      enum: ['fifo', 'vip-first', 'highest-quantity'],
      default: 'fifo'
    },
    allowPartialFulfillment: {
      type: Boolean,
      default: false
    }
  },

  // Waitlist Management
  waitlist: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['pre-order', 'backorder', 'notify-when-available'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    variant: {
      size: String,
      color: String,
      material: String
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    priority: {
      type: Number,
      default: 0
    },
    notified: {
      type: Boolean,
      default: false
    },
    notificationSent: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'push']
      },
      sentAt: Date,
      opened: Boolean
    }],
    status: {
      type: String,
      enum: ['waiting', 'notified', 'purchased', 'expired', 'cancelled'],
      default: 'waiting'
    },
    expiresAt: Date,
    notes: String
  }],

  // Orders
  orders: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    quantity: Number,
    type: {
      type: String,
      enum: ['pre-order', 'backorder']
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'deposit-paid', 'fully-paid', 'refunded'],
      default: 'pending'
    },
    paidAmount: Number,
    remainingAmount: Number,
    orderDate: {
      type: Date,
      default: Date.now
    },
    estimatedShipDate: Date,
    actualShipDate: Date,
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    }
  }],

  // Inventory Allocation
  inventoryAllocation: {
    totalAllocated: {
      type: Number,
      default: 0
    },
    allocations: [{
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      quantity: Number,
      allocatedAt: {
        type: Date,
        default: Date.now
      },
      fulfilled: {
        type: Boolean,
        default: false
      },
      fulfilledAt: Date
    }],
    reservedStock: {
      type: Number,
      default: 0
    },
    availableForAllocation: {
      type: Number,
      default: 0
    }
  },

  // Notifications
  notifications: {
    autoNotify: {
      type: Boolean,
      default: true
    },
    templates: {
      preOrderConfirmation: {
        enabled: {
          type: Boolean,
          default: true
        },
        subject: String,
        body: String
      },
      estimatedDateUpdate: {
        enabled: {
          type: Boolean,
          default: true
        },
        subject: String,
        body: String
      },
      readyToShip: {
        enabled: {
          type: Boolean,
          default: true
        },
        subject: String,
        body: String
      },
      backInStock: {
        enabled: {
          type: Boolean,
          default: true
        },
        subject: String,
        body: String
      },
      paymentReminder: {
        enabled: {
          type: Boolean,
          default: true
        },
        subject: String,
        body: String,
        daysBeforeDue: {
          type: Number,
          default: 3
        }
      }
    },
    sentNotifications: [{
      type: String,
      recipients: Number,
      sentAt: {
        type: Date,
        default: Date.now
      },
      subject: String,
      openRate: Number,
      clickRate: Number
    }]
  },

  // Analytics
  analytics: {
    totalPreOrders: {
      type: Number,
      default: 0
    },
    totalBackorders: {
      type: Number,
      default: 0
    },
    waitlistSize: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageWaitTime: {
      type: Number,
      default: 0
    },
    cancellationRate: {
      type: Number,
      default: 0
    },
    revenue: {
      preOrder: {
        type: Number,
        default: 0
      },
      backorder: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    },
    fulfillmentRate: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    }
  },

  // Stock Updates
  stockUpdates: [{
    previousStock: Number,
    newStock: Number,
    difference: Number,
    updateType: {
      type: String,
      enum: ['restock', 'allocation', 'adjustment', 'fulfillment']
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Fulfillment Schedule
  fulfillmentSchedule: [{
    batchName: String,
    expectedDate: Date,
    quantity: Number,
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'delayed'],
      default: 'scheduled'
    },
    ordersToFulfill: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }],
    actualDate: Date,
    notes: String
  }],

  // Settings
  settings: {
    allowCancellation: {
      type: Boolean,
      default: true
    },
    cancellationDeadline: {
      type: String,
      enum: ['anytime', 'before-shipping', 'custom-date'],
      default: 'before-shipping'
    },
    customCancellationDate: Date,
    refundPolicy: {
      fullRefund: {
        type: Boolean,
        default: true
      },
      cancellationFee: Number,
      cancellationFeePercentage: Number
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
preOrderBackorderSchema.index({ product: 1, seller: 1 });
preOrderBackorderSchema.index({ 'waitlist.user': 1 });

// Methods
preOrderBackorderSchema.methods.addToWaitlist = function (userData) {
  const priority = this.waitlist.length + 1;

  this.waitlist.push({
    user: userData.userId,
    type: userData.type,
    quantity: userData.quantity,
    variant: userData.variant || {},
    priority: priority,
    expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))
  });

  this.analytics.waitlistSize = this.waitlist.length;

  return this.save();
};

preOrderBackorderSchema.methods.notifyWaitlist = async function (quantity) {
  const availableSlots = quantity;
  const notifyList = this.waitlist
    .filter(item => item.status === 'waiting')
    .sort((a, b) => a.priority - b.priority)
    .slice(0, availableSlots);

  for (const item of notifyList) {
    item.status = 'notified';
    item.notified = true;
    item.notificationSent.push({
      type: 'email',
      sentAt: Date.now(),
      opened: false
    });
  }

  return this.save();
};

preOrderBackorderSchema.methods.fulfillOrder = function (orderId) {
  const order = this.orders.find(o => o.order.toString() === orderId.toString());

  if (order) {
    order.fulfillmentStatus = 'shipped';
    order.actualShipDate = Date.now();
  }

  const allocation = this.inventoryAllocation.allocations.find(
    a => a.order.toString() === orderId.toString()
  );

  if (allocation) {
    allocation.fulfilled = true;
    allocation.fulfilledAt = Date.now();
  }

  return this.save();
};

// Statics
preOrderBackorderSchema.statics.getActivePreOrders = function (sellerId) {
  return this.find({
    seller: sellerId,
    'preOrder.enabled': true,
    'preOrder.endDate': { $gte: new Date() }
  })
    .populate('product');
};

preOrderBackorderSchema.statics.getBackorderQueue = function (productId) {
  return this.findOne({ product: productId })
    .populate('waitlist.user orders.user');
};

const PreOrderBackorder = mongoose.model('PreOrderBackorder', preOrderBackorderSchema);

export default PreOrderBackorder;
