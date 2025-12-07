import mongoose from 'mongoose';

const aiChatTriagingSchema = new mongoose.Schema({
  ticket: {
    ticketNumber: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    channel: {
      type: String,
      enum: ['chat', 'email', 'phone', 'social', 'whatsapp'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  initialMessage: {
    text: String,
    language: String,
    attachments: [String]
  },
  aiAnalysis: {
    intent: {
      primary: String,
      secondary: [String],
      confidence: Number
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'angry', 'frustrated'],
      score: Number
    },
    urgency: {
      level: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      score: Number,
      factors: [String]
    },
    complexity: {
      level: {
        type: String,
        enum: ['simple', 'moderate', 'complex']
      },
      score: Number
    },
    category: {
      main: String,
      sub: String,
      confidence: Number
    },
    entities: [{
      type: String,
      value: String,
      confidence: Number
    }],
    keywords: [String]
  },
  routing: {
    recommendation: {
      destination: {
        type: String,
        enum: ['ai_bot', 'tier1_agent', 'tier2_agent', 'specialist', 'manager', 'knowledge_base']
      },
      agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      department: String,
      confidence: Number,
      reasons: [String]
    },
    actual: {
      destination: String,
      agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      routedAt: Date,
      manual: Boolean
    },
    queue: {
      position: Number,
      estimatedWait: Number,
      priority: Number
    }
  },
  customerProfile: {
    segment: String,
    value: {
      type: String,
      enum: ['low', 'medium', 'high', 'vip']
    },
    previousTickets: Number,
    averageResolutionTime: Number,
    satisfactionScore: Number,
    isChurnRisk: Boolean
  },
  resolution: {
    resolvedBy: {
      type: String,
      enum: ['ai', 'agent', 'self_service']
    },
    resolvedAt: Date,
    resolutionTime: Number,
    firstContactResolution: Boolean,
    transferCount: Number,
    escalated: Boolean
  },
  feedback: {
    rating: Number,
    comment: String,
    routingAccuracy: Boolean,
    aiHelpful: Boolean
  },
  conversation: [{
    from: String,
    message: String,
    timestamp: Date,
    isAI: Boolean
  }]
}, {
  timestamps: true
});

aiChatTriagingSchema.index({ 'ticket.ticketNumber': 1 });
aiChatTriagingSchema.index({ 'ticket.user': 1 });
aiChatTriagingSchema.index({ 'routing.actual.agent': 1 });
aiChatTriagingSchema.index({ 'aiAnalysis.urgency.level': 1 });

export default mongoose.model('AIChatTriaging', aiChatTriagingSchema);
