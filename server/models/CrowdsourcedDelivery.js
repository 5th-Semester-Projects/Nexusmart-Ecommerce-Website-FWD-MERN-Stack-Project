import mongoose from 'mongoose';

const crowdsourcedDeliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  deliveryType: {
    type: String,
    enum: ['crowdsourced', 'same_day', 'hyperlocal', 'standard'],
    default: 'crowdsourced'
  },
  pickupLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    contactName: String,
    contactPhone: String,
    instructions: String
  },
  dropoffLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    contactName: String,
    contactPhone: String,
    instructions: String
  },
  package: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    fragile: Boolean,
    requiresSignature: Boolean,
    specialInstructions: String
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  driverDetails: {
    name: String,
    phone: String,
    vehicle: String,
    rating: Number,
    completedDeliveries: Number
  },
  pricing: {
    baseFare: Number,
    distanceFee: Number,
    timeFee: Number,
    surcharge: Number,
    tip: Number,
    total: Number
  },
  status: {
    type: String,
    enum: [
      'pending',
      'searching_driver',
      'driver_assigned',
      'picked_up',
      'in_transit',
      'arrived',
      'delivered',
      'failed',
      'cancelled'
    ],
    default: 'pending'
  },
  timeline: [{
    status: String,
    timestamp: Date,
    location: {
      lat: Number,
      lng: Number
    },
    note: String
  }],
  tracking: {
    currentLocation: {
      lat: Number,
      lng: Number
    },
    lastUpdated: Date,
    estimatedArrival: Date,
    distanceRemaining: Number
  },
  proof: {
    signature: String,
    photo: String,
    recipientName: String,
    deliveredAt: Date
  },
  rating: {
    score: Number,
    review: String,
    ratedAt: Date
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

crowdsourcedDeliverySchema.index({ order: 1 });
crowdsourcedDeliverySchema.index({ driver: 1 });
crowdsourcedDeliverySchema.index({ status: 1 });

export default mongoose.model('CrowdsourcedDelivery', crowdsourcedDeliverySchema);
