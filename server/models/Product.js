import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
      maxLength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
      maxLength: [4000, 'Description cannot exceed 4000 characters'],
    },
    shortDescription: {
      type: String,
      maxLength: [500, 'Short description cannot exceed 500 characters'],
    },

    // Pricing
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      maxLength: [8, 'Price cannot exceed 8 digits'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },

    // Category & Classification
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select product category'],
    },
    subCategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    tags: [String],

    // Inventory Management
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    sku: {
      type: String,
      required: [true, 'Please enter product SKU'],
      unique: true,
      trim: true,
    },
    barcode: String,
    lowStockThreshold: {
      type: Number,
      default: 10,
    },

    // Media Assets
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    videos: [
      {
        public_id: String,
        url: String,
        thumbnail: String,
        duration: Number,
      },
    ],

    // 3D & AR Assets
    model3D: {
      fileUrl: String,
      format: {
        type: String,
        enum: ['glb', 'gltf', 'obj', 'fbx'],
      },
      size: Number,
      thumbnail: String,
    },
    arEnabled: {
      type: Boolean,
      default: false,
    },
    arAssets: {
      iosModel: String, // USDZ format for iOS
      androidModel: String, // GLB format for Android
      scale: {
        type: Number,
        default: 1,
      },
    },

    // Product Variants
    variants: [
      {
        name: String, // e.g., "Color", "Size"
        options: [
          {
            value: String, // e.g., "Red", "Large"
            price: Number,
            stock: Number,
            sku: String,
            images: [String],
          },
        ],
      },
    ],

    // Specifications
    specifications: [
      {
        name: String,
        value: String,
      },
    ],
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inch', 'm'],
        default: 'cm',
      },
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'g', 'lb'],
        default: 'kg',
      },
    },

    // Ratings & Reviews
    ratings: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],

    // AI & ML Features
    aiTags: [String], // AI-generated tags
    similarityVector: [Number], // Embedding vector for similarity search
    seasonalTags: [String], // E.g., "summer", "winter", "festive"
    trendingScore: {
      type: Number,
      default: 0,
    },
    aiRecommendationScore: {
      type: Number,
      default: 0,
    },
    predictedDemand: {
      type: Number,
      default: 0,
    },

    // SEO & Marketing
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      slug: {
        type: String,
        unique: true,
        lowercase: true,
      },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },

    // Seller Information
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerInfo: {
      name: String,
      rating: Number,
      totalProducts: Number,
    },

    // Shipping & Returns
    shipping: {
      isFreeShipping: {
        type: Boolean,
        default: false,
      },
      shippingCost: {
        type: Number,
        default: 0,
      },
      estimatedDelivery: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ['days', 'weeks'],
          default: 'days',
        },
      },
    },
    returnPolicy: {
      returnable: {
        type: Boolean,
        default: true,
      },
      returnWindow: {
        type: Number,
        default: 30, // days
      },
    },

    // Analytics
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Number,
      default: 0,
    },
    wishlistCount: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ['draft', 'active', 'out-of-stock', 'discontinued'],
      default: 'active',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: Date,

    // Blockchain Authentication (Optional)
    blockchain: {
      certificateId: String,
      ownershipHistory: [
        {
          owner: String,
          timestamp: Date,
          transactionHash: String,
        },
      ],
      isAuthentic: {
        type: Boolean,
        default: false,
      },
      verificationHash: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
// Note: sku and seo.slug already have unique: true which creates indexes automatically
productSchema.index({ seller: 1 });
productSchema.index({ trendingScore: -1 });
productSchema.index({ createdAt: -1 });

// Generate SEO slug before saving
productSchema.pre('save', function (next) {
  if (!this.seo.slug && this.name) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Calculate discount percentage
productSchema.pre('save', function (next) {
  if (this.originalPrice && this.price) {
    this.discount = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }
  next();
});

// Update stock status
productSchema.pre('save', function (next) {
  if (this.stock === 0) {
    this.status = 'out-of-stock';
  } else if (this.status === 'out-of-stock' && this.stock > 0) {
    this.status = 'active';
  }
  next();
});

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function () {
  return `$${this.price.toFixed(2)}`;
});

// Method to check if product is low on stock
productSchema.methods.isLowStock = function () {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
};

// Method to increment views
productSchema.methods.incrementViews = async function () {
  this.views += 1;
  return await this.save();
};

// Static method to get trending products
productSchema.statics.getTrending = function (limit = 10) {
  return this.find({ status: 'active' })
    .sort({ trendingScore: -1, purchases: -1 })
    .limit(limit)
    .populate('category', 'name');
};

// Static method to get new arrivals
productSchema.statics.getNewArrivals = function (limit = 10) {
  return this.find({ status: 'active', newArrival: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name');
};

const Product = mongoose.model('Product', productSchema);
export default Product;
export { Product };
