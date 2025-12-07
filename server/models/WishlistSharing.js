import mongoose from 'mongoose';

const wishlistSharingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  occasion: {
    type: String,
    enum: ['birthday', 'wedding', 'anniversary', 'baby_shower', 'christmas', 'general']
  },
  eventDate: Date,
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    quantity: {
      type: Number,
      default: 1
    },
    notes: String,
    purchased: {
      type: Boolean,
      default: false
    },
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    purchasedAt: Date,
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reservedUntil: Date,
    votes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: Date
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: String,
      commentedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  sharing: {
    isPublic: {
      type: Boolean,
      default: false
    },
    shareUrl: String,
    sharedWith: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      email: String,
      permissions: {
        type: String,
        enum: ['view', 'vote', 'purchase'],
        default: 'view'
      },
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }],
    allowAnonymousPurchase: {
      type: Boolean,
      default: false
    }
  },
  settings: {
    hidePurchased: {
      type: Boolean,
      default: true
    },
    allowSuggestions: {
      type: Boolean,
      default: true
    },
    sendNotifications: {
      type: Boolean,
      default: true
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    totalItems: Number,
    purchasedItems: Number,
    totalValue: Number,
    purchasedValue: Number
  }
}, {
  timestamps: true
});

wishlistSharingSchema.index({ owner: 1 });
wishlistSharingSchema.index({ 'sharing.shareUrl': 1 });
wishlistSharingSchema.index({ eventDate: 1 });

export default mongoose.model('WishlistSharing', wishlistSharingSchema);
