import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { PriceHistory } from '../models/AIFeatures.js';
import { LoyaltyTransaction } from '../models/Gamification.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import { ErrorHandler } from '../utils/errorHandler.js';

// ==================== USER DASHBOARD ANALYTICS ====================

// @desc    Get user dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
export const getUserDashboardAnalytics = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;

  // Get orders summary
  const orders = await Order.find({ user: userId });
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Get monthly spending for last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlySpending = await Order.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        total: { $sum: '$totalPrice' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Get order status distribution
  const statusDistribution = await Order.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Get loyalty points info
  const user = await User.findById(userId);
  const recentTransactions = await LoyaltyTransaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5);

  // Calculate savings
  const totalSavings = orders.reduce((sum, order) => sum + (order.discount || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalOrders,
        totalSpent: Math.round(totalSpent * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalSavings: Math.round(totalSavings * 100) / 100,
        loyaltyPoints: user.loyaltyPoints,
        membershipTier: user.membershipTier,
      },
      monthlySpending,
      statusDistribution,
      recentTransactions,
    },
  });
});

// @desc    Get detailed spending analytics
// @route   GET /api/analytics/spending
// @access  Private
export const getSpendingAnalytics = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;
  const { period = '12m' } = req.query;

  let startDate = new Date();
  if (period === '3m') startDate.setMonth(startDate.getMonth() - 3);
  else if (period === '6m') startDate.setMonth(startDate.getMonth() - 6);
  else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
  else startDate.setMonth(startDate.getMonth() - 12);

  // Daily spending trend
  const dailySpending = await Order.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        total: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  // Spending by payment method
  const byPaymentMethod = await Order.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$paymentMethod',
        total: { $sum: '$totalPrice' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Comparison with previous period
  const prevStartDate = new Date(startDate);
  prevStartDate.setMonth(prevStartDate.getMonth() - (period === '1y' ? 12 : parseInt(period)));

  const previousPeriodTotal = await Order.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: prevStartDate, $lt: startDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
      },
    },
  ]);

  const currentPeriodTotal = await Order.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
      },
    },
  ]);

  const prevTotal = previousPeriodTotal[0]?.total || 0;
  const currTotal = currentPeriodTotal[0]?.total || 0;
  const percentChange = prevTotal > 0 ? ((currTotal - prevTotal) / prevTotal) * 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      dailySpending,
      byPaymentMethod,
      comparison: {
        currentPeriod: currTotal,
        previousPeriod: prevTotal,
        percentChange: Math.round(percentChange * 100) / 100,
        trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      },
    },
  });
});

// @desc    Get category breakdown
// @route   GET /api/analytics/categories
// @access  Private
export const getCategoryBreakdown = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;

  const categoryBreakdown = await Order.aggregate([
    { $match: { user: userId } },
    { $unwind: '$orderItems' },
    {
      $lookup: {
        from: 'products',
        localField: 'orderItems.product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.category',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$category.name',
        total: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        items: { $sum: '$orderItems.quantity' },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const total = categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0);

  res.status(200).json({
    success: true,
    data: categoryBreakdown.map(cat => ({
      category: cat._id || 'Uncategorized',
      amount: Math.round(cat.total * 100) / 100,
      items: cat.items,
      percentage: Math.round((cat.total / total) * 100),
    })),
  });
});

// @desc    Get savings analytics
// @route   GET /api/analytics/savings
// @access  Private
export const getSavingsAnalytics = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;

  const orders = await Order.find({ user: userId })
    .select('discount couponCode totalPrice createdAt');

  // Savings by month
  const monthlySavings = await Order.aggregate([
    { $match: { user: userId, discount: { $gt: 0 } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        savings: { $sum: '$discount' },
        couponsUsed: { $sum: { $cond: [{ $ne: ['$couponCode', null] }, 1, 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Loyalty points value
  const user = await User.findById(userId);
  const loyaltyValue = user.loyaltyPoints * 0.01;

  // Total savings
  const totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      totalSavings: Math.round(totalDiscount * 100) / 100,
      loyaltyPointsValue: Math.round(loyaltyValue * 100) / 100,
      couponsUsed: orders.filter(o => o.couponCode).length,
      monthlySavings,
      potentialSavings: loyaltyValue,
    },
  });
});

// @desc    Get shopping trends
// @route   GET /api/analytics/trends
// @access  Private
export const getShoppingTrends = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;

  // Most purchased products
  const topProducts = await Order.aggregate([
    { $match: { user: userId } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalQuantity: { $sum: '$orderItems.quantity' },
        totalSpent: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        purchases: { $sum: 1 },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        product: {
          _id: '$product._id',
          name: '$product.name',
          images: '$product.images',
          price: '$product.price',
        },
        totalQuantity: 1,
        totalSpent: 1,
        purchases: 1,
      },
    },
  ]);

  // Shopping frequency by day of week
  const byDayOfWeek = await Order.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' },
        count: { $sum: 1 },
        total: { $sum: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Peak shopping hours
  const byHour = await Order.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.status(200).json({
    success: true,
    data: {
      topProducts,
      shoppingByDay: byDayOfWeek.map(d => ({
        day: dayNames[d._id - 1],
        orders: d.count,
        spending: Math.round(d.total * 100) / 100,
      })),
      peakHours: byHour.map(h => ({
        hour: `${h._id}:00`,
        orders: h.count,
      })),
    },
  });
});

// ==================== PRICE HISTORY CHARTS ====================

// @desc    Get price history chart data
// @route   GET /api/analytics/price-history/:productId
// @access  Public
export const getPriceHistoryChart = catchAsyncErrors(async (req, res) => {
  const { productId } = req.params;
  const { period = '30d' } = req.query;

  let startDate = new Date();
  if (period === '7d') startDate.setDate(startDate.getDate() - 7);
  else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
  else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
  else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);

  const priceHistory = await PriceHistory.find({
    product: productId,
    recordedAt: { $gte: startDate },
  }).sort({ recordedAt: 1 });

  const product = await Product.findById(productId).select('name price');

  // Calculate statistics
  const prices = priceHistory.map(h => h.price);
  const stats = {
    current: product?.price || 0,
    lowest: prices.length > 0 ? Math.min(...prices) : product?.price || 0,
    highest: prices.length > 0 ? Math.max(...prices) : product?.price || 0,
    average: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : product?.price || 0,
  };

  res.status(200).json({
    success: true,
    data: {
      product: {
        id: productId,
        name: product?.name,
        currentPrice: product?.price,
      },
      history: priceHistory.map(h => ({
        price: h.price,
        date: h.recordedAt,
        discount: h.discount,
      })),
      stats,
    },
  });
});

