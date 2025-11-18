import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

/**
 * Get product recommendations based on user's browsing history and purchases
 */
export const getPersonalizedRecommendations = async (userId, limit = 10) => {
  try {
    const user = await User.findById(userId).populate('browsingHistory.product');

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Get categories from browsing history
    const viewedCategories = user.browsingHistory
      .map(item => item.product?.category)
      .filter(Boolean);

    // Get user's previous orders
    const orders = await Order.find({ user: userId, orderStatus: 'delivered' })
      .populate('orderItems.product')
      .limit(20);

    const purchasedCategories = orders
      .flatMap(order => order.orderItems.map(item => item.product?.category))
      .filter(Boolean);

    // Combine categories and get unique ones
    const allCategories = [...new Set([...viewedCategories, ...purchasedCategories])];

    if (allCategories.length === 0) {
      // Return trending products if no history
      return getTrendingRecommendations(limit);
    }

    // Find products from these categories
    const recommendations = await Product.find({
      category: { $in: allCategories },
      isActive: true,
      stock: { $gt: 0 },
    })
      .sort({ aiRecommendationScore: -1, ratings: -1 })
      .limit(limit);

    return {
      success: true,
      recommendations,
      reason: 'based_on_history',
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Collaborative filtering - Find similar users and recommend their purchases
 */
export const getCollaborativeRecommendations = async (userId, limit = 10) => {
  try {
    // Get user's order history
    const userOrders = await Order.find({ user: userId })
      .populate('orderItems.product');

    const userProductIds = userOrders
      .flatMap(order => order.orderItems.map(item => item.product?._id))
      .filter(Boolean)
      .map(id => id.toString());

    if (userProductIds.length === 0) {
      return { success: false, error: 'No purchase history' };
    }

    // Find other users who bought similar products
    const similarUsers = await Order.aggregate([
      {
        $match: {
          user: { $ne: userId },
          'orderItems.product': { $in: userProductIds.map(id => mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $group: {
          _id: '$user',
          commonProducts: { $sum: 1 },
        },
      },
      { $sort: { commonProducts: -1 } },
      { $limit: 10 },
    ]);

    // Get products purchased by similar users but not by current user
    const similarUserIds = similarUsers.map(u => u._id);
    const theirOrders = await Order.find({
      user: { $in: similarUserIds },
    }).populate('orderItems.product');

    const recommendedProductIds = theirOrders
      .flatMap(order => order.orderItems.map(item => item.product?._id))
      .filter(id => id && !userProductIds.includes(id.toString()))
      .filter((id, index, self) => self.indexOf(id) === index) // Unique
      .slice(0, limit);

    const recommendations = await Product.find({
      _id: { $in: recommendedProductIds },
      isActive: true,
      stock: { $gt: 0 },
    });

    return {
      success: true,
      recommendations,
      reason: 'users_like_you',
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Content-based filtering - Similar products based on attributes
 */
export const getSimilarProducts = async (productId, limit = 10) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Find similar products based on category, tags, and price range
    const priceRange = product.price * 0.3; // 30% price range

    const similarProducts = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } },
        { brand: product.brand },
      ],
      price: {
        $gte: product.price - priceRange,
        $lte: product.price + priceRange,
      },
      isActive: true,
      stock: { $gt: 0 },
    })
      .sort({ ratings: -1, numOfReviews: -1 })
      .limit(limit);

    return {
      success: true,
      recommendations: similarProducts,
      reason: 'similar_products',
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get trending products based on recent activity
 */
export const getTrendingRecommendations = async (limit = 10) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingProducts = await Product.find({
      isActive: true,
      stock: { $gt: 0 },
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ trendingScore: -1, purchases: -1, views: -1 })
      .limit(limit);

    return {
      success: true,
      recommendations: trendingProducts,
      reason: 'trending',
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get frequently bought together products
 */
export const getFrequentlyBoughtTogether = async (productId, limit = 5) => {
  try {
    // Find orders containing this product
    const orders = await Order.find({
      'orderItems.product': productId,
    }).populate('orderItems.product');

    // Count product co-occurrences
    const productCounts = {};

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.product && item.product._id.toString() !== productId.toString()) {
          const pid = item.product._id.toString();
          productCounts[pid] = (productCounts[pid] || 0) + 1;
        }
      });
    });

    // Sort by frequency and get top products
    const topProductIds = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    const recommendations = await Product.find({
      _id: { $in: topProductIds },
      isActive: true,
      stock: { $gt: 0 },
    });

    return {
      success: true,
      recommendations,
      reason: 'frequently_bought_together',
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * AI Size Recommendation based on user measurements
 */
export const getAISizeRecommendation = async (userId, productId) => {
  try {
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
      return { success: false, error: 'User or product not found' };
    }

    const { bodyMeasurements } = user.styleProfile;

    if (!bodyMeasurements || !bodyMeasurements.height || !bodyMeasurements.weight) {
      return {
        success: false,
        error: 'Body measurements not available',
      };
    }

    // Simple size recommendation logic (can be enhanced with ML)
    const { height, weight } = bodyMeasurements;
    let recommendedSize = 'M'; // Default

    // Basic logic for clothing (customize based on product type)
    if (product.category && product.category.name === 'Clothing') {
      if (height < 160 && weight < 55) {
        recommendedSize = 'XS';
      } else if (height < 165 && weight < 60) {
        recommendedSize = 'S';
      } else if (height < 175 && weight < 75) {
        recommendedSize = 'M';
      } else if (height < 180 && weight < 85) {
        recommendedSize = 'L';
      } else if (height < 185 && weight < 95) {
        recommendedSize = 'XL';
      } else {
        recommendedSize = 'XXL';
      }
    }

    return {
      success: true,
      recommendedSize,
      confidence: 'medium',
      measurements: bodyMeasurements,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Predict demand for products (simple moving average)
 */
export const predictDemand = async (productId, days = 7) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Get order data for the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await Order.aggregate([
      {
        $match: {
          'orderItems.product': productId,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $unwind: '$orderItems',
      },
      {
        $match: {
          'orderItems.product': productId,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          quantity: { $sum: '$orderItems.quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    if (orders.length === 0) {
      return {
        success: true,
        predictedDemand: 0,
        confidence: 'low',
      };
    }

    // Calculate average daily demand
    const totalQuantity = orders.reduce((sum, day) => sum + day.quantity, 0);
    const avgDailyDemand = totalQuantity / orders.length;
    const predictedDemand = Math.round(avgDailyDemand * days);

    return {
      success: true,
      predictedDemand,
      avgDailyDemand: avgDailyDemand.toFixed(2),
      confidence: orders.length >= 7 ? 'high' : 'medium',
      historicalData: orders,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  getPersonalizedRecommendations,
  getCollaborativeRecommendations,
  getSimilarProducts,
  getTrendingRecommendations,
  getFrequentlyBoughtTogether,
  getAISizeRecommendation,
  predictDemand,
};
