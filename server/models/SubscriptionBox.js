import mongoose from 'mongoose';

const subscriptionBoxSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['curated', 'replenishment', 'access', 'surprise'],
    default: 'curated'
  },
  category: String,
  pricing: {
    monthly: Number,
    quarterly: Number,
    semiAnnual: Number,
    annual: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    },
    isOptional: {
      type: Boolean,
      default: false
    }
  }],
  customization: {
    allowCustomization: {
      type: Boolean,
      default: false
    },
    options: [{
      name: String,
      choices: [String],
      required: Boolean
    }]
  },
  shipping: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    freeShipping: {
      type: Boolean,
      default: true
    },
    shippingFee: Number
  },
  subscribers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    plan: {
      type: String,
      enum: ['monthly', 'quarterly', 'semiAnnual', 'annual']
    },
    startDate: Date,
    nextDelivery: Date,
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active'
    },
    customizations: mongoose.Schema.Types.Mixed
  }],
  benefits: [String],
  images: [String],
  status: {
    type: String,
    enum: ['draft', 'active', 'soldout', 'discontinued'],
    default: 'draft'
  },
  analytics: {
    totalSubscribers: {
      type: Number,
      default: 0
    },
    activeSubscribers: {
      type: Number,
      default: 0
    },
    churnRate: {
      type: Number,
      default: 0
    },
    monthlyRevenue: {
      type: Number,
      default: 0
    },
    averageLifetimeValue: Number
  }
}, { timestamps: true });

subscriptionBoxSchema.index({ status: 1 });
subscriptionBoxSchema.index({ category: 1 });

export default mongoose.model('SubscriptionBox', subscriptionBoxSchema);
