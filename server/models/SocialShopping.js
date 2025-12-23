import mongoose from 'mongoose';

const socialShoppingSchema = new mongoose.Schema({
  // Post details
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  postType: {
    type: String,
    enum: ['product_review', 'outfit', 'haul', 'wishlist', 'recommendation', 'question', 'poll', 'challenge', 'story'],
    required: true
  },

  // Content
  content: {
    title: String,
    description: {
      type: String,
      maxlength: 5000
    },
    media: [{
      type: {
        type: String,
        enum: ['image', 'video', 'gif'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      thumbnail: String,
      duration: Number,
      width: Number,
      height: Number,
      caption: String,
      tags: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        x: Number,
        y: Number,
        label: String
      }]
    }],
    hashtags: [String],
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String
    }]
  },

  // Tagged products
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
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    pros: [String],
    cons: [String],
    purchaseLink: String,
    affiliateLink: String,
    price: Number,
    whereIBought: String
  }],

  // Outfit/Look details (for outfit posts)
  outfit: {
    occasion: {
      type: String,
      enum: ['casual', 'formal', 'party', 'work', 'sport', 'beach', 'date', 'wedding', 'other']
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter', 'all_season']
    },
    style: [String],
    totalPrice: Number,
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      category: String,
      brand: String,
      price: Number
    }]
  },

  // Poll (for poll posts)
  poll: {
    question: String,
    options: [{
      text: String,
      votes: {
        type: Number,
        default: 0
      },
      voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    endsAt: Date,
    allowMultipleVotes: {
      type: Boolean,
      default: false
    }
  },

  // Challenge (for challenge posts)
  challenge: {
    name: String,
    description: String,
    rules: [String],
    startDate: Date,
    endDate: Date,
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      joinedAt: Date
    }],
    prize: String,
    hashtag: String
  },

  // Engagement
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    addToCarts: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    }
  },

  // User interactions
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Comments
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000
    },
    media: {
      type: String,
      url: String
    },
    likes: {
      type: Number,
      default: 0
    },
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Visibility & privacy
  visibility: {
    type: String,
    enum: ['public', 'friends', 'followers', 'private'],
    default: 'public'
  },

  allowComments: {
    type: Boolean,
    default: true
  },

  // Location
  location: {
    name: String,
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Shopping features
  shopping: {
    shoppable: {
      type: Boolean,
      default: true
    },
    commission: {
      rate: Number,
      earned: {
        type: Number,
        default: 0
      }
    },
    conversions: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },

  // Influencer features
  influencer: {
    isSponsored: {
      type: Boolean,
      default: false
    },
    sponsor: {
      brand: String,
      campaignId: String,
      compensation: Number
    },
    discountCode: String,
    affiliateLinks: [{
      platform: String,
      url: String,
      clicks: Number
    }]
  },

  // Collections/Boards
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],

  // AI analysis
  aiAnalysis: {
    style: [String],
    colors: [String],
    brands: [String],
    priceRange: {
      min: Number,
      max: Number
    },
    sentiment: String,
    topics: [String],
    suggestedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  },

  // Moderation
  moderation: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'approved'
    },
    flags: [{
      reason: String,
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reportedAt: Date
    }],
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    reviewedAt: Date
  },

  // Boosted/Promoted
  promotion: {
    boosted: {
      type: Boolean,
      default: false
    },
    budget: Number,
    startDate: Date,
    endDate: Date,
    targetAudience: {
      age: { min: Number, max: Number },
      gender: [String],
      interests: [String],
      locations: [String]
    },
    impressions: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    }
  },

  // Featured
  featured: {
    isFeatured: {
      type: Boolean,
      default: false
    },
    featuredUntil: Date,
    featuredIn: [String]
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deleted'],
    default: 'published'
  },

  publishedAt: Date,

  // Expiration (for stories)
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
socialShoppingSchema.index({ user: 1, createdAt: -1 });
socialShoppingSchema.index({ postType: 1 });
socialShoppingSchema.index({ 'engagement.likes': -1 });
socialShoppingSchema.index({ 'engagement.views': -1 });
socialShoppingSchema.index({ visibility: 1, status: 1 });
socialShoppingSchema.index({ 'content.hashtags': 1 });
socialShoppingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for engagement rate
socialShoppingSchema.virtual('engagementRate').get(function () {
  if (this.engagement.views === 0) return 0;
  const totalEngagement = this.engagement.likes + this.engagement.comments + this.engagement.shares;
  return (totalEngagement / this.engagement.views) * 100;
});

// Method to like/unlike post
socialShoppingSchema.methods.toggleLike = function (userId) {
  const index = this.likedBy.indexOf(userId);

  if (index > -1) {
    this.likedBy.splice(index, 1);
    this.engagement.likes--;
  } else {
    this.likedBy.push(userId);
    this.engagement.likes++;
  }
};

// Method to save/unsave post
socialShoppingSchema.methods.toggleSave = function (userId) {
  const index = this.savedBy.indexOf(userId);

  if (index > -1) {
    this.savedBy.splice(index, 1);
    this.engagement.saves--;
  } else {
    this.savedBy.push(userId);
    this.engagement.saves++;
  }
};

// Method to add comment
socialShoppingSchema.methods.addComment = function (userId, text) {
  this.comments.push({
    user: userId,
    text,
    createdAt: Date.now()
  });
  this.engagement.comments++;
};

// Static method to get trending posts
socialShoppingSchema.statics.getTrendingPosts = function (limit = 10) {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return this.find({
    status: 'published',
    visibility: 'public',
    createdAt: { $gte: last24Hours }
  })
    .sort({ 'engagement.views': -1, 'engagement.likes': -1 })
    .limit(limit)
    .populate('user', 'name avatar')
    .populate('products.product', 'name images price');
};

// Static method to get user feed
socialShoppingSchema.statics.getUserFeed = function (userId, following, limit = 20, skip = 0) {
  return this.find({
    $or: [
      { user: { $in: following } },
      { visibility: 'public', 'featured.isFeatured': true }
    ],
    status: 'published'
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name avatar')
    .populate('products.product', 'name images price');
};

const SocialShopping = mongoose.model('SocialShopping', socialShoppingSchema);
export default SocialShopping;
export { SocialShopping };
