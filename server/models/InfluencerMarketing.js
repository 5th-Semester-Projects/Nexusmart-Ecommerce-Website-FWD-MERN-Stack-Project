import mongoose from 'mongoose';

const influencerMarketingSchema = new mongoose.Schema({
  influencer: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    displayName: String,
    profileImage: String,
    bio: String,
    verified: {
      type: Boolean,
      default: false
    }
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Influencer Profile
  profile: {
    category: [{
      type: String,
      enum: ['fashion', 'beauty', 'fitness', 'tech', 'lifestyle', 'food', 'travel', 'gaming', 'home-decor', 'parenting']
    }],
    socialMedia: {
      instagram: {
        handle: String,
        followers: Number,
        engagementRate: Number,
        verified: Boolean
      },
      youtube: {
        channelId: String,
        subscribers: Number,
        avgViews: Number,
        verified: Boolean
      },
      tiktok: {
        handle: String,
        followers: Number,
        avgViews: Number,
        verified: Boolean
      },
      twitter: {
        handle: String,
        followers: Number,
        engagementRate: Number,
        verified: Boolean
      },
      facebook: {
        pageId: String,
        followers: Number,
        verified: Boolean
      }
    },
    totalReach: {
      type: Number,
      default: 0
    },
    averageEngagementRate: {
      type: Number,
      default: 0
    },
    audienceDemographics: {
      ageGroups: [{
        range: String,
        percentage: Number
      }],
      gender: {
        male: Number,
        female: Number,
        other: Number
      },
      topCountries: [{
        country: String,
        percentage: Number
      }]
    }
  },

  // Commission Structure
  commission: {
    type: {
      type: String,
      enum: ['percentage', 'fixed-per-sale', 'tiered', 'hybrid'],
      required: true
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    fixedAmount: Number,
    tiers: [{
      minSales: Number,
      maxSales: Number,
      percentage: Number,
      fixedAmount: Number
    }],
    minimumPayout: {
      type: Number,
      default: 50
    },
    paymentSchedule: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly'],
      default: 'monthly'
    }
  },

  // Discount Codes
  discountCodes: [{
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed-amount', 'free-shipping'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    applicableCategories: [String],
    minOrderValue: Number,
    maxDiscount: Number,
    usageLimit: {
      total: Number,
      perUser: Number
    },
    usageCount: {
      type: Number,
      default: 0
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: Date,
    active: {
      type: Boolean,
      default: true
    },
    uniqueUsers: {
      type: Number,
      default: 0
    }
  }],

  // Content & Campaigns
  campaigns: [{
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['product-review', 'unboxing', 'tutorial', 'sponsored-post', 'story', 'reel', 'video', 'blog-post']
    },
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    platforms: [{
      type: String,
      enum: ['instagram', 'youtube', 'tiktok', 'twitter', 'facebook', 'blog']
    }],
    deliverables: [{
      type: String,
      description: String,
      deadline: Date,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'submitted', 'approved', 'rejected', 'published'],
        default: 'pending'
      },
      submittedUrl: String,
      submittedAt: Date
    }],
    budget: Number,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['draft', 'pending-approval', 'active', 'completed', 'cancelled'],
      default: 'draft'
    }
  }],

  // Content Approval
  contentApproval: {
    required: {
      type: Boolean,
      default: true
    },
    pendingContent: [{
      campaign: mongoose.Schema.Types.ObjectId,
      contentType: String,
      contentUrl: String,
      caption: String,
      hashtags: [String],
      submittedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revision-requested'],
        default: 'pending'
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reviewedAt: Date,
      feedback: String
    }],
    autoApprove: {
      enabled: {
        type: Boolean,
        default: false
      },
      criteria: [String]
    }
  },

  // Performance Metrics
  performance: {
    totalSales: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalCommission: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    },
    returnOnInvestment: {
      type: Number,
      default: 0
    },
    monthlyStats: [{
      month: Date,
      sales: Number,
      revenue: Number,
      commission: Number,
      clicks: Number,
      conversions: Number
    }]
  },

  // Analytics
  analytics: {
    clicks: {
      type: Number,
      default: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    uniqueCustomers: {
      type: Number,
      default: 0
    },
    productViews: {
      type: Number,
      default: 0
    },
    addToCart: {
      type: Number,
      default: 0
    },
    trackingLinks: [{
      url: String,
      shortUrl: String,
      clicks: Number,
      conversions: Number,
      createdAt: Date
    }],
    topProducts: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      sales: Number,
      revenue: Number
    }]
  },

  // Commission Tracking
  commissionTracking: {
    earned: {
      type: Number,
      default: 0
    },
    paid: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    transactions: [{
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      orderAmount: Number,
      commissionAmount: Number,
      commissionRate: Number,
      status: {
        type: String,
        enum: ['pending', 'approved', 'paid', 'cancelled'],
        default: 'pending'
      },
      earnedAt: {
        type: Date,
        default: Date.now
      },
      paidAt: Date,
      paymentId: String
    }],
    payouts: [{
      amount: Number,
      method: {
        type: String,
        enum: ['bank-transfer', 'paypal', 'stripe', 'wallet']
      },
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      transactionId: String,
      initiatedAt: {
        type: Date,
        default: Date.now
      },
      completedAt: Date,
      failureReason: String
    }]
  },

  // Contract & Agreement
  contract: {
    signed: {
      type: Boolean,
      default: false
    },
    signedAt: Date,
    startDate: Date,
    endDate: Date,
    terms: String,
    exclusivity: {
      required: {
        type: Boolean,
        default: false
      },
      categories: [String],
      duration: Number
    },
    contentRights: {
      type: String,
      enum: ['influencer-owns', 'brand-owns', 'shared'],
      default: 'shared'
    },
    autoRenew: {
      type: Boolean,
      default: false
    }
  },

  // Communication
  messages: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    attachments: [String],
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],

  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'suspended', 'terminated'],
    default: 'pending',
    index: true
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
influencerMarketingSchema.index({ 'influencer.user': 1, seller: 1 });
// influencerMarketingSchema.index({ 'discountCodes.code': 1 }); // Removed: code already has unique:true

