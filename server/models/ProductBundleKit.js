import mongoose from 'mongoose';

const productBundleKitSchema = new mongoose.Schema({
  // Bundle Information
  bundleName: {
    type: String,
    required: true,
    trim: true
  },

  bundleType: {
    type: String,
    enum: ['fixed', 'dynamic', 'mix-and-match', 'curated', 'build-your-own'],
    required: true
  },

  description: String,

  shortDescription: String,

  // Products in Bundle
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant'
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },

    // For Mix & Match bundles
    isRequired: {
      type: Boolean,
      default: true
    },

    // For categories in build-your-own bundles
    category: String,

    // Individual pricing
    individualPrice: Number,

    // Position in bundle display
    position: Number,

    // Alternative/Substitute products
    alternatives: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant'
      },
      priceDifference: Number
    }]
  }],

  // Mix & Match Configuration
  mixAndMatch: {
    enabled: { type: Boolean, default: false },

    // Category-based selection
    categories: [{
      categoryName: String,
      minSelect: { type: Number, default: 1 },
      maxSelect: { type: Number, default: 1 },
      availableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }]
    }],

    totalItemsRequired: Number,

    rules: {
      allowDuplicates: { type: Boolean, default: false },
      requireFromEachCategory: { type: Boolean, default: true }
    }
  },

  // Pricing
  pricing: {
    // Original total price (sum of individual products)
    originalPrice: {
      type: Number,
      required: true,
      min: 0
    },

    // Bundle price
    bundlePrice: {
      type: Number,
      required: true,
      min: 0
    },

    // Discount
    discount: {
      type: {
        type: String,
        enum: ['fixed', 'percentage'],
        default: 'fixed'
      },
      value: Number
    },

    // Calculated savings
    savings: {
      type: Number,
      default: 0
    },

    savingsPercentage: {
      type: Number,
      default: 0
    },

    currency: {
      type: String,
      default: 'USD'
    },

    // Price tiers based on quantity
    priceTiers: [{
      minQuantity: Number,
      price: Number,
      discount: Number
    }],

    // Compare at price
    compareAtPrice: Number
  },

  // Inventory Management
  inventory: {
    trackInventory: {
      type: Boolean,
      default: true
    },

    // Stock based on minimum available product
    availableQuantity: {
      type: Number,
      default: 0
    },

    // Reserve stock for bundle
    reservedStock: {
      type: Number,
      default: 0
    },

    lowStockThreshold: {
      type: Number,
      default: 10
    },

    // Stock status
    stockStatus: {
      type: String,
      enum: ['in-stock', 'low-stock', 'out-of-stock', 'pre-order'],
      default: 'in-stock'
    },

    // Sync with individual product inventory
    syncWithProducts: {
      type: Boolean,
      default: true
    },

    // Last inventory check
    lastInventorySync: Date
  },

  // Images & Media
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false },
    position: Number
  }],

  video: {
    url: String,
    thumbnail: String
  },

  // Categories & Tags
  category: {
    type: String,
    index: true
  },

  subcategory: String,

  tags: [String],

  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived', 'scheduled'],
    default: 'draft',
    index: true
  },

  // Availability
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },

    availableFrom: Date,
    availableUntil: Date,

    // Channel availability
    channels: [{
      type: String,
      enum: ['website', 'mobile-app', 'in-store', 'wholesale']
    }],

    // Geographic availability
    countries: [String],
    regions: [String]
  },

  // Shipping
  shipping: {
    // Ship together or separately
    shipTogether: {
      type: Boolean,
      default: true
    },

    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: String
    },

    freeShipping: {
      type: Boolean,
      default: false
    },

    shippingClass: String,

    estimatedDeliveryDays: {
      min: Number,
      max: Number
    }
  },

  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },

  // Customization Options
  customization: {
    allowCustomization: {
      type: Boolean,
      default: false
    },

    options: [{
      name: String,
      type: {
        type: String,
        enum: ['text', 'select', 'checkbox', 'radio']
      },
      values: [String],
      required: Boolean,
      additionalCost: Number
    }]
  },

  // Restrictions
  restrictions: {
    // Purchase limits
    maxQuantityPerOrder: Number,
    maxQuantityPerCustomer: Number,

    // Minimum purchase
    minimumOrderValue: Number,

    // Customer restrictions
    requiresMembership: { type: Boolean, default: false },
    membershipTier: String,

    // First time buyer only
    firstTimeOnly: { type: Boolean, default: false }
  },

  // Bundle Performance Analytics
  analytics: {
    // Sales metrics
    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalSavingsProvided: { type: Number, default: 0 },

    // Engagement metrics
    views: { type: Number, default: 0 },
    addedToCart: { type: Number, default: 0 },

    // Conversion
    conversionRate: { type: Number, default: 0 },

    // Ratings
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // Popular combinations (for mix & match)
    popularCombinations: [{
      productIds: [mongoose.Schema.Types.ObjectId],
      count: Number
    }],

    lastUpdated: Date
  },

  // Reviews
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    helpful: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }],

  // Related Bundles
  relatedBundles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductBundleKit'
  }],

  // Upsell Bundles
  upsellBundles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductBundleKit'
  }],

  // Promotional Info
  promotional: {
    isFeatured: { type: Boolean, default: false },
    isHotDeal: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },

    badge: String,
    badgeColor: String,

    promotionalText: String
  },

  // Creator & Management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Vendor (for marketplace)
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },

  // Notes
  internalNotes: String,

  // Archive info
  archivedAt: Date,
  archivedReason: String

}, {
  timestamps: true, suppressReservedKeysWarning: true });

