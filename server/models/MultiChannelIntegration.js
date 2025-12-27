import mongoose from 'mongoose';

const multiChannelIntegrationSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },

  // Instagram Shopping Integration
  instagram: {
    enabled: { type: Boolean, default: false },

    account: {
      instagramBusinessId: String,
      username: String,
      profileUrl: String,
      followersCount: Number,
      isVerified: Boolean
    },

    authentication: {
      accessToken: String,
      refreshToken: String,
      tokenExpiry: Date,
      lastAuthenticated: Date
    },

    catalog: {
      catalogId: String,
      catalogName: String,
      productCount: Number,
      lastSyncedAt: Date,
      syncStatus: {
        type: String,
        enum: ['synced', 'syncing', 'failed', 'pending'],
        default: 'pending'
      },
      syncError: String
    },

    shoppablePosts: [{
      postId: String,
      postUrl: String,
      products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      likes: Number,
      comments: Number,
      shares: Number,
      clicks: Number,
      conversions: Number,
      revenue: Number,
      postedAt: Date
    }],

    stories: [{
      storyId: String,
      products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      views: Number,
      clicks: Number,
      conversions: Number,
      expiresAt: Date
    }],

    settings: {
      autoSync: { type: Boolean, default: true },
      syncFrequency: { type: Number, default: 3600 }, // seconds
      productTagging: { type: Boolean, default: true },
      autoPublish: { type: Boolean, default: false }
    },

    analytics: {
      totalImpressions: { type: Number, default: 0 },
      totalClicks: { type: Number, default: 0 },
      totalConversions: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 }
    }
  },

  // Facebook Marketplace Integration
  facebook: {
    enabled: { type: Boolean, default: false },

    account: {
      facebookPageId: String,
      pageName: String,
      pageUrl: String,
      category: String,
      isVerified: Boolean
    },

    authentication: {
      accessToken: String,
      refreshToken: String,
      tokenExpiry: Date,
      lastAuthenticated: Date
    },

    marketplace: {
      catalogId: String,
      catalogName: String,
      productCount: Number,
      listingsActive: Number,
      listingsSold: Number,
      lastSyncedAt: Date,
      syncStatus: {
        type: String,
        enum: ['synced', 'syncing', 'failed', 'pending'],
        default: 'pending'
      }
    },

    listings: [{
      listingId: String,
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      price: Number,
      currency: String,
      status: {
        type: String,
        enum: ['active', 'sold', 'pending', 'rejected', 'expired']
      },
      views: Number,
      inquiries: Number,
      saves: Number,
      listedAt: Date,
      soldAt: Date
    }],

    shops: {
      shopId: String,
      shopName: String,
      shopUrl: String,
      isActive: Boolean,
      productsCount: Number
    },

    settings: {
      autoSync: { type: Boolean, default: true },
      syncFrequency: { type: Number, default: 3600 },
      autoRelist: { type: Boolean, default: false },
      markupPercentage: { type: Number, default: 0 }
    },

    analytics: {
      totalViews: { type: Number, default: 0 },
      totalInquiries: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      avgResponseTime: Number // minutes
    }
  },

  // Amazon Integration
  amazon: {
    enabled: { type: Boolean, default: false },

    account: {
      sellerId: String,
      sellerName: String,
      marketplaceId: String,
      marketplace: String, // US, UK, CA, etc.
      accountType: {
        type: String,
        enum: ['individual', 'professional']
      }
    },

    authentication: {
      mwsAuthToken: String,
      accessKey: String,
      secretKey: String,
      region: String,
      lastAuthenticated: Date
    },

    inventory: {
      totalProducts: Number,
      activeListings: Number,
      inactiveListings: Number,
      outOfStock: Number,
      lastSyncedAt: Date,
      syncStatus: String
    },

    listings: [{
      asin: String,
      sku: String,
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      title: String,
      price: Number,
      quantity: Number,
      condition: String,
      fulfillmentChannel: {
        type: String,
        enum: ['FBM', 'FBA'] // Fulfilled by Merchant, Fulfilled by Amazon
      },
      status: String,
      salesRank: Number,
      reviews: Number,
      rating: Number,
      listedAt: Date
    }],

    orders: [{
      amazonOrderId: String,
      orderDate: Date,
      totalAmount: Number,
      orderStatus: String,
      fulfillmentStatus: String,
      syncedToLocal: Boolean,
      localOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    }],

    fees: {
      monthlySubscription: Number,
      referralFees: Number,
      fbaFees: Number,
      otherFees: Number,
      totalFees: Number
    },

    settings: {
      autoSync: { type: Boolean, default: true },
      syncFrequency: { type: Number, default: 1800 },
      autoFulfill: { type: Boolean, default: false },
      minPrice: Number,
      maxPrice: Number,
      defaultCondition: String
    },

    analytics: {
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalFees: { type: Number, default: 0 },
      netProfit: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0 }
    }
  },

  // eBay Integration
  ebay: {
    enabled: { type: Boolean, default: false },

    account: {
      userId: String,
      username: String,
      email: String,
      site: String, // eBay.com, eBay.co.uk, etc.
      feedbackScore: Number,
      feedbackPercentage: Number
    },

    authentication: {
      authToken: String,
      tokenExpiry: Date,
      lastAuthenticated: Date
    },

    inventory: {
      totalListings: Number,
      activeListings: Number,
      soldListings: Number,
      endedListings: Number,
      lastSyncedAt: Date
    },

    listings: [{
      itemId: String,
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      title: String,
      price: Number,
      quantity: Number,
      format: {
        type: String,
        enum: ['auction', 'fixed-price', 'classified']
      },
      status: {
        type: String,
        enum: ['active', 'sold', 'ended', 'pending']
      },
      views: Number,
      watchers: Number,
      bids: Number,
      startTime: Date,
      endTime: Date
    }],

    orders: [{
      orderId: String,
      orderDate: Date,
      totalAmount: Number,
      orderStatus: String,
      paymentStatus: String,
      shippingStatus: String,
      syncedToLocal: Boolean,
      localOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    }],

    settings: {
      autoSync: { type: Boolean, default: true },
      syncFrequency: { type: Number, default: 1800 },
      autoRelist: { type: Boolean, default: true },
      listingDuration: { type: Number, default: 7 }, // days
      defaultFormat: String,
      returnPolicy: String
    },

    analytics: {
      totalSales: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalFees: { type: Number, default: 0 },
      avgSellingPrice: { type: Number, default: 0 }
    }
  },

  // WhatsApp Commerce Integration
  whatsapp: {
    enabled: { type: Boolean, default: false },

    account: {
      phoneNumberId: String,
      phoneNumber: String,
      displayName: String,
      isVerified: Boolean,
      businessAccountId: String
    },

    authentication: {
      accessToken: String,
      tokenExpiry: Date
    },

    catalog: {
      catalogId: String,
      productCount: Number,
      lastSyncedAt: Date,
      syncStatus: String
    },

    conversations: [{
      conversationId: String,
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      phoneNumber: String,
      messages: [{
        messageId: String,
        from: String,
        to: String,
        type: String,
        content: mongoose.Schema.Types.Mixed,
        timestamp: Date
      }],
      products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      status: {
        type: String,
        enum: ['active', 'resolved', 'abandoned']
      },
      convertedToOrder: Boolean,
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    }],

    settings: {
      autoSync: { type: Boolean, default: true },
      autoReply: { type: Boolean, default: false },
      businessHours: {
        enabled: Boolean,
        hours: [{
          day: String,
          open: String,
          close: String
        }]
      }
    },

    analytics: {
      totalConversations: { type: Number, default: 0 },
      totalMessages: { type: Number, default: 0 },
      conversionsFromWhatsApp: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }
  },

  // Product Syncing Configuration
  productSync: {
    syncDirection: {
      type: String,
      enum: ['one-way', 'two-way'],
      default: 'one-way'
    },

    syncFields: [{
      field: String,
      enabled: Boolean,
      mapping: String
    }],

    priceRules: [{
      channel: String,
      adjustment: {
        type: {
          type: String,
          enum: ['fixed', 'percentage']
        },
        value: Number
      }
    }],

    inventorySync: {
      enabled: { type: Boolean, default: true },
      reserveStock: { type: Boolean, default: true },
      lowStockThreshold: Number
    }
  },

  // Order Syncing
  orderSync: {
    autoImport: { type: Boolean, default: true },
    importFrequency: { type: Number, default: 600 }, // seconds

    statusMapping: [{
      channel: String,
      channelStatus: String,
      localStatus: String
    }],

    fulfillmentSync: { type: Boolean, default: true },
    trackingSync: { type: Boolean, default: true }
  },

  // Global Analytics
  analytics: {
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },

    byChannel: [{
      channel: String,
      revenue: Number,
      orders: Number,
      products: Number,
      conversionRate: Number
    }],

    lastUpdated: Date
  },

  // Sync History
  syncHistory: [{
    channel: String,
    syncType: {
      type: String,
      enum: ['products', 'orders', 'inventory', 'catalog']
    },
    startTime: Date,
    endTime: Date,
    status: {
      type: String,
      enum: ['success', 'failed', 'partial']
    },
    itemsSynced: Number,
    errors: [String]
  }]

}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Indexes
multiChannelIntegrationSchema.index({ businessId: 1 });
multiChannelIntegrationSchema.index({ 'instagram.enabled': 1 });
multiChannelIntegrationSchema.index({ 'facebook.enabled': 1 });
multiChannelIntegrationSchema.index({ 'amazon.enabled': 1 });
multiChannelIntegrationSchema.index({ 'ebay.enabled': 1 });

