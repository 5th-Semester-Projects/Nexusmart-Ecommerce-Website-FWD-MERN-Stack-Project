import mongoose from 'mongoose';

const blockchainIntegrationSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Blockchain Configuration
  blockchainConfig: {
    enabled: {
      type: Boolean,
      default: false
    },
    networks: [{
      name: {
        type: String,
        enum: ['ethereum', 'polygon', 'binance-smart-chain', 'solana', 'avalanche', 'arbitrum', 'optimism']
      },
      active: {
        type: Boolean,
        default: true
      },
      chainId: Number,
      rpcUrl: String,
      explorerUrl: String,
      nativeCurrency: {
        name: String,
        symbol: String,
        decimals: Number
      },
      contractAddresses: {
        nftMarketplace: String,
        paymentProcessor: String,
        authenticityRegistry: String,
        supplyChain: String
      }
    }],
    primaryNetwork: String,
    walletProvider: {
      type: String,
      enum: ['metamask', 'walletconnect', 'coinbase', 'trust-wallet'],
      default: 'metamask'
    }
  },

  // NFT Products
  nftProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    nftType: {
      type: String,
      enum: ['digital-art', 'collectible', 'physical-backed', 'membership', 'utility', 'gaming'],
      required: true
    },
    tokenStandard: {
      type: String,
      enum: ['ERC-721', 'ERC-1155', 'SPL'],
      default: 'ERC-721'
    },
    contractAddress: String,
    tokenId: String,
    metadata: {
      name: String,
      description: String,
      image: String,
      animationUrl: String,
      externalUrl: String,
      attributes: [{
        traitType: String,
        value: mongoose.Schema.Types.Mixed,
        displayType: String
      }],
      properties: mongoose.Schema.Types.Mixed
    },
    ipfsMetadata: {
      metadataUri: String,
      imageUri: String,
      metadataHash: String,
      imageHash: String
    },
    minting: {
      isMinted: {
        type: Boolean,
        default: false
      },
      mintedAt: Date,
      mintedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      transactionHash: String,
      blockNumber: Number,
      gasUsed: Number,
      gasPrice: String
    },
    ownership: {
      currentOwner: String,
      ownershipHistory: [{
        from: String,
        to: String,
        transactionHash: String,
        timestamp: Date,
        price: Number,
        currency: String
      }]
    },
    royalties: {
      enabled: {
        type: Boolean,
        default: false
      },
      percentage: {
        type: Number,
        min: 0,
        max: 50
      },
      recipient: String,
      totalEarned: {
        type: Number,
        default: 0
      }
    },
    listing: {
      isListed: {
        type: Boolean,
        default: false
      },
      price: Number,
      currency: String,
      listedAt: Date,
      expiresAt: Date
    },
    rarity: {
      score: Number,
      rank: Number,
      tier: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary']
      }
    }
  }],

  // Crypto Payments
  cryptoPayments: {
    enabled: {
      type: Boolean,
      default: false
    },
    acceptedCurrencies: [{
      symbol: {
        type: String,
        enum: ['ETH', 'BTC', 'USDT', 'USDC', 'BNB', 'MATIC', 'SOL', 'AVAX']
      },
      name: String,
      network: String,
      walletAddress: String,
      enabled: {
        type: Boolean,
        default: true
      },
      minimumAmount: Number,
      conversionRate: Number,
      lastUpdated: Date
    }],
    paymentProcessor: {
      type: String,
      enum: ['coinbase-commerce', 'bitpay', 'nowpayments', 'custom']
    },
    autoConvert: {
      enabled: {
        type: Boolean,
        default: false
      },
      targetCurrency: String
    },
    transactions: [{
      transactionId: String,
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      amount: Number,
      currency: String,
      amountInFiat: Number,
      fiatCurrency: String,
      walletAddress: String,
      transactionHash: String,
      status: {
        type: String,
        enum: ['pending', 'confirming', 'confirmed', 'completed', 'failed', 'cancelled'],
        default: 'pending'
      },
      confirmations: {
        type: Number,
        default: 0
      },
      requiredConfirmations: {
        type: Number,
        default: 3
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      completedAt: Date,
      explorerUrl: String
    }]
  },

  // Product Authenticity
  authenticityVerification: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    certificateId: {
      type: String,
      unique: true
    },
    blockchainRecord: {
      network: String,
      contractAddress: String,
      tokenId: String,
      transactionHash: String,
      blockNumber: Number,
      timestamp: Date
    },
    physicalProduct: {
      serialNumber: String,
      batch: String,
      manufacturingDate: Date,
      qrCode: String,
      nfcTag: String
    },
    verification: {
      isVerified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date,
      verifiedBy: String,
      verificationMethod: {
        type: String,
        enum: ['qr-scan', 'nfc-tap', 'serial-number', 'visual-inspection']
      },
      verificationCount: {
        type: Number,
        default: 0
      }
    },
    authenticity: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      status: {
        type: String,
        enum: ['authentic', 'suspicious', 'counterfeit', 'pending-verification']
      },
      report: String
    },
    ownership: {
      currentOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      transferHistory: [{
        from: String,
        to: String,
        timestamp: Date,
        verificationId: String,
        transactionHash: String
      }]
    }
  }],

  // Supply Chain Tracking
  supplyChain: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    batchId: String,
    trackingId: {
      type: String,
      unique: true
    },
    blockchainRecords: [{
      stage: {
        type: String,
        enum: ['manufacturing', 'quality-check', 'packaging', 'warehousing', 'shipping', 'customs', 'distribution', 'retail', 'delivered']
      },
      location: {
        name: String,
        address: String,
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      timestamp: Date,
      actor: String,
      details: mongoose.Schema.Types.Mixed,
      documentation: [String],
      transactionHash: String,
      blockNumber: Number,
      verifiedBy: String
    }],
    origin: {
      manufacturer: {
        name: String,
        address: String,
        country: String,
        certifications: [String]
      },
      rawMaterials: [{
        material: String,
        source: String,
        certifications: [String],
        percentage: Number
      }]
    },
    currentStatus: {
      stage: String,
      location: String,
      lastUpdate: Date,
      estimatedArrival: Date
    },
    sustainability: {
      carbonFootprint: Number,
      recyclablePercentage: Number,
      ethicallySourced: Boolean,
      certifications: [String]
    },
    transparency: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      publiclyVisible: {
        type: Boolean,
        default: true
      }
    }
  }],

  // Smart Contracts
  smartContracts: [{
    name: String,
    type: {
      type: String,
      enum: ['nft-marketplace', 'payment-escrow', 'royalty-distribution', 'supply-chain', 'authenticity-registry']
    },
    network: String,
    address: String,
    abi: mongoose.Schema.Types.Mixed,
    deployedAt: Date,
    deploymentTx: String,
    version: String,
    isActive: {
      type: Boolean,
      default: true
    },
    interactions: {
      type: Number,
      default: 0
    },
    totalVolume: {
      type: Number,
      default: 0
    }
  }],

  // Wallet Integration
  wallets: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    walletAddress: {
      type: String,
      required: true
    },
    walletType: {
      type: String,
      enum: ['metamask', 'walletconnect', 'coinbase', 'trust-wallet', 'ledger', 'trezor']
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    balance: [{
      currency: String,
      amount: Number,
      lastUpdated: Date
    }],
    transactions: {
      type: Number,
      default: 0
    }
  }],

  // Analytics
  analytics: {
    totalNFTsSold: {
      type: Number,
      default: 0
    },
    totalNFTVolume: {
      type: Number,
      default: 0
    },
    totalCryptoPayments: {
      type: Number,
      default: 0
    },
    totalCryptoVolume: {
      type: Number,
      default: 0
    },
    authenticityVerifications: {
      type: Number,
      default: 0
    },
    supplyChainRecords: {
      type: Number,
      default: 0
    },
    connectedWallets: {
      type: Number,
      default: 0
    },
    gasFeesSpent: {
      type: Number,
      default: 0
    },
    averageNFTPrice: Number,
    topCryptoCurrency: String,
    conversionRate: Number
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

// Indexes
blockchainIntegrationSchema.index({ business: 1 });
blockchainIntegrationSchema.index({ 'nftProducts.tokenId': 1 });
blockchainIntegrationSchema.index({ 'authenticityVerification.certificateId': 1 });
blockchainIntegrationSchema.index({ 'supplyChain.trackingId': 1 });

// Methods
blockchainIntegrationSchema.methods.mintNFT = async function (productId, metadata) {
  const nft = {
    productId,
    nftType: metadata.nftType,
    tokenStandard: metadata.tokenStandard || 'ERC-721',
    metadata: metadata.metadata,
    minting: {
      isMinted: true,
      mintedAt: Date.now(),
      transactionHash: metadata.transactionHash
    }
  };

  this.nftProducts.push(nft);
  this.analytics.totalNFTsSold += 1;

  return this.save();
};

blockchainIntegrationSchema.methods.processCryptoPayment = function (paymentData) {
  const transaction = {
    transactionId: `TX${Date.now()}`,
    orderId: paymentData.orderId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    walletAddress: paymentData.walletAddress,
    status: 'pending',
    createdAt: Date.now()
  };

  this.cryptoPayments.transactions.push(transaction);
  this.analytics.totalCryptoPayments += 1;

  return this.save();
};

blockchainIntegrationSchema.methods.verifyAuthenticity = function (productId, verificationData) {
  const record = this.authenticityVerification.find(
    a => a.product.toString() === productId.toString()
  );

  if (record) {
    record.verification.isVerified = true;
    record.verification.verifiedAt = Date.now();
    record.verification.verificationCount += 1;
    record.authenticity.score = verificationData.score || 100;
    record.authenticity.status = 'authentic';
  }

  this.analytics.authenticityVerifications += 1;

  return this.save();
};

blockchainIntegrationSchema.methods.trackSupplyChain = function (productId, stage, data) {
  const tracking = this.supplyChain.find(
    s => s.product.toString() === productId.toString()
  );

  if (tracking) {
    tracking.blockchainRecords.push({
      stage,
      location: data.location,
      timestamp: Date.now(),
      actor: data.actor,
      details: data.details,
      transactionHash: data.transactionHash
    });

    tracking.currentStatus = {
      stage,
      location: data.location.name,
      lastUpdate: Date.now()
    };
  }

  this.analytics.supplyChainRecords += 1;

  return this.save();
};

// Statics
blockchainIntegrationSchema.statics.getBusinessBlockchain = function (businessId) {
  return this.findOne({ business: businessId })
    .populate('nftProducts.productId')
    .populate('authenticityVerification.product')
    .populate('supplyChain.product');
};

const BlockchainIntegration = mongoose.model('BlockchainIntegration', blockchainIntegrationSchema);

export default BlockchainIntegration;