// @desc    Get price comparison
// @route   GET /api/analytics/price-comparison
// @access  Public
export const getProductPriceComparison = catchAsyncErrors(async (req, res) => {
  const { productIds } = req.query;

  if (!productIds) {
    return res.status(400).json({
      success: false,
      message: 'Product IDs required',
    });
  }

  const ids = productIds.split(',');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const comparison = await Promise.all(
    ids.map(async (id) => {
      const product = await Product.findById(id).select('name price images');
      const history = await PriceHistory.find({
        product: id,
        recordedAt: { $gte: thirtyDaysAgo },
      }).sort({ recordedAt: 1 });

      return {
        product,
        history: history.map(h => ({
          price: h.price,
          date: h.recordedAt,
        })),
      };
    })
  );

  res.status(200).json({
    success: true,
    data: comparison,
  });
});

// @desc    Get market trends
// @route   GET /api/analytics/market-trends/:category
// @access  Public
export const getMarketTrends = catchAsyncErrors(async (req, res) => {
  const { category } = req.params;

  const products = await Product.find({ category })
    .select('name price ratings numOfReviews')
    .sort({ ratings: -1 })
    .limit(20);

  // Get average prices
  const avgPrices = await Product.aggregate([
    { $match: { category: category } },
    {
      $group: {
        _id: null,
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalProducts: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      topProducts: products,
      marketStats: avgPrices[0] || {},
    },
  });
});

// ==================== PERSONALIZED DEALS ====================

// @desc    Get personalized deals
// @route   GET /api/analytics/deals/personalized
// @access  Private
export const getPersonalizedDeals = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;

  // Get user's purchase history
  const orders = await Order.find({ user: userId })
    .populate('orderItems.product', 'category tags')
    .sort({ createdAt: -1 })
    .limit(20);

  // Extract categories and tags
  const categories = new Set();
  const tags = new Set();

  orders.forEach(order => {
    order.orderItems.forEach(item => {
      if (item.product?.category) categories.add(item.product.category.toString());
      if (item.product?.tags) item.product.tags.forEach(t => tags.add(t));
    });
  });

  // Find products with discounts in preferred categories
  const deals = await Product.find({
    $or: [
      { category: { $in: Array.from(categories) } },
      { tags: { $in: Array.from(tags) } },
    ],
    discount: { $gt: 0 },
    isActive: true,
  })
    .select('name price originalPrice discount images ratings category')
    .sort({ discount: -1 })
    .limit(12);

  // Calculate deal score
  const dealsWithScore = deals.map(deal => ({
    ...deal.toObject(),
    savings: deal.originalPrice ? deal.originalPrice - deal.price : 0,
    matchScore: Math.floor(Math.random() * 20) + 80, // Simulated match score
    reason: categories.has(deal.category?.toString())
      ? 'Based on your purchases'
      : 'Trending in categories you like',
  }));

  res.status(200).json({
    success: true,
    data: dealsWithScore,
  });
});

