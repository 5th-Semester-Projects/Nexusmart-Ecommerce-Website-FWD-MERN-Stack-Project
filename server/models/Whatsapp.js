import mongoose from 'mongoose';

/**
 * WhatsApp Integration Model
 */

// WhatsApp Business Account Config
const whatsappConfigSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },

  // WhatsApp Business API Credentials
  phoneNumberId: {
    type: String,
    required: true
  },
  businessAccountId: String,
  accessToken: String, // Encrypted
  webhookVerifyToken: String,

  // Business Profile
  businessName: String,
  businessDescription: String,
  businessCategory: String,
  profilePictureUrl: String,

  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },

  // Settings
  autoReply: { type: Boolean, default: true },
  autoReplyMessage: String,
  businessHours: {
    enabled: { type: Boolean, default: false },
    timezone: String,
    schedule: [{
      day: String,
      openTime: String,
      closeTime: String
    }],
    outsideHoursMessage: String
  },

  // Features
  enableOrderUpdates: { type: Boolean, default: true },
  enableDeliveryUpdates: { type: Boolean, default: true },
  enablePromotions: { type: Boolean, default: false },
  enableCatalog: { type: Boolean, default: true },

  // Templates
  orderConfirmationTemplate: String,
  shippingUpdateTemplate: String,
  deliveryConfirmationTemplate: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * WhatsApp Conversation Schema
 */
const whatsappConversationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },

  // Customer Info
  customerPhone: {
    type: String,
    required: true
  },
  customerName: String,
  customerWhatsappId: String,

  // Conversation Status
  status: {
    type: String,
    enum: ['active', 'pending', 'resolved', 'spam'],
    default: 'active'
  },

  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,

  // Labels/Tags
  labels: [String],

  // Related Order
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },

  // Last Message
  lastMessageAt: Date,
  lastMessagePreview: String,
  unreadCount: { type: Number, default: 0 },

  // 24-hour window
  lastCustomerMessageAt: Date,
  canSendTemplateOnly: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * WhatsApp Message Schema
 */
const whatsappMessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsappConversation',
    required: true
  },

  // Message Details
  messageId: String, // WhatsApp message ID
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },

  // Message Type
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contact', 'template', 'interactive', 'order', 'product'],
    required: true
  },

  // Content
  text: String,

  // Media
  media: {
    url: String,
    mimeType: String,
    caption: String,
    filename: String,
    sha256: String
  },

  // Location
  location: {
    latitude: Number,
    longitude: Number,
    name: String,
    address: String
  },

  // Interactive Message
  interactive: {
    type: { type: String, enum: ['button', 'list', 'product', 'product_list'] },
    header: String,
    body: String,
    footer: String,
    buttons: [{
      id: String,
      title: String,
      type: String
    }],
    sections: [{
      title: String,
      rows: [{
        id: String,
        title: String,
        description: String
      }]
    }]
  },

  // Template Message
  template: {
    name: String,
    language: String,
    components: [{
      type: String,
      parameters: [mongoose.Schema.Types.Mixed]
    }]
  },

  // Product/Order
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }],

  // Status
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  failedReason: String,

  // Reply Reference
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsappMessage'
  },

  // Bot/Automation
  isAutomated: { type: Boolean, default: false },
  automationRule: String,

  createdAt: { type: Date, default: Date.now }
});

/**
 * WhatsApp Message Template Schema
 */
const whatsappTemplateSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },

  // Template Details
  name: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  category: {
    type: String,
    enum: ['UTILITY', 'MARKETING', 'AUTHENTICATION'],
    required: true
  },

  // Status (from WhatsApp)
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED'],
    default: 'PENDING'
  },
  rejectionReason: String,

  // Template Components
  components: [{
    type: {
      type: String,
      enum: ['HEADER', 'BODY', 'FOOTER', 'BUTTONS']
    },
    format: String, // TEXT, IMAGE, VIDEO, DOCUMENT
    text: String,
    example: mongoose.Schema.Types.Mixed,
    buttons: [{
      type: String,
      text: String,
      url: String,
      phoneNumber: String
    }]
  }],

  // Variables
  variables: [{
    name: String,
    type: String,
    example: String
  }],

  // Usage Stats
  sentCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * WhatsApp Broadcast Schema
 */
const whatsappBroadcastSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },

  name: {
    type: String,
    required: true
  },

  // Template to use
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsappTemplate',
    required: true
  },

  // Recipients
  recipientType: {
    type: String,
    enum: ['all', 'segment', 'custom'],
    default: 'custom'
  },
  segment: String,
  recipients: [{
    phone: String,
    name: String,
    variables: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending'
    },
    sentAt: Date
  }],

  // Schedule
  scheduledAt: Date,

  // Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'completed', 'cancelled'],
    default: 'draft'
  },

  // Stats
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },

  startedAt: Date,
  completedAt: Date,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
whatsappConversationSchema.index({ customerPhone: 1, seller: 1 });
whatsappConversationSchema.index({ status: 1, lastMessageAt: -1 });
whatsappMessageSchema.index({ conversation: 1, createdAt: -1 });

export const WhatsappConfig = mongoose.model('WhatsappConfig', whatsappConfigSchema);
export const WhatsappConversation = mongoose.model('WhatsappConversation', whatsappConversationSchema);
export const WhatsappMessage = mongoose.model('WhatsappMessage', whatsappMessageSchema);
export const WhatsappTemplate = mongoose.model('WhatsappTemplate', whatsappTemplateSchema);
export const WhatsappBroadcast = mongoose.model('WhatsappBroadcast', whatsappBroadcastSchema);
