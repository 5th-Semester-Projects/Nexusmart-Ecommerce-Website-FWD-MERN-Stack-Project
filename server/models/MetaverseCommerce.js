import mongoose from 'mongoose';

const metaverseCommerceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  avatar: {
    avatarId: String,
    name: String,
    appearance: mongoose.Schema.Types.Mixed,
    wearables: [{
      nftId: String,
      product: mongoose.Schema.Types.ObjectId,
      equippedAt: Date
    }]
  },
  virtualStore: {
    storeId: String,
    storeName: String,
    platform: {
      type: String,
      enum: ['decentraland', 'sandbox', 'roblox', 'meta_horizon', 'spatial', 'custom']
    },
    coordinates: {
      x: Number,
      y: Number,
      z: Number,
      world: String
    },
    visitedAt: Date
  },
  vrSessions: [{
    sessionId: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
    headset: {
      type: String,
      enum: ['oculus_quest', 'htc_vive', 'playstation_vr', 'valve_index', 'other']
    },
    interactions: {
      productsViewed: [{
        product: mongoose.Schema.Types.ObjectId,
        viewDuration: Number,
        distance: Number,
        angle: String
      }],
      productsInteracted: [{
        product: mongoose.Schema.Types.ObjectId,
        action: String,
        timestamp: Date
      }],
      socialInteractions: [{
        withUser: mongoose.Schema.Types.ObjectId,
        type: String,
        timestamp: Date
      }]
    }
  }],
  virtualShowroom: {
    visited: [{
      showroomId: String,
      brand: String,
      products: [mongoose.Schema.Types.ObjectId],
      attendedEvent: Boolean,
      timestamp: Date
    }]
  },
  digitalTwinProducts: [{
    physicalProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    digitalTwinNFT: {
      tokenId: String,
      blockchain: String,
      contractAddress: String,
      metadata: mongoose.Schema.Types.Mixed
    },
    usageInMetaverse: {
      worlds: [String],
      gamesPlayed: Number,
      hoursUsed: Number
    }
  }],
  virtualTryOn3D: [{
    product: mongoose.Schema.Types.ObjectId,
    tryOnDate: Date,
    avatarSnapshot: String,
    liked: Boolean,
    purchased: Boolean
  }],
  nftPurchases: [{
    nft: {
      tokenId: String,
      contractAddress: String,
      blockchain: String,
      standard: {
        type: String,
        enum: ['ERC721', 'ERC1155', 'SPL']
      }
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    price: {
      crypto: Number,
      fiat: Number
    },
    marketplace: String,
    purchaseDate: Date,
    transactionHash: String
  }],
  virtualEvents: [{
    eventId: String,
    eventName: String,
    eventType: {
      type: String,
      enum: ['product_launch', 'fashion_show', 'concert', 'conference', 'sale']
    },
    attended: Boolean,
    duration: Number,
    purchasesMade: [{
      product: mongoose.Schema.Types.ObjectId,
      amount: Number
    }]
  }],
  socialMetaverse: {
    friends: [mongoose.Schema.Types.ObjectId],
    wishlistShares: Number,
    groupShopping: [{
      groupId: String,
      members: [mongoose.Schema.Types.ObjectId],
      purchasedTogether: [mongoose.Schema.Types.ObjectId]
    }]
  },
  preferences: {
    preferredPlatform: String,
    privacySettings: mongoose.Schema.Types.Mixed,
    notificationSettings: mongoose.Schema.Types.Mixed
  },
  achievements: [{
    achievementId: String,
    name: String,
    description: String,
    earnedAt: Date,
    rewards: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true, suppressReservedKeysWarning: true });

metaverseCommerceSchema.index({ 'nftPurchases.tokenId': 1 });
metaverseCommerceSchema.index({ 'virtualStore.platform': 1, createdAt: -1 });

const MetaverseCommerce = mongoose.model('MetaverseCommerce', metaverseCommerceSchema);
export default MetaverseCommerce;
export { MetaverseCommerce };
