const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  guestIdentifier: String,
  conversation: [{
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    intent: {
      type: String,
      enum: ['greeting', 'product_inquiry', 'order_status', 'complaint', 'payment', 'shipping', 'return', 'recommendation', 'general', 'farewell']
    },
    entities: [{
      type: String,
      value: String,
      confidence: Number
    }],
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      score: Number
    },
    actions: [{
      type: String,
      data: mongoose.Schema.Types.Mixed
    }],
    suggestedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  context: {
    currentTopic: String,
    previousIntents: [String],
    userPreferences: mongoose.Schema.Types.Mixed,
    cartItems: [mongoose.Schema.Types.ObjectId],
    lastViewedProducts: [mongoose.Schema.Types.ObjectId]
  },
  nlpEngine: {
    type: String,
    enum: ['dialogflow', 'watson', 'rasa', 'custom'],
    default: 'custom'
  },
  language: {
    type: String,
    default: 'en'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'escalated', 'abandoned'],
    default: 'active'
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin or support agent
  },
  escalationReason: String,
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    wasHelpful: Boolean
  },
  metadata: {
    device: String,
    browser: String,
    location: String,
    source: String
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  duration: Number // in seconds
}, {
  timestamps: true
});

// Index for performance
chatbotSchema.index({ sessionId: 1 });
chatbotSchema.index({ user: 1, status: 1 });
chatbotSchema.index({ createdAt: -1 });

const Chatbot = mongoose.model('Chatbot', chatbotSchema);
export default Chatbot;
export { Chatbot };
