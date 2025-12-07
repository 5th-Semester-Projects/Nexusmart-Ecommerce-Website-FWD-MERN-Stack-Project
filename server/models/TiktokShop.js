const mongoose = require('mongoose');

const tiktokShopSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  tiktokProductId: String,
  videos: [{
    videoId: String,
    videoUrl: String,
    coverImage: String,
    caption: String,
    hashtags: [String],
    music: String,
    duration: Number,
    postedAt: Date,
    engagement: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      productClicks: { type: Number, default: 0 }
    }
  }],
  liveStreams: [{
    streamId: String,
    title: String,
    startedAt: Date,
    endedAt: Date,
    viewers: { peak: Number, total: Number },
    products: [mongoose.Schema.Types.ObjectId],
    sales: Number,
    revenue: Number
  }],
  influencers: [{
    influencerId: String,
    username: String,
    followers: Number,
    collaboration: {
      type: String,
      enum: ['sponsored', 'affiliate', 'partnership']
    },
    commission: Number,
    sales: Number,
    revenue: Number
  }],
  performance: {
    totalViews: { type: Number, default: 0 },
    productClicks: { type: Number, default: 0 },
    addToCart: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    averageEngagementRate: { type: Number, default: 0 }
  },
  settings: {
    autoSync: Boolean,
    productTagging: Boolean,
    shoppingLink: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

tiktokShopSchema.index({ product: 1 });
tiktokShopSchema.index({ tiktokProductId: 1 });

module.exports = mongoose.model('TiktokShop', tiktokShopSchema);
