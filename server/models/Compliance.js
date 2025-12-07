const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema({
  entity: {
    type: {
      type: String,
      enum: ['user', 'seller', 'transaction', 'product'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  amlScreening: {
    checked: Boolean,
    lastChecked: Date,
    provider: String,
    result: {
      status: {
        type: String,
        enum: ['clear', 'review_required', 'blocked']
      },
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      matches: [{
        listName: String,
        matchType: String,
        confidence: Number,
        details: mongoose.Schema.Types.Mixed
      }]
    },
    watchlists: [String],
    pepCheck: {
      isPEP: Boolean,
      details: String
    },
    adverseMedia: [{
      source: String,
      date: Date,
      summary: String
    }]
  },
  sanctionsCheck: {
    checked: Boolean,
    lastChecked: Date,
    lists: [{
      name: String,
      jurisdiction: String,
      matched: Boolean,
      details: String
    }],
    countries: [String],
    blocked: Boolean,
    blockReason: String
  },
  kycVerification: {
    level: {
      type: String,
      enum: ['none', 'basic', 'standard', 'enhanced']
    },
    status: {
      type: String,
      enum: ['not_started', 'pending', 'verified', 'failed', 'expired']
    },
    verifiedAt: Date,
    expiresAt: Date,
    documents: [{
      type: String,
      verified: Boolean,
      verifiedAt: Date
    }],
    riskAssessment: {
      score: Number,
      factors: [String]
    }
  },
  ageVerification: {
    required: Boolean,
    verified: Boolean,
    method: {
      type: String,
      enum: ['id_document', 'credit_card', 'third_party', 'database']
    },
    verifiedAge: Number,
    verifiedAt: Date,
    provider: String
  },
  esgCompliance: {
    score: {
      environmental: Number,
      social: Number,
      governance: Number,
      overall: Number
    },
    certifications: [{
      name: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      verified: Boolean
    }],
    sustainabilityMetrics: mongoose.Schema.Types.Mixed,
    carbonFootprint: {
      value: Number,
      unit: String,
      calculatedAt: Date
    }
  },
  dataProtection: {
    gdpr: {
      compliant: Boolean,
      consentRecorded: Boolean,
      consentDate: Date,
      dataProcessingAgreement: Boolean,
      rightToErasure: {
        requested: Boolean,
        requestedAt: Date,
        completedAt: Date
      }
    },
    ccpa: {
      compliant: Boolean,
      optOutRequested: Boolean,
      dataDisclosureProvided: Boolean
    },
    dataRetention: {
      category: String,
      retentionPeriod: Number, // days
      destructionDate: Date
    }
  },
  regulatoryReporting: [{
    regulation: String,
    jurisdiction: String,
    reportType: String,
    reportedAt: Date,
    reportId: String,
    status: String
  }],
  riskScore: {
    overall: Number,
    factors: [{
      factor: String,
      weight: Number,
      value: Number
    }],
    lastCalculated: Date
  },
  flags: [{
    type: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String,
    raisedAt: Date,
    resolvedAt: Date,
    resolution: String
  }],
  auditTrail: [{
    action: String,
    performedBy: mongoose.Schema.Types.ObjectId,
    timestamp: Date,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String
  }]
}, {
  timestamps: true
});

complianceSchema.index({ 'entity.type': 1, 'entity.id': 1 });
complianceSchema.index({ 'amlScreening.result.status': 1 });
complianceSchema.index({ 'riskScore.overall': -1 });
complianceSchema.index({ 'flags.severity': 1, 'flags.resolvedAt': 1 });

const Compliance = mongoose.model('Compliance', complianceSchema);
export default Compliance;
export { Compliance };
