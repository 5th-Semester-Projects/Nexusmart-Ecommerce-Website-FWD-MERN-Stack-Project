import mongoose from 'mongoose';

const arVirtualTryOnSchema = new mongoose.Schema({
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
  sessionId: {
    type: String,
    required: true
  },
  tryOnType: {
    type: String,
    enum: ['makeup', 'glasses', 'jewelry', 'watch', 'furniture', 'clothing', 'shoes', 'hair_color'],
    required: true
  },
  userImage: {
    original: String,
    processed: String,
    faceDetection: {
      landmarks: mongoose.Schema.Types.Mixed,
      boundingBox: mongoose.Schema.Types.Mixed,
      confidence: Number
    }
  },
  tryOnResult: {
    resultImage: String,
    thumbnail: String,
    overlayData: mongoose.Schema.Types.Mixed,
    renderQuality: Number
  },
  measurements: {
    faceShape: String,
    skinTone: String,
    roomDimensions: mongoose.Schema.Types.Mixed,
    bodyMeasurements: mongoose.Schema.Types.Mixed
  },
  interaction: {
    duration: Number, // seconds
    rotations: Number,
    zooms: Number,
    colorChanges: Number,
    variantsTried: [String]
  },
  preferences: {
    lighting: String,
    angle: String,
    background: String
  },
  outcome: {
    saved: Boolean,
    shared: Boolean,
    addedToCart: Boolean,
    purchased: Boolean
  },
  feedback: {
    realistic: Number, // 1-5
    helpful: Number,
    comments: String
  },
  technology: {
    arKit: Boolean,
    arCore: Boolean,
    webAR: Boolean,
    mlModel: String,
    processingTime: Number
  }
}, {
  timestamps: true
});

arVirtualTryOnSchema.index({ user: 1, createdAt: -1 });
arVirtualTryOnSchema.index({ product: 1 });
arVirtualTryOnSchema.index({ tryOnType: 1, createdAt: -1 });

const ARVirtualTryOn = mongoose.model('ARVirtualTryOn', arVirtualTryOnSchema);
export default ARVirtualTryOn;
export { ARVirtualTryOn };
