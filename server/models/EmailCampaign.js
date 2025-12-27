import mongoose from 'mongoose';

const emailCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['drip', 'abandoned_cart', 'promotional', 'transactional', 'newsletter'],
    default: 'promotional'
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    html: String,
    text: String,
    template: String,
    variables: mongoose.Schema.Types.Mixed
  },
  audience: {
    segmentId: mongoose.Schema.Types.ObjectId,
    filters: {
      userType: [String],
      location: [String],
      purchaseHistory: Boolean,
      minOrderValue: Number,
      lastActive: Date
    },
    recipientCount: Number
  },
  schedule: {
    type: {
      type: String,
      enum: ['immediate', 'scheduled', 'triggered'],
      default: 'immediate'
    },
    sendAt: Date,
    trigger: {
      event: String,
      delay: Number,
      condition: mongoose.Schema.Types.Mixed
    }
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'],
    default: 'draft'
  },
  metrics: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true, suppressReservedKeysWarning: true });

export default mongoose.model('EmailCampaign', emailCampaignSchema);
