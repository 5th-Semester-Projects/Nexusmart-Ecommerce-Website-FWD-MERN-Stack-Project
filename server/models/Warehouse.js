import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['main', 'regional', 'fulfillment', 'dropship', 'store'],
    default: 'regional'
  },
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    timezone: String
  },
  capacity: {
    totalSpace: Number,
    usedSpace: Number,
    unit: { type: String, default: 'sqft' },
    utilizationPercentage: Number
  },
  inventory: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    sku: String,
    quantity: {
      available: Number,
      reserved: Number,
      damaged: Number,
      inTransit: Number
    },
    location: {
      zone: String,
      aisle: String,
      rack: String,
      bin: String
    },
    reorderPoint: Number,
    reorderQuantity: Number,
    lastRestocked: Date
  }],
  operations: {
    operatingHours: {
      open: String,
      close: String,
      timezone: String
    },
    processingCapacity: {
      ordersPerDay: Number,
      currentLoad: Number
    },
    shippingCarriers: [String],
    handlesReturns: { type: Boolean, default: true }
  },
  staff: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    shift: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'closed'],
    default: 'active'
  },
  analytics: {
    totalOrders: { type: Number, default: 0 },
    averageProcessingTime: Number,
    accuracy: Number,
    onTimeShipment: Number
  }
}, { timestamps: true });

warehouseSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model('Warehouse', warehouseSchema);
