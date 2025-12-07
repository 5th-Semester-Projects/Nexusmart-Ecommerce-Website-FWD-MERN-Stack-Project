const mongoose = require('mongoose');

const churnPredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  churnScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  churnProbability: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  predictedChurnDate: Date,
  factors: {
    recency: {
      daysSinceLastPurchase: Number,
      daysSinceLastVisit: Number,
      score: Number,
      impact: String
    },
    frequency: {
      totalOrders: Number,
      ordersLast30Days: Number,
      ordersLast90Days: Number,
      averageOrderFrequency: Number,
      score: Number,
      impact: String
    },
    monetary: {
      totalSpent: Number,
      averageOrderValue: Number,
      lifetimeValue: Number,
      spendingTrend: String,
      score: Number,
      impact: String
    },
    engagement: {
      emailOpenRate: Number,
      emailClickRate: Number,
      appUsage: Number,
      reviewsWritten: Number,
      socialShares: Number,
      score: Number,
      impact: String
    },
    satisfaction: {
      averageRating: Number,
      nps: Number,
      complaintCount: Number,
      returnRate: Number,
      score: Number,
      impact: String
    },
    behavioral: {
      cartAbandonmentRate: Number,
      wishlistItems: Number,
      supportTickets: Number,
      competitorActivity: Boolean,
      score: Number,
      impact: String
    }
  },
  segments: {
    customerType: String,
    loyaltyTier: String,
    valueSegment: String,
    riskSegment: String
  },
  interventions: [{
    type: {
      type: String,
      enum: ['discount', 'personalized_offer', 'email_campaign', 'loyalty_bonus', 'vip_upgrade', 'personal_outreach', 'winback_campaign']
    },
    priority: Number,
    expectedImpact: Number,
    cost: Number,
    roi: Number,
    status: {
      type: String,
      enum: ['recommended', 'scheduled', 'executed', 'successful', 'failed']
    },
    executedAt: Date,
    result: String
  }],
  comparison: {
    vsAverage: Number,
    vsSimilarCustomers: Number,
    percentile: Number
  },
  timeline: [{
    date: Date,
    churnScore: Number,
    event: String
  }],
  mlModel: {
    algorithm: String,
    version: String,
    confidence: Number,
    features: [String]
  },
  actualChurn: {
    didChurn: Boolean,
    churnDate: Date,
    reason: String
  },
  preventionActions: [{
    action: String,
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    takenAt: Date,
    outcome: String
  }],
  nextReviewDate: Date
}, {
  timestamps: true
});

// Indexes
churnPredictionSchema.index({ user: 1, createdAt: -1 });
churnPredictionSchema.index({ riskLevel: 1, churnScore: -1 });

const ChurnPrediction = mongoose.model('ChurnPrediction', churnPredictionSchema);
export default ChurnPrediction;
export { ChurnPrediction };
