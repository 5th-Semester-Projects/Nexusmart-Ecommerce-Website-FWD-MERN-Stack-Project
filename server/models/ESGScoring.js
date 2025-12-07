import mongoose from 'mongoose';

const esgScoringSchema = new mongoose.Schema({
  entity: {
    type: {
      type: String,
      enum: ['product', 'brand', 'supplier', 'seller'],
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'entity.type'
    }
  },
  environmental: {
    carbonFootprint: {
      total: Number,
      perUnit: Number,
      offsetPercentage: Number,
      score: Number
    },
    materials: {
      sustainable: Number,
      recycled: Number,
      recyclable: Number,
      biodegradable: Number,
      score: Number
    },
    packaging: {
      minimal: Boolean,
      recyclable: Boolean,
      plastic: Number,
      score: Number
    },
    waterUsage: {
      total: Number,
      efficiency: Number,
      score: Number
    },
    energyUsage: {
      total: Number,
      renewable: Number,
      efficiency: Number,
      score: Number
    },
    wasteManagement: {
      recyclingRate: Number,
      wasteReduction: Number,
      score: Number
    },
    overallScore: Number
  },
  social: {
    laborPractices: {
      fairWages: Boolean,
      safeConditions: Boolean,
      noChildLabor: Boolean,
      unionRights: Boolean,
      score: Number
    },
    diversity: {
      genderEquality: Number,
      inclusivity: Number,
      score: Number
    },
    communityImpact: {
      localSourcing: Boolean,
      communityPrograms: Boolean,
      charitableGiving: Number,
      score: Number
    },
    humanRights: {
      compliance: Boolean,
      audited: Boolean,
      score: Number
    },
    overallScore: Number
  },
  governance: {
    transparency: {
      reporting: Boolean,
      certifications: [String],
      audits: Number,
      score: Number
    },
    ethics: {
      codeOfConduct: Boolean,
      whistleblowerPolicy: Boolean,
      antiCorruption: Boolean,
      score: Number
    },
    compliance: {
      regulations: [String],
      violations: Number,
      score: Number
    },
    dataPrivacy: {
      gdprCompliant: Boolean,
      dataProtection: Boolean,
      score: Number
    },
    overallScore: Number
  },
  overall: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
    },
    percentile: Number,
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining']
    }
  },
  certifications: [{
    name: String,
    issuer: String,
    issuedDate: Date,
    expiryDate: Date,
    certificateUrl: String,
    verified: Boolean
  }],
  audits: [{
    type: String,
    auditor: String,
    date: Date,
    score: Number,
    report: String,
    findings: [String]
  }],
  improvements: [{
    area: String,
    action: String,
    targetDate: Date,
    status: String,
    impact: Number
  }],
  lastAssessed: {
    type: Date,
    default: Date.now
  },
  nextAssessment: Date
}, {
  timestamps: true
});

esgScoringSchema.index({ 'entity.type': 1, 'entity.referenceId': 1 });
esgScoringSchema.index({ 'overall.score': -1 });
esgScoringSchema.index({ 'overall.grade': 1 });

export default mongoose.model('ESGScoring', esgScoringSchema);
