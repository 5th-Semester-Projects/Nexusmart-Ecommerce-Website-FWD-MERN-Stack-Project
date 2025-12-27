import mongoose from 'mongoose';

const sentimentAnalysisSchema = new mongoose.Schema({
  source: {
    type: {
      type: String,
      enum: ['review', 'ticket', 'chat', 'social', 'feedback', 'survey'],
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  content: {
    text: {
      type: String,
      required: true
    },
    language: String,
    wordCount: Number
  },
  analysis: {
    overall: {
      sentiment: {
        type: String,
        enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'],
        required: true
      },
      score: {
        type: Number,
        min: -1,
        max: 1
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      }
    },
    emotions: [{
      emotion: {
        type: String,
        enum: ['joy', 'trust', 'fear', 'surprise', 'sadness', 'disgust', 'anger', 'anticipation']
      },
      intensity: Number,
      confidence: Number
    }],
    aspects: [{
      aspect: String,
      sentiment: String,
      score: Number,
      mentions: [String]
    }],
    subjectivity: {
      type: String,
      enum: ['objective', 'subjective'],
      score: Number
    },
    urgency: {
      detected: Boolean,
      level: String,
      keywords: [String]
    }
  },
  keywords: [{
    word: String,
    sentiment: String,
    weight: Number,
    category: String
  }],
  themes: [{
    theme: String,
    relevance: Number,
    sentiment: String
  }],
  actionable: {
    requiresAction: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    suggestedActions: [String],
    department: String
  },
  trends: {
    comparison: {
      previous: Number,
      change: Number,
      trend: String
    },
    patterns: [String]
  },
  metadata: {
    analyzedAt: {
      type: Date,
      default: Date.now
    },
    model: String,
    version: String,
    processingTime: Number
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

sentimentAnalysisSchema.index({ 'source.type': 1, 'source.referenceId': 1 });
sentimentAnalysisSchema.index({ 'source.user': 1 });
sentimentAnalysisSchema.index({ 'analysis.overall.sentiment': 1 });
sentimentAnalysisSchema.index({ 'actionable.requiresAction': 1 });

export default mongoose.model('SentimentAnalysis', sentimentAnalysisSchema);
