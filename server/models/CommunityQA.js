import mongoose from 'mongoose';

const communityQASchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  question: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    askedAt: {
      type: Date,
      default: Date.now
    },
    isAnonymous: {
      type: Boolean,
      default: false
    }
  },
  answers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    answeredAt: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isBestAnswer: {
      type: Boolean,
      default: false
    },
    votes: {
      up: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      down: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    reputation: {
      type: Number,
      default: 0
    }
  }],
  category: {
    type: String,
    enum: ['product_info', 'usage', 'compatibility', 'shipping', 'warranty', 'size_fit', 'other'],
    default: 'product_info'
  },
  tags: [String],
  status: {
    type: String,
    enum: ['open', 'answered', 'closed'],
    default: 'open'
  },
  views: {
    type: Number,
    default: 0
  },
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    markedAt: Date
  }],
  notHelpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    markedAt: Date
  }]
}, {
  timestamps: true, suppressReservedKeysWarning: true });

communityQASchema.index({ product: 1 });
communityQASchema.index({ 'question.user': 1 });
communityQASchema.index({ status: 1 });
communityQASchema.index({ views: -1 });

export default mongoose.model('CommunityQA', communityQASchema);
