import mongoose from 'mongoose';

const facebookMarketplaceSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  facebookProductId: String,
  listing: {
    title: String,
    description: String,
    price: Number,
    currency: String,
    condition: String,
    availability: String,
    category: String,
    location: String
  },
  posts: [{
    postId: String,
    pageId: String,
    pageName: String,
    postUrl: String,
    content: String,
    mediaUrls: [String],
    postedAt: Date,
    engagement: {
      reactions: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      reach: { type: Number, default: 0 }
    }
  }],
  shop: {
    shopId: String,
    shopUrl: String,
    isActive: Boolean
  },
  catalog: {
    catalogId: String,
    catalogName: String,
    lastSynced: Date
  },
  performance: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  settings: {
    autoSync: Boolean,
    autoPublish: Boolean,
    enableMessaging: Boolean
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

facebookMarketplaceSchema.index({ product: 1 });
facebookMarketplaceSchema.index({ facebookProductId: 1 });

const FacebookMarketplace = mongoose.model('FacebookMarketplace', facebookMarketplaceSchema);
export default FacebookMarketplace;
export { FacebookMarketplace };
