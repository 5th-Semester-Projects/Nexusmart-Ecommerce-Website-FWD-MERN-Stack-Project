import mongoose from 'mongoose';

// ==================== VIDEO CHAT SUPPORT ====================
const videoChatSessionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'on_hold', 'ended', 'missed'],
    default: 'waiting',
  },
  type: {
    type: String,
    enum: ['video', 'audio', 'screen_share'],
    default: 'video',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  reason: {
    type: String,
    enum: ['order_issue', 'product_inquiry', 'return_refund', 'technical_support', 'billing', 'other'],
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  startedAt: Date,
  endedAt: Date,
  duration: Number,
  waitTime: Number,
  screenShareEnabled: {
    type: Boolean,
    default: false,
  },
  recording: {
    enabled: {
      type: Boolean,
      default: false,
    },
    url: String,
    public_id: String,
  },
  notes: [{
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  resolution: {
    resolved: {
      type: Boolean,
      default: false,
    },
    resolutionType: String,
    notes: String,
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

videoChatSessionSchema.index({ customer: 1, status: 1 });
videoChatSessionSchema.index({ agent: 1, status: 1 });

export const VideoChatSession = mongoose.model('VideoChatSession', videoChatSessionSchema);

// ==================== FAQ CHATBOT ====================
const faqChatbotSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  keywords: [String],
  answer: {
    type: String,
    required: true,
  },
  richContent: {
    hasImages: Boolean,
    hasLinks: Boolean,
    hasSteps: Boolean,
    content: mongoose.Schema.Types.Mixed,
  },
  relatedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQChatbot',
  }],
  helpful: {
    yes: { type: Number, default: 0 },
    no: { type: Number, default: 0 },
  },
  views: {
    type: Number,
    default: 0,
  },
  language: {
    type: String,
    default: 'en',
  },
  order: Number,
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

faqChatbotSchema.index({ category: 1, isActive: 1 });
faqChatbotSchema.index({ keywords: 1 });
faqChatbotSchema.index({ question: 'text', answer: 'text' });

export const FAQChatbot = mongoose.model('FAQChatbot', faqChatbotSchema);

// ==================== CHATBOT CONVERSATION ====================
const chatbotConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sessionId: {
    type: String,
    required: true,
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'bot', 'agent'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    intent: String,
    confidence: Number,
    faqMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FAQChatbot',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  context: {
    currentTopic: String,
    entities: mongoose.Schema.Types.Mixed,
    previousIntent: String,
  },
  escalated: {
    type: Boolean,
    default: false,
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoChatSession',
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  rating: {
    score: Number,
    feedback: String,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

chatbotConversationSchema.index({ user: 1, createdAt: -1 });

export const ChatbotConversation = mongoose.model('ChatbotConversation', chatbotConversationSchema);

// ==================== CALLBACK SCHEDULING ====================
const callbackScheduleSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  preferredTime: {
    type: Date,
    required: true,
  },
  alternateTime: Date,
  timezone: {
    type: String,
    default: 'UTC',
  },
  reason: {
    type: String,
    enum: ['order_issue', 'product_inquiry', 'return_refund', 'technical_support', 'billing', 'complaint', 'feedback', 'other'],
    required: true,
  },
  description: String,
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_answer', 'rescheduled'],
    default: 'scheduled',
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  attempts: [{
    attemptedAt: Date,
    result: String,
    notes: String,
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  completedAt: Date,
  resolution: {
    resolved: Boolean,
    notes: String,
    followUpRequired: Boolean,
    followUpDate: Date,
  },
  rating: {
    score: Number,
    feedback: String,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

callbackScheduleSchema.index({ preferredTime: 1, status: 1 });
callbackScheduleSchema.index({ customer: 1 });
callbackScheduleSchema.index({ assignedAgent: 1, status: 1 });

export const CallbackSchedule = mongoose.model('CallbackSchedule', callbackScheduleSchema);

// ==================== SUPPORT TICKET ====================
const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['order', 'payment', 'shipping', 'product', 'account', 'technical', 'other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_customer', 'waiting_internal', 'resolved', 'closed'],
    default: 'open',
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    senderType: {
      type: String,
      enum: ['customer', 'agent', 'system'],
    },
    content: String,
    attachments: [{
      name: String,
      url: String,
      type: String,
    }],
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
  }],
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tags: [String],
  firstResponseAt: Date,
  resolvedAt: Date,
  closedAt: Date,
  satisfaction: {
    rating: Number,
    feedback: String,
    submittedAt: Date,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ customer: 1, status: 1 });
supportTicketSchema.index({ assignedAgent: 1, status: 1 });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default { VideoChatSession, FAQChatbot, ChatbotConversation, CallbackSchedule, SupportTicket };
