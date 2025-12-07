const mongoose = require('mongoose');

const customerServiceHubSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },

  // Ticket Management System
  ticket: {
    ticketId: {
      type: String,
      unique: true,
      required: true
    },

    customer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      email: String,
      phone: String,
      isGuest: { type: Boolean, default: false }
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: [
        'order-issue',
        'product-inquiry',
        'payment-issue',
        'shipping-delay',
        'return-refund',
        'technical-support',
        'account-issue',
        'complaint',
        'feedback',
        'general-inquiry',
        'other'
      ],
      required: true
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },

    status: {
      type: String,
      enum: ['open', 'in-progress', 'pending-customer', 'resolved', 'closed', 'reopened'],
      default: 'open',
      index: true
    },

    // Related Entities
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },

    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },

    relatedTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },

    // Assignment
    assignedTo: {
      agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      assignedAt: Date,
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },

    department: {
      type: String,
      enum: ['sales', 'technical', 'billing', 'shipping', 'general']
    },

    // Conversation Thread
    messages: [{
      messageId: String,
      from: {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        name: String,
        role: {
          type: String,
          enum: ['customer', 'agent', 'system', 'bot']
        }
      },
      content: String,
      timestamp: { type: Date, default: Date.now },
      isInternal: { type: Boolean, default: false }, // Internal notes
      attachments: [{
        name: String,
        url: String,
        type: String,
        size: Number
      }],
      read: { type: Boolean, default: false },
      readAt: Date
    }],

    // Attachments
    attachments: [{
      name: String,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: Date,
      type: String,
      size: Number
    }],

    // Tags
    tags: [String],

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    closedAt: Date,
    firstResponseAt: Date,

    // SLA Tracking
    sla: {
      firstResponseTime: Number, // minutes
      resolutionTime: Number, // minutes
      firstResponseDue: Date,
      resolutionDue: Date,
      firstResponseBreached: { type: Boolean, default: false },
      resolutionBreached: { type: Boolean, default: false }
    },

    // Customer Satisfaction
    satisfaction: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: String,
      submittedAt: Date
    },

    // Resolution
    resolution: {
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      resolutionNote: String,
      resolutionType: {
        type: String,
        enum: ['solved', 'workaround', 'unable-to-solve', 'duplicate', 'not-an-issue']
      },
      resolvedAt: Date
    },

    // Escalation
    escalation: {
      isEscalated: { type: Boolean, default: false },
      escalatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      escalatedAt: Date,
      escalationReason: String,
      escalationLevel: Number
    },

    // Activity Log
    activityLog: [{
      action: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: { type: Date, default: Date.now },
      details: mongoose.Schema.Types.Mixed
    }]
  },

  // Live Chat Integration
  liveChat: {
    enabled: { type: Boolean, default: true },

    session: {
      sessionId: String,
      customer: {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        name: String,
        email: String,
        isGuest: Boolean
      },

      agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },

      status: {
        type: String,
        enum: ['waiting', 'active', 'ended', 'transferred'],
        default: 'waiting'
      },

      startedAt: Date,
      endedAt: Date,
      duration: Number, // seconds

      messages: [{
        from: String,
        content: String,
        timestamp: Date,
        type: {
          type: String,
          enum: ['text', 'image', 'file', 'system']
        },
        read: Boolean
      }],

      // Chat Routing
      queue: {
        position: Number,
        waitTime: Number,
        estimatedWaitTime: Number
      },

      // Metadata
      page: String,
      referrer: String,
      device: String,
      location: String,

      satisfaction: {
        rating: Number,
        feedback: String
      },

      tags: [String],
      notes: String
    },

    // Chat History
    chatHistory: [{
      sessionId: String,
      startedAt: Date,
      endedAt: Date,
      duration: Number,
      messageCount: Number,
      agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: Number,
      convertedToTicket: Boolean,
      ticketId: String
    }]
  },

  // Knowledge Base / FAQ
  knowledgeBase: [{
    articleId: String,
    title: String,
    content: String,
    category: String,
    tags: [String],

    views: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },

    relatedArticles: [String],

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    lastUpdated: Date,
    publishedAt: Date
  }],

  // Chat Routing & Assignment
  routing: {
    strategy: {
      type: String,
      enum: ['round-robin', 'least-active', 'skill-based', 'manual'],
      default: 'round-robin'
    },

    rules: [{
      condition: mongoose.Schema.Types.Mixed,
      assignTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      department: String,
      priority: Number
    }],

    businessHours: {
      enabled: { type: Boolean, default: true },
      timezone: String,
      hours: [{
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        open: String,
        close: String,
        isOpen: Boolean
      }]
    },

    offlineMessage: String
  },

  // SLA Configuration
  slaConfig: {
    firstResponseTime: {
      low: Number, // minutes
      medium: Number,
      high: Number,
      urgent: Number
    },

    resolutionTime: {
      low: Number, // hours
      medium: Number,
      high: Number,
      urgent: Number
    },

    businessHoursOnly: { type: Boolean, default: true }
  },

  // Canned Responses / Templates
  cannedResponses: [{
    name: String,
    shortcut: String,
    content: String,
    category: String,
    language: String,
    usageCount: { type: Number, default: 0 }
  }],

  // Agent Performance
  agentPerformance: [{
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    metrics: {
      ticketsHandled: { type: Number, default: 0 },
      ticketsResolved: { type: Number, default: 0 },
      ticketsReopened: { type: Number, default: 0 },

      avgFirstResponseTime: Number, // minutes
      avgResolutionTime: Number, // minutes

      chatsHandled: { type: Number, default: 0 },
      avgChatDuration: Number, // minutes

      customerSatisfactionScore: Number,

      slaCompliance: Number, // percentage

      activeTime: Number, // hours
      idleTime: Number,

      lastActive: Date
    },

    currentStatus: {
      type: String,
      enum: ['online', 'away', 'busy', 'offline'],
      default: 'offline'
    },

    currentLoad: {
      activeTickets: Number,
      activeChats: Number,
      maxCapacity: Number
    }
  }],

  // Analytics
  analytics: {
    totalTickets: { type: Number, default: 0 },
    openTickets: { type: Number, default: 0 },
    resolvedTickets: { type: Number, default: 0 },
    avgResolutionTime: Number,

    totalChats: { type: Number, default: 0 },
    avgChatDuration: Number,

    customerSatisfactionScore: Number,

    topCategories: [{
      category: String,
      count: Number
    }],

    peakHours: [{
      hour: Number,
      count: Number
    }],

    lastUpdated: Date
  },

  // Integrations
  integrations: {
    email: {
      enabled: Boolean,
      incomingEmail: String,
      outgoingEmail: String
    },

    slack: {
      enabled: Boolean,
      webhookUrl: String,
      channel: String
    },

    zendesk: {
      enabled: Boolean,
      apiKey: String,
      subdomain: String
    },

    intercom: {
      enabled: Boolean,
      appId: String
    }
  }

}, {
  timestamps: true
});

