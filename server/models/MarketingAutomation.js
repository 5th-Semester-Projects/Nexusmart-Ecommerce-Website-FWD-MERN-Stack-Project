import mongoose from 'mongoose';

const marketingAutomationSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },

  // Campaign Details
  campaignName: {
    type: String,
    required: true,
    trim: true
  },

  campaignType: {
    type: String,
    enum: [
      'abandoned-cart',
      'win-back',
      'post-purchase',
      'welcome-series',
      'birthday',
      'product-recommendation',
      'price-drop',
      'back-in-stock',
      'review-request',
      'loyalty-reward',
      'custom'
    ],
    required: true
  },

  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'archived'],
    default: 'draft'
  },

  // Channels
  channels: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push-notification', 'whatsapp', 'in-app'],
      required: true
    },
    enabled: { type: Boolean, default: true },
    priority: Number
  }],

  // Trigger Conditions
  trigger: {
    event: {
      type: String,
      enum: [
        'cart-abandoned',
        'purchase-made',
        'user-signup',
        'birthday',
        'inactive-period',
        'product-viewed',
        'search-made',
        'wishlist-added',
        'price-drop',
        'stock-available',
        'custom-event'
      ],
      required: true
    },

    conditions: [{
      field: String,
      operator: {
        type: String,
        enum: ['equals', 'not-equals', 'greater-than', 'less-than', 'contains', 'in', 'not-in']
      },
      value: mongoose.Schema.Types.Mixed
    }],

    // Timing
    delay: {
      value: Number,
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days', 'weeks']
      }
    },

    sendTime: {
      type: String,
      enum: ['immediate', 'optimal', 'scheduled'],
      default: 'immediate'
    },

    scheduledTime: {
      hour: Number,
      minute: Number,
      timezone: String
    }
  },

  // Target Audience
  audience: {
    segmentType: {
      type: String,
      enum: ['all-users', 'segment', 'custom-filter'],
      default: 'all-users'
    },

    segment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerSegment'
    },

    filters: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }],

    excludeSegments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerSegment'
    }],

    estimatedReach: Number
  },

  // Email Content
  emailContent: {
    subject: String,
    preheader: String,
    fromName: String,
    fromEmail: String,
    replyTo: String,

    template: {
      templateId: String,
      html: String,
      plainText: String,
      designJson: mongoose.Schema.Types.Mixed
    },

    personalization: [{
      variable: String,
      defaultValue: String
    }],

    attachments: [{
      name: String,
      url: String,
      size: Number
    }]
  },

  // SMS Content
  smsContent: {
    message: {
      type: String,
      maxlength: 160
    },
    sender: String,
    shortLinks: { type: Boolean, default: true }
  },

  // Push Notification Content
  pushContent: {
    title: String,
    body: String,
    icon: String,
    image: String,
    clickAction: String,
    data: mongoose.Schema.Types.Mixed
  },

  // Sequence/Workflow
  sequence: [{
    stepNumber: Number,
    stepName: String,

    delay: {
      value: Number,
      unit: String
    },

    channel: {
      type: String,
      enum: ['email', 'sms', 'push-notification', 'whatsapp']
    },

    content: {
      subject: String,
      message: String,
      template: String
    },

    conditions: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }],

    // What happens if condition not met
    fallback: {
      action: {
        type: String,
        enum: ['skip', 'wait', 'end-sequence']
      },
      waitTime: Number
    }
  }],

  // A/B Testing
  abTest: {
    enabled: { type: Boolean, default: false },

    variants: [{
      name: String,
      percentage: Number,

      subject: String,
      content: String,
      template: String,

      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      converted: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },

      isWinner: { type: Boolean, default: false }
    }],

    winnerCriteria: {
      metric: {
        type: String,
        enum: ['open-rate', 'click-rate', 'conversion-rate', 'revenue']
      },
      confidence: { type: Number, default: 95 }
    },

    testDuration: {
      value: Number,
      unit: String
    },

    winnerSelected: Boolean,
    winnerSelectedAt: Date
  },

  // Behavioral Triggers
  behavioralTriggers: {
    // Abandoned Cart Specific
    abandonedCart: {
      reminderSequence: [{
        delay: Number, // hours
        discount: {
          type: String,
          value: Number
        }
      }],
      maxReminders: { type: Number, default: 3 }
    },

    // Win-back Specific
    winBack: {
      inactiveDays: { type: Number, default: 90 },
      incentive: {
        type: String,
        value: Number
      }
    },

    // Post-purchase Specific
    postPurchase: {
      thankYouDelay: { type: Number, default: 1 }, // hours
      reviewRequestDelay: { type: Number, default: 7 }, // days
      crossSellDelay: { type: Number, default: 14 }, // days
      replenishmentDelay: { type: Number, default: 30 } // days
    }
  },

  // Performance Metrics
  metrics: {
    // Send Stats
    totalSent: { type: Number, default: 0 },
    totalDelivered: { type: Number, default: 0 },
    totalBounced: { type: Number, default: 0 },
    totalFailed: { type: Number, default: 0 },

    // Engagement Stats
    totalOpened: { type: Number, default: 0 },
    totalClicked: { type: Number, default: 0 },
    totalUnsubscribed: { type: Number, default: 0 },
    totalSpamReports: { type: Number, default: 0 },

    // Conversion Stats
    totalConversions: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    // Rates
    deliveryRate: { type: Number, default: 0 },
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    unsubscribeRate: { type: Number, default: 0 },

    // ROI
    totalCost: { type: Number, default: 0 },
    roi: { type: Number, default: 0 },

    lastUpdated: Date
  },

  // Individual Campaign Sends
  sends: [{
    recipient: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      email: String,
      phone: String
    },

    channel: String,
    variant: String, // For A/B testing

    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'opened', 'clicked', 'converted', 'bounced', 'failed', 'unsubscribed'],
      default: 'pending'
    },

    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date,
    clickedAt: Date,
    convertedAt: Date,

    // Interaction Details
    opens: { type: Number, default: 0 },
    clicks: [{
      url: String,
      clickedAt: Date
    }],

    conversion: {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      revenue: Number,
      convertedAt: Date
    },

    metadata: mongoose.Schema.Types.Mixed,
    error: String
  }],

  // Schedule Settings
  schedule: {
    startDate: Date,
    endDate: Date,

    recurring: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom']
      },
      interval: Number,
      endAfter: {
        occurrences: Number,
        date: Date
      }
    },

    nextRun: Date,
    lastRun: Date
  },

  // Campaign Goals
  goals: [{
    metric: String,
    target: Number,
    achieved: { type: Number, default: 0 },
    unit: String
  }],

  // Integration Settings
  integrations: {
    emailProvider: {
      type: String,
      enum: ['sendgrid', 'mailgun', 'aws-ses', 'smtp']
    },
    smsProvider: {
      type: String,
      enum: ['twilio', 'nexmo', 'aws-sns']
    },
    trackingEnabled: { type: Boolean, default: true },
    utmParameters: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    }
  },

  // Compliance
  compliance: {
    gdprCompliant: { type: Boolean, default: true },
    canSpamCompliant: { type: Boolean, default: true },
    unsubscribeLink: { type: Boolean, default: true },
    doubleOptIn: { type: Boolean, default: false }
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Indexes
marketingAutomationSchema.index({ businessId: 1, campaignType: 1 });
marketingAutomationSchema.index({ status: 1 });
marketingAutomationSchema.index({ 'schedule.nextRun': 1 });
marketingAutomationSchema.index({ 'sends.recipient.userId': 1 });
marketingAutomationSchema.index({ 'sends.status': 1 });

// Method: Calculate Rates
marketingAutomationSchema.methods.calculateRates = function () {
  if (this.metrics.totalSent === 0) {
    return;
  }

  this.metrics.deliveryRate = (this.metrics.totalDelivered / this.metrics.totalSent) * 100;
  this.metrics.openRate = (this.metrics.totalOpened / this.metrics.totalDelivered) * 100;
  this.metrics.clickRate = (this.metrics.totalClicked / this.metrics.totalOpened) * 100;
  this.metrics.conversionRate = (this.metrics.totalConversions / this.metrics.totalClicked) * 100;
  this.metrics.unsubscribeRate = (this.metrics.totalUnsubscribed / this.metrics.totalDelivered) * 100;

  // Calculate ROI
  if (this.metrics.totalCost > 0) {
    this.metrics.roi = ((this.metrics.totalRevenue - this.metrics.totalCost) / this.metrics.totalCost) * 100;
  }

  this.metrics.lastUpdated = Date.now();
};

// Method: Add Send Record
marketingAutomationSchema.methods.addSendRecord = function (recipientData, channel, variant) {
  this.sends.push({
    recipient: recipientData,
    channel,
    variant,
    status: 'sent',
    sentAt: Date.now()
  });

  this.metrics.totalSent += 1;
};

// Method: Record Interaction
marketingAutomationSchema.methods.recordInteraction = function (sendId, interactionType, data = {}) {
  const send = this.sends.id(sendId);

  if (!send) {
    throw new Error('Send record not found');
  }

  const now = Date.now();

  switch (interactionType) {
    case 'delivered':
      send.status = 'delivered';
      send.deliveredAt = now;
      this.metrics.totalDelivered += 1;
      break;

    case 'opened':
      if (send.status !== 'opened' && send.status !== 'clicked' && send.status !== 'converted') {
        send.status = 'opened';
        send.openedAt = now;
        this.metrics.totalOpened += 1;
      }
      send.opens += 1;
      break;

    case 'clicked':
      if (send.status !== 'clicked' && send.status !== 'converted') {
        send.status = 'clicked';
        send.clickedAt = now;
        this.metrics.totalClicked += 1;
      }
      send.clicks.push({
        url: data.url,
        clickedAt: now
      });
      break;

    case 'converted':
      send.status = 'converted';
      send.convertedAt = now;
      send.conversion = {
        orderId: data.orderId,
        revenue: data.revenue,
        convertedAt: now
      };
      this.metrics.totalConversions += 1;
      this.metrics.totalRevenue += data.revenue || 0;
      break;

    case 'bounced':
      send.status = 'bounced';
      send.error = data.error;
      this.metrics.totalBounced += 1;
      break;

    case 'unsubscribed':
      send.status = 'unsubscribed';
      this.metrics.totalUnsubscribed += 1;
      break;
  }

  this.calculateRates();
};

// Method: Select A/B Test Winner
marketingAutomationSchema.methods.selectABTestWinner = function () {
  if (!this.abTest.enabled || !this.abTest.variants || this.abTest.variants.length === 0) {
    return null;
  }

  const metric = this.abTest.winnerCriteria.metric;
  let winner = this.abTest.variants[0];
  let maxValue = 0;

  this.abTest.variants.forEach(variant => {
    let value = 0;

    switch (metric) {
      case 'open-rate':
        value = variant.delivered > 0 ? (variant.opened / variant.delivered) * 100 : 0;
        break;
      case 'click-rate':
        value = variant.opened > 0 ? (variant.clicked / variant.opened) * 100 : 0;
        break;
      case 'conversion-rate':
        value = variant.clicked > 0 ? (variant.converted / variant.clicked) * 100 : 0;
        break;
      case 'revenue':
        value = variant.revenue;
        break;
    }

    if (value > maxValue) {
      maxValue = value;
      winner = variant;
    }
  });

  winner.isWinner = true;
  this.abTest.winnerSelected = true;
  this.abTest.winnerSelectedAt = Date.now();

  return winner;
};

// Static: Get Active Campaigns
marketingAutomationSchema.statics.getActiveCampaigns = function (businessId) {
  return this.find({ businessId, status: 'active' });
};

// Static: Get Due Campaigns
marketingAutomationSchema.statics.getDueCampaigns = function () {
  return this.find({
    status: 'active',
    'schedule.nextRun': { $lte: new Date() }
  });
};

// Static: Get Campaign Performance
marketingAutomationSchema.statics.getCampaignPerformance = function (businessId, campaignType) {
  return this.aggregate([
    { $match: { businessId: mongoose.Types.ObjectId(businessId), campaignType } },
    {
      $group: {
        _id: '$campaignType',
        totalCampaigns: { $sum: 1 },
        totalSent: { $sum: '$metrics.totalSent' },
        totalRevenue: { $sum: '$metrics.totalRevenue' },
        avgOpenRate: { $avg: '$metrics.openRate' },
        avgClickRate: { $avg: '$metrics.clickRate' },
        avgConversionRate: { $avg: '$metrics.conversionRate' }
      }
    }
  ]);
};

const MarketingAutomation = mongoose.model('MarketingAutomation', marketingAutomationSchema);
export default MarketingAutomation;
export { MarketingAutomation };
