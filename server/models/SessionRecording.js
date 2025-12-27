import mongoose from 'mongoose';

// Sub-schema for errors array
const errorSchema = new mongoose.Schema({
  message: String,
  stack: String,
  timestamp: Date,
  page: String
}, { _id: false, suppressReservedKeysWarning: true });

const sessionRecordingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  recording: {
    started: {
      type: Date,
      default: Date.now
    },
    ended: Date,
    duration: Number,
    url: String,
    size: Number
  },
  events: [{
    type: {
      type: String,
      enum: ['click', 'scroll', 'mousemove', 'input', 'resize', 'navigation', 'error']
    },
    timestamp: Number,
    element: String,
    value: mongoose.Schema.Types.Mixed,
    coordinates: {
      x: Number,
      y: Number
    }
  }],
  pageViews: [{
    url: String,
    title: String,
    enteredAt: Date,
    leftAt: Date,
    duration: Number
  }],
  interactions: {
    clicks: Number,
    scrolls: Number,
    inputs: Number,
    hovers: Number
  },
  heatmap: {
    clicks: [{
      x: Number,
      y: Number,
      page: String,
      count: Number
    }],
    scrollDepth: [{
      page: String,
      maxDepth: Number,
      avgDepth: Number
    }]
  },
  analytics: {
    bounced: Boolean,
    converted: Boolean,
    addedToCart: Boolean,
    completedPurchase: Boolean,
    revenue: Number,
    pagesViewed: Number,
    timeOnSite: Number
  },
  device: {
    type: String,
    browser: String,
    os: String,
    screenSize: String
  },
  errors: [errorSchema],
  consent: {
    given: {
      type: Boolean,
      default: false
    },
    givenAt: Date,
    gdprCompliant: {
      type: Boolean,
      default: true
    },
    anonymized: {
      type: Boolean,
      default: false
    }
  },
  tags: [String],
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    timestamp: Date
  }]
}, {
  timestamps: true, suppressReservedKeysWarning: true
});

sessionRecordingSchema.index({ user: 1 });
sessionRecordingSchema.index({ 'recording.started': -1 });

export default mongoose.model('SessionRecording', sessionRecordingSchema);
