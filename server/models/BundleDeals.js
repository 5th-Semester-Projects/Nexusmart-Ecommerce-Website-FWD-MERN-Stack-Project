import mongoose from 'mongoose';

const bundleDealsSchema = new mongoose.Schema({
  // Bundle information
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },

  // Bundle type
  bundleType: {
    type: String,
    enum: ['fixed', 'flexible', 'tiered', 'build_your_own', 'subscription_box', 'gift_set'],
    default: 'fixed'
  },

  // Products in bundle
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    variant: {
      color: String,
      size: String,
      sku: String
    },
    position: Number,
    required: {
      type: Boolean,
      default: true
    },
    // For flexible bundles
    substitutable: {
      type: Boolean,
      default: false
    },
    alternativeProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  }],

  // Flexible bundle options (for build_your_own)
  flexibleOptions: {
    minProducts: {
      type: Number,
      default: 1
    },
    maxProducts: {
      type: Number,
      default: 10
    },
    allowDuplicates: {
      type: Boolean,
      default: false
    },
    categories: [{
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      },
      minSelection: Number,
      maxSelection: Number
    }]
  },

  // Tiered pricing (for tiered bundles)
  tiers: [{
    minQuantity: {
      type: Number,
      required: true
    },
    maxQuantity: Number,
    discount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
      },
      value: Number
    },
    price: Number
  }],

  // Pricing
  pricing: {
    regularPrice: {
      type: Number,
      required: true
    },
    salePrice: Number,
    discount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
      },
      value: Number
    },
    savings: {
      amount: Number,
      percentage: Number
    },
    compareAtPrice: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Media
  media: {
    images: [{
      url: {
        type: String,
        required: true
      },
      alt: String,
      isPrimary: {
        type: Boolean,
        default: false
      },
      position: Number
    }],
    videos: [{
      url: String,
      thumbnail: String,
      title: String,
      duration: Number
    }],
    banner: String
  },

  // Availability
  availability: {
    status: {
      type: String,
      enum: ['available', 'out_of_stock', 'pre_order', 'discontinued'],
      default: 'available'
    },
    inStock: {
      type: Boolean,
      default: true
    },
    stockQuantity: Number,
    stockTracking: {
      type: Boolean,
      default: true
    },
    backorderAllowed: {
      type: Boolean,
      default: false
    },
    preOrderDate: Date
  },

  // Validity period
  validity: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    timezone: String
  },

  // Purchase limits
  limits: {
    maxPerOrder: Number,
    maxPerCustomer: Number,
    minPurchaseQuantity: {
      type: Number,
      default: 1
    }
  },

  // Target audience
  targeting: {
    userTiers: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond']
    }],
    newCustomersOnly: {
      type: Boolean,
      default: false
    },
    regions: [String],
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }]
  },

  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String
  },

  // Features & highlights
  features: [{
    icon: String,
    title: String,
    description: String
  }],

  highlights: [String],

  tags: [String],

  // Shipping
  shipping: {
    freeShipping: {
      type: Boolean,
      default: false
    },
    weight: {
      value: Number,
      unit: String
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: String
    },
    shippingClass: String,
    handlingTime: {
      min: Number,
      max: Number,
      unit: String
    }
  },

  // Gift options
  giftOptions: {
    giftWrapping: {
      available: {
        type: Boolean,
        default: false
      },
      price: Number
    },
    giftMessage: {
      available: {
        type: Boolean,
        default: false
      },
      maxLength: Number
    },
    giftReceipt: {
      type: Boolean,
      default: true
    }
  },

  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    addToCart: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },

  // Customer reviews
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    verifiedPurchase: {
      type: Boolean,
      default: false
    },
    helpful: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Cross-sell and upsell
  relatedBundles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BundleDeals'
  }],

  frequentlyBoughtTogether: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  // Admin settings
  settings: {
    featured: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      default: 0
    },
    autoDiscount: {
      type: Boolean,
      default: true
    },
    notifyLowStock: {
      type: Boolean,
      default: true
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    }
  },

  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'expired', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Indexes
bundleDealsSchema.index({ status: 1, 'validity.isActive': 1 });
bundleDealsSchema.index({ 'validity.startDate': 1, 'validity.endDate': 1 });
bundleDealsSchema.index({ 'analytics.purchases': -1 });
bundleDealsSchema.index({ 'analytics.revenue': -1 });
bundleDealsSchema.index({ 'settings.featured': 1 });

// Virtual for is active
bundleDealsSchema.virtual('isActive').get(function () {
  const now = new Date();
  return (
    this.status === 'active' &&
    this.validity.isActive &&
    this.validity.startDate <= now &&
    (!this.validity.endDate || this.validity.endDate >= now)
  );
});

// Virtual for total savings
bundleDealsSchema.virtual('totalSavings').get(function () {
  if (this.pricing.salePrice) {
    return this.pricing.regularPrice - this.pricing.salePrice;
  }
  return 0;
});

// Pre-save middleware to calculate savings
bundleDealsSchema.pre('save', function (next) {
  if (this.pricing.salePrice) {
    this.pricing.savings = {
      amount: this.pricing.regularPrice - this.pricing.salePrice,
      percentage: ((this.pricing.regularPrice - this.pricing.salePrice) / this.pricing.regularPrice) * 100
    };
  }

  // Generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  next();
});

// Method to check availability
bundleDealsSchema.methods.checkAvailability = async function () {
  if (!this.isActive) return false;

  if (this.availability.stockTracking && this.availability.stockQuantity <= 0) {
    return this.availability.backorderAllowed;
  }

  return true;
};

// Method to update analytics
bundleDealsSchema.methods.updateAnalytics = function (action, value = 1) {
  if (this.analytics[action] !== undefined) {
    if (typeof this.analytics[action] === 'number') {
      this.analytics[action] += value;
    }
  }

  // Update conversion rate
  if (this.analytics.views > 0) {
    this.analytics.conversionRate = (this.analytics.purchases / this.analytics.views) * 100;
  }
};

// Static method to get active bundles
bundleDealsSchema.statics.getActiveBundles = function () {
  const now = new Date();
  return this.find({
    status: 'active',
    'validity.isActive': true,
    'validity.startDate': { $lte: now },
    $or: [
      { 'validity.endDate': { $gte: now } },
      { 'validity.endDate': null }
    ]
  }).sort({ 'settings.priority': -1, createdAt: -1 });
};

// Static method to get featured bundles
bundleDealsSchema.statics.getFeaturedBundles = function (limit = 5) {
  return this.getActiveBundles()
    .where('settings.featured').equals(true)
    .limit(limit);
};

const BundleDeals = mongoose.model('BundleDeals', bundleDealsSchema);
export default BundleDeals;
export { BundleDeals };
