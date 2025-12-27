import mongoose from 'mongoose';

const demandForecastSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  forecastPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  predictions: [{
    date: Date,
    predictedDemand: Number,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    lowerBound: Number,
    upperBound: Number
  }],
  historicalData: {
    salesVolume: [{
      date: Date,
      quantity: Number
    }],
    seasonality: {
      pattern: String,
      strength: Number
    },
    trend: {
      direction: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable']
      },
      rate: Number
    }
  },
  externalFactors: {
    events: [{
      name: String,
      date: Date,
      expectedImpact: Number
    }],
    weather: mongoose.Schema.Types.Mixed,
    economicIndicators: mongoose.Schema.Types.Mixed,
    marketTrends: [String]
  },
  inventoryRecommendation: {
    recommendedStock: Number,
    reorderPoint: Number,
    safetyStock: Number,
    orderQuantity: Number
  },
  accuracy: {
    mape: Number, // Mean Absolute Percentage Error
    rmse: Number, // Root Mean Square Error
    lastUpdated: Date
  },
  mlModel: {
    algorithm: String,
    version: String,
    features: [String],
    lastTrainedAt: Date
  },
  category: String,
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

demandForecastSchema.index({ product: 1, 'forecastPeriod.startDate': -1 });
demandForecastSchema.index({ category: 1, createdAt: -1 });

const DemandForecast = mongoose.model('DemandForecast', demandForecastSchema);
export default DemandForecast;
export { DemandForecast };
