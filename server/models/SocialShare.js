const mongoose = require('mongoose');

const socialShareSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentType: {
    type: String,
    enum: ['product', 'order', 'review', 'wishlist', 'achievement', 'referral'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  platform: {
    type: String,
    enum: ['facebook', 'twitter', 'instagram', 'whatsapp', 'pinterest', 'linkedin', 'tiktok', 'snapchat'],
    required: true
  },
  shareUrl: String,
  shareText: String,
  shareImage: String,
  campaign: String,
  rewards: {
    pointsEarned: { type: Number, default: 0 },
    bonusApplied: Boolean,
    couponCode: String
  },
  engagement: {
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  sharedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

socialShareSchema.index({ user: 1, platform: 1 });
socialShareSchema.index({ contentType: 1, contentId: 1 });

const SocialShare = mongoose.model('SocialShare', socialShareSchema);`nexport default SocialShare;`nexport { SocialShare };
