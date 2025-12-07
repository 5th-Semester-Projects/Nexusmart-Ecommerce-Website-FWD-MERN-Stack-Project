import mongoose from 'mongoose';

// ==================== VOICE SEARCH HISTORY ====================
const voiceSearchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sessionId: {
    type: String,
    required: true,
  },
  transcript: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
  },
  language: {
    type: String,
    default: 'en-US',
  },
  intent: {
    type: String,
    enum: ['search', 'navigate', 'add_to_cart', 'checkout', 'help', 'unknown'],
    default: 'search',
  },
  extractedEntities: {
    productName: String,
    category: String,
    brand: String,
    priceRange: {
      min: Number,
      max: Number,
    },
    color: String,
    size: String,
  },
  results: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    relevanceScore: Number,
  }],
  successful: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

voiceSearchSchema.index({ user: 1, createdAt: -1 });
voiceSearchSchema.index({ transcript: 'text' });

export const VoiceSearch = mongoose.model('VoiceSearch', voiceSearchSchema);

// ==================== VOICE ASSISTANT CONVERSATION ====================
const voiceConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    audioUrl: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  context: {
    currentProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    cartItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    lastAction: String,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active',
  },
}, { timestamps: true });

export const VoiceConversation = mongoose.model('VoiceConversation', voiceConversationSchema);

// ==================== TEXT TO SPEECH PREFERENCES ====================
const ttsPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  voice: {
    type: String,
    default: 'en-US-Neural2-F',
  },
  speed: {
    type: Number,
    default: 1.0,
    min: 0.5,
    max: 2.0,
  },
  pitch: {
    type: Number,
    default: 0,
    min: -20,
    max: 20,
  },
  autoRead: {
    productDescriptions: {
      type: Boolean,
      default: true,
    },
    reviews: {
      type: Boolean,
      default: false,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
}, { timestamps: true });

export const TTSPreferences = mongoose.model('TTSPreferences', ttsPreferencesSchema);

export default { VoiceSearch, VoiceConversation, TTSPreferences };
