import mongoose from 'mongoose';

const flashSaleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    originalPrice: Number,
    salePrice: Number,
    discountPercentage: Number,
    quantity: {
      total: Number,
      sold: { type: Number, default: 0 },
      remaining: Number
    },
    maxPerUser: { type: Number, default: 5 }
  }],
  timing: {
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    timezone: { type: String, default: 'UTC' },
    duration: Number
  },
  visibility: {
    isPublic: { type: Boolean, default: true },
    previewEnabled: { type: Boolean, default: false },
    previewStartTime: Date,
    allowedUserGroups: [String]
  },
  restrictions: {
    minCartValue: Number,
    maxCartValue: Number,
    eligibleCountries: [String],
    newUsersOnly: { type: Boolean, default: false },
    requiresCoupon: { type: Boolean, default: false },
    couponCode: String
  },
  notifications: {
    emailReminder: { type: Boolean, default: true },
    pushNotification: { type: Boolean, default: true },
    reminderBefore: { type: Number, default: 1 }
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'ended', 'cancelled'],
    default: 'draft'
  },
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    addToCarts: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    uniqueCustomers: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true, suppressReservedKeysWarning: true });

flashSaleSchema.index({ 'timing.startTime': 1, 'timing.endTime': 1 });
flashSaleSchema.index({ status: 1 });

export default mongoose.model('FlashSale', flashSaleSchema);