// Indexes
customerServiceHubSchema.index({ businessId: 1, 'ticket.status': 1 });
customerServiceHubSchema.index({ 'ticket.ticketId': 1 }, { unique: true });
customerServiceHubSchema.index({ 'ticket.customer.userId': 1 });
customerServiceHubSchema.index({ 'ticket.assignedTo.agent': 1 });
customerServiceHubSchema.index({ 'ticket.priority': 1, 'ticket.createdAt': -1 });
customerServiceHubSchema.index({ 'liveChat.session.sessionId': 1 });

// Method: Assign Ticket to Agent
customerServiceHubSchema.methods.assignTicket = function (agentId, assignedBy) {
  this.ticket.assignedTo = {
    agent: agentId,
    assignedAt: Date.now(),
    assignedBy
  };

  this.ticket.activityLog.push({
    action: 'ticket-assigned',
    performedBy: assignedBy,
    timestamp: Date.now(),
    details: { agentId }
  });

  if (this.ticket.status === 'open') {
    this.ticket.status = 'in-progress';
  }
};

// Method: Add Message
customerServiceHubSchema.methods.addMessage = function (fromUserId, fromName, role, content, isInternal = false, attachments = []) {
  const message = {
    messageId: new mongoose.Types.ObjectId().toString(),
    from: {
      userId: fromUserId,
      name: fromName,
      role
    },
    content,
    timestamp: Date.now(),
    isInternal,
    attachments,
    read: false
  };

  this.ticket.messages.push(message);
  this.ticket.updatedAt = Date.now();

  // Track first response time
  if (role === 'agent' && !this.ticket.firstResponseAt) {
    this.ticket.firstResponseAt = Date.now();
    this.ticket.sla.firstResponseTime = Math.floor(
      (this.ticket.firstResponseAt - this.ticket.createdAt) / 60000
    );
  }

  return message;
};

// Method: Resolve Ticket
customerServiceHubSchema.methods.resolveTicket = function (resolvedBy, resolutionNote, resolutionType) {
  this.ticket.status = 'resolved';
  this.ticket.resolvedAt = Date.now();

  this.ticket.resolution = {
    resolvedBy,
    resolutionNote,
    resolutionType,
    resolvedAt: Date.now()
  };

  this.ticket.sla.resolutionTime = Math.floor(
    (this.ticket.resolvedAt - this.ticket.createdAt) / 60000
  );

  this.ticket.activityLog.push({
    action: 'ticket-resolved',
    performedBy: resolvedBy,
    timestamp: Date.now(),
    details: { resolutionType, resolutionNote }
  });
};

// Method: Escalate Ticket
customerServiceHubSchema.methods.escalateTicket = function (escalatedTo, escalationReason, escalationLevel) {
  this.ticket.escalation = {
    isEscalated: true,
    escalatedTo,
    escalatedAt: Date.now(),
    escalationReason,
    escalationLevel
  };

  this.ticket.priority = 'urgent';

  this.ticket.activityLog.push({
    action: 'ticket-escalated',
    timestamp: Date.now(),
    details: { escalatedTo, escalationReason, escalationLevel }
  });
};

// Method: Check SLA Breach
customerServiceHubSchema.methods.checkSLABreach = function () {
  const now = Date.now();

  // Check first response SLA
  if (!this.ticket.firstResponseAt && this.ticket.sla.firstResponseDue) {
    this.ticket.sla.firstResponseBreached = now > this.ticket.sla.firstResponseDue;
  }

  // Check resolution SLA
  if (this.ticket.status !== 'resolved' && this.ticket.sla.resolutionDue) {
    this.ticket.sla.resolutionBreached = now > this.ticket.sla.resolutionDue;
  }

  return {
    firstResponseBreached: this.ticket.sla.firstResponseBreached,
    resolutionBreached: this.ticket.sla.resolutionBreached
  };
};

// Static: Get Open Tickets
customerServiceHubSchema.statics.getOpenTickets = function (businessId) {
  return this.find({
    businessId,
    'ticket.status': { $in: ['open', 'in-progress'] }
  }).sort({ 'ticket.priority': -1, 'ticket.createdAt': 1 });
};

// Static: Get Agent Performance
customerServiceHubSchema.statics.getAgentPerformance = function (businessId, agentId) {
  return this.findOne({
    businessId,
    'agentPerformance.agent': agentId
  }).select('agentPerformance.$');
};

module.exports = mongoose.model('CustomerServiceHub', customerServiceHubSchema);
