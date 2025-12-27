import mongoose from 'mongoose';

const liveShoppingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  host: {
    type: {
      type: String,
      enum: ['seller', 'influencer', 'brand', 'internal']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    avatar: String,
    verified: Boolean
  },
  schedule: {
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    duration: Number, // minutes
    timezone: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  stream: {
    provider: {
      type: String,
      enum: ['agora', 'twilio', 'aws_ivs', 'youtube', 'facebook']
    },
    streamKey: String,
    streamUrl: String,
    playbackUrl: String,
    rtmpUrl: String,
    recordingUrl: String,
    thumbnailUrl: String
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    showcaseTime: Date,
    specialPrice: Number,
    discount: Number,
    limitedQuantity: Number,
    soldDuringLive: {
      type: Number,
      default: 0
    },
    highlighted: Boolean
  }],
  viewers: {
    current: {
      type: Number,
      default: 0
    },
    peak: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    demographics: mongoose.Schema.Types.Mixed
  },
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String,
      message: String,
      timestamp: Date,
      pinned: Boolean,
      moderated: Boolean
    }],
    reactions: mongoose.Schema.Types.Mixed
  },
  purchases: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    conversionRate: Number,
    ordersByProduct: [{
      product: mongoose.Schema.Types.ObjectId,
      count: Number,
      revenue: Number
    }]
  },
  features: {
    chat: {
      enabled: Boolean,
      moderators: [mongoose.Schema.Types.ObjectId],
      bannedUsers: [mongoose.Schema.Types.ObjectId]
    },
    polls: [{
      question: String,
      options: [String],
      votes: mongoose.Schema.Types.Mixed,
      active: Boolean
    }],
    giveaways: [{
      prize: String,
      eligibilityCriteria: String,
      winners: [mongoose.Schema.Types.ObjectId],
      active: Boolean
    }],
    flashDeals: [{
      product: mongoose.Schema.Types.ObjectId,
      originalPrice: Number,
      dealPrice: Number,
      startTime: Date,
      endTime: Date,
      quantity: Number,
      claimed: Number
    }]
  },
  notifications: {
    reminderSent: Boolean,
    startingSoon: Boolean,
    nowLive: Boolean,
    ending: Boolean
  },
  recording: {
    available: Boolean,
    url: String,
    watchCount: Number
  },
  analytics: {
    averageWatchTime: Number,
    dropOffPoints: [Number],
    clickThroughRate: Number,
    engagementRate: Number
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

liveShoppingSchema.index({ 'schedule.startTime': -1 });
liveShoppingSchema.index({ status: 1, 'schedule.startTime': -1 });
liveShoppingSchema.index({ 'host.id': 1 });

const LiveShopping = mongoose.model('LiveShopping', liveShoppingSchema);
export default LiveShopping;
export { LiveShopping };
