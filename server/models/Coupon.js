import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required'],
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative'],
  },
  minPurchase: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: null, // null means no limit
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  userUsageLimit: {
    type: Number,
    default: 1, // How many times a single user can use
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  startDate: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPublic: {
    type: Boolean,
    default: true, // If false, only shareable via direct link
  },
  newUsersOnly: {
    type: Boolean,
    default: false,
  },
  firstOrderOnly: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Check if coupon is valid
couponSchema.methods.isValid = function (userId, cartTotal, userOrderCount = 0) {
  const now = new Date();

  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'This coupon is no longer active' };
  }

  // Check date validity
  if (this.startDate > now) {
    return { valid: false, message: 'This coupon is not yet active' };
  }

  if (this.expiresAt < now) {
    return { valid: false, message: 'This coupon has expired' };
  }

  // Check usage limit
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return { valid: false, message: 'This coupon has reached its usage limit' };
  }

  // Check minimum purchase
  if (cartTotal < this.minPurchase) {
    return {
      valid: false,
      message: `Minimum purchase of Rs. ${this.minPurchase.toLocaleString()} required`
    };
  }

  // Check user usage limit
  if (userId) {
    const userUsage = this.usedBy.filter(u => u.user.toString() === userId.toString()).length;
    if (userUsage >= this.userUsageLimit) {
      return { valid: false, message: 'You have already used this coupon' };
    }
  }

  // Check first order only
  if (this.firstOrderOnly && userOrderCount > 0) {
    return { valid: false, message: 'This coupon is only valid for first orders' };
  }

  return { valid: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function (cartTotal) {
  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (cartTotal * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }

  // Apply max discount limit if set
  if (this.maxDiscount && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }

  // Ensure discount doesn't exceed cart total
  if (discount > cartTotal) {
    discount = cartTotal;
  }

  return Math.round(discount);
};

// Record usage
couponSchema.methods.recordUsage = async function (userId, orderId) {
  this.usedBy.push({
    user: userId,
    orderId: orderId,
    usedAt: new Date(),
  });
  this.usageCount += 1;
  await this.save();
};

// Static method to find valid public coupons
couponSchema.statics.findPublicCoupons = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    isPublic: true,
    startDate: { $lte: now },
    expiresAt: { $gt: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
    ],
  }).sort({ discountValue: -1 });
};

// Index for faster queries
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, isPublic: 1, expiresAt: 1 });

export default mongoose.model('Coupon', couponSchema);