// Methods
influencerMarketingSchema.methods.generateDiscountCode = function (codeData) {
  this.discountCodes.push({
    code: codeData.code.toUpperCase(),
    type: codeData.type,
    value: codeData.value,
    applicableProducts: codeData.applicableProducts || [],
    validFrom: codeData.validFrom || Date.now(),
    validUntil: codeData.validUntil,
    usageLimit: codeData.usageLimit || {},
    active: true
  });

  return this.save();
};

influencerMarketingSchema.methods.trackSale = function (orderData) {
  const commissionRate = this.commission.percentage || 0;
  const commissionAmount = (orderData.orderAmount * commissionRate) / 100;

  this.commissionTracking.transactions.push({
    order: orderData.orderId,
    orderAmount: orderData.orderAmount,
    commissionAmount: commissionAmount,
    commissionRate: commissionRate,
    status: 'pending',
    earnedAt: Date.now()
  });

  this.performance.totalSales += 1;
  this.performance.totalRevenue += orderData.orderAmount;
  this.performance.totalCommission += commissionAmount;
  this.commissionTracking.pending += commissionAmount;

  this.analytics.totalOrders += 1;

  return this.save();
};

influencerMarketingSchema.methods.approveContent = function (contentId, reviewedBy) {
  const content = this.contentApproval.pendingContent.id(contentId);

  if (content) {
    content.status = 'approved';
    content.reviewedBy = reviewedBy;
    content.reviewedAt = Date.now();
  }

  return this.save();
};

// Statics
influencerMarketingSchema.statics.getTopInfluencers = function (sellerId, limit = 10) {
  return this.find({ seller: sellerId, status: 'active' })
    .sort({ 'performance.totalRevenue': -1 })
    .limit(limit)
    .populate('influencer.user');
};

const InfluencerMarketing = mongoose.model('InfluencerMarketing', influencerMarketingSchema);

export default InfluencerMarketing;
