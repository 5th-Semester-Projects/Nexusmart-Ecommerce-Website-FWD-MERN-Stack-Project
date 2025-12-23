import mongoose from 'mongoose';

const smartContractEscrowSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  blockchain: {
    network: {
      type: String,
      enum: ['ethereum', 'polygon', 'binance_smart_chain', 'avalanche', 'solana', 'arbitrum'],
      required: true
    },
    testnet: Boolean
  },
  smartContract: {
    address: {
      type: String,
      required: true
    },
    abi: mongoose.Schema.Types.Mixed,
    standard: String, // ERC-20, ERC-721, etc.
    deployedAt: Date,
    transactionHash: String
  },
  escrowAmount: {
    crypto: {
      amount: String,
      token: String
    },
    fiat: {
      amount: Number,
      currency: String
    }
  },
  conditions: [{
    condition: {
      type: String,
      enum: ['order_confirmed', 'shipped', 'delivered', 'quality_approved', 'time_elapsed', 'manual_release']
    },
    fulfilled: Boolean,
    fulfilledAt: Date,
    verifiedBy: String,
    proof: String
  }],
  milestones: [{
    name: String,
    amount: Number,
    condition: String,
    released: Boolean,
    releasedAt: Date,
    transactionHash: String
  }],
  status: {
    type: String,
    enum: ['created', 'funded', 'active', 'releasing', 'released', 'disputed', 'refunded', 'cancelled'],
    default: 'created'
  },
  transactions: [{
    type: {
      type: String,
      enum: ['deposit', 'release', 'refund', 'partial_release']
    },
    amount: String,
    from: String,
    to: String,
    transactionHash: String,
    blockNumber: Number,
    gasUsed: String,
    gasFee: String,
    timestamp: Date,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed']
    },
    confirmations: Number
  }],
  arbitration: {
    enabled: Boolean,
    arbitrator: {
      address: String,
      type: {
        type: String,
        enum: ['dao', 'oracle', 'multisig', 'centralized']
      }
    },
    dispute: {
      filed: Boolean,
      filedAt: Date,
      filedBy: {
        type: String,
        enum: ['buyer', 'seller']
      },
      reason: String,
      evidence: [String],
      resolution: String,
      resolvedAt: Date
    }
  },
  releaseSchedule: {
    automatic: Boolean,
    releaseAfter: Date,
    partialReleases: [{
      percentage: Number,
      condition: String,
      scheduledDate: Date
    }]
  },
  oracle: {
    provider: String,
    apiEndpoint: String,
    verificationData: mongoose.Schema.Types.Mixed,
    lastUpdate: Date
  },
  security: {
    multiSig: {
      required: Boolean,
      threshold: Number,
      signers: [String],
      signatures: [{
        signer: String,
        signed: Boolean,
        signedAt: Date
      }]
    },
    timelock: {
      enabled: Boolean,
      duration: Number, // seconds
      canExecuteAt: Date
    }
  },
  fees: {
    platformFee: Number,
    gasFee: String,
    arbitrationFee: Number,
    totalFees: Number
  },
  metadata: {
    ipfsHash: String,
    documentHash: String,
    termsUrl: String
  }
}, {
  timestamps: true
});

smartContractEscrowSchema.index({ order: 1 });
smartContractEscrowSchema.index({ 'smartContract.address': 1 });
smartContractEscrowSchema.index({ status: 1, createdAt: -1 });

const SmartContractEscrow = mongoose.model('SmartContractEscrow', smartContractEscrowSchema);
export default SmartContractEscrow;
export { SmartContractEscrow };
