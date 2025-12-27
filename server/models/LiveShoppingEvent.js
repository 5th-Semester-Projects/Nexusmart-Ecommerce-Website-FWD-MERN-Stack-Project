import mongoose from 'mongoose';

const liveShoppingEventSchema = new mongoose.Schema({
  // Event details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },

  // Host information
  host: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    avatar: String,
    bio: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  },

  // Co-hosts
  coHosts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    avatar: String
  }],

  // Scheduling
  scheduling: {
    scheduledAt: {
      type: Date,
      required: true
    },
    startedAt: Date,
    endedAt: Date,
    duration: Number, // planned duration in minutes
    actualDuration: Number,
    timezone: String,
    recurring: {
      isRecurring: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly']
      },
      endDate: Date
    }
  },

  // Stream details
  stream: {
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled'
    },
    platform: {
      type: String,
      enum: ['youtube', 'facebook', 'instagram', 'twitch', 'custom'],
      default: 'custom'
    },
    streamUrl: String,
    streamKey: String,
    playbackUrl: String,
    chatEnabled: {
      type: Boolean,
      default: true
    },
    recordingUrl: String,
    quality: {
      type: String,
      enum: ['480p', '720p', '1080p', '4k'],
      default: '720p'
    }
  },

  // Products featured
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      color: String,
      size: String,
      sku: String
    },
    position: Number,
    showcaseTime: {
      start: Number, // seconds from stream start
      end: Number
    },
    specialPrice: Number,
    discount: {
      type: String,
      value: Number
    },
    limitedStock: {
      quantity: Number,
      sold: {
        type: Number,
        default: 0
      }
    },
    highlights: [String],
    featured: {
      type: Boolean,
      default: false
    }
  }],

  // Viewers
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
    unique: {
      type: Number,
      default: 0
    },
    liveViewers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      joinedAt: Date,
      leftAt: Date,
      duration: Number
    }]
  },

  // Chat messages
  chat: {
    enabled: {
      type: Boolean,
      default: true
    },
    messages: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String,
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      type: {
        type: String,
        enum: ['message', 'product_link', 'emoji', 'system'],
        default: 'message'
      },
      isPinned: {
        type: Boolean,
        default: false
      },
      isDeleted: {
        type: Boolean,
        default: false
      }
    }],
    moderators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    bannedUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      bannedAt: Date
    }]
  },

  // Interactive features
  interactive: {
    polls: [{
      question: String,
      options: [{
        text: String,
        votes: Number
      }],
      startTime: Number,
      endTime: Number,
      totalVotes: Number
    }],
    quizzes: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      participants: Number,
      winners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    giveaways: [{
      prize: String,
      eligibility: String,
      startTime: Number,
      endTime: Number,
      participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      winners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }]
  },

  // Reactions & engagement
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    hearts: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    reactionsByType: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      fire: { type: Number, default: 0 }
    }
  },

  // Sales tracking
  sales: {
    orders: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    avgOrderValue: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    productsSold: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      revenue: Number
    }]
  },

  // Special offers during stream
  offers: [{
    name: String,
    description: String,
    code: String,
    discount: {
      type: String,
      value: Number
    },
    validFrom: Number, // seconds from stream start
    validUntil: Number,
    maxUses: Number,
    usedCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Flash deals
  flashDeals: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    price: Number,
    originalPrice: Number,
    quantity: Number,
    sold: {
      type: Number,
      default: 0
    },
    startTime: Number,
    duration: Number,
    isActive: Boolean
  }],

  // Notifications
  notifications: {
    reminder: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      minutesBefore: Number
    },
    startNotification: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    subscribers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  // Promotion
  promotion: {
    thumbnail: String,
    banner: String,
    teaser: {
      video: String,
      image: String
    },
    socialMediaPosts: [{
      platform: String,
      url: String,
      postedAt: Date
    }],
    emailCampaign: {
      sent: Boolean,
      sentAt: Date,
      recipients: Number,
      opens: Number,
      clicks: Number
    }
  },

  // Recording & replay
  recording: {
    available: {
      type: Boolean,
      default: false
    },
    url: String,
    views: {
      type: Number,
      default: 0
    },
    expiresAt: Date,
    downloadUrl: String,
    highlights: [{
      title: String,
      startTime: Number,
      endTime: Number,
      thumbnail: String
    }]
  },

  // Analytics
  analytics: {
    avgWatchTime: Number,
    dropOffRate: Number,
    peakViewerTime: Number,
    mostEngagedMoments: [{
      time: Number,
      engagement: Number,
      type: String
    }],
    audienceDemographics: {
      ageGroups: mongoose.Schema.Types.Mixed,
      genderDistribution: mongoose.Schema.Types.Mixed,
      topLocations: [String]
    },
    deviceBreakdown: {
      mobile: Number,
      desktop: Number,
      tablet: Number
    }
  },

  // Moderation
  moderation: {
    autoModeration: {
      type: Boolean,
      default: true
    },
    blockedWords: [String],
    slowMode: {
      enabled: Boolean,
      interval: Number // seconds between messages
    },
    requireFollowToChat: {
      type: Boolean,
      default: false
    }
  },

  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String
  },

  // Settings
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    requireLogin: {
      type: Boolean,
      default: false
    },
    allowScreenRecording: {
      type: Boolean,
      default: true
    },
    chatLanguage: String,
    maxViewers: Number
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'live', 'ended', 'cancelled'],
    default: 'draft'
  },

  cancelledReason: String
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

// Indexes
liveShoppingEventSchema.index({ 'scheduling.scheduledAt': 1 });
liveShoppingEventSchema.index({ 'stream.status': 1 });
liveShoppingEventSchema.index({ 'host.user': 1 });

// Virtual for is live
liveShoppingEventSchema.virtual('isLive').get(function () {
  return this.stream.status === 'live';
});

// Method to start stream
liveShoppingEventSchema.methods.startStream = function () {
  this.stream.status = 'live';
  this.scheduling.startedAt = Date.now();
  this.status = 'live';
};

// Method to end stream
liveShoppingEventSchema.methods.endStream = function () {
  this.stream.status = 'ended';
  this.scheduling.endedAt = Date.now();
  this.scheduling.actualDuration = Math.floor((this.scheduling.endedAt - this.scheduling.startedAt) / 1000 / 60);
  this.status = 'ended';
};

// Method to update viewer count
liveShoppingEventSchema.methods.updateViewerCount = function (count) {
  this.viewers.current = count;
  if (count > this.viewers.peak) {
    this.viewers.peak = count;
  }
};

// Static method to get upcoming events
liveShoppingEventSchema.statics.getUpcomingEvents = function (limit = 10) {
  return this.find({
    status: { $in: ['scheduled', 'draft'] },
    'scheduling.scheduledAt': { $gte: new Date() }
  })
    .sort({ 'scheduling.scheduledAt': 1 })
    .limit(limit)
    .populate('host.user', 'name avatar');
};

// Static method to get live events
liveShoppingEventSchema.statics.getLiveEvents = function () {
  return this.find({
    'stream.status': 'live'
  })
    .sort({ 'viewers.current': -1 })
    .populate('host.user', 'name avatar');
};

const LiveShoppingEvent = mongoose.model('LiveShoppingEvent', liveShoppingEventSchema);
export default LiveShoppingEvent;
export { LiveShoppingEvent };
