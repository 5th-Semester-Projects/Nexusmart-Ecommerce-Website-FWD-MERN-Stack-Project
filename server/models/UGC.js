const mongoose = require('mongoose');

const ugcSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  contentType: {
    type: String,
    enum: ['photo', 'video', 'review', 'unboxing', 'tutorial', 'testimonial'],
    required: true
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video']
    },
    url: String,
    thumbnail: String,
    duration: Number
  }],
  caption: String,
  hashtags: [String],
  socialPlatform: String,
  socialPostUrl: String,
  moderation: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    rejectionReason: String
  },
  rights: {
    granted: Boolean,
    grantedAt: Date,
    usage: [String], // 'website', 'social', 'ads', 'packaging'
    expiresAt: Date
  },
  engagement: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  featured: {
    isFeatured: Boolean,
    featuredOn: [String], // 'homepage', 'product_page', 'gallery'
    featuredAt: Date
  },
  reward: {
    type: String,
    points: Number,
    discount: Number,
    credited: Boolean,
    creditedAt: Date
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

ugcSchema.index({ user: 1 });
ugcSchema.index({ product: 1 });
ugcSchema.index({ 'moderation.status': 1 });
ugcSchema.index({ 'featured.isFeatured': 1 });

const UGC = mongoose.model('UGC', ugcSchema);
export default UGC;
export { UGC };
