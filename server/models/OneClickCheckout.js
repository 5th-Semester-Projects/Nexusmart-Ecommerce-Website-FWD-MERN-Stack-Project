import mongoose from 'mongoose';

const oneClickCheckoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Saved payment methods
  paymentMethods: [{
    id: String,
    type: {
      type: String,
      enum: ['card', 'paypal', 'apple_pay', 'google_pay', 'bank_account'],
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },

    // Card details (tokenized)
    card: {
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number,
      holderName: String,
      token: String,
      fingerprint: String
    },

    // Digital wallet
    wallet: {
      email: String,
      accountId: String
    },

    // Bank account
    bankAccount: {
      last4: String,
      bankName: String,
      accountType: String,
      routingNumber: String
    },

    billing Address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },

    addedAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date,
    verified: {
      type: Boolean,
      default: false
    }
  }],

  // Saved shipping addresses
  shippingAddresses: [{
    id: String,
    label: {
      type: String,
      enum: ['home', 'work', 'other']
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    apartment: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    instructions: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date,
    verified: {
      type: Boolean,
      default: false
    }
  }],

  // Checkout preferences
  preferences: {
    defaultShippingSpeed: {
      type: String,
      enum: ['standard', 'express', 'priority', 'same_day'],
      default: 'standard'
    },
    giftWrapping: {
      type: Boolean,
      default: false
    },
    leaveAtDoor: {
      type: Boolean,
      default: false
    },
    requireSignature: {
      type: Boolean,
      default: false
    },
    marketingConsent: {
      type: Boolean,
      default: false
    },
    saveCardForFuture: {
      type: Boolean,
      default: true
    }
  },

  // One-click settings
  oneClickSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    requireBiometric: {
      type: Boolean,
      default: false
    },
    requirePassword: {
      type: Boolean,
      default: false
    },
    confirmBeforePurchase: {
      type: Boolean,
      default: true
    },
    maxOrderValue: Number, // Maximum order value for one-click
    dailyLimit: Number,
    monthlyLimit: Number
  },

  // Security
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    biometricEnabled: {
      type: Boolean,
      default: false
    },
    deviceFingerprints: [{
      fingerprint: String,
      deviceName: String,
      lastUsed: Date,
      trusted: {
        type: Boolean,
        default: false
      }
    }],
    ipWhitelist: [String],
    lastSecurityCheck: Date
  },

  // Usage analytics
  analytics: {
    totalOrders: {
      type: Number,
      default: 0
    },
    oneClickOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    avgOrderValue: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date,
    avgCheckoutTime: Number, // seconds
    abandonmentRate: {
      type: Number,
      default: 0
    }
  },

  // Recent orders for quick reorder
  recentOrders: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    date: Date,
    total: Number,
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      name: String,
      quantity: Number,
      price: Number
    }]
  }],

  // Express checkout tokens (for external platforms)
  expressTokens: [{
    platform: {
      type: String,
      enum: ['shopify', 'amazon', 'paypal', 'stripe']
    },
    token: String,
    expiresAt: Date,
    active: {
      type: Boolean,
      default: true
    }
  }],

  // Notifications
  notifications: {
    orderConfirmation: {
      type: Boolean,
      default: true
    },
    shipping Updates: {
      type: Boolean,
      default: true
    },
    deliveryNotification: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: false
    }
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending_verification'],
    default: 'active'
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
oneClickCheckoutSchema.index({ user: 1 });
oneClickCheckoutSchema.index({ 'paymentMethods.isDefault': 1 });
oneClickCheckoutSchema.index({ 'shippingAddresses.isDefault': 1 });

// Method to get default payment method
oneClickCheckoutSchema.methods.getDefaultPaymentMethod = function () {
  return this.paymentMethods.find(pm => pm.isDefault);
};

// Method to get default shipping address
oneClickCheckoutSchema.methods.getDefaultShippingAddress = function () {
  return this.shippingAddresses.find(addr => addr.isDefault);
};

// Method to add payment method
oneClickCheckoutSchema.methods.addPaymentMethod = function (paymentData) {
  // If this is the first payment method, make it default
  const isFirst = this.paymentMethods.length === 0;

  this.paymentMethods.push({
    ...paymentData,
    isDefault: isFirst,
    addedAt: Date.now()
  });
};

// Method to add shipping address
oneClickCheckoutSchema.methods.addShippingAddress = function (addressData) {
  // If this is the first address, make it default
  const isFirst = this.shippingAddresses.length === 0;

  this.shippingAddresses.push({
    ...addressData,
    isDefault: isFirst,
    addedAt: Date.now()
  });
};

// Method to set default payment method
oneClickCheckoutSchema.methods.setDefaultPaymentMethod = function (paymentId) {
  this.paymentMethods.forEach(pm => {
    pm.isDefault = pm.id === paymentId;
  });
};

// Method to set default shipping address
oneClickCheckoutSchema.methods.setDefaultShippingAddress = function (addressId) {
  this.shippingAddresses.forEach(addr => {
    addr.isDefault = addr.id === addressId;
  });
};

// Method to validate one-click purchase
oneClickCheckoutSchema.methods.validateOneClickPurchase = function (orderValue) {
  if (!this.oneClickSettings.enabled) {
    throw new Error('One-click checkout is disabled');
  }

  if (this.status !== 'active') {
    throw new Error('Checkout profile is not active');
  }

  if (this.oneClickSettings.maxOrderValue && orderValue > this.oneClickSettings.maxOrderValue) {
    throw new Error(`Order value exceeds one-click limit of $${this.oneClickSettings.maxOrderValue}`);
  }

  if (!this.getDefaultPaymentMethod()) {
    throw new Error('No default payment method set');
  }

  if (!this.getDefaultShippingAddress()) {
    throw new Error('No default shipping address set');
  }

  return true;
};

// Method to update analytics
oneClickCheckoutSchema.methods.updateAnalytics = function (orderValue, isOneClick = false) {
  this.analytics.totalOrders++;
  if (isOneClick) {
    this.analytics.oneClickOrders++;
  }
  this.analytics.totalSpent += orderValue;
  this.analytics.avgOrderValue = this.analytics.totalSpent / this.analytics.totalOrders;
  this.analytics.lastOrderDate = Date.now();
};

const OneClickCheckout = mongoose.model('OneClickCheckout', oneClickCheckoutSchema);
export default OneClickCheckout;
export { OneClickCheckout };
