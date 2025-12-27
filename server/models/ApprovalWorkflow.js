import mongoose from 'mongoose';

const approvalWorkflowSchema = new mongoose.Schema({
  request: {
    type: {
      type: String,
      enum: ['purchase', 'expense', 'contract', 'budget', 'vendor', 'quote'],
      required: true
    },
    referenceId: String,
    amount: Number,
    currency: String,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    description: String,
    justification: String,
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  },
  workflow: {
    template: String,
    levels: [{
      level: {
        type: Number,
        required: true
      },
      name: String,
      approvers: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        role: String,
        required: {
          type: Boolean,
          default: true
        }
      }],
      requireAll: {
        type: Boolean,
        default: false
      },
      autoApproveAfter: Number,
      escalateTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      escalateAfter: Number
    }],
    parallel: {
      type: Boolean,
      default: false
    }
  },
  approvals: [{
    level: Number,
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'delegated'],
      default: 'pending'
    },
    decision: String,
    comments: String,
    timestamp: Date,
    delegatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  currentLevel: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'approved', 'rejected', 'cancelled', 'escalated'],
    default: 'pending'
  },
  timeline: [{
    event: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  reminders: [{
    sentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date,
    type: String
  }],
  finalDecision: {
    decision: String,
    decidedAt: Date,
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

approvalWorkflowSchema.index({ 'request.requestedBy': 1 });
approvalWorkflowSchema.index({ status: 1 });
approvalWorkflowSchema.index({ currentLevel: 1 });

export default mongoose.model('ApprovalWorkflow', approvalWorkflowSchema);
