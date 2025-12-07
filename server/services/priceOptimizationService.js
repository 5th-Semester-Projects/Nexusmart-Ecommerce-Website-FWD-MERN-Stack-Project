import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import redisCache from './redisCache.js';

/**
 * AI Price Optimization Service
 * Dynamic pricing based on demand, competition, and market conditions
 */

class PriceOptimizationService {
  constructor() {
    this.priceHistory = new Map();
    this.competitorPrices = new Map();
  }

  /**
   * Calculate optimal price for a product
   */
  async calculateOptimalPrice(productId) {
    const product = await Product.findById(productId).lean();

    if (!product) {
      throw new Error('Product not found');
    }

    // Get various pricing factors
    const [
      demandScore,
      competitorData,
      inventoryFactor,
      seasonalFactor,
      historicalData
    ] = await Promise.all([
      this.calculateDemandScore(productId),
      this.getCompetitorPricing(product),
      this.getInventoryFactor(product),
      this.getSeasonalFactor(product.category),
      this.getHistoricalPriceData(productId)
    ]);

    // Base price
    let basePrice = product.price;
    const costPrice = product.costPrice || basePrice * 0.6;
    const minMargin = 0.1; // 10% minimum margin
    const maxMargin = 0.5; // 50% maximum margin

    // Calculate suggested price adjustments
    let priceMultiplier = 1;

    // Demand factor (high demand = can increase price)
    if (demandScore > 80) {
      priceMultiplier += 0.15;
    } else if (demandScore > 60) {
      priceMultiplier += 0.08;
    } else if (demandScore < 30) {
      priceMultiplier -= 0.1;
    }

    // Inventory factor (low stock = increase price, high stock = decrease)
    priceMultiplier += inventoryFactor;

    // Seasonal factor
    priceMultiplier += seasonalFactor;

    // Competitor pricing
    if (competitorData.averagePrice) {
      const competitorDiff = (competitorData.averagePrice - basePrice) / basePrice;
      // Stay competitive but don't race to bottom
      priceMultiplier += Math.max(-0.1, Math.min(0.1, competitorDiff * 0.5));
    }

    // Calculate suggested price
    let suggestedPrice = basePrice * priceMultiplier;

    // Ensure minimum margin
    const minPrice = costPrice * (1 + minMargin);
    const maxPrice = costPrice * (1 + maxMargin);
    suggestedPrice = Math.max(minPrice, Math.min(maxPrice, suggestedPrice));

    // Round to appropriate decimal places
    suggestedPrice = this.roundPrice(suggestedPrice);

    // Calculate confidence score
    const confidenceScore = this.calculateConfidence({
      demandScore,
      competitorData,
      historicalData
    });

    return {
      currentPrice: basePrice,
      suggestedPrice,
      priceChange: suggestedPrice - basePrice,
      priceChangePercent: ((suggestedPrice - basePrice) / basePrice * 100).toFixed(2),
      factors: {
        demandScore,
        inventoryFactor: inventoryFactor.toFixed(3),
        seasonalFactor: seasonalFactor.toFixed(3),
        competitorAvgPrice: competitorData.averagePrice,
        priceMultiplier: priceMultiplier.toFixed(3)
      },
      confidenceScore,
      recommendation: this.getRecommendation(suggestedPrice, basePrice),
      estimatedImpact: await this.estimateImpact(product, suggestedPrice)
    };
  }

  /**
   * Calculate demand score based on sales velocity, views, and cart additions
   */
  async calculateDemandScore(productId) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Get recent orders
    const recentOrders = await Order.countDocuments({
      'items.product': productId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get product views and cart additions from cache/analytics
    const cacheKey = `product:analytics:${productId}`;
    let analytics = await redisCache.get(cacheKey);

    if (!analytics) {
      analytics = { views: 0, cartAdditions: 0 };
    }

    // Calculate score (0-100)
    const salesWeight = 40;
    const viewsWeight = 30;
    const cartWeight = 30;

    // Normalize metrics (assuming benchmarks)
    const salesScore = Math.min(recentOrders / 50, 1) * salesWeight;
    const viewsScore = Math.min(analytics.views / 1000, 1) * viewsWeight;
    const cartScore = Math.min(analytics.cartAdditions / 100, 1) * cartWeight;

    return Math.round(salesScore + viewsScore + cartScore);
  }

  /**
   * Get competitor pricing data
   */
  async getCompetitorPricing(product) {
    // In a real implementation, this would fetch from competitor price APIs
    // For now, simulate with cached/stored data

    const cacheKey = `competitor:price:${product._id}`;
    let cached = await redisCache.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Simulated competitor data
    const competitors = [
      { name: 'Competitor A', price: product.price * (0.9 + Math.random() * 0.2) },
      { name: 'Competitor B', price: product.price * (0.85 + Math.random() * 0.3) },
      { name: 'Competitor C', price: product.price * (0.95 + Math.random() * 0.15) }
    ];

    const averagePrice = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length;
    const lowestPrice = Math.min(...competitors.map(c => c.price));
    const highestPrice = Math.max(...competitors.map(c => c.price));

    const data = {
      competitors,
      averagePrice: Math.round(averagePrice * 100) / 100,
      lowestPrice: Math.round(lowestPrice * 100) / 100,
      highestPrice: Math.round(highestPrice * 100) / 100,
      lastUpdated: new Date()
    };

    await redisCache.set(cacheKey, JSON.stringify(data), 3600); // Cache 1 hour

    return data;
  }

  /**
   * Get inventory-based pricing factor
   */
  getInventoryFactor(product) {
    const stock = product.stock || 0;
    const reorderLevel = product.reorderLevel || 10;

    if (stock <= 0) {
      return 0; // Out of stock, no pricing needed
    }

    if (stock <= reorderLevel * 0.5) {
      // Very low stock - can increase price
      return 0.1;
    } else if (stock <= reorderLevel) {
      // Low stock
      return 0.05;
    } else if (stock > reorderLevel * 5) {
      // High stock - should decrease price to move inventory
      return -0.1;
    } else if (stock > reorderLevel * 3) {
      // Moderate high stock
      return -0.05;
    }

    return 0;
  }

  /**
   * Get seasonal pricing factor
   */
  getSeasonalFactor(category) {
    const now = new Date();
    const month = now.getMonth();
    const dayOfWeek = now.getDay();

    let seasonalFactor = 0;

    // Holiday season (November-December)
    if (month === 10 || month === 11) {
      seasonalFactor += 0.1;
    }

    // Post-holiday (January)
    if (month === 0) {
      seasonalFactor -= 0.15;
    }

    // Weekend pricing
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      seasonalFactor += 0.02;
    }

    // Category-specific seasonal factors
    const categorySeasons = {
      'Electronics': { peak: [10, 11], low: [0, 1] },
      'Fashion': { peak: [2, 3, 8, 9], low: [5, 6] },
      'Sports': { peak: [3, 4, 5], low: [11, 0, 1] },
      'Home': { peak: [4, 5], low: [11, 0] }
    };

    const categorySeason = categorySeasons[category];
    if (categorySeason) {
      if (categorySeason.peak.includes(month)) {
        seasonalFactor += 0.08;
      } else if (categorySeason.low.includes(month)) {
        seasonalFactor -= 0.08;
      }
    }

    return seasonalFactor;
  }