// Method: Sync Products to Channel
multiChannelIntegrationSchema.methods.syncProductsToChannel = async function (channel, productIds) {
  try {
    const syncRecord = {
      channel,
      syncType: 'products',
      startTime: Date.now(),
      status: 'success',
      itemsSynced: productIds.length,
      errors: []
    };

    // Simulate sync (in production, call actual channel APIs)

    syncRecord.endTime = Date.now();
    this.syncHistory.push(syncRecord);

    // Update channel-specific data
    if (this[channel] && this[channel].catalog) {
      this[channel].catalog.lastSyncedAt = Date.now();
      this[channel].catalog.syncStatus = 'synced';
    }

    return { success: true, itemsSynced: productIds.length };
  } catch (error) {
    this.syncHistory.push({
      channel,
      syncType: 'products',
      startTime: Date.now(),
      endTime: Date.now(),
      status: 'failed',
      itemsSynced: 0,
      errors: [error.message]
    });

    return { success: false, error: error.message };
  }
};

// Method: Calculate Total Revenue
multiChannelIntegrationSchema.methods.calculateTotalRevenue = function () {
  let total = 0;

  const channels = ['instagram', 'facebook', 'amazon', 'ebay', 'whatsapp'];

  channels.forEach(channel => {
    if (this[channel] && this[channel].analytics && this[channel].analytics.totalRevenue) {
      total += this[channel].analytics.totalRevenue;
    }
  });

  this.analytics.totalRevenue = total;
  this.analytics.lastUpdated = Date.now();

  return total;
};

// Static: Get Active Integrations
multiChannelIntegrationSchema.statics.getActiveIntegrations = function (businessId) {
  return this.findOne({ businessId }).select({
    'instagram.enabled': 1,
    'facebook.enabled': 1,
    'amazon.enabled': 1,
    'ebay.enabled': 1,
    'whatsapp.enabled': 1
  });
};

const MultiChannelIntegration = mongoose.model('MultiChannelIntegration', multiChannelIntegrationSchema);
export default MultiChannelIntegration;
export { MultiChannelIntegration };
