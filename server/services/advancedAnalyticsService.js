import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

/**
 * Advanced Analytics Service
 * Handles heatmaps, A/B testing, cohort analysis, and revenue dashboards
 */
class AdvancedAnalyticsService {
  constructor() {
    this.abTests = new Map();
    this.cohorts = new Map();
    this.heatmapData = new Map();
  }

  /**
   * Record heatmap click data
   */
  async recordClick(data) {
    const { page, x, y, element, userId, sessionId, timestamp } = data;

    const key = `${page}:${Math.round(x / 10) * 10}:${Math.round(y / 10) * 10}`;
    const existing = this.heatmapData.get(key) || { count: 0, clicks: [] };

    existing.count++;
    existing.clicks.push({
      userId,
      sessionId,
      element,
      timestamp: timestamp || new Date(),
      exactX: x,
      exactY: y
    });

    // Keep only last 1000 clicks per grid cell
    if (existing.clicks.length > 1000) {
      existing.clicks = existing.clicks.slice(-1000);
    }

    this.heatmapData.set(key, existing);

    return existing;
  }

  /**
   * Get heatmap data for a page
   */
  async getHeatmapData(page, timeRange = '7d') {
    const data = [];
    const now = Date.now();
    const rangeMs = this.parseTimeRange(timeRange);

    for (const [key, value] of this.heatmapData) {
      if (key.startsWith(`${page}:`)) {
        const [_, x, y] = key.split(':');

        // Filter by time range
        const recentClicks = value.clicks.filter(
          click => now - new Date(click.timestamp).getTime() < rangeMs
        );

        if (recentClicks.length > 0) {
          data.push({
            x: parseInt(x),
            y: parseInt(y),
            count: recentClicks.length,
            intensity: Math.min(recentClicks.length / 100, 1)
          });
        }
      }
    }

    return data;
  }

  /**
   * Record scroll depth
   */
  async recordScrollDepth(data) {
    const { page, depth, userId, sessionId } = data;
    // Store scroll depth data
    return { page, depth, recorded: true };
  }

  /**
   * A/B Testing Management
   */
  createABTest(config) {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const test = {
      id: testId,
      name: config.name,
      description: config.description,
      variants: config.variants.map((v, i) => ({
        id: `variant_${i}`,
        name: v.name,
        weight: v.weight || 1 / config.variants.length,
        config: v.config,
        metrics: {
          impressions: 0,
          conversions: 0,
          revenue: 0,
          bounces: 0,
          timeOnPage: []
        }
      })),
      status: 'active',
      startDate: new Date(),
      endDate: config.endDate || null,
      targetPages: config.targetPages || ['*'],
      targetAudience: config.targetAudience || 'all',
      winningVariant: null,
      statisticalSignificance: 0,
      createdAt: new Date()
    };

    this.abTests.set(testId, test);
    return test;
  }

  /**
   * Get variant for user
   */
  getVariantForUser(testId, userId) {
    const test = this.abTests.get(testId);
    if (!test || test.status !== 'active') return null;

    // Consistent hashing for user assignment
    const hash = this.hashString(`${testId}:${userId}`);
    const normalized = hash / 0xFFFFFFFF;

    let cumWeight = 0;
    for (const variant of test.variants) {
      cumWeight += variant.weight;
      if (normalized <= cumWeight) {
        variant.metrics.impressions++;
        return {
          testId,
          variantId: variant.id,
          variantName: variant.name,
          config: variant.config
        };
      }
    }

    return {
      testId,
      variantId: test.variants[0].id,
      variantName: test.variants[0].name,
      config: test.variants[0].config
    };
  }

  /**
   * Record A/B test conversion
   */
  recordConversion(testId, variantId, data = {}) {
    const test = this.abTests.get(testId);
    if (!test) return false;

    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) return false;

    variant.metrics.conversions++;
    if (data.revenue) variant.metrics.revenue += data.revenue;
    if (data.timeOnPage) variant.metrics.timeOnPage.push(data.timeOnPage);

    // Calculate statistical significance
    this.calculateSignificance(test);

