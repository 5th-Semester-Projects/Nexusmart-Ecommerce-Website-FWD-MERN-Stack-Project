import mongoose from 'mongoose';

const volumeDiscountingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  discountType: {
    type: String,
    enum: ['product', 'category', 'order_total', 'customer_specific'],
    required: true
  },
  tiers: [{
    minQuantity: {
      type: Number,
      required: true
    },
    maxQuantity: Number,
    discount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed', 'price_override'],
        required: true
      },
      value: {
        type: Number,
        required: true
      }
    },
    description: String
  }],
  conditions: {
    customerTypes: [{
      type: String,
      enum: ['business', 'wholesale', 'retail', 'vip']
    }],
    minOrderValue: Number,
    validFrom: Date,
    validTo: Date,
    daysOfWeek: [Number],
    regions: [String],
    firstTimeOrder: Boolean,
    repeatCustomer: Boolean
  },
  cumulative: {
    enabled: {
      type: Boolean,
      default: false
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    },
    resetOn: Date
  },
  stackable: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 1
  },
  usage: {
    totalOrders: Number,
    totalRevenue: Number,
    totalDiscount: Number,
    averageOrderValue: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'scheduled', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

volumeDiscountingSchema.index({ product: 1 });
volumeDiscountingSchema.index({ category: 1 });
volumeDiscountingSchema.index({ business: 1 });
volumeDiscountingSchema.index({ status: 1 });

export default mongoose.model('VolumeDiscounting', volumeDiscountingSchema);
