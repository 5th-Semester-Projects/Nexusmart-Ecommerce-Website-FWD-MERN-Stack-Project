const mongoose = require('mongoose');

const iotIntegrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  device: {
    deviceId: {
      type: String,
      required: true,
      unique: true
    },
    deviceType: {
      type: String,
      enum: ['smart_fridge', 'washing_machine', 'printer', 'coffee_maker', 'pet_feeder', 'thermostat', 'door_lock', 'camera', 'speaker', 'custom'],
      required: true
    },
    manufacturer: String,
    model: String,
    nickname: String
  },
  connectivity: {
    protocol: {
      type: String,
      enum: ['wifi', 'bluetooth', 'zigbee', 'zwave', 'thread', 'matter']
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'error'],
      default: 'disconnected'
    },
    lastSeen: Date,
    ipAddress: String,
    macAddress: String
  },
  autoReordering: {
    enabled: Boolean,
    rules: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      trigger: {
        type: {
          type: String,
          enum: ['low_inventory', 'time_based', 'usage_based', 'sensor_based']
        },
        threshold: Number,
        value: mongoose.Schema.Types.Mixed
      },
      quantity: Number,
      frequency: String, // e.g., 'weekly', 'monthly'
      maxPrice: Number
    }],
    confirmationRequired: Boolean,
    notifyUser: Boolean
  },
  sensorData: [{
    timestamp: Date,
    sensorType: String,
    value: mongoose.Schema.Types.Mixed,
    unit: String,
    normalized: Number
  }],
  orders: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    triggeredBy: String,
    triggeredAt: Date,
    confirmed: Boolean,
    confirmationMethod: String
  }],
  inventory: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    currentLevel: Number,
    reorderPoint: Number,
    lastUpdated: Date
  }],
  usagePatterns: {
    dailyUsage: mongoose.Schema.Types.Mixed,
    weeklyPattern: mongoose.Schema.Types.Mixed,
    predictions: [{
      product: mongoose.Schema.Types.ObjectId,
      nextRunOut: Date,
      confidence: Number
    }]
  },
  notifications: [{
    type: {
      type: String,
      enum: ['low_inventory', 'order_placed', 'order_delivered', 'device_offline', 'error']
    },
    message: String,
    sentAt: Date,
    acknowledged: Boolean
  }],
  preferences: {
    brands: [String],
    excludeProducts: [mongoose.Schema.Types.ObjectId],
    deliverySchedule: String,
    budgetLimit: Number
  }
}, {
  timestamps: true
});

iotIntegrationSchema.index({ user: 1 });
iotIntegrationSchema.index({ 'device.deviceId': 1 });
iotIntegrationSchema.index({ 'connectivity.status': 1 });

module.exports = mongoose.model('IoTIntegration', iotIntegrationSchema);
