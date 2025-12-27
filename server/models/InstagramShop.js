import mongoose from 'mongoose';

const instagramShopSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  instagramProductId: String,
  posts: [{
    postId: String,
    postUrl: String,
    caption: String,
    mediaType: String, // 'image', 'video', 'carousel'
    mediaUrl: String,
    permalink: String,
    tags: [String],
    postedAt: Date,
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 }
    }
  }],
  stories: [{
    storyId: String,
    mediaUrl: String,
    expiresAt: Date,
    views: Number,
    taps: Number,
    exits: Number
  }],
  reels: [{
    reelId: String,
    videoUrl: String,
    views: Number,
    likes: Number,
    comments: Number,
    shares: Number
  }],
  performance: {
    clicks: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    addToCart: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  settings: {
    autoSync: Boolean,
    autoPost: Boolean,
    priceDisplay: Boolean
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

instagramShopSchema.index({ product: 1 });
instagramShopSchema.index({ instagramProductId: 1 });

const InstagramShop = mongoose.model('InstagramShop', instagramShopSchema);
export default InstagramShop;
export { InstagramShop };
