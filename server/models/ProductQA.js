import mongoose from 'mongoose';

const productQASchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Question Details
  question: {
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    category: {
      type: String,
      enum: ['product-specs', 'usage', 'compatibility', 'shipping', 'warranty', 'availability', 'sizing', 'materials', 'care-instructions', 'general'],
      default: 'general'
    },
    images: [String],
    isAnonymous: {
      type: Boolean,
      default: false
    },
    tags: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },

  // Answers
  answers: [{
    answeredBy: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      userType: {
        type: String,
        enum: ['seller', 'expert', 'customer', 'verified-buyer'],
        required: true
      },
      isOfficial: {
        type: Boolean,
        default: false
      },
      expertise: {
        level: {
          type: String,
          enum: ['novice', 'intermediate', 'expert', 'professional']
        },
        verified: Boolean
      }
    },
    text: {
      type: String,
      required: true,
      maxlength: 2000
    },
    images: [String],
    videos: [String],
    links: [{
      url: String,
      title: String
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    editHistory: [{
      text: String,
      editedAt: Date
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },

    // Voting
    votes: {
      upvotes: {
        type: Number,
        default: 0
      },
      downvotes: {
        type: Number,
        default: 0
      },
      score: {
        type: Number,
        default: 0
      },
      voters: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        vote: {
          type: String,
          enum: ['up', 'down']
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }]
    },

    // Helpfulness
    helpful: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'hidden', 'flagged', 'deleted'],
      default: 'active'
    },

    // Best Answer
    isBestAnswer: {
      type: Boolean,
      default: false
    },
    markedBestBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    markedBestAt: Date
  }],

  // Moderation
  moderation: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged', 'deleted'],
      default: 'approved',
      index: true
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    reason: String,
    autoModerated: {
      type: Boolean,
      default: false
    },
    flags: [{
      flaggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'offensive', 'misleading', 'duplicate', 'irrelevant']
      },
      description: String,
      flaggedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'reviewed', 'actioned', 'dismissed'],
        default: 'pending'
      }
    }]
  },

  // Visibility & Settings
  visibility: {
    isPublic: {
      type: Boolean,
      default: true
    },
    showOnProductPage: {
      type: Boolean,
      default: true
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    pinnedAt: Date
  },

  // Engagement
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    bookmarks: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      bookmarkedAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastActivityAt: {
      type: Date,
      default: Date.now
    }
  },

  // Question Status
  status: {
    type: String,
    enum: ['unanswered', 'answered', 'resolved', 'closed'],
    default: 'unanswered',
    index: true
  },

  // Analytics
  analytics: {
    totalAnswers: {
      type: Number,
      default: 0
    },
    totalVotes: {
      type: Number,
      default: 0
    },
    averageAnswerTime: Number,
    helpfulnessScore: {
      type: Number,
      default: 0
    },
    engagementScore: {
      type: Number,
      default: 0
    }
  },

  // Notifications
  notifications: {
    notifyAsker: {
      onAnswer: {
        type: Boolean,
        default: true
      },
      onBestAnswer: {
        type: Boolean,
        default: true
      }
    },
    notifyAnswerer: {
      onVote: {
        type: Boolean,
        default: true
      },
      onBestAnswer: {
        type: Boolean,
        default: true
      }
    },
    notifySeller: {
      onQuestion: {
        type: Boolean,
        default: true
      },
      onAnswer: {
        type: Boolean,
        default: false
      }
    }
  },

  // Similar Questions
  similarQuestions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductQA'
    },
    similarity: Number,
    calculatedAt: Date
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
productQASchema.index({ product: 1, status: 1 });
productQASchema.index({ 'question.askedBy': 1 });
productQASchema.index({ 'moderation.status': 1 });

// Methods
productQASchema.methods.addAnswer = function (answerData) {
  this.answers.push({
    answeredBy: {
      user: answerData.userId,
      userType: answerData.userType,
      isOfficial: answerData.isOfficial || false
    },
    text: answerData.text,
    images: answerData.images || [],
    videos: answerData.videos || [],
    createdAt: Date.now()
  });

  this.status = 'answered';
  this.analytics.totalAnswers = this.answers.length;
  this.engagement.lastActivityAt = Date.now();

  return this.save();
};

productQASchema.methods.voteAnswer = function (answerId, userId, voteType) {
  const answer = this.answers.id(answerId);

  if (!answer) return null;

  const existingVote = answer.votes.voters.find(
    v => v.user.toString() === userId.toString()
  );

  if (existingVote) {
    if (existingVote.vote === voteType) {
      return this.save();
    }

    if (existingVote.vote === 'up') {
      answer.votes.upvotes--;
    } else {
      answer.votes.downvotes--;
    }

    existingVote.vote = voteType;
  } else {
    answer.votes.voters.push({
      user: userId,
      vote: voteType,
      votedAt: Date.now()
    });
  }

  if (voteType === 'up') {
    answer.votes.upvotes++;
  } else {
    answer.votes.downvotes--;
  }

  answer.votes.score = answer.votes.upvotes - answer.votes.downvotes;
  this.analytics.totalVotes = this.answers.reduce((sum, a) => sum + a.votes.upvotes + a.votes.downvotes, 0);

  return this.save();
};

productQASchema.methods.markBestAnswer = function (answerId, markedBy) {
  this.answers.forEach(answer => {
    answer.isBestAnswer = false;
  });

  const answer = this.answers.id(answerId);
  if (answer) {
    answer.isBestAnswer = true;
    answer.markedBestBy = markedBy;
    answer.markedBestAt = Date.now();
    this.status = 'resolved';
  }

  return this.save();
};

productQASchema.methods.calculateEngagementScore = function () {
  const viewWeight = 0.1;
  const answerWeight = 5;
  const voteWeight = 2;
  const shareWeight = 10;

  this.analytics.engagementScore =
    (this.engagement.views * viewWeight) +
    (this.analytics.totalAnswers * answerWeight) +
    (this.analytics.totalVotes * voteWeight) +
    (this.engagement.shares * shareWeight);

  return this.save();
};

// Statics
productQASchema.statics.getProductQuestions = function (productId, filter = {}) {
  const query = { product: productId, 'moderation.status': 'approved' };

  if (filter.status) {
    query.status = filter.status;
  }

  return this.find(query)
    .populate('question.askedBy answers.answeredBy.user')
    .sort({ 'visibility.isPinned': -1, 'analytics.engagementScore': -1 });
};

productQASchema.statics.searchQuestions = function (searchText, productId) {
  return this.find({
    product: productId,
    $text: { $search: searchText }
  })
    .populate('question.askedBy answers.answeredBy.user');
};

// Text Index for Search
productQASchema.index({ 'question.text': 'text', 'answers.text': 'text' });

const ProductQA = mongoose.model('ProductQA', productQASchema);

export default ProductQA;