// Indexes
productBundleKitSchema.index({ bundleName: 1 });
productBundleKitSchema.index({ status: 1, 'availability.isAvailable': 1 });
productBundleKitSchema.index({ category: 1, status: 1 });
productBundleKitSchema.index({ 'pricing.bundlePrice': 1 });

// Virtual: Is Available
productBundleKitSchema.virtual('isAvailable').get(function () {
  if (this.status !== 'active') return false;
  if (!this.availability.isAvailable) return false;
  if (this.inventory.stockStatus === 'out-of-stock') return false;

  const now = new Date();
  if (this.availability.availableFrom && this.availability.availableFrom > now) return false;
  if (this.availability.availableUntil && this.availability.availableUntil < now) return false;

  return true;
});

// Virtual: Discount Percentage
productBundleKitSchema.virtual('discountPercentage').get(function () {
  if (this.pricing.originalPrice === 0) return 0;
  return ((this.pricing.originalPrice - this.pricing.bundlePrice) / this.pricing.originalPrice) * 100;
});

// Method: Calculate Total Price
productBundleKitSchema.methods.calculateTotalPrice = async function () {
  let totalPrice = 0;

  // Populate products to get current prices
  await this.populate('products.product');

  this.products.forEach(item => {
    const productPrice = item.product.price || item.individualPrice || 0;
    totalPrice += productPrice * item.quantity;
  });

  this.pricing.originalPrice = totalPrice;

  // Apply discount
  if (this.pricing.discount.type === 'fixed') {
    this.pricing.bundlePrice = totalPrice - this.pricing.discount.value;
  } else if (this.pricing.discount.type === 'percentage') {
    this.pricing.bundlePrice = totalPrice * (1 - this.pricing.discount.value / 100);
  }

  this.pricing.savings = this.pricing.originalPrice - this.pricing.bundlePrice;
  this.pricing.savingsPercentage = (this.pricing.savings / this.pricing.originalPrice) * 100;

  return this.pricing.bundlePrice;
};

