import mongoose from 'mongoose';

const aiStylistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Style Profile
  styleProfile: {
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    quiz: {
      answers: [{
        questionId: String,
        question: String,
        answer: mongoose.Schema.Types.Mixed,
        weight: {
          type: Number,
          default: 1
        }
      }],
      styleTypes: [{
        type: {
          type: String,
          enum: ['casual', 'formal', 'business', 'sporty', 'bohemian', 'minimalist', 'vintage', 'trendy', 'classic', 'edgy']
        },
        score: Number,
        percentage: Number
      }],
      primaryStyle: String,
      secondaryStyle: String
    },
    preferences: {
      colors: [{
        color: String,
        hex: String,
        preference: {
          type: String,
          enum: ['love', 'like', 'neutral', 'dislike', 'avoid']
        }
      }],
      patterns: [String],
      fabrics: [String],
      occasions: [String],
      brands: [String],
      priceRange: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'USD'
        }
      },
      sizes: {
        tops: String,
        bottoms: String,
        shoes: String,
        dresses: String
      },
      bodyType: {
        type: String,
        enum: ['petite', 'tall', 'plus-size', 'athletic', 'curvy', 'slim', 'average']
      },
      styleGoals: [String],
      avoidList: [String]
    }
  },

  // Outfit Recommendations
  outfitRecommendations: [{
    outfitId: {
      type: String,
      unique: true
    },
    name: String,
    description: String,
    occasion: {
      type: String,
      enum: ['casual', 'work', 'formal', 'party', 'date', 'workout', 'travel', 'outdoor', 'lounge']
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter', 'all-season']
    },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      category: String,
      role: {
        type: String,
        enum: ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'bag']
      },
      alternatives: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }]
    }],
    totalPrice: Number,
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    styleAlignment: Number,
    aiGenerated: {
      type: Boolean,
      default: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    imageUrl: String,
    liked: {
      type: Boolean,
      default: false
    },
    saved: {
      type: Boolean,
      default: false
    },
    purchased: {
      type: Boolean,
      default: false
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      reasons: [String]
    }
  }],

  // Virtual Styling Sessions
  virtualSessions: [{
    sessionId: {
      type: String,
      unique: true
    },
    type: {
      type: String,
      enum: ['live-chat', 'video-call', 'async-consultation', 'ai-powered'],
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    stylist: {
      type: {
        type: String,
        enum: ['ai', 'human', 'hybrid']
      },
      stylistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      avatar: String,
      expertise: [String],
      rating: Number
    },
    scheduledTime: Date,
    duration: {
      type: Number,
      default: 30
    },
    actualDuration: Number,
    startTime: Date,
    endTime: Date,
    topic: String,
    goals: [String],
    notes: [{
      timestamp: Date,
      text: String,
      addedBy: String
    }],
    recommendations: [{
      type: {
        type: String,
        enum: ['product', 'outfit', 'style-tip', 'color-palette']
      },
      content: mongoose.Schema.Types.Mixed
    }],
    productsDiscussed: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    recording: {
      available: {
        type: Boolean,
        default: false
      },
      url: String,
      transcription: String
    },
    chat: [{
      from: String,
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      attachments: [String]
    }],
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      wouldRecommend: Boolean
    },
    price: Number,
    paid: {
      type: Boolean,
      default: false
    }
  }],

  // Wardrobe
  wardrobe: {
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      addedAt: {
        type: Date,
        default: Date.now
      },
      category: String,
      color: String,
      pattern: String,
      season: [String],
      occasions: [String],
      timesWorn: {
        type: Number,
        default: 0
      },
      lastWorn: Date,
      costPerWear: Number,
      favorite: {
        type: Boolean,
        default: false
      },
      tags: [String],
      notes: String
    }],
    totalItems: {
      type: Number,
      default: 0
    },
    totalValue: {
      type: Number,
      default: 0
    },
    categoryBreakdown: mongoose.Schema.Types.Mixed
  },

  // AI Learning & Personalization
  aiLearning: {
    interactions: {
      type: Number,
      default: 0
    },
    outfitsViewed: {
      type: Number,
      default: 0
    },
    outfitsLiked: {
      type: Number,
      default: 0
    },
    outfitsPurchased: {
      type: Number,
      default: 0
    },
    averageMatchScore: Number,
    improvementRate: Number,
    learningProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    modelVersion: {
      type: String,
      default: 'v1.0'
    },
    lastTrainingDate: Date,
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },

  // Style Evolution
  styleEvolution: [{
    date: Date,
    styleSnapshot: {
      primaryStyle: String,
      preferences: mongoose.Schema.Types.Mixed,
      topBrands: [String],
      topColors: [String],
      averagePrice: Number
    },
    changes: [String],
    triggers: [String]
  }],

  // Look Books
  lookBooks: [{
    name: String,
    description: String,
    theme: String,
    outfits: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIStylist.outfitRecommendations'
    }],
    coverImage: String,
    isPublic: {
      type: Boolean,
      default: false
    },
    likes: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Shopping Lists
  shoppingLists: [{
    name: String,
    occasion: String,
    budget: Number,
    deadline: Date,
    items: [{
      description: String,
      category: String,
      priority: {
        type: String,
        enum: ['high', 'medium', 'low']
      },
      suggestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      purchased: {
        type: Boolean,
        default: false
      },
      purchasedProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    }],
    completed: {
      type: Boolean,
      default: false
    }
  }],

  // Analytics
  analytics: {
    totalOutfitsGenerated: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    averageSessionDuration: Number,
    totalSpent: {
      type: Number,
      default: 0
    },
    sessionRevenue: {
      type: Number,
      default: 0
    },
    conversionRate: Number,
    favoriteOccasion: String,
    mostPurchasedCategory: String,
    styleConsistency: Number,
    engagementScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Notifications Preferences
  notifications: {
    newRecommendations: {
      type: Boolean,
      default: true
    },
    sessionReminders: {
      type: Boolean,
      default: true
    },
    trendAlerts: {
      type: Boolean,
      default: true
    },
    wardrobeInsights: {
      type: Boolean,
      default: true
    },
    priceDrops: {
      type: Boolean,
      default: true
    }
  },

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
aiStylistSchema.index({ user: 1 });
aiStylistSchema.index({ 'outfitRecommendations.outfitId': 1 });
aiStylistSchema.index({ 'virtualSessions.sessionId': 1 });

// Methods
aiStylistSchema.methods.generateOutfitRecommendations = async function (occasion, season, count = 5) {
  const recommendations = [];

  for (let i = 0; i < count; i++) {
    const outfit = {
      outfitId: `OUTFIT${Date.now()}${i}`,
      name: `${occasion} Outfit ${i + 1}`,
      occasion,
      season,
      items: [],
      matchScore: Math.floor(Math.random() * 30) + 70,
      styleAlignment: Math.floor(Math.random() * 20) + 80,
      aiGenerated: true,
      generatedAt: Date.now()
    };

    recommendations.push(outfit);
  }

  this.outfitRecommendations.push(...recommendations);
  this.analytics.totalOutfitsGenerated += count;
  this.aiLearning.interactions += 1;

  return this.save();
};

aiStylistSchema.methods.scheduleVirtualSession = async function (sessionData) {
  const session = {
    sessionId: `SESSION${Date.now()}`,
    type: sessionData.type,
    status: 'scheduled',
    scheduledTime: sessionData.scheduledTime,
    duration: sessionData.duration || 30,
    topic: sessionData.topic,
    goals: sessionData.goals || [],
    stylist: sessionData.stylist
  };

  this.virtualSessions.push(session);
  this.analytics.totalSessions += 1;

  return this.save();
};

aiStylistSchema.methods.addToWardrobe = function (productId, productData) {
  const item = {
    product: productId,
    category: productData.category,
    color: productData.color,
    pattern: productData.pattern,
    season: productData.season,
    occasions: productData.occasions,
    addedAt: Date.now()
  };

  this.wardrobe.items.push(item);
  this.wardrobe.totalItems += 1;
  this.wardrobe.totalValue += productData.price || 0;

  return this.save();
};

aiStylistSchema.methods.updateAILearning = function (interaction) {
  this.aiLearning.interactions += 1;

  if (interaction.type === 'view') {
    this.aiLearning.outfitsViewed += 1;
  } else if (interaction.type === 'like') {
    this.aiLearning.outfitsLiked += 1;
  } else if (interaction.type === 'purchase') {
    this.aiLearning.outfitsPurchased += 1;
  }

  const engagementRate = (this.aiLearning.outfitsLiked / Math.max(this.aiLearning.outfitsViewed, 1)) * 100;
  const purchaseRate = (this.aiLearning.outfitsPurchased / Math.max(this.aiLearning.outfitsViewed, 1)) * 100;

  this.aiLearning.learningProgress = Math.min((engagementRate + purchaseRate) / 2, 100);
  this.aiLearning.confidenceScore = Math.min(50 + (this.aiLearning.interactions / 10), 100);

  return this.save();
};

// Statics
aiStylistSchema.statics.getUserStyleProfile = function (userId) {
  return this.findOne({ user: userId })
    .populate('outfitRecommendations.items.product')
    .populate('wardrobe.items.product');
};

aiStylistSchema.statics.getTopStylists = function (limit = 10) {
  return this.aggregate([
    { $unwind: '$virtualSessions' },
    { $match: { 'virtualSessions.feedback.rating': { $gte: 4 } } },
    {
      $group: {
        _id: '$virtualSessions.stylist.stylistId',
        averageRating: { $avg: '$virtualSessions.feedback.rating' },
        totalSessions: { $sum: 1 }
      }
    },
    { $sort: { averageRating: -1, totalSessions: -1 } },
    { $limit: limit }
  ]);
};

const AIStylist = mongoose.model('AIStylist', aiStylistSchema);

export default AIStylist;
