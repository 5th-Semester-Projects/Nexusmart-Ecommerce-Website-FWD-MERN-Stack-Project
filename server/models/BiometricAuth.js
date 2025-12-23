import mongoose from 'mongoose';

const biometricAuthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fingerprint: {
    enabled: Boolean,
    enrolledFingers: [{
      fingerId: String,
      template: String, // Encrypted biometric template
      enrolledAt: Date
    }],
    lastUsed: Date
  },
  faceId: {
    enabled: Boolean,
    faceTemplate: String, // Encrypted face biometric data
    livenessDetection: Boolean,
    enrolledAt: Date,
    lastUsed: Date,
    accuracy: Number
  },
  iris: {
    enabled: Boolean,
    irisTemplate: String,
    enrolledAt: Date,
    lastUsed: Date
  },
  voice: {
    enabled: Boolean,
    voicePrint: String, // Encrypted voice signature
    phrases: [String],
    enrolledAt: Date,
    lastUsed: Date
  },
  behavioral: {
    typing: {
      enabled: Boolean,
      pattern: mongoose.Schema.Types.Mixed,
      accuracy: Number
    },
    swipe: {
      enabled: Boolean,
      pattern: mongoose.Schema.Types.Mixed
    },
    gait: {
      enabled: Boolean,
      pattern: mongoose.Schema.Types.Mixed
    }
  },
  deviceBindings: [{
    deviceId: String,
    deviceType: String,
    biometricType: [String],
    trusted: Boolean,
    lastAuthenticated: Date,
    enrolledAt: Date
  }],
  paymentAuthentication: {
    enabled: Boolean,
    requiredFor: {
      allPayments: Boolean,
      thresholdAmount: Number
    },
    methods: [{
      type: String,
      enum: ['fingerprint', 'face', 'iris', 'voice']
    }]
  },
  security: {
    encryptionMethod: String,
    templateVersion: String,
    secureEnclaveUsed: Boolean,
    onDeviceProcessing: Boolean
  },
  authenticationHistory: [{
    timestamp: Date,
    method: String,
    success: Boolean,
    deviceId: String,
    ipAddress: String,
    location: mongoose.Schema.Types.Mixed,
    riskScore: Number
  }],
  failedAttempts: {
    count: Number,
    lastAttempt: Date,
    lockoutUntil: Date
  },
  backup: {
    pin: String, // Hashed
    securityQuestions: [{
      question: String,
      answerHash: String
    }]
  }
}, {
  timestamps: true
});

biometricAuthSchema.index({ user: 1 });
biometricAuthSchema.index({ 'deviceBindings.deviceId': 1 });

const BiometricAuth = mongoose.model('BiometricAuth', biometricAuthSchema);
export default BiometricAuth;
export { BiometricAuth };
