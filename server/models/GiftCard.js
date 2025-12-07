import mongoose from 'mongoose';

/**
 * Gift Card System Model
 */

const giftCardSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['digital', 'physical'],
    default: 'digital'
  },

  // Value
  initialBalance: {
    type: Number,
    required: true,
    min: 0
  },
  currentBalance: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'redeemed', 'expired', 'disabled'],
    default: 'active'
  },

  // Validity
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  activatedAt: Date,

  // Sender & Recipient
  purchasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recipientEmail: String,
  recipientName: String,
  senderName: String,
  personalMessage: String,

  // Delivery
  deliveryMethod: {
    type: String,
    enum: ['email', 'sms', 'print'],
    default: 'email'
  },
  deliveryDate: Date,
  delivered: { type: Boolean, default: false },

  // Design
  template: {
    type: String,
    default: 'default'
  },
  customImage: {
    public_id: String,
    url: String
  },

  // Redemption
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  redemptionHistory: [{
    date: { type: Date, default: Date.now },
    amount: Number,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    balanceAfter: Number
  }],

  // Restrictions
  minPurchaseAmount: { type: Number, default: 0 },
  maxUsagePerOrder: Number,
  applicableCategories: [String],
  excludedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // Metadata
  source: {
    type: String,
    enum: ['purchase', 'reward', 'refund', 'promotion', 'corporate'],
    default: 'purchase'
  },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

  createdAt: { type: Date, default: Date.now }
});

// Generate unique gift card code
giftCardSchema.statics.generateCode = function () {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Check if gift card is valid
giftCardSchema.methods.isValid = function () {
  if (this.status !== 'active') return false;
  if (this.currentBalance <= 0) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

// Use gift card
giftCardSchema.methods.redeem = async function (amount, orderId, userId) {
  if (!this.isValid()) {
    throw new Error('Gift card is not valid');
  }

  if (amount > this.currentBalance) {
    throw new Error('Insufficient balance');
  }

  this.currentBalance -= amount;
  this.redemptionHistory.push({
    amount,
    orderId,
    balanceAfter: this.currentBalance
  });

  if (!this.redeemedBy) {
    this.redeemedBy = userId;
  }

  if (this.currentBalance === 0) {
    this.status = 'redeemed';
  }

  await this.save();
  return this.currentBalance;
};

/**
 * Gift Wrapping Options
 */
const giftWrappingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    default: 0
  },
  image: {
    public_id: String,
    url: String
  },
  category: {
    type: String,
    enum: ['basic', 'premium', 'luxury', 'eco-friendly', 'seasonal'],
    default: 'basic'
  },
  includesCard: { type: Boolean, default: true },
  includesRibbon: { type: Boolean, default: true },
  color: String,
  isActive: { type: Boolean, default: true },
  availableFor: {
    type: String,
    enum: ['all', 'specific'],
    default: 'all'
  },
  applicableCategories: [String],
  createdAt: { type: Date, default: Date.now }
});

export const GiftCard = mongoose.model('GiftCard', giftCardSchema);
export const GiftWrapping = mongoose.model('GiftWrapping', giftWrappingSchema);
