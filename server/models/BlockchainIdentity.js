import mongoose from 'mongoose';

const blockchainIdentitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  did: {
    type: String,
    required: true,
    unique: true
  },
  blockchain: {
    type: String,
    enum: ['ethereum', 'polygon', 'binance', 'solana'],
    default: 'polygon'
  },
  wallet: {
    address: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date
  },
  credentials: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'kyc', 'address', 'social', 'education', 'employment']
    },
    value: String,
    issuer: String,
    issuedAt: Date,
    expiresAt: Date,
    verified: {
      type: Boolean,
      default: false
    },
    verificationHash: String,
    credentialHash: String,
    revoked: {
      type: Boolean,
      default: false
    }
  }],
  attestations: [{
    attester: String,
    claim: String,
    proof: String,
    timestamp: Date,
    onChain: Boolean,
    transactionHash: String
  }],
  reputation: {
    score: {
      type: Number,
      default: 0
    },
    badges: [String],
    endorsements: [{
      from: String,
      skill: String,
      timestamp: Date
    }]
  },
  permissions: [{
    service: String,
    scope: [String],
    grantedAt: Date,
    expiresAt: Date,
    revoked: Boolean
  }],
  recovery: {
    guardians: [{
      did: String,
      address: String,
      approved: Boolean
    }],
    threshold: Number,
    lastRecovery: Date
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

blockchainIdentitySchema.index({ 'wallet.address': 1 });

export default mongoose.model('BlockchainIdentity', blockchainIdentitySchema);
