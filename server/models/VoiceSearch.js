const mongoose = require('mongoose');

const voiceSearchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  audioFile: {
    url: String,
    duration: Number, // seconds
    format: String,
    size: Number // bytes
  },
  transcription: {
    text: String,
    language: String,
    confidence: Number,
    alternatives: [{
      text: String,
      confidence: Number
    }]
  },
  intent: {
    primary: String,
    confidence: Number,
    entities: [{
      type: String, // 'product', 'category', 'brand', 'color', 'price_range', 'size'
      value: String,
      confidence: Number
    }]
  },
  nlp: {
    keywords: [String],
    sentiment: String,
    action: String, // 'search', 'navigate', 'add_to_cart', 'track_order', 'ask_question'
  },
  searchQuery: {
    original: String,
    normalized: String,
    filters: mongoose.Schema.Types.Mixed
  },
  results: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    relevanceScore: Number,
    matchedFields: [String]
  }],
  voiceResponse: {
    text: String,
    audioUrl: String,
    ssml: String // Speech Synthesis Markup Language
  },
  platform: {
    type: String,
    enum: ['alexa', 'google_assistant', 'siri', 'cortana', 'web', 'mobile_app'],
    required: true
  },
  device: {
    type: String,
    model: String,
    os: String
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number], // [longitude, latitude]
    city: String,
    country: String
  },
  context: {
    previousSearches: [String],
    cartItems: Number,
    currentPage: String,
    timeOfDay: String
  },
  performance: {
    transcriptionTime: Number, // ms
    processingTime: Number, // ms
    totalTime: Number, // ms
    accuracy: Number
  },
  userAction: {
    clicked: Boolean,
    addedToCart: Boolean,
    purchased: Boolean,
    refinedSearch: Boolean,
    newQuery: String
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'no_results'],
    default: 'processing'
  },
  error: String
}, {
  timestamps: true
});

// Indexes
voiceSearchSchema.index({ user: 1, createdAt: -1 });
voiceSearchSchema.index({ platform: 1 });
voiceSearchSchema.index({ 'transcription.text': 'text' });

const VoiceSearch = mongoose.model('VoiceSearch', voiceSearchSchema);`nexport default VoiceSearch;`nexport { VoiceSearch };
