import mongoose from 'mongoose';

const imageGenerationSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  generationType: {
    type: String,
    enum: ['lifestyle', 'background_removal', 'style_transfer', 'upscale', 'variation'],
    required: true
  },
  prompt: String,
  originalImage: {
    url: String,
    publicId: String
  },
  generatedImages: [{
    url: String,
    publicId: String,
    style: String,
    quality: Number,
    generatedAt: Date,
    isApproved: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  }],
  settings: {
    style: String,
    background: String,
    lighting: String,
    mood: String,
    resolution: String
  },
  aiModel: {
    type: String,
    enum: ['dall-e', 'stable-diffusion', 'midjourney', 'custom'],
    default: 'stable-diffusion'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cost: Number,
  metadata: {
    processingTime: Number,
    iterations: Number,
    seed: Number
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

imageGenerationSchema.index({ product: 1 });
imageGenerationSchema.index({ status: 1 });
imageGenerationSchema.index({ createdAt: -1 });

export default mongoose.model('ImageGeneration', imageGenerationSchema);
