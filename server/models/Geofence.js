import mongoose from 'mongoose';

const geofenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  location: {
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  radius: {
    type: Number,
    required: true // in meters
  },
  type: {
    type: String,
    enum: ['store', 'warehouse', 'competitor', 'event', 'delivery_zone', 'promotion'],
    required: true
  },
  triggers: [{
    event: {
      type: String,
      enum: ['enter', 'exit', 'dwell'],
      required: true
    },
    action: {
      type: String,
      enum: ['push_notification', 'email', 'sms', 'offer', 'discount', 'alert'],
      required: true
    },
    content: {
      title: String,
      message: String,
      image: String,
      deepLink: String,
      offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
      }
    },
    delay: Number, // seconds
    cooldown: Number, // hours before retrigger
    maxTriggers: Number
  }],
  targeting: {
    userSegments: [String],
    loyaltyTiers: [String],
    newCustomers: Boolean,
    returning: Boolean
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    daysOfWeek: [Number], // 0-6, Sunday = 0
    timeRanges: [{
      start: String, // HH:MM
      end: String
    }]
  },
  analytics: {
    totalEnters: { type: Number, default: 0 },
    totalExits: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    triggeredNotifications: { type: Number, default: 0 },
    clickedNotifications: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  events: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    event: String,
    timestamp: Date,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    },
    triggered: Boolean,
    converted: Boolean
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Geospatial index
geofenceSchema.index({ location: '2dsphere' });
geofenceSchema.index({ type: 1, isActive: 1 });

const Geofence = mongoose.model('Geofence', geofenceSchema);
export default Geofence;
export { Geofence };
