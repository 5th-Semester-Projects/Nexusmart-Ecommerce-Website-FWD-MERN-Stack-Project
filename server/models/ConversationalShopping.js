import mongoose from 'mongoose';

const conversationalShoppingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  conversations: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    userMessage: {
      type: String,
      required: true
    },
    botResponse: {
      type: String,
      required: true
    },
    intent: {
      type: String,
      enum: ['search', 'compare', 'recommend', 'question', 'purchase', 'support']
    },
    entities: [{
      type: String,
      value: String,
      confidence: Number
    }],
    productsShown: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    sentiment: {
      score: Number,
      label: {
        type: String,
        enum: ['positive', 'neutral', 'negative']
      }
    }
  }],
  context: {
    preferences: mongoose.Schema.Types.Mixed,
    budget: {
      min: Number,
      max: Number
    },
    occasion: String,
    urgency: String
  },
  conversationState: {
    type: String,
    enum: ['active', 'paused', 'completed', 'abandoned'],
    default: 'active'
  },
  outcome: {
    type: String,
    enum: ['purchase', 'saved_for_later', 'no_action', 'support_escalated']
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  duration: Number, // in seconds
  satisfactionScore: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

conversationalShoppingSchema.index({ user: 1, createdAt: -1 });

const ConversationalShopping = mongoose.model('ConversationalShopping', conversationalShoppingSchema);
export default ConversationalShopping;
export { ConversationalShopping };
