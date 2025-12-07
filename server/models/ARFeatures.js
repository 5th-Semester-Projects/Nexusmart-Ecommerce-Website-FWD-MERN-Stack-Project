import mongoose from 'mongoose';

// ==================== VIRTUAL TRY-ON SESSION ====================
const virtualTryOnSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sessionId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['makeup', 'clothing', 'accessories', 'eyewear', 'jewelry'],
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  inputImage: {
    public_id: String,
    url: String,
  },
  resultImage: {
    public_id: String,
    url: String,
  },
  settings: {
    intensity: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 2.0,
    },
    shade: String,
    size: String,
  },
  liked: {
    type: Boolean,
    default: null,
  },
  shared: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

virtualTryOnSchema.index({ user: 1, product: 1 });

export const VirtualTryOn = mongoose.model('VirtualTryOn', virtualTryOnSchema);

// ==================== FURNITURE PLACEMENT SESSION ====================
const furniturePlacementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sessionId: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  roomImage: {
    public_id: String,
    url: String,
  },
  roomDimensions: {
    width: Number,
    height: Number,
    depth: Number,
    unit: {
      type: String,
      enum: ['meters', 'feet', 'inches'],
      default: 'meters',
    },
  },
  placement: {
    position: {
      x: Number,
      y: Number,
      z: Number,
    },
    rotation: {
      x: Number,
      y: Number,
      z: Number,
    },
    scale: {
      type: Number,
      default: 1.0,
    },
  },
  resultImage: {
    public_id: String,
    url: String,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  notes: String,
}, { timestamps: true });

export const FurniturePlacement = mongoose.model('FurniturePlacement', furniturePlacementSchema);

// ==================== BODY SCAN DATA ====================
const bodyScanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scanType: {
    type: String,
    enum: ['full_body', 'upper_body', 'lower_body', 'feet'],
    default: 'full_body',
  },
  measurements: {
    height: { value: Number, unit: String },
    weight: { value: Number, unit: String },
    chest: { value: Number, unit: String },
    waist: { value: Number, unit: String },
    hips: { value: Number, unit: String },
    shoulders: { value: Number, unit: String },
    armLength: { value: Number, unit: String },
    inseam: { value: Number, unit: String },
    thigh: { value: Number, unit: String },
    neck: { value: Number, unit: String },
    footLength: { value: Number, unit: String },
    footWidth: { value: Number, unit: String },
  },
  recommendedSizes: {
    tops: String,
    bottoms: String,
    dresses: String,
    shoes: String,
    international: {
      US: String,
      UK: String,
      EU: String,
      Asian: String,
    },
  },
  bodyShape: {
    type: String,
    enum: ['rectangle', 'triangle', 'inverted_triangle', 'hourglass', 'apple', 'pear'],
  },
  scanImages: [{
    angle: String,
    public_id: String,
    url: String,
  }],
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

bodyScanSchema.index({ user: 1, isActive: 1 });

export const BodyScan = mongoose.model('BodyScan', bodyScanSchema);

// ==================== AR PRODUCT MODELS ====================
const arProductModelSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true,
  },
  modelType: {
    type: String,
    enum: ['3d', '2d_overlay', 'face_tracking', 'body_tracking', 'surface_tracking'],
    required: true,
  },
  modelUrl: {
    glb: String,
    usdz: String,
    obj: String,
  },
  thumbnailUrl: String,
  dimensions: {
    width: Number,
    height: Number,
    depth: Number,
    unit: String,
  },
  anchors: [{
    name: String,
    position: {
      x: Number,
      y: Number,
      z: Number,
    },
  }],
  animations: [{
    name: String,
    duration: Number,
    loop: Boolean,
  }],
  variants: [{
    color: String,
    texture: String,
    modelUrl: String,
  }],
  viewCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export const ARProductModel = mongoose.model('ARProductModel', arProductModelSchema);

export default { VirtualTryOn, FurniturePlacement, BodyScan, ARProductModel };
