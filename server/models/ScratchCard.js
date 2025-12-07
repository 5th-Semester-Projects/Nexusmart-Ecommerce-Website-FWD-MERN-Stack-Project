const mongoose = require('mongoose');

const scratchCardSchema = new mongoose.Schema({
  campaign: {
    name: String,
    description: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardCode: {
    type: String,
    required: true,
    unique: true
  },
  reward: {
    type: {
      type: String,
      enum: ['discount', 'cashback', 'points', 'free_product', 'free_shipping', 'coupon', 'nothing'],
      required: true
    },
    value: mongoose.Schema.Types.Mixed,
    description: String
  },
  design: {
    coverImage: String,
    revealImage: String,
    backgroundColor: String
  },
  status: {
    type: String,
    enum: ['active', 'scratched', 'redeemed', 'expired'],
    default: 'active'
  },
  scratchedAt: Date,
  redeemedAt: Date,
  expiresAt: Date,
  conditions: {
    minimumPurchase: Number,
    applicableProducts: [mongoose.Schema.Types.ObjectId],
    applicableCategories: [mongoose.Schema.Types.ObjectId],
    validFrom: Date,
    validUntil: Date
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

scratchCardSchema.index({ user: 1, status: 1 });
scratchCardSchema.index({ cardCode: 1 });

module.exports = mongoose.model('ScratchCard', scratchCardSchema);
