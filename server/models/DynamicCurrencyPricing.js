import mongoose from 'mongoose';

const dynamicCurrencyPricingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  baseCurrency: {
    type: String,
    default: 'USD'
  },
  basePrice: {
    type: Number,
    required: true
  },
  currencies: [{
    code: String,
    symbol: String,
    price: Number,
    exchangeRate: Number,
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    markup: {
      type: Number,
      default: 0
    }
  }],
  autoUpdate: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily'],
      default: 'hourly'
    },
    lastUpdateAt: Date,
    nextUpdateAt: Date
  },
  rules: [{
    currency: String,
    minPrice: Number,
    maxPrice: Number,
    roundingRule: {
      type: String,
      enum: ['none', 'up', 'down', 'nearest'],
      default: 'nearest'
    },
    roundingPrecision: {
      type: Number,
      default: 2
    }
  }],
  priceHistory: [{
    currency: String,
    price: Number,
    exchangeRate: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

dynamicCurrencyPricingSchema.index({ product: 1 });
dynamicCurrencyPricingSchema.index({ 'currencies.code': 1 });

export default mongoose.model('DynamicCurrencyPricing', dynamicCurrencyPricingSchema);
