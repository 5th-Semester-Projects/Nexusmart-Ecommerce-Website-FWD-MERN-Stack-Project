import mongoose from 'mongoose';

const inventoryForecastSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  forecastPeriod: {
    startDate: Date,
    endDate: Date,
    duration: String // '7_days', '30_days', '90_days', '365_days'
  },
  currentStock: {
    quantity: Number,
    value: Number,
    lastUpdated: Date
  },
  predictions: [{
    date: Date,
    predictedDemand: Number,
    predictedStock: Number,
    confidence: Number,
    stockoutProbability: Number,
    overstockProbability: Number
  }],
  aggregates: {
    totalPredictedDemand: Number,
    averageDailyDemand: Number,
    peakDemandDate: Date,
    peakDemandQuantity: Number,
    lowDemandDate: Date,
    lowDemandQuantity: Number
  },
  recommendations: {
    reorderDate: Date,
    reorderQuantity: Number,
    reorderCost: Number,
    expectedStockoutDate: Date,
    safetyStock: Number,
    optimalStockLevel: Number
  },
  historicalData: {
    salesLast30Days: Number,
    salesLast90Days: Number,
    salesLastYear: Number,
    averageOrderSize: Number,
    returnRate: Number
  },
  trends: {
    seasonality: {
      pattern: String,
      strength: Number
    },
    trend: {
      direction: String, // 'increasing', 'stable', 'decreasing'
      slope: Number
    },
    cyclicality: Boolean
  },
  externalFactors: [{
    factor: String, // 'holiday', 'promotion', 'competition', 'weather', 'event'
    impact: Number,
    startDate: Date,
    endDate: Date
  }],
  accuracy: {
    mape: Number, // Mean Absolute Percentage Error
    rmse: Number, // Root Mean Square Error
    lastActualVsPredicted: [{
      date: Date,
      actual: Number,
      predicted: Number,
      error: Number
    }]
  },
  mlModel: {
    algorithm: {
      type: String,
      enum: ['arima', 'prophet', 'lstm', 'xgboost', 'ensemble']
    },
    version: String,
    trainedOn: Date,
    features: [String]
  },
  alerts: [{
    type: {
      type: String,
      enum: ['stockout_risk', 'overstock_risk', 'reorder_required', 'slow_moving', 'dead_stock']
    },
    severity: String,
    message: String,
    triggeredAt: Date
  }],
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  }
}, {
  timestamps: true
});

// Indexes
inventoryForecastSchema.index({ product: 1, 'forecastPeriod.startDate': -1 });
inventoryForecastSchema.index({ warehouse: 1 });

const InventoryForecast = mongoose.model('InventoryForecast', inventoryForecastSchema);
export default InventoryForecast;
export { InventoryForecast };
