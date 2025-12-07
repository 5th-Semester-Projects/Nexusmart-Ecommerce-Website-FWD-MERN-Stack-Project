import mongoose from 'mongoose';

const liveStreamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Stream title is required'],
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  scheduledAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  thumbnail: {
    type: String
  },
  streamKey: {
    type: String,
    unique: true
  },
  streamUrl: {
    type: String
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    featuredAt: Date,
    discount: Number,
    flashSale: {
      active: Boolean,
      discount: Number,
      quantity: Number,
      claimed: Number,
      expiresAt: Date
    }
  }],
  viewers: {
    current: { type: Number, default: 0 },
    peak: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  engagement: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    reactions: [{
      emoji: String,
      count: Number
    }]
  },
  sales: {
    orderCount: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  chat: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    timestamp: { type: Date, default: Date.now },
    isHost: Boolean,
    isPinned: Boolean
  }],
  settings: {
    chatEnabled: { type: Boolean, default: true },
    moderationEnabled: { type: Boolean, default: true },
    subscribersOnly: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Generate stream key
liveStreamSchema.pre('save', function (next) {
  if (!this.streamKey) {
    this.streamKey = `live_${this._id}_${Date.now()}`;
  }
  next();
});

const groupBuySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  targetQuantity: {
    type: Number,
    required: true,
    min: 2
  },
  currentQuantity: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    required: true
  },
  discountTiers: [{
    minQuantity: Number,
    discountPercent: Number,
    price: Number
  }],
  currentPrice: {
    type: Number
  },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quantity: Number,
    joinedAt: { type: Date, default: Date.now },
    paid: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['active', 'successful', 'failed', 'processing'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  shareLink: String,
  inviteCode: {
    type: String,
    unique: true
  }
}, { timestamps: true });

// Generate invite code
groupBuySchema.pre('save', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = `GB${Date.now().toString(36).toUpperCase()}`;
  }
  if (!this.shareLink) {
    this.shareLink = `${process.env.FRONTEND_URL}/group-buy/${this.inviteCode}`;
  }
  // Update current price based on quantity
  if (this.discountTiers && this.discountTiers.length > 0) {
    const applicableTier = this.discountTiers
      .filter(t => t.minQuantity <= this.currentQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];

    if (applicableTier) {
      this.currentPrice = applicableTier.price;
    } else {
      this.currentPrice = this.originalPrice;
    }
  }
  next();
});

const videoReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  duration: Number,
  title: {
    type: String,
    maxLength: 100
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  helpful: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const LiveStream = mongoose.model('LiveStream', liveStreamSchema);
export const GroupBuy = mongoose.model('GroupBuy', groupBuySchema);
export const VideoReview = mongoose.model('VideoReview', videoReviewSchema);

export default { LiveStream, GroupBuy, VideoReview };
