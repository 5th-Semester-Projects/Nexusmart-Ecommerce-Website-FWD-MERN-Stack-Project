const mongoose = require('mongoose');

const sizePredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  measurements: {
    height: Number,
    weight: Number,
    chest: Number,
    waist: Number,
    hips: Number,
    inseam: Number,
    shoeSize: Number
  },
  previousPurchases: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    size: String,
    fit: {
      type: String,
      enum: ['too_small', 'slightly_small', 'perfect', 'slightly_large', 'too_large']
    },
    returned: Boolean,
    returnReason: String
  }],
  predictedSize: {
    size: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    alternativeSizes: [{
      size: String,
      probability: Number
    }]
  },
  fitGuarantee: {
    eligible: Boolean,
    expiresAt: Date
  },
  brandSizeMapping: {
    brand: String,
    userSize: mongoose.Schema.Types.Mixed
  },
  actualPurchase: {
    size: String,
    fitFeedback: String,
    returned: Boolean
  },
  mlModel: {
    version: String,
    accuracy: Number,
    lastTrainedAt: Date
  }
}, {
  timestamps: true
});

sizePredictionSchema.index({ user: 1, product: 1 });
sizePredictionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SizePrediction', sizePredictionSchema);
