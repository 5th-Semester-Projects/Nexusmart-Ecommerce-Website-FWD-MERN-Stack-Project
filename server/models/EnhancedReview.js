const mongoose = require('mongoose');

const enhancedReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },

  // Rating breakdown
  ratings: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    shipping: {
      type: Number,
      min: 1,
      max: 5
    },
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Review content
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 5000
  },

  // Media attachments
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnail: String,
    caption: String,
    size: Number,
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number, // for videos
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Pros and cons
  pros: [{
    type: String,
    maxlength: 500
  }],
  cons: [{
    type: String,
    maxlength: 500
  }],

  // Purchase context
  purchaseContext: {
    verifiedPurchase: {
      type: Boolean,
      default: false
    },
    purchaseDate: Date,
    purchasePrice: Number,
    variant: String,
    size: String,
    color: String
  },

  // User profile
  userProfile: {
    displayName: String,
    avatar: String,
    isBadgeHolder: Boolean,
    badges: [{
      type: String,
      enum: ['verified_buyer', 'top_reviewer', 'early_adopter', 'helpful_reviewer', 'expert']
    }],
    reviewCount: Number,
    helpfulVotes: Number
  },

  // Engagement metrics
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    helpfulVotes: {
      type: Number,
      default: 0
    },
    notHelpfulVotes: {
      type: Number,
      default: 0
    },
    reportCount: {
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
    }
  },

  // Helpfulness tracking
  helpfulVoters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: Boolean,
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Comments/replies
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userType: {
      type: String,
      enum: ['customer', 'seller', 'admin'],
      default: 'customer'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: {
      type: Number,
      default: 0
    }
  }],

  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged', 'hidden'],
    default: 'pending'
  },
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,

  // AI analysis
  aiAnalysis: {
    sentimentScore: Number, // -1 to 1
    sentiment: {
      type: String,
      enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive']
    },
    topics: [{
      topic: String,
      relevance: Number
    }],
    keywords: [String],
    readabilityScore: Number,
    authenticity: {
      score: Number,
      flags: [String]
    },
    language: String,
    tone: String
  },

  // Incentivization
  incentive: {
    received: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['points', 'discount', 'cashback', 'badge']
    },
    value: Number,
    awardedAt: Date
  },

  // Visibility settings
  visibility: {
    isPublic: {
      type: Boolean,
      default: true
    },
    showOnProductPage: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    featuredUntil: Date
  },

  // Edit history
  editHistory: [{
    editedAt: {
      type: Date,
      default: Date.now
    },
    field: String,
    oldValue: String,
    newValue: String
  }],

  // Reporting
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'misleading', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

// Indexes
enhancedReviewSchema.index({ product: 1, status: 1, createdAt: -1 });
enhancedReviewSchema.index({ user: 1, createdAt: -1 });
enhancedReviewSchema.index({ 'ratings.overall': -1 });
enhancedReviewSchema.index({ 'engagement.helpfulVotes': -1 });
enhancedReviewSchema.index({ 'purchaseContext.verifiedPurchase': 1 });
enhancedReviewSchema.index({ status: 1, 'visibility.featured': 1 });
enhancedReviewSchema.index({ 'aiAnalysis.sentiment': 1 });

// Virtual for helpfulness ratio
enhancedReviewSchema.virtual('helpfulnessRatio').get(function () {
  const total = this.engagement.helpfulVotes + this.engagement.notHelpfulVotes;
  if (total === 0) return 0;
  return this.engagement.helpfulVotes / total;
});

// Method to vote helpful
enhancedReviewSchema.methods.voteHelpful = function (userId, isHelpful) {
  const existingVote = this.helpfulVoters.find(v => v.user.toString() === userId.toString());

  if (existingVote) {
    // Update existing vote
    if (existingVote.helpful === isHelpful) return; // No change

    if (existingVote.helpful) {
      this.engagement.helpfulVotes--;
      this.engagement.notHelpfulVotes++;
    } else {
      this.engagement.notHelpfulVotes--;
      this.engagement.helpfulVotes++;
    }
    existingVote.helpful = isHelpful;
    existingVote.votedAt = Date.now();
  } else {
    // New vote
    this.helpfulVoters.push({ user: userId, helpful: isHelpful });
    if (isHelpful) {
      this.engagement.helpfulVotes++;
    } else {
      this.engagement.notHelpfulVotes++;
    }
  }
};

// Method to add reply
enhancedReviewSchema.methods.addReply = function (userId, userType, content) {
  this.replies.push({
    user: userId,
    userType,
    content
  });
  this.engagement.comments++;
};

// Static method to get featured reviews
enhancedReviewSchema.statics.getFeaturedReviews = function (productId, limit = 5) {
  return this.find({
    product: productId,
    status: 'approved',
    'visibility.featured': true,
    'visibility.featuredUntil': { $gt: Date.now() }
  })
    .sort({ 'engagement.helpfulVotes': -1 })
    .limit(limit)
    .populate('user', 'name avatar');
};

// Static method to get top rated reviews
enhancedReviewSchema.statics.getTopReviews = function (productId, limit = 10) {
  return this.find({
    product: productId,
    status: 'approved',
    'visibility.isPublic': true
  })
    .sort({ 'engagement.helpfulVotes': -1, 'ratings.overall': -1 })
    .limit(limit)
    .populate('user', 'name avatar');
};

module.exports = mongoose.model('EnhancedReview', enhancedReviewSchema);
