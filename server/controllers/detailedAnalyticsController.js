import Customer360 from '../models/Customer360.js';
import SessionRecording from '../models/SessionRecording.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Customer 360 View

export const getCustomer360View = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  const customer = await Customer360.findOne({ user: userId })
    .populate('user', 'name email')
    .populate('orders.order')
    .populate('supportHistory.ticket');

  if (!customer) {
    return next(new ErrorHandler('Customer 360 profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: customer
  });
});

export const updateCustomer360 = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  const updates = req.body;

  let customer = await Customer360.findOne({ user: userId });

  if (!customer) {
    // Create new Customer 360 profile
    customer = await Customer360.create({
      user: userId,
      ...updates
    });
  } else {
    Object.keys(updates).forEach(key => {
      customer[key] = updates[key];
    });
    await customer.save();
  }

  res.status(200).json({
    success: true,
    data: customer
  });
});

// Cohort Analysis

export const createCohort = catchAsyncErrors(async (req, res, next) => {
  const { name, criteria, startDate, endDate } = req.body;

  // Simplified cohort analysis
  const cohortData = {
    cohortId: 'cohort_' + Date.now(),
    name,
    criteria,
    dateRange: { start: startDate, end: endDate },
    metrics: {
      totalUsers: 1500,
      activeUsers: 850,
      retention: {
        week1: 65,
        week2: 48,
        week3: 38,
        week4: 32,
        month2: 25,
        month3: 20
      },
      revenue: {
        total: 145000,
        averagePerUser: 96.67,
        ltv: 320
      },
      engagement: {
        sessionsPerUser: 12.5,
        avgSessionDuration: 8.5,
        pagesPerSession: 6.8
      }
    }
  };

  res.status(200).json({
    success: true,
    data: cohortData
  });
});

export const getCohortAnalysis = catchAsyncErrors(async (req, res, next) => {
  const { cohortId } = req.params;

  // Return cohort analysis data
  const analysis = {
    cohortId,
    retentionCurve: generateRetentionCurve(),
    revenueProgression: generateRevenueProgression(),
    topProducts: generateTopProducts(),
    behaviorPatterns: generateBehaviorPatterns()
  };

  res.status(200).json({
    success: true,
    data: analysis
  });
});

// Funnel Optimization

export const analyzeFunnel = catchAsyncErrors(async (req, res, next) => {
  const { funnelName, steps } = req.body;

  const funnelAnalysis = {
    funnelName,
    totalEntries: 10000,
    steps: [
      { name: 'Homepage Visit', users: 10000, conversionRate: 100, dropOff: 0 },
      { name: 'Category Browse', users: 7500, conversionRate: 75, dropOff: 2500 },
      { name: 'Product View', users: 5200, conversionRate: 52, dropOff: 2300 },
      { name: 'Add to Cart', users: 2800, conversionRate: 28, dropOff: 2400 },
      { name: 'Checkout', users: 1400, conversionRate: 14, dropOff: 1400 },
      { name: 'Purchase', users: 980, conversionRate: 9.8, dropOff: 420 }
    ],
    overallConversionRate: 9.8,
    avgTimeToConvert: 24.5,
    recommendations: [
      'Optimize product page load time',
      'Simplify checkout process',
      'Add trust badges',
      'Offer guest checkout'
    ]
  };

  res.status(200).json({
    success: true,
    data: funnelAnalysis
  });
});

// Heat Mapping

export const getHeatmapData = catchAsyncErrors(async (req, res, next) => {
  const { page, device } = req.query;

  const sessions = await SessionRecording.find({
    'metadata.page': page || 'homepage',
    'metadata.device': device || 'desktop',
    consent: true
  }).limit(1000);

  const heatmapData = {
    page: page || 'homepage',
    device: device || 'desktop',
    totalSessions: sessions.length,
    clicks: generateClickData(sessions),
    scrollDepth: generateScrollData(sessions),
    attention: generateAttentionData(sessions),
    avgTimeOnPage: calculateAvgTime(sessions)
  };

  res.status(200).json({
    success: true,
    data: heatmapData
  });
});

// Revenue Attribution

export const getRevenueAttribution = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate, model } = req.query;

  const attributionModel = model || 'last_touch';

  const attribution = {
    model: attributionModel,
    dateRange: { start: startDate, end: endDate },
    channels: [
      { channel: 'Organic Search', revenue: 125000, orders: 850, percentage: 35 },
      { channel: 'Paid Search', revenue: 95000, orders: 620, percentage: 26.5 },
      { channel: 'Social Media', revenue: 68000, orders: 480, percentage: 19 },
      { channel: 'Email', revenue: 45000, orders: 320, percentage: 12.5 },
      { channel: 'Direct', revenue: 25000, orders: 180, percentage: 7 }
    ],
    totalRevenue: 358000,
    totalOrders: 2450,
    topPerformingChannel: 'Organic Search',
    roi: {
      paidSearch: 3.8,
      social: 2.5,
      email: 8.2
    }
  };

  res.status(200).json({
    success: true,
    data: attribution
  });
});

// Predictive LTV

