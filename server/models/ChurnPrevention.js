const mongoose = require('mongoose');

const churnPreventionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  churnRisk: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    confidence: Number
  },
  riskFactors: [{
    factor: String,
    weight: Number,
    description: String
  }],
  behaviorMetrics: {
    daysSinceLastPurchase: Number,
    purchaseFrequency: Number,
    averageOrderValue: Number,
    totalLifetimeValue: Number,
    engagementScore: Number,
    cartAbandonmentRate: Number,
    emailOpenRate: Number,
    appUsageFrequency: Number,
    customerSupportInteractions: Number,
    negativeReviews: Number
  },
  retentionStrategies: [{
    strategy: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    description: String,
    expectedImpact: Number,
    implementedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'failed']
    }
  }],
  interventions: [{
    type: {
      type: String,
      enum: ['discount', 'personalized_email', 'loyalty_points', 'exclusive_offer', 'survey', 'phone_call']
    },
    details: mongoose.Schema.Types.Mixed,
    sentAt: Date,
    response: String,
    effectiveness: Number
  }],
  segment: {
    type: String,
    enum: ['new', 'active', 'at_risk', 'hibernating', 'lost']
  },
  predictedChurnDate: Date,
  preventionCampaigns: [{
    campaign: String,
    startDate: Date,
    endDate: Date,
    result: String
  }],
  mlModel: {
    version: String,
    algorithm: String,
    accuracy: Number,
    lastTrainedAt: Date
  },
  lastEvaluated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

churnPreventionSchema.index({ user: 1 });
churnPreventionSchema.index({ 'churnRisk.level': 1, 'churnRisk.score': -1 });

const ChurnPrevention = mongoose.model('ChurnPrevention', churnPreventionSchema);`nexport default ChurnPrevention;`nexport { ChurnPrevention };
