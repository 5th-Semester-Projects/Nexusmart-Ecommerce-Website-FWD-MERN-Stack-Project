const mongoose = require('mongoose');

const aiCustomerServiceSchema = new mongoose.Schema({
  ticket: {
    ticketId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: String,
    category: {
      type: String,
      enum: ['order', 'product', 'payment', 'shipping', 'return', 'technical', 'account', 'general']
    },
    subcategory: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['new', 'open', 'pending', 'resolved', 'closed', 'escalated'],
      default: 'new'
    }
  },
  aiTriaging: {
    classification: {
      category: String,
      subcategory: String,
      confidence: Number,
      keywords: [String]
    },
    urgency: {
      score: Number,
      factors: [String],
      autoEscalate: Boolean
    },
    sentiment: {
      score: Number,
      label: {
        type: String,
        enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive']
      },
      emotions: [{
        emotion: String,
        confidence: Number
      }]
    },
    routing: {
      recommendedAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      recommendedDepartment: String,
      routingReason: String,
      confidence: Number
    },
    suggestedResponse: {
      templates: [String],
      aiGeneratedResponse: String,
      confidence: Number,
      requiresHumanReview: Boolean
    }
  },
  conversation: [{
    timestamp: Date,
    sender: {
      type: {
        type: String,
        enum: ['user', 'agent', 'ai_bot', 'system']
      },
      id: mongoose.Schema.Types.ObjectId,
      name: String
    },
    message: {
      text: String,
      attachments: [String],
      type: {
        type: String,
        enum: ['text', 'image', 'video', 'file', 'audio']
      }
    },
    aiAnalysis: {
      intent: String,
      entities: mongoose.Schema.Types.Mixed,
      sentiment: Number,
      actionRequired: String
    }
  }],
  aiAssistance: {
    knowledgeBase: [{
      articleId: String,
      title: String,
      relevanceScore: Number,
      suggested: Boolean,
      used: Boolean
    }],
    similarTickets: [{
      ticketId: String,
      similarity: Number,
      resolution: String
    }],
    nextBestAction: {
      action: String,
      reasoning: String,
      confidence: Number
    },
    responseTimeEstimate: Number // minutes
  },
  coBrowsing: {
    sessionId: String,
    started: Boolean,
    startedAt: Date,
    endedAt: Date,
    screenshotsRecorded: [String],
    permissionsGranted: [String]
  },
  videoSupport: {
    sessionId: String,
    started: Boolean,
    startedAt: Date,
    endedAt: Date,
    recordingUrl: String,
    duration: Number
  },
  callbackScheduling: {
    requested: Boolean,
    scheduledTime: Date,
    completed: Boolean,
    completedAt: Date,
    duration: Number,
    outcome: String
  },
  autoGenKnowledgeBase: {
    articleGenerated: Boolean,
    articleId: String,
    title: String,
    content: String,
    reviewed: Boolean,
    published: Boolean
  },
  resolution: {
    resolvedBy: {
      type: {
        type: String,
        enum: ['ai', 'agent', 'self_service']
      },
      id: mongoose.Schema.Types.ObjectId
    },
    resolution: String,
    resolutionTime: Number, // minutes
    firstResponseTime: Number,
    reopened: Boolean,
    reopenCount: Number
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    nps: Number,
    surveyCompletedAt: Date
  },
  escalation: {
    escalated: Boolean,
    escalatedAt: Date,
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    level: Number
  },
  tags: [String],
  notes: [{
    author: mongoose.Schema.Types.ObjectId,
    content: String,
    private: Boolean,
    timestamp: Date
  }]
}, {
  timestamps: true
});

aiCustomerServiceSchema.index({ 'ticket.ticketId': 1 });
aiCustomerServiceSchema.index({ 'ticket.user': 1, 'ticket.status': 1 });
aiCustomerServiceSchema.index({ 'ticket.status': 1, 'ticket.priority': 1 });
aiCustomerServiceSchema.index({ 'aiTriaging.sentiment.label': 1 });

const AICustomerService = mongoose.model('AICustomerService', aiCustomerServiceSchema);
export default AICustomerService;
export { AICustomerService };