  /**
   * Get historical price data
   */
  async getHistoricalPriceData(productId) {
    const cacheKey = `price:history:${productId}`;
    let history = await redisCache.get(cacheKey);

    if (history) {
      return JSON.parse(history);
    }

    // Return empty history for new products
    return {
      changes: [],
      averagePrice: null,
      priceVolatility: 0
    };
  }

  /**
   * Calculate confidence score for pricing recommendation
   */
  calculateConfidence({ demandScore, competitorData, historicalData }) {
    let confidence = 50; // Base confidence

    // More demand data = higher confidence
    if (demandScore > 0) confidence += 15;

    // Competitor data available
    if (competitorData.competitors && competitorData.competitors.length > 0) {
      confidence += 10 * Math.min(competitorData.competitors.length, 3);
    }

    // Historical data available
    if (historicalData.changes && historicalData.changes.length > 5) {
      confidence += 15;
    }

    return Math.min(confidence, 95);
  }

  /**
   * Get recommendation text
   */
  getRecommendation(suggestedPrice, currentPrice) {
    const diff = ((suggestedPrice - currentPrice) / currentPrice * 100);

    if (diff > 10) {
      return 'STRONG_INCREASE';
    } else if (diff > 5) {
      return 'MODERATE_INCREASE';
    } else if (diff > 0) {
      return 'SLIGHT_INCREASE';
    } else if (diff > -5) {
      return 'SLIGHT_DECREASE';
    } else if (diff > -10) {
      return 'MODERATE_DECREASE';
    } else {
      return 'STRONG_DECREASE';
    }
  }

  /**
   * Estimate impact of price change
   */
  async estimateImpact(product, newPrice) {
    const currentPrice = product.price;
    const priceDiff = (newPrice - currentPrice) / currentPrice;

    // Price elasticity estimation (-1.5 is typical for most consumer goods)
    const elasticity = -1.5;

    // Estimate demand change
    const demandChange = priceDiff * elasticity;

    // Assume base monthly revenue
    const baseRevenue = currentPrice * (product.soldCount || 100);
    const newRevenue = newPrice * (product.soldCount || 100) * (1 + demandChange);

    return {
      estimatedDemandChange: `${(demandChange * 100).toFixed(1)}%`,
      currentMonthlyRevenue: Math.round(baseRevenue),
      projectedMonthlyRevenue: Math.round(newRevenue),
      revenueImpact: `${((newRevenue - baseRevenue) / baseRevenue * 100).toFixed(1)}%`
    };
  }

  /**
   * Round price to psychological price point
   */
  roundPrice(price) {
    // Round to .99 or .95 for psychological pricing
    if (price < 10) {
      return Math.floor(price) + 0.99;
    } else if (price < 100) {
      return Math.round(price / 5) * 5 - 0.01;
    } else {
      return Math.round(price / 10) * 10 - 1;
    }
  }

  /**
   * Bulk price optimization for multiple products
   */
  async optimizePrices(productIds) {
    const results = await Promise.all(
      productIds.map(id => this.calculateOptimalPrice(id).catch(err => ({
        productId: id,
        error: err.message
      })))
    );

    return results;
  }

  /**
   * Apply price change to product
   */
  async applyPriceChange(productId, newPrice, reason) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const oldPrice = product.price;

    // Update price
    product.price = newPrice;
    product.priceHistory = product.priceHistory || [];
    product.priceHistory.push({
      price: oldPrice,
      changedAt: new Date(),
      reason
    });

    await product.save();

    // Update cache
    const cacheKey = `price:history:${productId}`;
    let history = await redisCache.get(cacheKey);
    history = history ? JSON.parse(history) : { changes: [] };
    history.changes.push({
      oldPrice,
      newPrice,
      changedAt: new Date(),
      reason
    });
    await redisCache.set(cacheKey, JSON.stringify(history), 86400 * 30);

    return {
      productId,
      oldPrice,
      newPrice,
      applied: true
    };
  }
}

export default new PriceOptimizationService();
