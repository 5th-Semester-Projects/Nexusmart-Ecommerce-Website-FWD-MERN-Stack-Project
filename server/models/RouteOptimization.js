const mongoose = require('mongoose');

const routeOptimizationSchema = new mongoose.Schema({
  deliveryDate: {
    type: Date,
    required: true
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vehicle: {
    type: String,
    capacity: Number,
    currentLoad: Number
  },
  orders: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    deliveryAddress: {
      latitude: Number,
      longitude: Number,
      fullAddress: String
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent']
    },
    timeWindow: {
      start: Date,
      end: Date
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    status: {
      type: String,
      enum: ['pending', 'in_transit', 'delivered', 'failed']
    },
    sequenceNumber: Number
  }],
  route: {
    waypoints: [{
      latitude: Number,
      longitude: Number,
      address: String,
      order: mongoose.Schema.Types.ObjectId,
      arrivalTime: Date,
      departureTime: Date,
      completed: Boolean
    }],
    totalDistance: Number, // km
    totalDuration: Number, // minutes
    optimizationScore: Number
  },
  optimization: {
    algorithm: {
      type: String,
      enum: ['genetic', 'ant_colony', 'simulated_annealing', 'nearest_neighbor', 'AI_ml']
    },
    parameters: mongoose.Schema.Types.Mixed,
    iterations: Number,
    computeTime: Number // milliseconds
  },
  constraints: {
    maxDistance: Number,
    maxDuration: Number,
    maxStops: Number,
    vehicleCapacity: Number,
    timeWindows: Boolean,
    trafficConsideration: Boolean
  },
  realTimeUpdates: [{
    timestamp: Date,
    type: {
      type: String,
      enum: ['traffic', 'delay', 'accident', 'weather', 'reroute']
    },
    description: String,
    newETA: Date,
    adjustedRoute: mongoose.Schema.Types.Mixed
  }],
  performance: {
    onTimeDeliveries: Number,
    totalDeliveries: Number,
    averageTimePerStop: Number,
    fuelEfficiency: Number,
    costPerDelivery: Number
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'cancelled'],
    default: 'planned'
  }
}, {
  timestamps: true
});

routeOptimizationSchema.index({ deliveryDate: 1, warehouse: 1 });
routeOptimizationSchema.index({ driver: 1, status: 1 });

const RouteOptimization = mongoose.model('RouteOptimization', routeOptimizationSchema);
export default RouteOptimization;
export { RouteOptimization };
