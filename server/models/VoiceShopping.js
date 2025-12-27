import mongoose from 'mongoose';

const voiceShoppingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['alexa', 'google_assistant', 'siri', 'cortana', 'custom'],
    required: true
  },
  conversation: [{
    timestamp: Date,
    audioFile: String,
    transcription: String,
    intent: {
      name: String,
      confidence: Number
    },
    entities: [{
      type: String,
      value: String,
      confidence: Number
    }],
    response: {
      text: String,
      audioFile: String,
      ssml: String // Speech Synthesis Markup Language
    },
    context: mongoose.Schema.Types.Mixed
  }],
  commands: [{
    type: {
      type: String,
      enum: ['search', 'add_to_cart', 'checkout', 'track_order', 'reorder', 'ask_question', 'compare', 'navigate']
    },
    command: String,
    executed: Boolean,
    result: mongoose.Schema.Types.Mixed
  }],
  voiceProfile: {
    voicePrint: String, // Encrypted voice signature
    recognitionAccuracy: Number,
    preferredLanguage: String,
    accent: String,
    speakingRate: String
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    action: {
      type: String,
      enum: ['viewed', 'added', 'removed', 'purchased']
    },
    timestamp: Date
  }],
  authentication: {
    method: {
      type: String,
      enum: ['voice_biometric', 'pin', 'two_factor', 'none']
    },
    verified: Boolean,
    attempts: Number
  },
  cart: {
    addedViaVoice: [{
      product: mongoose.Schema.Types.ObjectId,
      quantity: Number,
      confirmedByUser: Boolean
    }]
  },
  order: {
    placedViaVoice: Boolean,
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    confirmationMethod: String
  },
  sessionMetrics: {
    duration: Number,
    totalCommands: Number,
    successfulCommands: Number,
    errors: Number,
    conversationTurns: Number
  },
  userSatisfaction: {
    rating: Number,
    feedback: String,
    completedTask: Boolean
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

voiceShoppingSchema.index({ user: 1, createdAt: -1 });
voiceShoppingSchema.index({ platform: 1, createdAt: -1 });

const VoiceShopping = mongoose.model('VoiceShopping', voiceShoppingSchema);
export default VoiceShopping;
export { VoiceShopping };
