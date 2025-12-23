import mongoose from 'mongoose';

const orderTrackingSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Tracking information
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  carrier: {
    type: String,
    enum: ['fedex', 'ups', 'usps', 'dhl', 'aramex', 'local', 'other'],
    required: true
  },
  carrierName: String,
  trackingUrl: String,

  // Current status
  currentStatus: {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packed', 'ready_to_ship', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed_delivery', 'returned', 'cancelled'],
      default: 'pending'
    },
    location: {
      city: String,
      state: String,
      country: String,
      facility: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String
  },

  // Status history
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    location: {
      city: String,
      state: String,
      country: String,
      facility: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    timestamp: {
      type: Date,
      required: true
    },
    description: String,
    performedBy: String,
    eventCode: String,
    notes: String
  }],

  // Estimated delivery
  estimatedDelivery: {
    date: Date,
    timeWindow: {
      start: String,
      end: String
    },
    confidence: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    daysRemaining: Number
  },

  // Actual delivery
  actualDelivery: {
    date: Date,
    time: String,
    receivedBy: String,
    signature: String,
    photo: String,
    location: {
      type: String,
      enum: ['front_door', 'back_door', 'mailbox', 'reception', 'neighbor', 'other']
    },
    notes: String
  },

  // Package details
  package: {
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      name: String,
      quantity: Number,
      sku: String,
      trackingNumber: String // for split shipments
    }],
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lb', 'g'],
        default: 'kg'
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    },
    packageType: String,
    numberOfPackages: {
      type: Number,
      default: 1
    }
  },

  // Real-time tracking
  realTimeTracking: {
    enabled: {
      type: Boolean,
      default: false
    },
    liveLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      timestamp: Date
    },
    driverInfo: {
      name: String,
      phone: String,
      photo: String,
      vehicleNumber: String
    },
    eta: Date,
    stopsRemaining: Number,
    distance: {
      value: Number,
      unit: String
    }
  },

  // Shipping details
  shipping: {
    origin: {
      name: String,
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    destination: {
      name: String,
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    shippingMethod: String,
    serviceLevel: {
      type: String,
      enum: ['standard', 'express', 'priority', 'same_day', 'next_day']
    },
    cost: Number,
    insurance: {
      covered: Boolean,
      amount: Number
    }
  },

  // Notifications
  notifications: {
    sent: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'push', 'whatsapp']
      },
      event: String,
      sentAt: Date,
      status: {
        type: String,
        enum: ['sent', 'delivered', 'failed']
      }
    }],
    preferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false }
    },
    subscribedEvents: [{
      type: String,
      enum: ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'delayed', 'exception']
    }]
  },

  // Issues & exceptions
  issues: [{
    type: {
      type: String,
      enum: ['delay', 'damaged', 'lost', 'wrong_address', 'failed_delivery', 'weather', 'customs', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date,
    resolution: String,
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'escalated'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],

  // Proof of delivery
  proofOfDelivery: {
    signatureUrl: String,
    photoUrl: String,
    timestamp: Date,
    receiverName: String,
    notes: String,
    verified: {
      type: Boolean,
      default: false
    }
  },

  // Return tracking (if applicable)
  returnTracking: {
    initiated: {
      type: Boolean,
      default: false
    },
    returnTrackingNumber: String,
    returnCarrier: String,
    returnStatus: String,
    returnStatusHistory: [{
      status: String,
      location: String,
      timestamp: Date,
      description: String
    }],
    receivedAt: Date
  },

  // Customer interactions
  customerInteractions: [{
    type: {
      type: String,
      enum: ['view', 'share', 'contact_support', 'change_address', 'reschedule', 'cancel']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }],

  // Analytics
  analytics: {
    viewCount: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    shareCount: {
      type: Number,
      default: 0
    },
    supportTickets: {
      type: Number,
      default: 0
    },
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },

  // External API sync
  externalSync: {
    lastSynced: Date,
    syncStatus: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending'
    },
    syncErrors: [String],
    apiResponse: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
orderTrackingSchema.index({ trackingNumber: 1 });
orderTrackingSchema.index({ order: 1 });
orderTrackingSchema.index({ user: 1, createdAt: -1 });
orderTrackingSchema.index({ 'currentStatus.status': 1 });
orderTrackingSchema.index({ 'estimatedDelivery.date': 1 });

// Virtual for is delayed
orderTrackingSchema.virtual('isDelayed').get(function () {
  if (!this.estimatedDelivery.date) return false;
  return new Date() > this.estimatedDelivery.date && this.currentStatus.status !== 'delivered';
});

// Method to update status
orderTrackingSchema.methods.updateStatus = function (status, location, description, performedBy) {
  this.statusHistory.push({
    status,
    location,
    timestamp: Date.now(),
    description,
    performedBy
  });

  this.currentStatus = {
    status,
    location,
    timestamp: Date.now(),
    description
  };

  // Auto-send notifications
  this.sendNotification(status);
};

// Method to send notification
orderTrackingSchema.methods.sendNotification = function (event) {
  const { preferences, subscribedEvents } = this.notifications;

  if (!subscribedEvents.includes(event)) return;

  const notificationTypes = [];
  if (preferences.email) notificationTypes.push('email');
  if (preferences.sms) notificationTypes.push('sms');
  if (preferences.push) notificationTypes.push('push');
  if (preferences.whatsapp) notificationTypes.push('whatsapp');

  notificationTypes.forEach(type => {
    this.notifications.sent.push({
      type,
      event,
      sentAt: Date.now(),
      status: 'sent'
    });
  });
};

// Method to report issue
orderTrackingSchema.methods.reportIssue = function (type, description, priority = 'medium') {
  this.issues.push({
    type,
    description,
    priority,
    reportedAt: Date.now(),
    status: 'open'
  });
};

// Static method to get deliveries for today
orderTrackingSchema.statics.getDeliveriesToday = function () {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    'estimatedDelivery.date': {
      $gte: startOfDay,
      $lte: endOfDay
    },
    'currentStatus.status': { $in: ['in_transit', 'out_for_delivery'] }
  }).populate('order user');
};

const OrderTracking = mongoose.model('OrderTracking', orderTrackingSchema);
export default OrderTracking;
export { OrderTracking };
