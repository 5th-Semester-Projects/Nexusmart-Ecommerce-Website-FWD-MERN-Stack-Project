import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import redisCache from './redisCache.js';

/**
 * Predictive Inventory Management Service
 * AI-powered demand forecasting and inventory optimization
 */

class PredictiveInventoryService {
  constructor() {
    this.forecastCache = new Map();
  }

  /**
   * Forecast demand for a product
   */
  async forecastDemand(productId, daysAhead = 30) {
    const product = await Product.findById(productId).lean();

    if (!product) {
      throw new Error('Product not found');
    }

    // Get historical sales data
    const historicalData = await this.getHistoricalSales(productId);

    // Get seasonal factors
    const seasonalFactors = this.calculateSeasonalFactors(historicalData);

    // Get trend
    const trend = this.calculateTrend(historicalData);

    // Generate forecast
    const forecast = this.generateForecast(historicalData, trend, seasonalFactors, daysAhead);

    // Calculate safety stock
    const safetyStock = this.calculateSafetyStock(historicalData, product.leadTime || 7);

    // Calculate reorder point
    const reorderPoint = this.calculateReorderPoint(forecast, product.leadTime || 7, safetyStock);

    // Generate recommendations
    const recommendations = this.generateRecommendations(product, forecast, safetyStock, reorderPoint);

    return {
      productId,
      productName: product.name,
      currentStock: product.stock,
      forecast: {
        dailyPredictions: forecast,
        totalPredicted: forecast.reduce((sum, f) => sum + f.quantity, 0),
        confidence: this.calculateForecastConfidence(historicalData)
      },
      trend: {
        direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
        percentage: (trend * 100).toFixed(2)
      },
      inventory: {
        safetyStock,
        reorderPoint,
        daysOfStock: this.calculateDaysOfStock(product.stock, forecast),
        optimalOrderQuantity: this.calculateEOQ(product, forecast)
      },
      recommendations,
      lastUpdated: new Date()
    };
  }

