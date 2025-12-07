import mongoose from 'mongoose';

/**
 * Multi-Vendor / Seller System Model
 */

const sellerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Business Info
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessType: {
    type: String,
    enum: ['individual', 'company', 'partnership'],
    default: 'individual'
  },
  description: String,
  logo: {
    public_id: String,
    url: String
  },
  banner: {
    public_id: String,
    url: String
  },

  // Contact
  email: {
    type: String,
    required: true
  },
  phone: String,
  website: String,

  // Address
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },

  // Verification
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'rejected'],
    default: 'pending'
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified'],
    default: 'unverified'
  },
  documents: [{
    type: { type: String, enum: ['id', 'business_license', 'tax_certificate', 'bank_statement'] },
    url: String,
    verified: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Tax Info
  taxId: String,
  vatNumber: String,

  // Bank/Payment Info
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    swiftCode: String,
    iban: String
  },
  paypalEmail: String,
  stripeAccountId: String,

  // Commission
  commissionRate: {
    type: Number,
    default: 10, // 10%
    min: 0,
    max: 100
  },
  commissionType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },

  // Performance
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalProducts: { type: Number, default: 0 },

  // Settings
  autoApproveProducts: { type: Boolean, default: false },
  shippingMethods: [{
    name: String,
    price: Number,
    estimatedDays: Number,
    isActive: { type: Boolean, default: true }
  }],
  returnPolicy: String,
  shippingPolicy: String,

  // Categories
  allowedCategories: [String],

  // Notifications
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true }
  },

  // Vacation Mode
  vacationMode: {
    isActive: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    message: String
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * Seller Payout Model
 */
const sellerPayoutSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'stripe'],
    required: true
  },

  // Period
  periodStart: Date,
  periodEnd: Date,

  // Breakdown
  grossAmount: Number,
  commission: Number,
  fees: Number,
  netAmount: Number,

  // Orders included
  orders: [{
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: Number,
    commission: Number
  }],

  // Transaction
  transactionId: String,
  transactionDate: Date,
  failureReason: String,

  // Invoice
  invoiceNumber: String,
  invoiceUrl: String,

  processedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

/**
 * Seller Analytics Snapshot
 */
const sellerAnalyticsSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  date: {
    type: Date,
    required: true
  },

  // Daily metrics
  orders: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  netEarnings: { type: Number, default: 0 },

  // Product metrics
  productViews: { type: Number, default: 0 },
  addToCartCount: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },

  // Customer metrics
  newCustomers: { type: Number, default: 0 },
  returningCustomers: { type: Number, default: 0 },

  // Order metrics
  averageOrderValue: { type: Number, default: 0 },
  cancelledOrders: { type: Number, default: 0 },
  returnedOrders: { type: Number, default: 0 },

  // Top products
  topProducts: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sales: Number,
    revenue: Number
  }],

  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
sellerAnalyticsSchema.index({ seller: 1, date: -1 });

export const Seller = mongoose.model('Seller', sellerSchema);
export const SellerPayout = mongoose.model('SellerPayout', sellerPayoutSchema);
export const SellerAnalytics = mongoose.model('SellerAnalytics', sellerAnalyticsSchema);
