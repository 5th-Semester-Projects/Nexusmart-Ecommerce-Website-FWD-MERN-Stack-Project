import mongoose from 'mongoose';

const pwaFeaturesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  installation: {
    installed: {
      type: Boolean,
      default: false
    },
    installedAt: Date,
    platform: String,
    version: String
  },
  offlineData: {
    cachedProducts: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      cachedAt: Date,
      expiresAt: Date
    }],
    cachedImages: [{
      url: String,
      size: Number,
      cachedAt: Date
    }],
    cart: {
      items: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantity: Number,
        addedOffline: Boolean
      }],
      lastSynced: Date
    }
  },
  syncQueue: [{
    action: String,
    data: mongoose.Schema.Types.Mixed,
    timestamp: Date,
    synced: {
      type: Boolean,
      default: false
    },
    syncedAt: Date
  }],
  settings: {
    autoCache: {
      type: Boolean,
      default: true
    },
    cacheLimit: {
      type: Number,
      default: 50
    },
    backgroundSync: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  usage: {
    offlineViews: Number,
    offlinePurchases: Number,
    timeSpentOffline: Number,
    lastOnline: Date
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

pwaFeaturesSchema.index({ user: 1 });

export default mongoose.model('PWAFeatures', pwaFeaturesSchema);
