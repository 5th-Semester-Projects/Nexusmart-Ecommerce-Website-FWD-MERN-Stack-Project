import mongoose from 'mongoose';

const nftMarketplaceSchema = new mongoose.Schema({
  nft: {
    tokenId: {
      type: String,
      required: true,
      unique: true
    },
    contractAddress: {
      type: String,
      required: true
    },
    blockchain: {
      type: String,
      enum: ['ethereum', 'polygon', 'binance', 'solana'],
      default: 'ethereum'
    },
    standard: {
      type: String,
      enum: ['ERC-721', 'ERC-1155', 'SPL'],
      default: 'ERC-721'
    }
  },
  metadata: {
    name: {
      type: String,
      required: true
    },
    description: String,
    image: String,
    animationUrl: String,
    externalUrl: String,
    attributes: [{
      traitType: String,
      value: mongoose.Schema.Types.Mixed,
      displayType: String
    }],
    rarity: {
      score: Number,
      rank: Number,
      tier: String
    }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    listed: {
      type: Boolean,
      default: false
    },
    price: Number,
    currency: String,
    priceInUSD: Number,
    saleType: {
      type: String,
      enum: ['fixed', 'auction', 'offer']
    },
    auction: {
      startPrice: Number,
      reservePrice: Number,
      startTime: Date,
      endTime: Date,
      highestBid: Number,
      highestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    listedAt: Date
  },
  history: [{
    event: {
      type: String,
      enum: ['mint', 'transfer', 'sale', 'list', 'delist', 'bid', 'burn']
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    price: Number,
    currency: String,
    transactionHash: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  royalties: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 50
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  utility: {
    redeemable: Boolean,
    physicalProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    benefits: [String],
    expiryDate: Date
  },
  collection: {
    name: String,
    description: String,
    totalSupply: Number,
    floorPrice: Number
  },
  engagement: {
    views: Number,
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    shares: Number
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

nftMarketplaceSchema.index({ owner: 1 });
nftMarketplaceSchema.index({ creator: 1 });
nftMarketplaceSchema.index({ 'listing.listed': 1 });

export default mongoose.model('NFTMarketplace', nftMarketplaceSchema);
