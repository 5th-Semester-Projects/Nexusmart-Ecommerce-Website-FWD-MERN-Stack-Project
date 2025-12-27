import mongoose from 'mongoose';

const contractManagementSchema = new mongoose.Schema({
  parties: {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  contractNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['purchase', 'service', 'subscription', 'partnership', 'nda'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  terms: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    },
    renewalPeriod: String,
    noticeperiod: Number,
    paymentTerms: String,
    deliveryTerms: String,
    penalties: String,
    terminationClauses: String
  },
  value: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    paymentSchedule: [{
      milestone: String,
      amount: Number,
      dueDate: Date,
      paid: {
        type: Boolean,
        default: false
      },
      paidAt: Date
    }]
  },
  documents: [{
    name: String,
    version: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isFinal: Boolean
  }],
  signatures: [{
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    signedAt: Date,
    signature: String,
    ipAddress: String,
    signatureType: {
      type: String,
      enum: ['electronic', 'digital', 'wet']
    },
    verified: Boolean
  }],
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'pending_signature', 'active', 'completed', 'terminated', 'expired'],
    default: 'draft'
  },
  amendments: [{
    amendmentNumber: Number,
    description: String,
    changes: mongoose.Schema.Types.Mixed,
    effectiveDate: Date,
    approvedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      approvedAt: Date
    }]
  }],
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    notes: String
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['renewal', 'expiry', 'milestone', 'payment_due']
    },
    sentTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    sentAt: Date,
    message: String
  }]
}, {
  timestamps: true, suppressReservedKeysWarning: true });

contractManagementSchema.index({ 'parties.buyer': 1 });
contractManagementSchema.index({ 'parties.seller': 1 });
contractManagementSchema.index({ status: 1 });

export default mongoose.model('ContractManagement', contractManagementSchema);
