import mongoose from 'mongoose';

/**
 * Subscription Box System Model
 * Handles recurring subscription products
 */

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  interval: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  intervalCount: {
    type: Number,
    default: 1
  },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }],
  category: String,
  image: {
    public_id: String,
    url: String
  },
  features: [String],
  maxSubscribers: Number,
  currentSubscribers: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  trialDays: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const userSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired', 'trial'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  nextBillingDate: Date,
  trialEndDate: Date,
  cancelledAt: Date,
  pausedAt: Date,
  resumeDate: Date,

  // Payment info
  paymentMethod: {
    type: { type: String, enum: ['card', 'paypal', 'crypto'] },
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  stripeSubscriptionId: String,

  // Shipping preferences
  shippingAddress: {
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    phone: String
  },

  // Customization
  preferences: {
    size: String,
    color: String,
    allergies: [String],
    notes: String
  },

  // History
  billingHistory: [{
    date: Date,
    amount: Number,
    status: { type: String, enum: ['paid', 'failed', 'refunded', 'pending'] },
    invoiceId: String,
    paymentIntentId: String
  }],

  deliveryHistory: [{
    date: Date,
    trackingNumber: String,
    carrier: String,
    status: String,
    products: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number
    }]
  }],

  // Rewards
  loyaltyPoints: { type: Number, default: 0 },
  referralCode: String,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate next billing date
userSubscriptionSchema.methods.calculateNextBillingDate = function () {
  const intervals = {
    weekly: 7,
    monthly: 30,
    quarterly: 90,
    yearly: 365
  };

  const days = intervals[this.plan.interval] * (this.plan.intervalCount || 1);
  const nextDate = new Date(this.currentPeriodEnd || this.startDate);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};

// Check if subscription is in trial
userSubscriptionSchema.methods.isInTrial = function () {
  if (!this.trialEndDate) return false;
  return new Date() < this.trialEndDate;
};

export const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
export const Subscription = SubscriptionPlan; // Alias for backwards compatibility
export const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);
