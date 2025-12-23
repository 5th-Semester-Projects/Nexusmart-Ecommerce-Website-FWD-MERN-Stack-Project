import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['product', 'payment', 'loyalty', 'coupon', 'download', 'check_in', 'table', 'tracking'],
    required: true
  },
  target: {
    type: String,
    required: true
  },
  targetId: mongoose.Schema.Types.ObjectId,
  qrImage: {
    url: String,
    format: String, // 'png', 'svg'
    size: Number
  },
  design: {
    foregroundColor: { type: String, default: '#000000' },
    backgroundColor: { type: String, default: '#ffffff' },
    logo: String,
    errorCorrection: {
      type: String,
      enum: ['L', 'M', 'Q', 'H'],
      default: 'M'
    }
  },
  data: mongoose.Schema.Types.Mixed,
  usage: {
    scans: { type: Number, default: 0 },
    uniqueScans: { type: Number, default: 0 },
    lastScannedAt: Date,
    scansByLocation: mongoose.Schema.Types.Mixed,
    scansByDevice: {
      ios: { type: Number, default: 0 },
      android: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  },
  scanHistory: [{
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    scannedAt: Date,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    },
    device: String,
    action: String
  }],
  settings: {
    maxScans: Number,
    requireAuth: Boolean,
    oneTimeUse: Boolean,
    validFrom: Date,
    validUntil: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
qrCodeSchema.index({ code: 1 });
qrCodeSchema.index({ type: 1, isActive: 1 });
qrCodeSchema.index({ targetId: 1 });

const QRCode = mongoose.model('QRCode', qrCodeSchema);
export default QRCode;
export { QRCode };
