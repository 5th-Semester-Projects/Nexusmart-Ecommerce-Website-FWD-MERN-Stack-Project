import mongoose from 'mongoose';

/**
 * Hyperlocal Delivery Model
 */

// Delivery Zone Schema
const deliveryZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['radius', 'polygon', 'pincode'],
    default: 'radius'
  },

  // For radius-based
  center: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  radius: Number, // in km

  // For polygon-based
  polygon: {
    type: { type: String, enum: ['Polygon'] },
    coordinates: [[Number]]
  },

  // For pincode-based
  pincodes: [String],

  // Delivery Settings
  isActive: { type: Boolean, default: true },
  deliveryFee: {
    type: Number,
    default: 0
  },
  freeDeliveryThreshold: Number,
  minOrderValue: Number,
  maxOrderValue: Number,

  // Time Slots
  availableSlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slots: [{
      startTime: String, // "09:00"
      endTime: String,   // "11:00"
      maxOrders: Number,
      currentOrders: Number,
      isAvailable: Boolean
    }]
  }],

  // Express Delivery
  expressDelivery: {
    available: { type: Boolean, default: false },
    fee: Number,
    maxTime: Number // in minutes
  },

  // Same Day Delivery
  sameDayDelivery: {
    available: { type: Boolean, default: true },
    cutoffTime: String, // "14:00"
    fee: Number
  },

  // Scheduled Delivery
  scheduledDelivery: {
    available: { type: Boolean, default: true },
    advanceDays: Number // How many days in advance
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

deliveryZoneSchema.index({ center: '2dsphere' });

/**
 * Delivery Partner Schema
 */
const deliveryPartnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Profile
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  photo: String,

  // Vehicle
  vehicleType: {
    type: String,
    enum: ['bicycle', 'bike', 'scooter', 'car', 'van'],
    required: true
  },
  vehicleNumber: String,

  // Status
  status: {
    type: String,
    enum: ['available', 'busy', 'offline', 'suspended'],
    default: 'offline'
  },
  isOnline: { type: Boolean, default: false },

  // Location (real-time)
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  lastLocationUpdate: Date,

  // Zones
  assignedZones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryZone'
  }],

  // Performance
  rating: {
    average: { type: Number, default: 5 },
    count: { type: Number, default: 0 }
  },
  completedDeliveries: { type: Number, default: 0 },
  cancelledDeliveries: { type: Number, default: 0 },
  onTimeDeliveryRate: { type: Number, default: 100 },

  // Earnings
  totalEarnings: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  perDeliveryRate: Number,
  perKmRate: Number,

  // Verification
  isVerified: { type: Boolean, default: false },
  documents: {
    idProof: String,
    license: String,
    vehicleRC: String,
    insurance: String
  },
  verifiedAt: Date,

  // Active Deliveries
  activeDeliveries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryTracking'
  }],
  maxActiveDeliveries: { type: Number, default: 3 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

deliveryPartnerSchema.index({ currentLocation: '2dsphere' });

/**
 * Delivery Tracking Schema
 */
const deliveryTrackingSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },

  // Partner
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner'
  },

  // Status
  status: {
    type: String,
    enum: [
      'pending',
      'assigned',
      'picking_up',
      'picked_up',
      'on_the_way',
      'nearby',
      'arrived',
      'delivered',
      'failed',
      'returned'
    ],
    default: 'pending'
  },

  // Addresses
  pickupLocation: {
    address: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]
    },
    contactName: String,
    contactPhone: String
  },
  deliveryLocation: {
    address: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]
    },
    contactName: String,
    contactPhone: String,
    instructions: String
  },

  // Time Slot
  scheduledSlot: {
    date: Date,
    startTime: String,
    endTime: String
  },
  isExpress: { type: Boolean, default: false },

  // Route
  estimatedDistance: Number, // in km
  actualDistance: Number,
  estimatedDuration: Number, // in minutes
  actualDuration: Number,

  // Real-time Tracking
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  locationHistory: [{
    coordinates: [Number],
    timestamp: Date
  }],

  // ETA
  estimatedArrival: Date,

  // Timestamps
  assignedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,

  // Proof of Delivery
  proofOfDelivery: {
    signature: String,
    photo: String,
    receivedBy: String,
    notes: String
  },

  // Failed Delivery
  failureReason: String,
  deliveryAttempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },

  // Customer Feedback
  rating: Number,
  feedback: String,

  // OTP Verification
  deliveryOTP: String,
  otpVerified: { type: Boolean, default: false },

  // Live Chat
  chatMessages: [{
    sender: { type: String, enum: ['customer', 'partner'] },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

deliveryTrackingSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
deliveryTrackingSchema.index({ 'deliveryLocation.coordinates': '2dsphere' });
deliveryTrackingSchema.index({ currentLocation: '2dsphere' });

// Generate delivery OTP
deliveryTrackingSchema.methods.generateOTP = function () {
  this.deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString();
  return this.deliveryOTP;
};

// Calculate ETA
deliveryTrackingSchema.methods.calculateETA = function (partnerLocation) {
  // Average speed in km/min (30 km/h = 0.5 km/min)
  const avgSpeed = 0.5;

  if (this.deliveryLocation?.coordinates?.coordinates && partnerLocation) {
    const distance = calculateDistance(
      partnerLocation,
      this.deliveryLocation.coordinates.coordinates
    );
    const minutes = Math.ceil(distance / avgSpeed);
    this.estimatedArrival = new Date(Date.now() + minutes * 60000);
  }

  return this.estimatedArrival;
};

// Helper function to calculate distance between two points
function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2[1] - coord1[1]);
  const dLon = toRad(coord2[0] - coord1[0]);
  const lat1 = toRad(coord1[1]);
  const lat2 = toRad(coord2[1]);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
}

export const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);
export const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
export const DeliveryTracking = mongoose.model('DeliveryTracking', deliveryTrackingSchema);
