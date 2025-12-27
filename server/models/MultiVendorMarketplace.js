import mongoose from 'mongoose';

const multiVendorMarketplaceSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Business information
  businessInfo: {
    businessName: {
      type: String,
      required: true,
      trim: true
    },
    businessType: {
      type: String,
      enum: ['individual', 'partnership', 'llc', 'corporation', 'ngo'],
      required: true
    },
    registrationNumber: String,
    taxId: String,
    establishedYear: Number,
    description: {
      type: String,
      maxlength: 2000
    },
    logo: String,
    banner: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String
    }
  },

  // Store settings
  storeSettings: {
    storeName: {
      type: String,
      required: true,
      unique: true
    },
    storeSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    tagline: String,
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    policies: {
      returnPolicy: String,
      shippingPolicy: String,
      privacyPolicy: String,
      termsOfService: String
    },
    customDomain: String,
    theme: {
      primaryColor: String,
      secondaryColor: String,
      font: String,
      layout: String
    }
  },

  // Contact information
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      latitude: Number,
      longitude: Number
    },
    supportHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    }
  },

  // Verification & compliance
  verification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending'
    },
    documents: [{
      type: {
        type: String,
        enum: ['business_license', 'tax_certificate', 'id_proof', 'address_proof', 'bank_statement', 'other']
      },
      url: String,
      uploadedAt: Date,
      verifiedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      rejectionReason: String
    }],
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    kycCompleted: {
      type: Boolean,
      default: false
    },
    backgroundCheckPassed: {
      type: Boolean,
      default: false
    }
  },

  // Payment settings
  paymentSettings: {
    bankAccount: {
      accountHolderName: String,
      accountNumber: String,
      bankName: String,
      branchCode: String,
      swiftCode: String,
      iban: String,
      verified: {
        type: Boolean,
        default: false
      }
    },
    paypalEmail: String,
    stripeAccountId: String,
    paymentMethods: [{
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe', 'crypto']
    }],
    commissionRate: {
      type: Number,
      default: 15,
      min: 0,
      max: 100
    },
    payoutSchedule: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly'
    },
    minimumPayout: {
      type: Number,
      default: 100
    }
  },

  // Financial tracking
  finances: {
    balance: {
      available: {
        type: Number,
        default: 0
      },
      pending: {
        type: Number,
        default: 0
      },
      reserved: {
        type: Number,
        default: 0
      }
    },
    earnings: {
      total: {
        type: Number,
        default: 0
      },
      thisMonth: {
        type: Number,
        default: 0
      },
      lastMonth: {
        type: Number,
        default: 0
      },
      thisYear: {
        type: Number,
        default: 0
      }
    },
    commissions: {
      totalPaid: {
        type: Number,
        default: 0
      },
      thisMonth: {
        type: Number,
        default: 0
      }
    },
    payouts: [{
      amount: Number,
      method: String,
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      requestedAt: Date,
      processedAt: Date,
      reference: String,
      failureReason: String
    }]
  },

  // Inventory & products
  inventory: {
    totalProducts: {
      type: Number,
      default: 0
    },
    activeProducts: {
      type: Number,
      default: 0
    },
    outOfStock: {
      type: Number,
      default: 0
    },
    lowStock: {
      type: Number,
      default: 0
    },
    totalVariants: {
      type: Number,
      default: 0
    },
    averagePrice: {
      type: Number,
      default: 0
    }
  },

  // Sales metrics
  sales: {
    totalOrders: {
      type: Number,
      default: 0
    },
    completedOrders: {
      type: Number,
      default: 0
    },
    cancelledOrders: {
      type: Number,
      default: 0
    },
    returnedOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    avgOrderValue: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    repeatCustomerRate: {
      type: Number,
      default: 0
    }
  },

  // Performance metrics
  performance: {
    rating: {
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
      breakdown: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 }
      }
    },
    responseTime: {
      average: Number, // in hours
      median: Number
    },
    fulfillmentRate: {
      type: Number,
      default: 100
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 100
    },
    customerSatisfaction: {
      type: Number,
      default: 0
    },
    disputeRate: {
      type: Number,
      default: 0
    }
  },

  // Shipping settings
  shipping: {
    handlingTime: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        enum: ['hours', 'days'],
        default: 'days'
      }
    },
    shippingMethods: [{
      name: String,
      carrier: String,
      estimatedDays: {
        min: Number,
        max: Number
      },
      cost: Number,
      freeShippingThreshold: Number,
      regions: [String],
      enabled: {
        type: Boolean,
        default: true
      }
    }],
    internationalShipping: {
      type: Boolean,
      default: false
    },
    shippingFrom: {
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },

  // Subscriptions & plans
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: true
    },
    features: {
      maxProducts: Number,
      maxImages: Number,
      customDomain: Boolean,
      prioritySupport: Boolean,
      advancedAnalytics: Boolean,
      apiAccess: Boolean
    }
  },

  // Notifications preferences
  notifications: {
    newOrder: {
      type: Boolean,
      default: true
    },
    lowStock: {
      type: Boolean,
      default: true
    },
    customerMessage: {
      type: Boolean,
      default: true
    },
    review: {
      type: Boolean,
      default: true
    },
    payout: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    }
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_approval', 'banned'],
    default: 'pending_approval'
  },
  suspensionReason: String,
  suspendedAt: Date,
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },

  // Activity tracking
  lastActive: Date,
  lastSale: Date,
  lastPayout: Date
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

// Indexes
multiVendorMarketplaceSchema.index({ 'verification.status': 1 });
multiVendorMarketplaceSchema.index({ status: 1 });
multiVendorMarketplaceSchema.index({ 'performance.rating.average': -1 });

// Virtual for total balance
multiVendorMarketplaceSchema.virtual('totalBalance').get(function () {
  return this.finances.balance.available + this.finances.balance.pending;
});

// Method to update rating
multiVendorMarketplaceSchema.methods.updateRating = function (newRating) {
  const breakdown = this.performance.rating.breakdown;
  breakdown[newRating]++;

  const totalRatings = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
  const weightedSum = Object.entries(breakdown).reduce((sum, [rating, count]) => sum + (Number(rating) * count), 0);

  this.performance.rating.average = weightedSum / totalRatings;
  this.performance.rating.count = totalRatings;
};

// Method to process payout
multiVendorMarketplaceSchema.methods.requestPayout = function (amount) {
  if (amount > this.finances.balance.available) {
    throw new Error('Insufficient balance');
  }

  if (amount < this.paymentSettings.minimumPayout) {
    throw new Error(`Minimum payout amount is ${this.paymentSettings.minimumPayout}`);
  }

  this.finances.balance.available -= amount;
  this.finances.balance.pending += amount;

  this.finances.payouts.push({
    amount,
    method: this.paymentSettings.paymentMethods[0],
    status: 'pending',
    requestedAt: Date.now()
  });
};

// Static method to get top vendors
multiVendorMarketplaceSchema.statics.getTopVendors = function (limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'performance.rating.average': -1, 'sales.totalRevenue': -1 })
    .limit(limit)
    .select('businessInfo storeSettings performance sales');
};

const MultiVendorMarketplace = mongoose.model('MultiVendorMarketplace', multiVendorMarketplaceSchema);
export default MultiVendorMarketplace;
export { MultiVendorMarketplace };