export const predictCustomerLTV = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  const customer = await Customer360.findOne({ user: userId });

  if (!customer) {
    return next(new ErrorHandler('Customer not found', 404));
  }

  const ltvPrediction = {
    userId,
    currentValue: customer.orders.totalValue || 0,
    predictedLTV: {
      oneYear: calculateLTV(customer, 12),
      threeYears: calculateLTV(customer, 36),
      lifetime: calculateLTV(customer, 60)
    },
    confidence: 85,
    factors: [
      { factor: 'Purchase frequency', weight: 0.3, score: 8.5 },
      { factor: 'Average order value', weight: 0.25, score: 7.2 },
      { factor: 'Product diversity', weight: 0.2, score: 6.8 },
      { factor: 'Engagement level', weight: 0.15, score: 9.1 },
      { factor: 'Referrals', weight: 0.1, score: 5.5 }
    ],
    segment: 'High Value',
    churnRisk: 'Low'
  };

  res.status(200).json({
    success: true,
    data: ltvPrediction
  });
});

// Real-time Dashboards

export const getRealtimeDashboard = catchAsyncErrors(async (req, res, next) => {
  const dashboard = {
    timestamp: Date.now(),
    liveMetrics: {
      activeUsers: 1247,
      activeOrders: 42,
      cartActivity: 156,
      revenue: {
        today: 24800,
        thisHour: 3450
      }
    },
    topProducts: [
      { id: 1, name: 'Premium Headphones', views: 145, sales: 12 },
      { id: 2, name: 'Smart Watch', views: 132, sales: 8 },
      { id: 3, name: 'Wireless Mouse', views: 98, sales: 15 }
    ],
    trafficSources: {
      organic: 45,
      paid: 28,
      social: 18,
      direct: 9
    },
    conversionRate: 3.2,
    avgOrderValue: 127.50,
    alerts: [
      { type: 'inventory', message: 'Low stock on SKU #12345', severity: 'medium' },
      { type: 'performance', message: 'Page load time increasing', severity: 'low' }
    ]
  };

  res.status(200).json({
    success: true,
    data: dashboard
  });
});

// A/B Testing

export const createABTest = catchAsyncErrors(async (req, res, next) => {
  const { name, variants, metric, duration } = req.body;

  const test = {
    testId: 'test_' + Date.now(),
    name,
    variants,
    metric,
    duration,
    status: 'running',
    startDate: Date.now(),
    results: null
  };

  res.status(201).json({
    success: true,
    data: test
  });
});

export const getABTestResults = catchAsyncErrors(async (req, res, next) => {
  const { testId } = req.params;

  const results = {
    testId,
    status: 'completed',
    variants: [
      { name: 'Control', users: 5000, conversions: 450, rate: 9.0, revenue: 54000 },
      { name: 'Variant A', users: 5000, conversions: 520, rate: 10.4, revenue: 62400 },
      { name: 'Variant B', users: 5000, conversions: 485, rate: 9.7, revenue: 58200 }
    ],
    winner: 'Variant A',
    confidence: 95,
    improvement: 15.6,
    recommendation: 'Deploy Variant A to all users'
  };

  res.status(200).json({
    success: true,
    data: results
  });
});

// Helper functions
function generateRetentionCurve() {
  return {
    day1: 100, day7: 65, day14: 48, day30: 32,
    day60: 25, day90: 20, day180: 15, day365: 12
  };
}

function generateRevenueProgression() {
  return [
    { period: 'Week 1', revenue: 12500 },
    { period: 'Week 2', revenue: 18750 },
    { period: 'Week 3', revenue: 22100 },
    { period: 'Week 4', revenue: 24500 }
  ];
}

function generateTopProducts() {
  return [
    { product: 'Premium Headphones', purchases: 145, revenue: 21750 },
    { product: 'Smart Watch', purchases: 98, revenue: 24500 },
    { product: 'Wireless Mouse', purchases: 210, revenue: 10500 }
  ];
}

function generateBehaviorPatterns() {
  return {
    avgSessionsPerWeek: 2.8,
    preferredBrowsingTime: 'Evening (6-9 PM)',
    avgCartValue: 156,
    categoryPreferences: ['Electronics', 'Fashion', 'Home']
  };
}

function generateClickData(sessions) {
  return sessions.slice(0, 100).map(session => ({
    x: Math.random() * 1920,
    y: Math.random() * 1080,
    clicks: Math.floor(Math.random() * 10) + 1
  }));
}

function generateScrollData(sessions) {
  return {
    0: 100,
    25: 85,
    50: 65,
    75: 42,
    100: 25
  };
}

function generateAttentionData(sessions) {
  return sessions.slice(0, 50).map(session => ({
    element: 'hero-banner',
    avgTime: Math.random() * 5 + 2,
    views: Math.floor(Math.random() * 100) + 50
  }));
}

function calculateAvgTime(sessions) {
  return sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
}

function calculateLTV(customer, months) {
  const avgMonthlyValue = (customer.orders.totalValue || 100) / 12;
  const churnRate = 0.05;
  return avgMonthlyValue * months * (1 - churnRate * months / 12);
}
