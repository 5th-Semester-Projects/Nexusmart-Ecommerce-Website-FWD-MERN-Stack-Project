import mongoose from 'mongoose';
import crypto from 'crypto';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  name: {
    type: String,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isSubscribed: {
    type: Boolean,
    default: true,
  },
  preferences: {
    promotions: { type: Boolean, default: true },
    newArrivals: { type: Boolean, default: true },
    stockAlerts: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
  },
  source: {
    type: String,
    enum: ['website', 'checkout', 'popup', 'footer', 'import'],
    default: 'website',
  },
  ipAddress: String,
  userAgent: String,
  unsubscribeToken: {
    type: String,
    unique: true,
  },
  unsubscribedAt: Date,
  confirmedAt: Date,
  confirmationToken: String,
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  tags: [String],
  metadata: {
    type: Map,
    of: String,
  },
}, {
  timestamps: true,
});

// Generate tokens before saving
newsletterSchema.pre('save', function (next) {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  }
  if (!this.confirmationToken && !this.isConfirmed) {
    this.confirmationToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Method to confirm subscription
newsletterSchema.methods.confirm = async function () {
  this.isConfirmed = true;
  this.confirmedAt = new Date();
  this.confirmationToken = undefined;
  await this.save();
};

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = async function () {
  this.isSubscribed = false;
  this.unsubscribedAt = new Date();
  await this.save();
};

// Method to resubscribe
newsletterSchema.methods.resubscribe = async function () {
  this.isSubscribed = true;
  this.unsubscribedAt = undefined;
  await this.save();
};

// Static method to get active subscribers
newsletterSchema.statics.getActiveSubscribers = function (preferences = {}) {
  const query = {
    isSubscribed: true,
    isConfirmed: true,
  };

  // Add preference filters
  Object.entries(preferences).forEach(([key, value]) => {
    if (value) {
      query[`preferences.${key}`] = true;
    }
  });

  return this.find(query).select('email name preferences');
};

// Static method to get subscriber stats
newsletterSchema.statics.getStats = async function () {
  const [
    total,
    active,
    unsubscribed,
    unconfirmed,
    sourceStats,
  ] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ isSubscribed: true, isConfirmed: true }),
    this.countDocuments({ isSubscribed: false }),
    this.countDocuments({ isConfirmed: false }),
    this.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
  ]);

  return {
    total,
    active,
    unsubscribed,
    unconfirmed,
    bySource: sourceStats.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {}),
  };
};

export default mongoose.model('Newsletter', newsletterSchema);
