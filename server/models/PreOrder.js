import mongoose from 'mongoose';

const preOrderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricing: {
    unitPrice: Number,
    totalPrice: Number,
    deposit: {
      required: {
        type: Boolean,
        default: false
      },
      amount: Number,
      percentage: Number,
      paid: {
        type: Boolean,
        default: false
      },
      paidAt: Date
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  availability: {
    expectedReleaseDate: Date,
    estimatedShipDate: Date,
    notifyOnAvailability: {
      type: Boolean,
      default: true
    }
  },
  payment: {
    method: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'deposit_paid', 'fully_paid', 'refunded', 'failed'],
      default: 'pending'
    }
  },
  fulfillment: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    shippingAddress: {
      name: String,
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      phone: String
    },
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date
  },
  notifications: [{
    type: String,
    message: String,
    sentAt: Date,
    read: {
      type: Boolean,
      default: false
    }
  }],
  cancellation: {
    canCancel: {
      type: Boolean,
      default: true
    },
    cancelledAt: Date,
    cancelReason: String,
    refundAmount: Number,
    refundStatus: String
  },
  status: {
    type: String,
    enum: ['active', 'confirmed', 'cancelled', 'fulfilled', 'refunded'],
    default: 'active'
  }
}, { timestamps: true, suppressReservedKeysWarning: true });

preOrderSchema.index({ product: 1, user: 1 });
preOrderSchema.index({ status: 1 });
preOrderSchema.index({ 'availability.expectedReleaseDate': 1 });

export default mongoose.model('PreOrder', preOrderSchema);
