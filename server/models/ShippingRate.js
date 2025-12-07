import mongoose from 'mongoose';

const shippingRateSchema = new mongoose.Schema({
  carrier: {
    name: {
      type: String,
      required: true,
      enum: ['fedex', 'ups', 'dhl', 'usps', 'aramex', 'custom']
    },
    serviceType: String,
    accountNumber: String
  },
  origin: {
    country: String,
    state: String,
    city: String,
    zipCode: String
  },
  destination: {
    country: String,
    state: String,
    city: String,
    zipCode: String
  },
  package: {
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lb', 'g', 'oz'],
        default: 'kg'
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    },
    value: Number,
    currency: String
  },
  rate: {
    baseRate: Number,
    fuelSurcharge: Number,
    handlingFee: Number,
    insuranceFee: Number,
    additionalFees: [{
      name: String,
      amount: Number
    }],
    totalRate: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  transit: {
    estimatedDays: Number,
    guaranteed: {
      type: Boolean,
      default: false
    },
    estimatedDeliveryDate: Date
  },
  features: {
    tracking: {
      type: Boolean,
      default: true
    },
    insurance: {
      type: Boolean,
      default: false
    },
    signatureRequired: {
      type: Boolean,
      default: false
    },
    saturday Delivery: {
      type: Boolean,
      default: false
    }
  },
  restrictions: {
    maxWeight: Number,
    maxDimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    prohibitedItems: [String],
    hazardousMaterials: {
      type: Boolean,
      default: false
    }
  },
  apiResponse: mongoose.Schema.Types.Mixed,
  calculatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

shippingRateSchema.index({ 'carrier.name': 1 });
shippingRateSchema.index({ calculatedAt: 1 });

export default mongoose.model('ShippingRate', shippingRateSchema);
