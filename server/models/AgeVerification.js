import mongoose from 'mongoose';

const ageVerificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  requiredAge: {
    type: Number,
    required: true,
    default: 18
  },
  verificationType: {
    type: String,
    enum: ['document', 'credit_card', 'database', 'biometric', 'third_party'],
    required: true
  },
  verification: {
    method: String,
    provider: String,
    reference: String,
    verifiedAt: Date,
    expiresAt: Date
  },
  documentVerification: {
    documentType: {
      type: String,
      enum: ['passport', 'drivers_license', 'national_id', 'birth_certificate']
    },
    documentNumber: String,
    issueDate: Date,
    expiryDate: Date,
    issuingCountry: String,
    images: [{
      type: {
        type: String,
        enum: ['front', 'back', 'selfie']
      },
      url: String,
      uploadedAt: Date
    }],
    extractedData: {
      fullName: String,
      dateOfBirth: Date,
      age: Number,
      address: String
    },
    verificationChecks: [{
      check: String,
      passed: Boolean,
      details: String
    }]
  },
  biometricVerification: {
    type: {
      type: String,
      enum: ['facial_recognition', 'fingerprint', 'voice']
    },
    livenessCheck: Boolean,
    matchScore: Number,
    passed: Boolean
  },
  thirdPartyVerification: {
    provider: String,
    sessionId: String,
    result: mongoose.Schema.Types.Mixed,
    confidence: Number
  },
  result: {
    verified: {
      type: Boolean,
      default: false
    },
    age: Number,
    dateOfBirth: Date,
    meetsRequirement: Boolean,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'expired', 'flagged'],
    default: 'pending'
  },
  attempts: [{
    attemptedAt: Date,
    method: String,
    result: String,
    reason: String
  }],
  flags: [{
    type: String,
    reason: String,
    flaggedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolved: Boolean
  }],
  compliance: {
    jurisdiction: String,
    regulation: String,
    auditTrail: [{
      action: String,
      performedBy: String,
      timestamp: Date,
      details: String
    }]
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

ageVerificationSchema.index({ user: 1 });
ageVerificationSchema.index({ order: 1 });
ageVerificationSchema.index({ status: 1 });

export default mongoose.model('AgeVerification', ageVerificationSchema);
