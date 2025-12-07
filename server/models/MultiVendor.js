import mongoose from 'mongoose';

const multiVendorSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessInfo: {
    businessName: {
      type: String,
      required: true,
      trim: true
    },
    businessType: {
      type: String,
      enum: ['individual', 'company', 'partnership'],
      required: true
    },
    registrationNumber: String,
    taxId: String,
    logo: String,
    description: String
  },
  contact: {
    email: String,
    phone: String,
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    swiftCode: String
  },
  commission: {
    type: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage'
    },
    value: {
      type: Number,
      required: true,
      default: 15
    },
    customRates: [{
      category: String,
      rate: Number
    }]
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  performance: {
    totalSales: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    commissionEarned: {
      type: Number,
      default: 0
    },
    fulfillmentRate: {
      type: Number,
      default: 100
    },
    responseTime: Number,
    cancelationRate: {
      type: Number,
      default: 0
    }
  },
  payouts: [{
    amount: Number,
    period: {
      start: Date,
      end: Date
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed'],
      default: 'pending'
    },
    paidAt: Date,
    transactionId: String
  }],
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    documents: [{
      type: String,
      url: String,
      status: String,
      uploadedAt: Date
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'banned', 'closed'],
    default: 'pending'
  },
  settings: {
    vacationMode: {
      enabled: { type: Boolean, default: false },
      startDate: Date,
      endDate: Date,
      message: String
    },
    shippingMethods: [String],
    returnPolicy: String,
    processingTime: Number
  }
}, { timestamps: true });

multiVendorSchema.index({ seller: 1 });
multiVendorSchema.index({ status: 1 });
multiVendorSchema.index({ 'ratings.average': -1 });

export default mongoose.model('MultiVendor', multiVendorSchema);
