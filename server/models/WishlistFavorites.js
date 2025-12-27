import mongoose from 'mongoose';

const wishlistFavoritesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Multiple Wishlists Support
  wishlists: [{
    wishlistId: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      default: 'My Wishlist'
    },

    description: String,

    visibility: {
      type: String,
      enum: ['private', 'friends', 'public'],
      default: 'private'
    },

    // Wishlist Items
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },

      variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant'
      },

      addedAt: {
        type: Date,
        default: Date.now
      },

      // Price Tracking
      priceWhenAdded: Number,
      currentPrice: Number,
      lowestPrice: Number,
      highestPrice: Number,

      priceHistory: [{
        price: Number,
        timestamp: Date
      }],

      // Alerts
      alerts: {
        priceDropAlert: {
          enabled: { type: Boolean, default: false },
          threshold: Number, // percentage or fixed amount
          thresholdType: {
            type: String,
            enum: ['percentage', 'fixed']
          },
          notified: { type: Boolean, default: false },
          lastNotified: Date
        },

        backInStockAlert: {
          enabled: { type: Boolean, default: false },
          notified: { type: Boolean, default: false },
          lastNotified: Date
        },

        lowStockAlert: {
          enabled: { type: Boolean, default: false },
          threshold: Number,
          notified: { type: Boolean, default: false }
        }
      },

      // Purchase Intent
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },

      notes: String,

      quantity: {
        type: Number,
        default: 1,
        min: 1
      },

      purchased: {
        type: Boolean,
        default: false
      },

      purchasedAt: Date,

      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    }],

    // Sharing Settings
    sharing: {
      isShared: { type: Boolean, default: false },
      shareCode: String,
      shareUrl: String,

      sharedWith: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        email: String,
        permission: {
          type: String,
          enum: ['view', 'edit'],
          default: 'view'
        },
        sharedAt: Date
      }],

      publicStats: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        followers: { type: Number, default: 0 }
      }
    },

    // Categorization
    category: {
      type: String,
      enum: ['general', 'birthday', 'wedding', 'holiday', 'gift-ideas', 'favorites', 'custom']
    },

    occasion: {
      type: String,
      enum: ['birthday', 'anniversary', 'christmas', 'valentines', 'mothers-day', 'fathers-day', 'graduation', 'wedding']
    },

    eventDate: Date,

    // Cover Image
    coverImage: String,

    // Analytics
    analytics: {
      totalItems: { type: Number, default: 0 },
      totalValue: { type: Number, default: 0 },
      itemsPurchased: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },

      priceDropsDetected: { type: Number, default: 0 },
      savingsPotential: { type: Number, default: 0 },

      lastViewed: Date,
      viewCount: { type: Number, default: 0 }
    },

    isDefault: {
      type: Boolean,
      default: false
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Quick Favorites (Single-click favorites)
  quickFavorites: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    movedToWishlist: {
      type: Boolean,
      default: false
    },
    wishlistId: String
  }],

  // Followed Shops/Sellers
  followedShops: [{
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop'
    },
    followedAt: Date,
    notifications: {
      newProducts: { type: Boolean, default: true },
      sales: { type: Boolean, default: true }
    }
  }],

  // Followed Brands
  followedBrands: [{
    brand: String,
    followedAt: Date,
    notifications: {
      newProducts: { type: Boolean, default: true },
      sales: { type: Boolean, default: true }
    }
  }],

  // Price Alert Preferences
  priceAlertPreferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },

    digestFrequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly'],
      default: 'instant'
    },

    minimumDiscount: {
      type: Number,
      default: 10 // percentage
    }
  },

  // Social Features
  social: {
    // Friends' Wishlists
    friendsWishlists: [{
      friend: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      wishlistId: String,
      visibility: String,
      lastViewed: Date
    }],

    // Collaborative Wishlists
    collaborativeWishlists: [{
      wishlistId: String,
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['viewer', 'contributor', 'admin']
      },
      joinedAt: Date
    }]
  },

  // Recommendations Based on Wishlist
  recommendations: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    score: Number,
    reason: String,
    basedOnProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: Date,
    viewed: { type: Boolean, default: false },
    dismissed: { type: Boolean, default: false }
  }],

  // Global Analytics
  globalAnalytics: {
    totalWishlists: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },

    mostWishlistedCategory: String,
    avgPricePoint: Number,

    conversionMetrics: {
      itemsAddedToCart: { type: Number, default: 0 },
      itemsPurchased: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 }
    },

    priceAlertMetrics: {
      totalAlerts: { type: Number, default: 0 },
      alertsTriggered: { type: Number, default: 0 },
      purchasesFromAlerts: { type: Number, default: 0 },
      totalSavings: { type: Number, default: 0 }
    },

    sharingMetrics: {
      wishlistsShared: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      itemsPurchasedByOthers: { type: Number, default: 0 }
    },

    lastUpdated: Date
  },

  // Settings
  settings: {
    defaultWishlistId: String,
    autoAddToDefaultWishlist: { type: Boolean, default: true },

    defaultVisibility: {
      type: String,
      enum: ['private', 'friends', 'public'],
      default: 'private'
    },

    priceTracking: { type: Boolean, default: true },
    stockTracking: { type: Boolean, default: true },

    syncWithRegistry: { type: Boolean, default: false }
  }

}, {
  timestamps: true
});

