import mongoose from 'mongoose';

/**
 * Shoppable Video Model
 */

const shoppableVideoSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Video Details
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  description: String,

  // Video Source
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  duration: Number, // in seconds

  // Video Type
  type: {
    type: String,
    enum: ['product_showcase', 'tutorial', 'review', 'unboxing', 'live_stream', 'story'],
    default: 'product_showcase'
  },

  // Products in Video
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    timestamp: Number, // when product appears (seconds)
    endTimestamp: Number,
    position: {
      x: Number, // percentage from left
      y: Number  // percentage from top
    },
    highlighted: Boolean
  }],

  // Interactive Hotspots
  hotspots: [{
    timestamp: Number,
    duration: Number,
    position: { x: Number, y: Number },
    type: { type: String, enum: ['product', 'link', 'info'] },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    link: String,
    text: String
  }],

  // Status
  status: {
    type: String,
    enum: ['draft', 'processing', 'published', 'archived'],
    default: 'draft'
  },
  isLive: { type: Boolean, default: false },

  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },

  // Categories/Tags
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tags: [String],

  // Analytics
  views: { type: Number, default: 0 },
  uniqueViews: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  watchTime: { type: Number, default: 0 }, // total seconds watched
  avgWatchTime: { type: Number, default: 0 },

  // Conversions
  productClicks: { type: Number, default: 0 },
  addToCartClicks: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },

  // Engagement
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Schedule
  scheduledAt: Date,
  publishedAt: Date,

  // Live Stream Settings
  liveStream: {
    streamKey: String,
    rtmpUrl: String,
    startedAt: Date,
    endedAt: Date,
    viewers: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * Video Comment Schema
 */
const videoCommentSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShoppableVideo',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  text: {
    type: String,
    required: true,
    maxLength: 1000
  },

  // Timestamp in video
  videoTimestamp: Number,

  // Parent comment for replies
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoComment'
  },

  // Engagement
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Pinned by creator
  isPinned: { type: Boolean, default: false },

  // Moderation
  isHidden: { type: Boolean, default: false },
  isReported: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * Video Playlist Schema
 */
const videoPlaylistSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  title: {
    type: String,
    required: true
  },
  description: String,
  thumbnailUrl: String,

  videos: [{
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'ShoppableVideo' },
    order: Number,
    addedAt: { type: Date, default: Date.now }
  }],

  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },

  // Stats
  totalViews: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update conversion rate
shoppableVideoSchema.methods.updateConversionRate = function () {
  if (this.productClicks > 0) {
    this.conversionRate = (this.purchases / this.productClicks) * 100;
  }
  return this.conversionRate;
};

// Update average watch time
shoppableVideoSchema.methods.updateAvgWatchTime = function () {
  if (this.views > 0) {
    this.avgWatchTime = this.watchTime / this.views;
  }
  return this.avgWatchTime;
};

shoppableVideoSchema.index({ status: 1, publishedAt: -1 });
shoppableVideoSchema.index({ seller: 1, status: 1 });
shoppableVideoSchema.index({ tags: 1 });

export const ShoppableVideo = mongoose.model('ShoppableVideo', shoppableVideoSchema);
export const VideoComment = mongoose.model('VideoComment', videoCommentSchema);
export const VideoPlaylist = mongoose.model('VideoPlaylist', videoPlaylistSchema);
