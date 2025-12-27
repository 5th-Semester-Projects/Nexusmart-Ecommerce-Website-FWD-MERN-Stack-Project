import mongoose from 'mongoose';

const productBundleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  bundleType: {
    type: String,
    enum: ['fixed', 'flexible', 'mix_match'],
    default: 'fixed'
  },
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
    isOptional: {
      type: Boolean,
      default: false
    },
    price: Number
  }],
  pricing: {
    totalRegularPrice: Number,
    bundlePrice: Number,
    discountAmount: Number,
    discountPercentage: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  inventory: {
    stockQuantity: Number,
    trackInventory: {
      type: Boolean,
      default: true
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  rules: {
    minItems: Number,
    maxItems: Number,
    allowDuplicates: {
      type: Boolean,
      default: false
    }
  },
  images: [String],
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'soldout', 'discontinued'],
    default: 'active'
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    addedToCart: {
      type: Number,
      default: 0
    },
    purchased: {
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
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      unique: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

productBundleSchema.index({ status: 1 });

export default mongoose.model('ProductBundle', productBundleSchema);