  /**
   * Get historical sales data
   */
  async getHistoricalSales(productId, days = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.aggregate([
      {
        $match: {
          'items.product': productId,
          createdAt: { $gte: startDate },
          orderStatus: { $in: ['delivered', 'shipped', 'processing'] }
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.product': productId
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with 0
    const salesByDate = new Map(orders.map(o => [o._id, o]));
    const result = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      result.push({
        date: dateStr,
        quantity: salesByDate.get(dateStr)?.quantity || 0,
        revenue: salesByDate.get(dateStr)?.revenue || 0,
        dayOfWeek: date.getDay()
      });
    }

    return result;
  }

  /**
   * Calculate seasonal factors
   */
  calculateSeasonalFactors(historicalData) {
    // Calculate day of week factors
    const dayFactors = Array(7).fill(0);
    const dayCounts = Array(7).fill(0);

    historicalData.forEach(d => {
      dayFactors[d.dayOfWeek] += d.quantity;
      dayCounts[d.dayOfWeek]++;
    });

    const avgDaily = historicalData.reduce((sum, d) => sum + d.quantity, 0) / historicalData.length;

    const factors = dayFactors.map((total, i) => {
      if (dayCounts[i] === 0) return 1;
      const avg = total / dayCounts[i];
      return avgDaily > 0 ? avg / avgDaily : 1;
    });

    // Monthly factors (simplified)
    const monthlyFactors = {
      0: 0.9,   // January - post-holiday slump
      1: 0.95,
      2: 1.0,
      3: 1.05,
      4: 1.1,   // Spring
      5: 1.0,
      6: 0.95,
      7: 0.9,   // Summer slump
      8: 1.05,
      9: 1.1,   // Fall
      10: 1.2,  // Holiday season
      11: 1.3   // Peak season
    };

    return {
      dayOfWeek: factors,
      monthly: monthlyFactors
    };
  }

  /**
   * Calculate trend (linear regression slope)
   */
  calculateTrend(historicalData) {
    const n = historicalData.length;
    if (n < 7) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    historicalData.forEach((d, i) => {
      sumX += i;
      sumY += d.quantity;
      sumXY += i * d.quantity;
      sumXX += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;

    return avgY > 0 ? slope / avgY : 0;
  }

  /**
   * Generate forecast
   */
  generateForecast(historicalData, trend, seasonalFactors, daysAhead) {
    const avgDailySales = historicalData.reduce((sum, d) => sum + d.quantity, 0) / historicalData.length;
    const forecast = [];
    const today = new Date();

    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const dayOfWeek = date.getDay();
      const month = date.getMonth();

      // Base prediction with trend
      let predicted = avgDailySales * (1 + trend * i);

      // Apply seasonal factors
      predicted *= seasonalFactors.dayOfWeek[dayOfWeek];
      predicted *= seasonalFactors.monthly[month];

      // Add some randomness for realistic variance
      const variance = predicted * 0.1; // 10% variance

      forecast.push({
        date: date.toISOString().split('T')[0],
        quantity: Math.max(0, Math.round(predicted)),
        low: Math.max(0, Math.round(predicted - variance)),
        high: Math.round(predicted + variance)
      });
    }

    return forecast;
  }

  /**
   * Calculate safety stock
   */
  calculateSafetyStock(historicalData, leadTime) {
    // Calculate standard deviation of daily sales
    const quantities = historicalData.map(d => d.quantity);
    const avg = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;
    const variance = quantities.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / quantities.length;
    const stdDev = Math.sqrt(variance);

    // Safety stock = Z-score * stdDev * sqrt(leadTime)
    // Using Z = 1.65 for 95% service level
    const zScore = 1.65;
    const safetyStock = Math.ceil(zScore * stdDev * Math.sqrt(leadTime));

    return safetyStock;
  }

  /**
   * Calculate reorder point
   */
  calculateReorderPoint(forecast, leadTime, safetyStock) {
    // Sum of forecasted demand during lead time
    const demandDuringLeadTime = forecast
      .slice(0, leadTime)
      .reduce((sum, f) => sum + f.quantity, 0);

    return demandDuringLeadTime + safetyStock;
  }

  /**
   * Calculate days of stock remaining
   */
  calculateDaysOfStock(currentStock, forecast) {
    let remaining = currentStock;
    let days = 0;

    for (const day of forecast) {
      remaining -= day.quantity;
      if (remaining <= 0) break;
      days++;
    }

    return days;
  }

  /**
   * Calculate Economic Order Quantity (EOQ)
   */
  calculateEOQ(product, forecast) {
    const annualDemand = forecast.reduce((sum, f) => sum + f.quantity, 0) * (365 / forecast.length);
    const orderCost = product.orderCost || 50; // Default order cost
    const holdingCostRate = 0.25; // 25% of product cost per year
    const holdingCost = (product.costPrice || product.price * 0.6) * holdingCostRate;

    // EOQ formula: sqrt((2 * D * S) / H)
    const eoq = Math.sqrt((2 * annualDemand * orderCost) / holdingCost);

    return Math.ceil(eoq);
  }

  /**
   * Calculate forecast confidence
   */
  calculateForecastConfidence(historicalData) {
    // More data = higher confidence
    let confidence = Math.min(historicalData.length / 90, 1) * 40;

    // Consistent sales = higher confidence
    const quantities = historicalData.map(d => d.quantity);
    const avg = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;
    const cv = quantities.length > 0 ?
      Math.sqrt(quantities.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / quantities.length) / avg : 0;

    // Lower coefficient of variation = higher confidence
    confidence += (1 - Math.min(cv, 1)) * 30;

    // Recent sales activity
    const recentSales = historicalData.slice(-7).reduce((sum, d) => sum + d.quantity, 0);
    if (recentSales > 0) confidence += 15;

    // Non-zero sales days
    const nonZeroDays = historicalData.filter(d => d.quantity > 0).length;
    confidence += (nonZeroDays / historicalData.length) * 15;

    return Math.round(Math.min(confidence, 95));
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(product, forecast, safetyStock, reorderPoint) {
    const recommendations = [];
    const currentStock = product.stock;
    const totalForecast = forecast.reduce((sum, f) => sum + f.quantity, 0);

    // Stock level recommendations
    if (currentStock <= safetyStock) {
      recommendations.push({
        priority: 'critical',
        type: 'reorder',
        message: 'Stock is at or below safety level. Immediate reorder required.',
        action: `Order ${reorderPoint * 2} units immediately`
      });
    } else if (currentStock <= reorderPoint) {
      recommendations.push({
        priority: 'high',
        type: 'reorder',
        message: 'Stock has reached reorder point.',
        action: `Order ${reorderPoint} units`
      });
    }

    // Overstock warning
    const daysOfStock = this.calculateDaysOfStock(currentStock, forecast);
    if (daysOfStock > 90) {
      recommendations.push({
        priority: 'medium',
        type: 'overstock',
        message: `Current stock will last ${daysOfStock} days. Consider reducing orders or running promotions.`,
        action: 'Consider discount or promotional pricing'
      });
    }

    // Demand trend
    const trend = this.calculateTrend(forecast);
    if (trend > 0.05) {
      recommendations.push({
        priority: 'info',
        type: 'trend',
        message: 'Demand is trending upward. Consider increasing order quantities.',
        action: 'Increase safety stock by 20%'
      });
    } else if (trend < -0.05) {
      recommendations.push({
        priority: 'info',
        type: 'trend',
        message: 'Demand is trending downward. Consider reducing order quantities.',
        action: 'Reduce next order by 20%'
      });
    }

    // Seasonal recommendation
    const now = new Date();
    const month = now.getMonth();
    if ([10, 11].includes(month)) {
      recommendations.push({
        priority: 'medium',
        type: 'seasonal',
        message: 'Holiday season approaching. Ensure adequate stock.',
        action: 'Increase stock levels by 30%'
      });
    }

    return recommendations;
  }

  /**
   * Bulk forecast for multiple products
   */
  async bulkForecast(productIds, daysAhead = 30) {
    const results = await Promise.all(
      productIds.map(id =>
        this.forecastDemand(id, daysAhead).catch(err => ({
          productId: id,
          error: err.message
        }))
      )
    );

    return results;
  }

  /**
   * Get products needing reorder
   */
  async getProductsNeedingReorder() {
    const products = await Product.find({
      status: 'active',
      stock: { $gt: 0 }
    }).lean();

    const needsReorder = [];

    for (const product of products) {
      try {
        const forecast = await this.forecastDemand(product._id, 14);

        if (product.stock <= forecast.inventory.reorderPoint) {
          needsReorder.push({
            product: {
              id: product._id,
              name: product.name,
              sku: product.sku
            },
            currentStock: product.stock,
            reorderPoint: forecast.inventory.reorderPoint,
            safetyStock: forecast.inventory.safetyStock,
            recommendedOrder: forecast.inventory.optimalOrderQuantity,
            urgency: product.stock <= forecast.inventory.safetyStock ? 'critical' : 'normal'
          });
        }
      } catch (error) {
        console.error(`Forecast error for ${product._id}:`, error);
      }
    }

    return needsReorder.sort((a, b) =>
      a.urgency === 'critical' ? -1 : b.urgency === 'critical' ? 1 : 0
    );
  }
}

export default new PredictiveInventoryService();
