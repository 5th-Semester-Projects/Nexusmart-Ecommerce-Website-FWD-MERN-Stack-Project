const mongoose = require('mongoose');

const nextPurchasePredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  predictions: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    category: String,
    probability: {
      type: Number,
      min: 0,
      max: 100
    },
    predictedDate: Date,
    predictedPrice: Number,
    confidence: Number,
    reasoning: [String]
  }],
  purchasePatterns: {
    averageDaysBetweenPurchases: Number,
    preferredShoppingDays: [String],
    preferredShoppingTime: String,
    seasonalPatterns: mongoose.Schema.Types.Mixed,
    categoryRotation: [{
      category: String,
      frequency: Number
    }]
  },
  triggers: [{
    type: {
      type: String,
      enum: ['replenishment', 'seasonal', 'event', 'complementary', 'upgrade', 'discovery']
    },
    description: String,
    likelihood: Number
  }],
  recommendedActions: [{
    action: String,
    timing: Date,
    channel: {
      type: String,
      enum: ['email', 'push', 'sms', 'in_app', 'whatsapp']
    },
    message: String,
    priority: Number
  }],
  crossSellOpportunities: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    basedOn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    probability: Number
  }],
  upsellOpportunities: [{
    currentProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    suggestedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    probability: Number,
    valueIncrease: Number
  }],
  lifetimeValuePrediction: {
    next30Days: Number,
    next90Days: Number,
    next365Days: Number,
    confidence: Number
  },
  mlModel: {
    version: String,
    algorithm: String,
    features: [String],
    accuracy: Number,
    lastTrainedAt: Date
  },
  actualPurchases: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    date: Date,
    wasPredicted: Boolean,
    predictionAccuracy: Number
  }],
  lastPredicted: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

nextPurchasePredictionSchema.index({ user: 1, lastPredicted: -1 });
nextPurchasePredictionSchema.index({ 'predictions.predictedDate': 1 });

const NextPurchasePrediction = mongoose.model('NextPurchasePrediction', nextPurchasePredictionSchema);
export default NextPurchasePrediction;
export { NextPurchasePrediction };
