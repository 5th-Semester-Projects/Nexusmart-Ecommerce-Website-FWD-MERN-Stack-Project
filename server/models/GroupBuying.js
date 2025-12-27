import mongoose from 'mongoose';

const groupBuyingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  pricingTiers: [{
    minQuantity: {
      type: Number,
      required: true
    },
    maxQuantity: Number,
    pricePerUnit: {
      type: Number,
      required: true
    },
    discountPercentage: Number
  }],
  currentPrice: Number,
  targetQuantity: {
    type: Number,
    required: true
  },
  currentQuantity: {
    type: Number,
    default: 0
  },
  maxQuantity: Number,
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    committed: {
      type: Boolean,
      default: false
    },
    paid: {
      type: Boolean,
      default: false
    },
    paidAt: Date,
    amount: Number,
    transactionId: String
  }],
  timeline: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    fulfillmentDate: Date
  },
  status: {
    type: String,
    enum: ['open', 'reached_target', 'closed', 'processing', 'shipped', 'completed', 'cancelled'],
    default: 'open'
  },
  rules: {
    minPerUser: {
      type: Number,
      default: 1
    },
    maxPerUser: Number,
    autoCloseOnTarget: {
      type: Boolean,
      default: true
    },
    refundIfFailed: {
      type: Boolean,
      default: true
    }
  },
  shipping: {
    method: String,
    consolidatedAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    individualShipping: {
      type: Boolean,
      default: false
    },
    estimatedCost: Number,
    actualCost: Number
  },
  communication: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    isAnnouncement: Boolean
  }],
  milestones: [{
    percentage: Number,
    reached: Boolean,
    reachedAt: Date,
    message: String
  }]
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

groupBuyingSchema.index({ product: 1 });
groupBuyingSchema.index({ organizer: 1 });
groupBuyingSchema.index({ status: 1 });
groupBuyingSchema.index({ 'timeline.endDate': 1 });

export default mongoose.model('GroupBuying', groupBuyingSchema);
