const mongoose = require('mongoose');

const emotionalCommerceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: String,
  moodDetection: {
    current: {
      mood: {
        type: String,
        enum: ['joyful', 'excited', 'content', 'relaxed', 'stressed', 'anxious', 'sad', 'frustrated', 'bored', 'energetic']
      },
      confidence: Number,
      detectionMethod: {
        type: String,
        enum: ['behavioral', 'text_analysis', 'emoji_usage', 'browsing_pattern', 'purchase_history', 'time_context']
      }
    },
    history: [{
      timestamp: Date,
      mood: String,
      confidence: Number
    }]
  },
  emotionalProfile: {
    dominantEmotions: [{
      emotion: String,
      frequency: Number
    }],
    shoppingTriggers: [{
      emotion: String,
      products: [String], // categories
      averageSpend: Number
    }],
    emotionalJourney: [{
      stage: String,
      typicalMood: String,
      conversionRate: Number
    }]
  },
  moodBasedRecommendations: [{
    mood: String,
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    reasoning: String,
    emotionalBenefit: String,
    presented: Boolean,
    effectiveness: Number
  }],
  contentPersonalization: {
    colors: [String],
    imagery: String,
    messaging: String,
    musicPreference: String
  },
  therapeuticShopping: {
    enabled: Boolean,
    limits: {
      maxAmount: Number,
      cooldownPeriod: Number // minutes
    },
    preventImpulsive: Boolean
  },
  emotionalPurchases: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    moodAtPurchase: String,
    satisfaction: Number,
    regretScore: Number,
    returned: Boolean
  }],
  wellbeingFeatures: {
    moodTracking: Boolean,
    positiveAffirmations: Boolean,
    breathingExercises: Boolean,
    mindfulShopping: Boolean
  }
}, {
  timestamps: true
});

emotionalCommerceSchema.index({ user: 1, createdAt: -1 });
emotionalCommerceSchema.index({ 'moodDetection.current.mood': 1 });

const EmotionalCommerce = mongoose.model('EmotionalCommerce', emotionalCommerceSchema);`nexport default EmotionalCommerce;`nexport { EmotionalCommerce };
