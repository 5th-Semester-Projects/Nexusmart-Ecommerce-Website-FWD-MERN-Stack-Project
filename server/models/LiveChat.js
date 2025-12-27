import mongoose from 'mongoose';

const liveChatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'resolved', 'closed', 'transferred'],
    default: 'waiting'
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderType: {
      type: String,
      enum: ['customer', 'agent', 'bot'],
      required: true
    },
    message: {
      text: String,
      type: {
        type: String,
        enum: ['text', 'image', 'file', 'product', 'order'],
        default: 'text'
      },
      fileUrl: String,
      productId: mongoose.Schema.Types.ObjectId,
      orderId: mongoose.Schema.Types.ObjectId
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  metadata: {
    source: {
      type: String,
      enum: ['website', 'mobile_app', 'facebook', 'whatsapp'],
      default: 'website'
    },
    currentPage: String,
    userAgent: String,
    ipAddress: String,
    location: {
      country: String,
      city: String
    }
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  timing: {
    startedAt: {
      type: Date,
      default: Date.now
    },
    assignedAt: Date,
    firstResponseAt: Date,
    resolvedAt: Date,
    closedAt: Date,
    waitTime: Number,
    responseTime: Number,
    totalDuration: Number
  }
}, { timestamps: true, suppressReservedKeysWarning: true });

liveChatSchema.index({ customer: 1, createdAt: -1 });
liveChatSchema.index({ agent: 1, status: 1 });

export default mongoose.model('LiveChat', liveChatSchema);
