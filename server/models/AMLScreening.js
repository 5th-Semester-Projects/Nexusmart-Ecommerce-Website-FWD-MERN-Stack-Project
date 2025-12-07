import mongoose from 'mongoose';

const amlScreeningSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  screening: {
    performedAt: {
      type: Date,
      default: Date.now
    },
    provider: String,
    reference: String,
    automated: {
      type: Boolean,
      default: true
    }
  },
  personalInfo: {
    fullName: String,
    dateOfBirth: Date,
    nationality: String,
    identificationNumber: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  checks: {
    pep: {
      checked: Boolean,
      result: {
        type: String,
        enum: ['clear', 'match', 'potential_match'],
        default: 'clear'
      },
      matches: [{
        name: String,
        position: String,
        country: String,
        matchScore: Number
      }]
    },
    sanctions: {
      checked: Boolean,
      result: {
        type: String,
        enum: ['clear', 'match', 'potential_match'],
        default: 'clear'
      },
      lists: [String],
      matches: [{
        list: String,
        name: String,
        reason: String,
        matchScore: Number
      }]
    },
    adverseMedia: {
      checked: Boolean,
      result: {
        type: String,
        enum: ['clear', 'negative', 'review_required'],
        default: 'clear'
      },
      findings: [{
        source: String,
        headline: String,
        date: Date,
        severity: String,
        summary: String
      }]
    },
    watchlists: {
      checked: Boolean,
      result: {
        type: String,
        enum: ['clear', 'match'],
        default: 'clear'
      },
      matches: [String]
    }
  },
  riskScore: {
    overall: {
      type: Number,
      min: 0,
      max: 100
    },
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    factors: [{
      factor: String,
      score: Number,
      weight: Number
    }]
  },
  decision: {
    status: {
      type: String,
      enum: ['approved', 'pending_review', 'rejected', 'requires_edd'],
      default: 'pending_review'
    },
    decidedBy: {
      automated: Boolean,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    decidedAt: Date,
    notes: String
  },
  monitoring: {
    continuous: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'monthly'
    },
    lastChecked: Date,
    nextCheck: Date,
    alerts: [{
      type: String,
      message: String,
      severity: String,
      triggeredAt: Date,
      reviewed: Boolean
    }]
  },
  documents: [{
    type: String,
    url: String,
    uploadedAt: Date,
    verified: Boolean
  }]
}, {
  timestamps: true
});

amlScreeningSchema.index({ user: 1 });
amlScreeningSchema.index({ 'decision.status': 1 });
amlScreeningSchema.index({ 'riskScore.level': 1 });

export default mongoose.model('AMLScreening', amlScreeningSchema);
