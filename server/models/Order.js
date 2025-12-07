import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // Order Information
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Order Items
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        image: String,
        price: {
          type: Number,
          required: true,
        },
        variant: {
          color: String,
          size: String,
          sku: String,
        },
        discount: {
          type: Number,
          default: 0,
        },
        finalPrice: {
          type: Number,
          required: true,
        },
      },
    ],

    // Shipping Information
    shippingInfo: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: String,
      phone: {
        type: String,
        required: true,
      },
      address: {
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
        zipCode: {
          type: String,
          required: true,
        },
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      // Saved address reference
      savedAddressId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },

    // Delivery Time Slot
    deliveryTimeSlot: {
      date: {
        type: Date,
      },
      slot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'any'],
        default: 'any',
      },
      slotLabel: {
        type: String, // e.g., "Morning (9AM - 12PM)"
      },
    },

    // Shipping Method & Calculator
    shippingMethod: {
      type: {
        type: String,
        enum: ['standard', 'express', 'same-day', 'pickup'],
        default: 'standard',
      },
      name: {
        type: String,
        default: 'Standard Delivery',
      },
      estimatedDays: {
        min: { type: Number, default: 3 },
        max: { type: Number, default: 7 },
      },
      cost: {
        type: Number,
        default: 0,
      },
    },

    // Area-based shipping zone
    shippingZone: {
      zone: {
        type: String,
        enum: ['local', 'regional', 'national', 'international'],
        default: 'national',
      },
      city: String,
      baseRate: Number,
      additionalRate: Number,
    },

    // Payment Information
    paymentInfo: {
      method: {
        type: String,
        enum: ['card', 'upi', 'wallet', 'cod', 'netbanking'],
        required: true,
      },
      provider: {
        type: String,
        enum: ['stripe', 'razorpay', 'cod'],
        required: true,
      },
      transactionId: String,
      paymentId: String,
      orderId: String,
      signature: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      paidAt: Date,
    },

    // Pricing Breakdown
    pricing: {
      itemsPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      taxPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      shippingPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      discountPrice: {
        type: Number,
        default: 0,
      },
      totalPrice: {
        type: Number,
        required: true,
        default: 0,
      },
    },

    // Discount & Coupons
    coupon: {
      code: String,
      discount: Number,
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
    },

    // Order Status & Tracking
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'out-for-delivery',
        'delivered',
        'cancelled',
        'returned',
        'refunded',
      ],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // Shipping & Delivery
    shippingProvider: String,
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date,

    // Return & Refund
    returnRequest: {
      requested: {
        type: Boolean,
        default: false,
      },
      reason: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
      },
      requestedAt: Date,
      approvedAt: Date,
      rejectedReason: String,
      refundAmount: Number,
      refundedAt: Date,
    },

    // Invoice
    invoice: {
      invoiceNumber: String,
      invoiceUrl: String,
      generatedAt: Date,
    },

    // Notes & Communication
    customerNotes: String,
    internalNotes: String,

    // Cancellation
    cancellation: {
      cancelled: {
        type: Boolean,
        default: false,
      },
      cancelledBy: {
        type: String,
        enum: ['customer', 'admin', 'system'],
      },
      reason: String,
      cancelledAt: Date,
    },

    // Ratings & Review
    hasReview: {
      type: Boolean,
      default: false,
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Note: orderNumber already has unique: true which creates index automatically
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'paymentInfo.status': 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Add status to history when order status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
    });
  }
  next();
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function () {
  const cancellableStatuses = ['pending', 'confirmed', 'processing'];
  return cancellableStatuses.includes(this.orderStatus);
};

// Method to check if order can be returned
orderSchema.methods.canBeReturned = function () {
  if (this.orderStatus !== 'delivered') return false;

  const deliveryDate = new Date(this.deliveredAt);
  const currentDate = new Date();
  const daysSinceDelivery = Math.floor(
    (currentDate - deliveryDate) / (1000 * 60 * 60 * 24)
  );

  return daysSinceDelivery <= 30; // 30-day return policy
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function (userId) {
  return await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$pricing.totalPrice' },
      },
    },
  ]);
};

const Order = mongoose.model('Order', orderSchema);
export default Order;
export { Order };