// Method: Check Inventory
productBundleKitSchema.methods.checkInventory = async function () {
  await this.populate('products.product');

  let minAvailable = Infinity;

  this.products.forEach(item => {
    if (item.product.stock !== undefined) {
      const availableForBundle = Math.floor(item.product.stock / item.quantity);
      minAvailable = Math.min(minAvailable, availableForBundle);
    }
  });

  this.inventory.availableQuantity = minAvailable === Infinity ? 0 : minAvailable;

  // Update stock status
  if (this.inventory.availableQuantity === 0) {
    this.inventory.stockStatus = 'out-of-stock';
  } else if (this.inventory.availableQuantity <= this.inventory.lowStockThreshold) {
    this.inventory.stockStatus = 'low-stock';
  } else {
    this.inventory.stockStatus = 'in-stock';
  }

  this.inventory.lastInventorySync = Date.now();

  return this.inventory.availableQuantity;
};

// Method: Add to Analytics
productBundleKitSchema.methods.recordView = function () {
  this.analytics.views += 1;
  this.analytics.lastUpdated = Date.now();
};

productBundleKitSchema.methods.recordAddToCart = function () {
  this.analytics.addedToCart += 1;
  this.analytics.lastUpdated = Date.now();
};

productBundleKitSchema.methods.recordPurchase = function (quantity = 1) {
  this.analytics.totalSold += quantity;
  this.analytics.totalRevenue += this.pricing.bundlePrice * quantity;
  this.analytics.totalSavingsProvided += this.pricing.savings * quantity;

  // Update conversion rate
  if (this.analytics.addedToCart > 0) {
    this.analytics.conversionRate = (this.analytics.totalSold / this.analytics.addedToCart) * 100;
  }

  this.analytics.lastUpdated = Date.now();
};

// Method: Validate Bundle
productBundleKitSchema.methods.validateBundle = function () {
  const errors = [];

  // Check if bundle has products
  if (!this.products || this.products.length === 0) {
    errors.push('Bundle must have at least one product');
  }

  // Check pricing
  if (this.pricing.bundlePrice >= this.pricing.originalPrice) {
    errors.push('Bundle price must be less than original price');
  }

  // Check mix & match configuration
  if (this.bundleType === 'mix-and-match' && this.mixAndMatch.enabled) {
    if (!this.mixAndMatch.categories || this.mixAndMatch.categories.length === 0) {
      errors.push('Mix & match bundle must have categories');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Method: Clone Bundle
productBundleKitSchema.methods.cloneBundle = function (newName) {
  const clonedBundle = this.toObject();
  delete clonedBundle._id;
  delete clonedBundle.createdAt;
  delete clonedBundle.updatedAt;

  clonedBundle.bundleName = newName || `${this.bundleName} (Copy)`;
  clonedBundle.status = 'draft';
  clonedBundle.analytics = {
    totalSold: 0,
    totalRevenue: 0,
    views: 0,
    addedToCart: 0,
    conversionRate: 0
  };

  return new this.constructor(clonedBundle);
};

// Static: Get Active Bundles
productBundleKitSchema.statics.getActiveBundles = function () {
  return this.find({
    status: 'active',
    'availability.isAvailable': true
  }).populate('products.product');
};

// Static: Get Featured Bundles
productBundleKitSchema.statics.getFeaturedBundles = function (limit = 10) {
  return this.find({
    status: 'active',
    'promotional.isFeatured': true
  })
    .sort({ 'analytics.totalSold': -1 })
    .limit(limit)
    .populate('products.product');
};

// Static: Get Best Sellers
productBundleKitSchema.statics.getBestSellers = function (limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'analytics.totalSold': -1 })
    .limit(limit)
    .populate('products.product');
};

// Static: Get Bundles by Category
productBundleKitSchema.statics.getBundlesByCategory = function (category) {
  return this.find({
    status: 'active',
    category
  }).populate('products.product');
};

// Static: Search Bundles
productBundleKitSchema.statics.searchBundles = function (searchTerm) {
  return this.find({
    status: 'active',
    $or: [
      { bundleName: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  }).populate('products.product');
};

// Pre-save: Generate slug
productBundleKitSchema.pre('save', function (next) {
  if (this.isModified('bundleName') && !this.seo.slug) {
    this.seo.slug = this.bundleName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const ProductBundleKit = mongoose.model('ProductBundleKit', productBundleKitSchema);
export default ProductBundleKit;
export { ProductBundleKit };
