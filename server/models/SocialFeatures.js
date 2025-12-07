import mongoose from 'mongoose';

// ==================== LIVE SHOPPING STREAM ====================
const liveStreamSchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxLength: 200,
  },
  description: {
    type: String,
    maxLength: 1000,
  },
  thumbnail: {
    public_id: String,
    url: String,
  },
  streamUrl: String,
  streamKey: String,
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled',
  },
  scheduledAt: Date,
  startedAt: Date,
  endedAt: Date,
  duration: Number,
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    specialPrice: Number,
    discount: Number,
    limitedQuantity: Number,
    soldCount: {
      type: Number,
      default: 0,
    },
    featuredAt: Date,
  }],
  viewers: {
    current: {
      type: Number,
      default: 0,
    },
    peak: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  interactions: {
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
  },
  chat: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isHighlighted: Boolean,
    isPinned: Boolean,
  }],
  recording: {
    url: String,
    public_id: String,
    available: {
      type: Boolean,
      default: false,
    },
  },
  analytics: {
    revenue: {
      type: Number,
      default: 0,
    },
    orders: {
      type: Number,
      default: 0,
    },
    averageWatchTime: Number,
    engagementRate: Number,
  },
}, { timestamps: true });

liveStreamSchema.index({ host: 1, status: 1 });
liveStreamSchema.index({ scheduledAt: 1 });

export const LiveStream = mongoose.model('LiveStream', liveStreamSchema);

// ==================== INFLUENCER STOREFRONT ====================
const influencerStorefrontSchema = new mongoose.Schema({
  influencer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  storeName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  bio: {
    type: String,
    maxLength: 500,
  },
  coverImage: {
    public_id: String,
    url: String,
  },
  socialLinks: {
    instagram: String,
    youtube: String,
    tiktok: String,
    twitter: String,
    facebook: String,
  },
  curatedProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    personalNote: String,
    addedAt: {
      type: Date,
      default: Date.now,
    },
    order: Number,
  }],
  collections: [{
    name: String,
    description: String,
    coverImage: String,
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
  }],
  commission: {
    rate: {
      type: Number,
      default: 10,
      min: 0,
      max: 50,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    pendingPayout: {
      type: Number,
      default: 0,
    },
  },
  stats: {
    followers: {
      type: Number,
      default: 0,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  tier: {
    type: String,
    enum: ['starter', 'rising', 'established', 'top'],
    default: 'starter',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

influencerStorefrontSchema.index({ slug: 1 });

export const InfluencerStorefront = mongoose.model('InfluencerStorefront', influencerStorefrontSchema);

// ==================== SHARED WISHLIST ====================
const sharedWishlistSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: String,
  shareCode: {
    type: String,
    unique: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    purchased: {
      type: Boolean,
      default: false,
    },
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view',
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  occasion: {
    type: String,
    enum: ['birthday', 'wedding', 'baby_shower', 'christmas', 'other'],
  },
  eventDate: Date,
  views: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

sharedWishlistSchema.index({ owner: 1 });
sharedWishlistSchema.index({ shareCode: 1 });

export const SharedWishlist = mongoose.model('SharedWishlist', sharedWishlistSchema);

// ==================== GROUP BUYING ====================
const groupBuyingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  tiers: [{
    minParticipants: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
  currentTier: {
    type: Number,
    default: 0,
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    quantity: {
      type: Number,
      default: 1,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    paid: {
      type: Boolean,
      default: false,
    },
  }],
  maxParticipants: Number,
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'successful', 'failed', 'cancelled'],
    default: 'active',
  },
  shareCode: {
    type: String,
    unique: true,
  },
  inviteLink: String,
  minimumParticipants: {
    type: Number,
    default: 2,
  },
}, { timestamps: true });

groupBuyingSchema.index({ status: 1, endDate: 1 });
groupBuyingSchema.index({ product: 1 });

export const GroupBuying = mongoose.model('GroupBuying', groupBuyingSchema);

// ==================== SOCIAL FOLLOW ====================
const socialFollowSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notificationsEnabled: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

socialFollowSchema.index({ follower: 1, following: 1 }, { unique: true });

export const SocialFollow = mongoose.model('SocialFollow', socialFollowSchema);

export default { LiveStream, InfluencerStorefront, SharedWishlist, GroupBuying, SocialFollow };