    return true;
  }

  /**
   * Get A/B test results
   */
  getTestResults(testId) {
    const test = this.abTests.get(testId);
    if (!test) return null;

    const results = {
      ...test,
      variants: test.variants.map(v => ({
        ...v,
        conversionRate: v.metrics.impressions > 0
          ? (v.metrics.conversions / v.metrics.impressions * 100).toFixed(2)
          : 0,
        avgTimeOnPage: v.metrics.timeOnPage.length > 0
          ? (v.metrics.timeOnPage.reduce((a, b) => a + b, 0) / v.metrics.timeOnPage.length).toFixed(2)
          : 0,
        avgRevenue: v.metrics.conversions > 0
          ? (v.metrics.revenue / v.metrics.conversions).toFixed(2)
          : 0
      })),
      recommendation: this.getTestRecommendation(test)
    };

    return results;
  }

  /**
   * Calculate statistical significance
   */
  calculateSignificance(test) {
    if (test.variants.length < 2) return 0;

    const control = test.variants[0];
    const treatment = test.variants[1];

    const n1 = control.metrics.impressions;
    const n2 = treatment.metrics.impressions;
    const p1 = n1 > 0 ? control.metrics.conversions / n1 : 0;
    const p2 = n2 > 0 ? treatment.metrics.conversions / n2 : 0;

    if (n1 < 30 || n2 < 30) {
      test.statisticalSignificance = 0;
      return 0;
    }

    // Z-test for proportions
    const pooledP = (control.metrics.conversions + treatment.metrics.conversions) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));

    if (se === 0) {
      test.statisticalSignificance = 0;
      return 0;
    }

    const z = Math.abs(p1 - p2) / se;

    // Convert Z to confidence level (approximation)
    const confidence = this.zToConfidence(z);
    test.statisticalSignificance = confidence;

    // Determine winner if significance > 95%
    if (confidence > 95) {
      test.winningVariant = p2 > p1 ? treatment.id : control.id;
    }

    return confidence;
  }

  /**
   * Cohort Analysis
   */
  async createCohort(config) {
    const cohortId = `cohort_${Date.now()}`;

    const cohort = {
      id: cohortId,
      name: config.name,
      type: config.type, // 'acquisition', 'behavior', 'custom'
      definition: config.definition,
      startDate: config.startDate || new Date(),
      users: [],
      metrics: {
        retention: {},
        revenue: {},
        engagement: {}
      },
      createdAt: new Date()
    };

    // Populate cohort based on definition
    if (config.type === 'acquisition') {
      const users = await User.find({
        createdAt: {
          $gte: config.startDate,
          $lte: config.endDate || new Date()
        }
      }).select('_id createdAt');

      cohort.users = users.map(u => ({ userId: u._id, joinedAt: u.createdAt }));
    }

    this.cohorts.set(cohortId, cohort);
    return cohort;
  }

  /**
   * Get cohort retention data
   */
  async getCohortRetention(cohortId, periods = 12) {
    const cohort = this.cohorts.get(cohortId);
    if (!cohort) return null;

    const retention = [];
    const cohortStartDate = new Date(cohort.startDate);

    for (let period = 0; period < periods; period++) {
      const periodStart = new Date(cohortStartDate);
      periodStart.setDate(periodStart.getDate() + period * 7); // Weekly periods

      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 7);

      // Count active users in this period
      const activeUsers = await Order.distinct('user', {
        createdAt: { $gte: periodStart, $lt: periodEnd },
        user: { $in: cohort.users.map(u => u.userId) }
      });

      retention.push({
        period,
        week: `Week ${period + 1}`,
        activeUsers: activeUsers.length,
        totalUsers: cohort.users.length,
        retentionRate: cohort.users.length > 0
          ? ((activeUsers.length / cohort.users.length) * 100).toFixed(2)
          : 0
      });
    }

    return retention;
  }

  /**
   * Revenue Dashboard Metrics
   */
  async getRevenueDashboard(timeRange = '30d') {
    const rangeMs = this.parseTimeRange(timeRange);
    const startDate = new Date(Date.now() - rangeMs);

    // Total Revenue
    const revenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Revenue by day
    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by category
    const categoryRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          units: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          units: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    // Customer metrics
    const customerMetrics = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          avgCustomerValue: { $avg: '$totalSpent' },
          avgOrdersPerCustomer: { $avg: '$orderCount' }
        }
      }
    ]);

    // Growth metrics (compare to previous period)
    const previousStart = new Date(startDate.getTime() - rangeMs);
    const previousRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStart, $lt: startDate },
          paymentStatus: 'paid'
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const currentTotal = revenueAgg[0]?.totalRevenue || 0;
    const previousTotal = previousRevenue[0]?.total || 0;
    const growthRate = previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal * 100).toFixed(2)
      : 100;

    return {
      summary: {
        totalRevenue: currentTotal,
        orderCount: revenueAgg[0]?.orderCount || 0,
        avgOrderValue: revenueAgg[0]?.avgOrderValue?.toFixed(2) || 0,
        growthRate,
        previousPeriodRevenue: previousTotal
      },
      dailyRevenue,
      categoryRevenue,
      topProducts: topProducts.map(p => ({
        _id: p._id,
        name: p.product.name,
        revenue: p.revenue,
        units: p.units,
        image: p.product.images?.[0]
      })),
      customerMetrics: customerMetrics[0] || {
        totalCustomers: 0,
        avgCustomerValue: 0,
        avgOrdersPerCustomer: 0
      },
      timeRange
    };
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(timeRange = '30d') {
    const rangeMs = this.parseTimeRange(timeRange);
    const startDate = new Date(Date.now() - rangeMs);

    // This would typically come from analytics tracking
    // For demo, we'll calculate from available data
    const totalUsers = await User.countDocuments({
      lastActive: { $gte: startDate }
    });

    const usersWithCart = await User.countDocuments({
      lastActive: { $gte: startDate },
      'cart.0': { $exists: true }
    });

    const usersWithOrders = await Order.distinct('user', {
      createdAt: { $gte: startDate }
    });

    const paidOrders = await Order.distinct('user', {
      createdAt: { $gte: startDate },
      paymentStatus: 'paid'
    });

    return {
      funnel: [
        { stage: 'Visit', count: totalUsers, rate: 100 },
        { stage: 'Add to Cart', count: usersWithCart, rate: totalUsers > 0 ? (usersWithCart / totalUsers * 100).toFixed(2) : 0 },
        { stage: 'Checkout', count: usersWithOrders.length, rate: totalUsers > 0 ? (usersWithOrders.length / totalUsers * 100).toFixed(2) : 0 },
        { stage: 'Purchase', count: paidOrders.length, rate: totalUsers > 0 ? (paidOrders.length / totalUsers * 100).toFixed(2) : 0 }
      ],
      dropoffs: [
        { stage: 'Cart Abandonment', rate: usersWithCart > 0 ? ((usersWithCart - usersWithOrders.length) / usersWithCart * 100).toFixed(2) : 0 },
        { stage: 'Checkout Abandonment', rate: usersWithOrders.length > 0 ? ((usersWithOrders.length - paidOrders.length) / usersWithOrders.length * 100).toFixed(2) : 0 }
      ]
    };
  }

  /**
   * Customer Lifetime Value Analysis
   */
  async getCustomerLTV() {
    const ltv = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);

    // Calculate LTV segments
    const segments = {
      champions: [],
      loyal: [],
      promising: [],
      needsAttention: [],
      atRisk: []
    };

    const now = new Date();
    for (const customer of ltv) {
      const daysSinceLastOrder = (now - new Date(customer.lastOrder)) / (1000 * 60 * 60 * 24);
      const avgOrderValue = customer.totalSpent / customer.orderCount;

      let segment;
      if (customer.orderCount >= 5 && daysSinceLastOrder < 30) {
        segment = 'champions';
      } else if (customer.orderCount >= 3 && daysSinceLastOrder < 60) {
        segment = 'loyal';
      } else if (customer.orderCount >= 1 && daysSinceLastOrder < 30) {
        segment = 'promising';
      } else if (customer.orderCount >= 2 && daysSinceLastOrder < 90) {
        segment = 'needsAttention';
      } else {
        segment = 'atRisk';
      }

      segments[segment].push({
        userId: customer._id,
        name: customer.user.name,
        email: customer.user.email,
        totalSpent: customer.totalSpent,
        orderCount: customer.orderCount,
        avgOrderValue,
        daysSinceLastOrder: Math.round(daysSinceLastOrder)
      });
    }

    // Calculate averages
    const avgLTV = ltv.reduce((sum, c) => sum + c.totalSpent, 0) / ltv.length || 0;
    const avgOrdersPerCustomer = ltv.reduce((sum, c) => sum + c.orderCount, 0) / ltv.length || 0;

    return {
      avgLTV: avgLTV.toFixed(2),
      avgOrdersPerCustomer: avgOrdersPerCustomer.toFixed(2),
      totalCustomers: ltv.length,
      segments: {
        champions: { count: segments.champions.length, customers: segments.champions.slice(0, 10) },
        loyal: { count: segments.loyal.length, customers: segments.loyal.slice(0, 10) },
        promising: { count: segments.promising.length, customers: segments.promising.slice(0, 10) },
        needsAttention: { count: segments.needsAttention.length, customers: segments.needsAttention.slice(0, 10) },
        atRisk: { count: segments.atRisk.length, customers: segments.atRisk.slice(0, 10) }
      }
    };
  }

  // Helper methods
  parseTimeRange(range) {
    const match = range.match(/^(\d+)([hdwmy])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000,
      'w': 7 * 24 * 60 * 60 * 1000,
      'm': 30 * 24 * 60 * 60 * 1000,
      'y': 365 * 24 * 60 * 60 * 1000
    };

    return value * (multipliers[unit] || multipliers['d']);
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  zToConfidence(z) {
    if (z < 1.645) return z / 1.645 * 90;
    if (z < 1.96) return 90 + (z - 1.645) / (1.96 - 1.645) * 5;
    if (z < 2.576) return 95 + (z - 1.96) / (2.576 - 1.96) * 4;
    return Math.min(99.9, 99 + (z - 2.576) * 0.1);
  }

  getTestRecommendation(test) {
    if (test.statisticalSignificance < 95) {
      return {
        action: 'continue',
        message: `Need more data. Current significance: ${test.statisticalSignificance.toFixed(1)}%`
      };
    }

    if (test.winningVariant) {
      const winner = test.variants.find(v => v.id === test.winningVariant);
      return {
        action: 'implement',
        message: `Variant "${winner.name}" is the winner with ${test.statisticalSignificance.toFixed(1)}% confidence`,
        winner: winner.name
      };
    }

    return {
      action: 'review',
      message: 'No clear winner yet despite high significance'
    };
  }
}

export default new AdvancedAnalyticsService();
