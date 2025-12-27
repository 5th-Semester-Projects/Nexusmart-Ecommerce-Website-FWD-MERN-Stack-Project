import mongoose from 'mongoose';

const lockerNetworkSchema = new mongoose.Schema({
  locker: {
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: String,
    location: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    type: {
      type: String,
      enum: ['indoor', 'outdoor', 'refrigerated', 'heated'],
      default: 'outdoor'
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    },
    compartments: [{
      size: {
        type: String,
        enum: ['small', 'medium', 'large', 'extra_large']
      },
      number: String,
      available: {
        type: Boolean,
        default: true
      },
      temperature: String
    }],
    features: [String],
    accessibility: {
      wheelchairAccessible: Boolean,
      indoorLocation: Boolean,
      lighting: Boolean
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'offline'],
      default: 'active'
    }
  },
  deliveries: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    compartmentNumber: String,
    accessCode: String,
    expiresAt: Date,
    depositedAt: Date,
    collectedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'deposited', 'collected', 'expired', 'returned'],
      default: 'pending'
    },
    notifications: [{
      type: {
        type: String,
        enum: ['deposited', 'expiring_soon', 'expired']
      },
      sentAt: Date,
      channel: String
    }]
  }],
  analytics: {
    totalDeliveries: Number,
    averagePickupTime: Number,
    utilizationRate: Number,
    peakHours: [Number]
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

lockerNetworkSchema.index({ 'locker.location.coordinates': '2dsphere' });
lockerNetworkSchema.index({ 'deliveries.order': 1 });

export default mongoose.model('LockerNetwork', lockerNetworkSchema);