// @desc    Get deal recommendations
// @route   GET /api/analytics/deals/recommendations
// @access  Private
export const getDealRecommendations = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  // Get wishlist items on sale
  const wishlistDeals = await Product.find({
    _id: { $in: user.wishlist || [] },
    discount: { $gt: 0 },
  }).select('name price originalPrice discount images');

  // Get items from cart that have alternatives on sale
  // This is a simplified version

  // Get flash sale items
  const now = new Date();
  const flashDeals = await Product.find({
    flashSale: true,
    flashSaleEndTime: { $gt: now },
    isActive: true,
  })
    .select('name price originalPrice discount images flashSaleEndTime')
    .limit(6);

  // Price drops on viewed items
  const priceDrops = await PriceHistory.aggregate([
    {
      $sort: { recordedAt: -1 },
    },
    {
      $group: {
        _id: '$product',
        latestPrice: { $first: '$price' },
        previousPrice: { $last: '$price' },
      },
    },
    {
      $match: {
        $expr: { $lt: ['$latestPrice', '$previousPrice'] },
      },
    },
    { $limit: 10 },
  ]);

  res.status(200).json({
    success: true,
    data: {
      wishlistDeals,
      flashDeals,
      priceDrops: priceDrops.length,
    },
  });
});

// ==================== ADMIN ANALYTICS ====================

// @desc    Get admin dashboard analytics
// @route   GET /api/analytics/admin/overview
// @access  Private (Admin)
export const getAdminAnalytics = catchAsyncErrors(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  // Today's stats
  const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
  const todayRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  // This month's stats
  const monthOrders = await Order.countDocuments({ createdAt: { $gte: thisMonth } });
  const monthRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: thisMonth } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  // Total stats
  const totalProducts = await Product.countDocuments({ isActive: true });
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Low stock alerts
  const lowStockProducts = await Product.countDocuments({
    $expr: { $lt: ['$stock', '$lowStockThreshold'] },
  });

  // Pending orders
  const pendingOrders = await Order.countDocuments({ status: 'Processing' });

  res.status(200).json({
    success: true,
    data: {
      today: {
        orders: todayOrders,
        revenue: todayRevenue[0]?.total || 0,
      },
      thisMonth: {
        orders: monthOrders,
        revenue: monthRevenue[0]?.total || 0,
      },
      totals: {
        products: totalProducts,
        users: totalUsers,
        orders: totalOrders,
      },
      alerts: {
        lowStock: lowStockProducts,
        pendingOrders,
      },
    },
  });
});

// @desc    Get sales analytics
// @route   GET /api/analytics/admin/sales
// @access  Private (Admin)
export const getSalesAnalytics = catchAsyncErrors(async (req, res) => {
  const { period = '30d' } = req.query;

  let startDate = new Date();
  if (period === '7d') startDate.setDate(startDate.getDate() - 7);
  else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
  else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

  const dailySales = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
        items: { $sum: { $size: '$orderItems' } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  const topSellingProducts = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
  ]);

  res.status(200).json({
    success: true,
    data: {
      dailySales,
      topSellingProducts,
    },
  });
});

// @desc    Get inventory analytics
// @route   GET /api/analytics/admin/inventory
// @access  Private (Admin)
export const getInventoryAnalytics = catchAsyncErrors(async (req, res) => {
  // Stock levels
  const stockLevels = await Product.aggregate([
    {
      $bucket: {
        groupBy: '$stock',
        boundaries: [0, 1, 10, 50, 100, 500, 1000],
        default: '1000+',
        output: {
          count: { $sum: 1 },
          products: { $push: { name: '$name', stock: '$stock' } },
        },
      },
    },
  ]);

  // Low stock products
  const lowStockProducts = await Product.find({
    $expr: { $lt: ['$stock', '$lowStockThreshold'] },
  })
    .select('name stock lowStockThreshold images')
    .sort({ stock: 1 })
    .limit(20);

  // Out of stock
  const outOfStock = await Product.find({ stock: 0 })
    .select('name images')
    .limit(10);

  // Stock value
  const stockValue = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
        totalItems: { $sum: '$stock' },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      stockLevels,
      lowStockProducts,
      outOfStock,
      stockValue: stockValue[0] || { totalValue: 0, totalItems: 0 },
    },
  });
});

// @desc    Get customer analytics
// @route   GET /api/analytics/admin/customers
// @access  Private (Admin)
export const getCustomerAnalytics = catchAsyncErrors(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // New customers
  const newCustomers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Customer by tier
  const byTier = await User.aggregate([
    {
      $group: {
        _id: '$membershipTier',
        count: { $sum: 1 },
        avgPoints: { $avg: '$loyaltyPoints' },
      },
    },
  ]);

  // Top customers
  const topCustomers = await Order.aggregate([
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        'user.name': 1,
        'user.email': 1,
        'user.membershipTier': 1,
        totalSpent: 1,
        orders: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      newCustomers,
      byTier,
      topCustomers,
    },
  });
});

export default {
  getUserDashboardAnalytics,
  getSpendingAnalytics,
  getCategoryBreakdown,
  getSavingsAnalytics,
  getShoppingTrends,
  getPriceHistoryChart,
  getProductPriceComparison,
  getMarketTrends,
  getPersonalizedDeals,
  getDealRecommendations,
  getAdminAnalytics,
  getSalesAnalytics,
  getInventoryAnalytics,
  getCustomerAnalytics,
};
