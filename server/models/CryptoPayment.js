const mongoose = require('mongoose');

const cryptoPaymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cryptocurrency: {
    type: String,
    enum: ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'MATIC'],
    required: true
  },
  amount: {
    fiat: {
      value: Number,
      currency: String
    },
    crypto: {
      value: String, // High precision string
      decimals: Number
    }
  },
  exchangeRate: {
    rate: Number,
    source: String,
    timestamp: Date
  },
  walletAddress: {
    sender: {
      type: String,
      required: true
    },
    receiver: {
      type: String,
      required: true
    }
  },
  transactionHash: {
    type: String,
    unique: true,
    sparse: true
  },
  blockchain: {
    network: String,
    confirmations: {
      type: Number,
      default: 0
    },
    requiredConfirmations: {
      type: Number,
      default: 3
    },
    blockNumber: Number,
    gasPrice: String,
    gasFee: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirming', 'confirmed', 'failed', 'expired', 'refunded'],
    default: 'pending'
  },
  paymentWindow: {
    expiresAt: Date,
    warningAt: Date
  },
  qrCode: String, // Base64 encoded QR code
  smartContract: {
    address: String,
    abi: mongoose.Schema.Types.Mixed,
    functionCalled: String
  },
  escrow: {
    enabled: Boolean,
    releaseConditions: [String],
    releasedAt: Date,
    arbitrator: String
  },
  webhook: {
    url: String,
    attempts: [{
      timestamp: Date,
      status: Number,
      response: String
    }]
  },
  refund: {
    initiated: Boolean,
    transactionHash: String,
    completedAt: Date,
    amount: String
  },
  fees: {
    platform: Number,
    network: String,
    total: Number
  }
}, {
  timestamps: true
});

cryptoPaymentSchema.index({ order: 1 });
cryptoPaymentSchema.index({ transactionHash: 1 });
cryptoPaymentSchema.index({ status: 1, createdAt: -1 });
cryptoPaymentSchema.index({ 'walletAddress.sender': 1 });

const CryptoPayment = mongoose.model('CryptoPayment', cryptoPaymentSchema);`nexport default CryptoPayment;`nexport { CryptoPayment };
