import mongoose from 'mongoose';

const videosupportSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  session: {
    sessionId: {
      type: String,
      required: true,
      unique: true
    },
    roomId: String,
    platform: {
      type: String,
      enum: ['webrtc', 'zoom', 'teams', 'custom'],
      default: 'webrtc'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    duration: Number,
    status: {
      type: String,
      enum: ['scheduled', 'waiting', 'active', 'ended', 'cancelled'],
      default: 'scheduled'
    }
  },
  features: {
    video: {
      enabled: {
        type: Boolean,
        default: true
      },
      quality: String,
      resolution: String
    },
    audio: {
      enabled: {
        type: Boolean,
        default: true
      },
      quality: String
    },
    screenSharing: {
      enabled: {
        type: Boolean,
        default: false
      },
      sharedBy: String,
      startedAt: Date
    },
    recording: {
      enabled: {
        type: Boolean,
        default: false
      },
      consent: Boolean,
      url: String,
      duration: Number
    },
    chat: {
      enabled: {
        type: Boolean,
        default: true
      },
      messages: [{
        from: String,
        message: String,
        timestamp: Date
      }]
    },
    fileSharing: {
      enabled: {
        type: Boolean,
        default: true
      },
      files: [{
        name: String,
        url: String,
        sharedBy: String,
        sharedAt: Date
      }]
    }
  },
  annotations: [{
    type: {
      type: String,
      enum: ['highlight', 'arrow', 'text', 'shape']
    },
    data: mongoose.Schema.Types.Mixed,
    createdBy: String,
    timestamp: Date
  }],
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['customer', 'agent', 'supervisor', 'guest']
    },
    joinedAt: Date,
    leftAt: Date,
    connectionQuality: String
  }],
  analytics: {
    connectionQuality: String,
    audioQuality: Number,
    videoQuality: Number,
    latency: Number,
    packetLoss: Number,
    bandwidth: Number
  },
  outcome: {
    resolved: Boolean,
    resolution: String,
    followUpRequired: Boolean,
    nextSteps: [String],
    rating: Number,
    feedback: String
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

videosupportSchema.index({ customer: 1 });
videosupportSchema.index({ agent: 1 });
videosupportSchema.index({ 'session.status': 1 });

export default mongoose.model('VideoSupport', videosupportSchema);
