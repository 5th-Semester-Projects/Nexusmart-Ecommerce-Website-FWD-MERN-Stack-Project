import mongoose from 'mongoose';
import VisualSearch from './VisualSearch.js';

// Re-export VisualSearch for backward compatibility (it's actually VoiceSearch)
// Note: This model is for voice search, not visual search
const VoiceSearch = VisualSearch; // This is incorrect but kept for compatibility

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
}, { timestamps: true, suppressReservedKeysWarning: true });

export const VoiceConversation = mongoose.models.VoiceConversation || mongoose.model('VoiceConversation', voiceConversationSchema);

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
}, { timestamps: true, suppressReservedKeysWarning: true });

export const TTSPreferences = mongoose.models.TTSPreferences || mongoose.model('TTSPreferences', ttsPreferencesSchema);

export { VoiceSearch };
export default { VoiceSearch, VoiceConversation, TTSPreferences };