// Indexes
wishlistFavoritesSchema.index({ 'wishlists.wishlistId': 1 }, { unique: true, sparse: true });
wishlistFavoritesSchema.index({ 'wishlists.items.product': 1 });
wishlistFavoritesSchema.index({ 'wishlists.sharing.shareCode': 1 });
wishlistFavoritesSchema.index({ 'quickFavorites.product': 1 });

// Virtual: Total Wishlists Count
wishlistFavoritesSchema.virtual('totalWishlists').get(function () {
  return this.wishlists.length;
});

// Method: Create Wishlist
wishlistFavoritesSchema.methods.createWishlist = function (name, description, visibility = 'private', category = 'general') {
  const wishlistId = new mongoose.Types.ObjectId().toString();

  const newWishlist = {
    wishlistId,
    name,
    description,
    visibility,
    category,
    items: [],
    analytics: {
      totalItems: 0,
      totalValue: 0
    },
    sharing: {
      shareCode: this.generateShareCode()
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // Set as default if it's the first wishlist
  if (this.wishlists.length === 0) {
    newWishlist.isDefault = true;
    this.settings.defaultWishlistId = wishlistId;
  }

  this.wishlists.push(newWishlist);
  this.globalAnalytics.totalWishlists += 1;

  return newWishlist;
};

// Method: Add Item to Wishlist
wishlistFavoritesSchema.methods.addItem = function (wishlistId, productId, variantId = null, price, quantity = 1) {
  const wishlist = this.wishlists.find(w => w.wishlistId === wishlistId);

  if (!wishlist) {
    throw new Error('Wishlist not found');
  }

  // Check if item already exists
  const existingItem = wishlist.items.find(
    item => item.product.toString() === productId.toString() &&
      (!variantId || item.variant?.toString() === variantId.toString())
  );

  if (existingItem) {
    throw new Error('Item already in wishlist');
  }

  const newItem = {
    product: productId,
    variant: variantId,
    addedAt: Date.now(),
    priceWhenAdded: price,
    currentPrice: price,
    lowestPrice: price,
    highestPrice: price,
    quantity,
    priceHistory: [{ price, timestamp: Date.now() }]
  };

  wishlist.items.push(newItem);
  wishlist.analytics.totalItems += 1;
  wishlist.analytics.totalValue += price * quantity;
  wishlist.updatedAt = Date.now();

  this.globalAnalytics.totalItems += 1;
  this.globalAnalytics.totalValue += price * quantity;

  return newItem;
};

// Method: Remove Item from Wishlist
wishlistFavoritesSchema.methods.removeItem = function (wishlistId, productId) {
  const wishlist = this.wishlists.find(w => w.wishlistId === wishlistId);

  if (!wishlist) {
    throw new Error('Wishlist not found');
  }

  const itemIndex = wishlist.items.findIndex(item => item.product.toString() === productId.toString());

  if (itemIndex === -1) {
    throw new Error('Item not found in wishlist');
  }

  const removedItem = wishlist.items[itemIndex];
  wishlist.items.splice(itemIndex, 1);

  wishlist.analytics.totalItems -= 1;
  wishlist.analytics.totalValue -= removedItem.currentPrice * removedItem.quantity;
  wishlist.updatedAt = Date.now();

  this.globalAnalytics.totalItems -= 1;
  this.globalAnalytics.totalValue -= removedItem.currentPrice * removedItem.quantity;

  return removedItem;
};

// Method: Update Price
wishlistFavoritesSchema.methods.updatePrice = function (wishlistId, productId, newPrice) {
  const wishlist = this.wishlists.find(w => w.wishlistId === wishlistId);

  if (!wishlist) {
    throw new Error('Wishlist not found');
  }

  const item = wishlist.items.find(i => i.product.toString() === productId.toString());

  if (!item) {
    throw new Error('Item not found');
  }

  const oldPrice = item.currentPrice;
  item.currentPrice = newPrice;

  // Update price history
  item.priceHistory.push({
    price: newPrice,
    timestamp: Date.now()
  });

  // Update lowest/highest
  if (newPrice < item.lowestPrice) {
    item.lowestPrice = newPrice;
  }
  if (newPrice > item.highestPrice) {
    item.highestPrice = newPrice;
  }

  // Check price drop alert
  if (item.alerts.priceDropAlert.enabled) {
    const priceDropPercentage = ((oldPrice - newPrice) / oldPrice) * 100;

    if (priceDropPercentage >= item.alerts.priceDropAlert.threshold) {
      item.alerts.priceDropAlert.notified = false; // Reset to trigger notification
      this.globalAnalytics.priceAlertMetrics.alertsTriggered += 1;
    }
  }

  // Update analytics
  const priceDiff = newPrice - oldPrice;
  wishlist.analytics.totalValue += priceDiff * item.quantity;
  this.globalAnalytics.totalValue += priceDiff * item.quantity;

  if (newPrice < oldPrice) {
    wishlist.analytics.priceDropsDetected += 1;
    wishlist.analytics.savingsPotential += (oldPrice - newPrice) * item.quantity;
  }
};

// Method: Share Wishlist
wishlistFavoritesSchema.methods.shareWishlist = function (wishlistId, email = null, permission = 'view') {
  const wishlist = this.wishlists.find(w => w.wishlistId === wishlistId);

  if (!wishlist) {
    throw new Error('Wishlist not found');
  }

  wishlist.sharing.isShared = true;

  if (!wishlist.sharing.shareCode) {
    wishlist.sharing.shareCode = this.generateShareCode();
  }

  if (email) {
    wishlist.sharing.sharedWith.push({
      email,
      permission,
      sharedAt: Date.now()
    });
  }

  this.globalAnalytics.sharingMetrics.wishlistsShared += 1;

  return wishlist.sharing;
};

// Method: Generate Share Code
wishlistFavoritesSchema.methods.generateShareCode = function () {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Method: Mark Item as Purchased
wishlistFavoritesSchema.methods.markAsPurchased = function (wishlistId, productId, orderId) {
  const wishlist = this.wishlists.find(w => w.wishlistId === wishlistId);

  if (!wishlist) {
    throw new Error('Wishlist not found');
  }

  const item = wishlist.items.find(i => i.product.toString() === productId.toString());

  if (!item) {
    throw new Error('Item not found');
  }

  item.purchased = true;
  item.purchasedAt = Date.now();
  item.orderId = orderId;

  wishlist.analytics.itemsPurchased += 1;
  wishlist.analytics.conversionRate = (wishlist.analytics.itemsPurchased / wishlist.analytics.totalItems) * 100;

  this.globalAnalytics.conversionMetrics.itemsPurchased += 1;
  this.globalAnalytics.conversionMetrics.totalSpent += item.currentPrice * item.quantity;
  this.globalAnalytics.conversionMetrics.conversionRate =
    (this.globalAnalytics.conversionMetrics.itemsPurchased / this.globalAnalytics.totalItems) * 100;
};

// Static: Get Public Wishlists
wishlistFavoritesSchema.statics.getPublicWishlists = function (limit = 20) {
  return this.find({ 'wishlists.visibility': 'public' })
    .populate('user', 'name profilePicture')
    .limit(limit);
};

// Static: Find Wishlist by Share Code
wishlistFavoritesSchema.statics.findByShareCode = function (shareCode) {
  return this.findOne({ 'wishlists.sharing.shareCode': shareCode })
    .populate('user', 'name profilePicture');
};

const WishlistFavorites = mongoose.model('WishlistFavorites', wishlistFavoritesSchema);
export default WishlistFavorites;
export { WishlistFavorites };
