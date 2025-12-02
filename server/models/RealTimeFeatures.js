import mongoose from 'mongoose';

// ==================== LIVE CHAT MESSAGE SCHEMA ====================
const liveChatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['customer', 'agent', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [{
    type: String,
    url: String,
    name: String,
  }],
  readAt: Date,
});

// ==================== LIVE CHAT SESSION SCHEMA ====================
const liveChatSessionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  messages: [liveChatMessageSchema],
  status: {
    type: String,
    enum: ['waiting', 'active', 'closed', 'abandoned'],
    default: 'waiting',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['order', 'product', 'payment', 'shipping', 'return', 'general'],
    default: 'general',
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    ratedAt: Date,
  },
  metadata: {
    userAgent: String,
    ip: String,
    page: String,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: Date,
  waitTime: Number, // in seconds
  responseTime: Number, // first response time in seconds
}, { timestamps: true });

liveChatSessionSchema.index({ customer: 1, status: 1 });
liveChatSessionSchema.index({ agent: 1, status: 1 });
liveChatSessionSchema.index({ status: 1, priority: -1, createdAt: 1 });

export const LiveChatSession = mongoose.model('LiveChatSession', liveChatSessionSchema);

// ==================== ORDER TRACKING SCHEMA ====================
const orderTrackingSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    city: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  deliveryPartner: {
    name: String,
    phone: String,
    photo: String,
    vehicleNumber: String,
    rating: Number,
  },
  route: [{
    latitude: Number,
    longitude: Number,
    timestamp: Date,
  }],
  estimatedArrival: Date,
  actualArrival: Date,
  distance: {
    remaining: Number, // in km
    total: Number,
  },
  status: {
    type: String,
    enum: ['preparing', 'picked_up', 'in_transit', 'nearby', 'delivered', 'failed'],
    default: 'preparing',
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    note: String,
  }],
  isLiveTracking: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

orderTrackingSchema.index({ order: 1 }, { unique: true });

export const OrderTracking = mongoose.model('OrderTracking', orderTrackingSchema);

// ==================== FLASH SALE SCHEMA ====================
const flashSaleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    limit: {
      type: Number,
      default: 1, // per user
    },
  }],
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  banner: {
    url: String,
    alt: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  totalViews: {
    type: Number,
    default: 0,
  },
  totalSold: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

flashSaleSchema.index({ startTime: 1, endTime: 1, isActive: 1 });

export const FlashSale = mongoose.model('FlashSale', flashSaleSchema);

// ==================== PRODUCT VIEW TRACKING ====================
const productViewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  viewers: [{
    sessionId: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  }],
  currentCount: {
    type: Number,
    default: 0,
  },
  peakCount: {
    type: Number,
    default: 0,
  },
  totalViews: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

productViewSchema.index({ product: 1 }, { unique: true });

export const ProductView = mongoose.model('ProductView', productViewSchema);

// ==================== PERSONALIZED DEAL SCHEMA ====================
const personalizedDealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  discount: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  discountCode: {
    type: String,
    required: true,
    unique: true,
  },
  reason: {
    type: String,
    enum: ['wishlist_item', 'browsing_history', 'cart_abandonment', 'loyalty_reward', 'win_back', 'birthday'],
    required: true,
  },
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedAt: Date,
  usedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
}, { timestamps: true });

personalizedDealSchema.index({ user: 1, isUsed: 1 });
personalizedDealSchema.index({ discountCode: 1 }, { unique: true });

export const PersonalizedDeal = mongoose.model('PersonalizedDeal', personalizedDealSchema);

// ==================== USER ANALYTICS SCHEMA ====================
const userAnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  spending: {
    total: {
      type: Number,
      default: 0,
    },
    byCategory: [{
      category: String,
      amount: Number,
    }],
    orderCount: {
      type: Number,
      default: 0,
    },
    averageOrderValue: {
      type: Number,
      default: 0,
    },
  },
  savings: {
    total: {
      type: Number,
      default: 0,
    },
    fromCoupons: {
      type: Number,
      default: 0,
    },
    fromDeals: {
      type: Number,
      default: 0,
    },
    fromPoints: {
      type: Number,
      default: 0,
    },
  },
  activity: {
    productsViewed: {
      type: Number,
      default: 0,
    },
    productsAddedToCart: {
      type: Number,
      default: 0,
    },
    productsWishlisted: {
      type: Number,
      default: 0,
    },
    searchCount: {
      type: Number,
      default: 0,
    },
    reviewsWritten: {
      type: Number,
      default: 0,
    },
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
  pointsRedeemed: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

userAnalyticsSchema.index({ user: 1, period: 1, date: -1 });

export const UserAnalytics = mongoose.model('UserAnalytics', userAnalyticsSchema);

// ==================== PRODUCT VIEWER SCHEMA ====================
const productViewerSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true,
  },
  viewerCount: {
    type: Number,
    default: 0,
  },
  viewers: [{
    sessionId: String,
    userId: mongoose.Schema.Types.ObjectId,
    joinedAt: { type: Date, default: Date.now },
  }],
  peakViewers: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export const ProductViewer = mongoose.model('ProductViewer', productViewerSchema);

// ==================== PRODUCT ACTIVITY SCHEMA ====================
const productActivitySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  type: {
    type: String,
    enum: ['view', 'cart', 'purchase', 'review', 'wishlist'],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: String,
  location: String,
}, { timestamps: true });

productActivitySchema.index({ product: 1, createdAt: -1 });

export const ProductActivity = mongoose.model('ProductActivity', productActivitySchema);

// ==================== SUPPORT TICKET SCHEMA ====================
const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['order', 'payment', 'shipping', 'product', 'technical', 'other'],
    default: 'other',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  messages: [{
    sender: mongoose.Schema.Types.ObjectId,
    message: String,
    createdAt: { type: Date, default: Date.now },
  }],
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
}, { timestamps: true });

supportTicketSchema.index({ user: 1, status: 1 });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default {
  LiveChatSession,
  OrderTracking,
  FlashSale,
  ProductView,
  PersonalizedDeal,
  UserAnalytics,
  ProductViewer,
  ProductActivity,
  SupportTicket,
};
