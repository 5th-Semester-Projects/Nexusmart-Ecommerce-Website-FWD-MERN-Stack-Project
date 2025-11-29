import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

const router = express.Router();

// All routes require admin authentication
router.use(isAuthenticatedUser, authorizeRoles('admin'));

/**
 * Get dashboard statistics
 * @route GET /api/admin/dashboard-stats
 * @access Admin
 */
router.get('/dashboard-stats', catchAsyncErrors(async (req, res, next) => {
  // Get total counts
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Get revenue
  const revenueResult = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  // Get monthly revenue for chart
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Format monthly data
  const revenueChart = monthlyRevenue.map(item => ({
    month: new Date(item._id + '-01').toLocaleDateString('en-US', { month: 'short' }),
    revenue: item.revenue,
    orders: item.orders
  }));

  // Get category distribution
  const categoryDistribution = await Product.aggregate([
    { $match: { status: 'active' } },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    { $unwind: '$categoryInfo' },
    {
      $group: {
        _id: '$categoryInfo.name',
        value: { $sum: 1 }
      }
    }
  ]);

  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];
  const formattedCategoryData = categoryDistribution.map((cat, index) => ({
    name: cat._id,
    value: cat.value,
    color: colors[index % colors.length]
  }));

  // Get recent counts for comparison (last 30 days vs previous 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  const previousUsers = await User.countDocuments({
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
  });

  const recentOrders = await Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  const previousOrders = await Order.countDocuments({
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
  });

  // Calculate percentage changes
  const usersChange = previousUsers > 0
    ? ((recentUsers - previousUsers) / previousUsers * 100).toFixed(1)
    : 100;
  const ordersChange = previousOrders > 0
    ? ((recentOrders - previousOrders) / previousOrders * 100).toFixed(1)
    : 100;

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      revenueChange: 12.5, // You can calculate this similarly
      ordersChange: parseFloat(ordersChange),
      usersChange: parseFloat(usersChange),
      productsChange: 5.4, // Calculate if needed
      revenueChart,
      categoryDistribution: formattedCategoryData
    }
  });
}));

/**
 * Get all products for admin
 * @route GET /api/admin/products
 * @access Admin
 */
router.get('/products', catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const query = {};

  // Search filter
  if (req.query.search) {
    query.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { description: new RegExp(req.query.search, 'i') }
    ];
  }

  // Status filter
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Category filter
  if (req.query.category) {
    query.category = req.query.category;
  }

  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('seller', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
      limit
    }
  });
}));

/**
 * Get all users for admin
 * @route GET /api/admin/users
 * @access Admin
 */
router.get('/users', catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const query = {};

  // Search filter
  if (req.query.search) {
    query.$or = [
      { firstName: new RegExp(req.query.search, 'i') },
      { lastName: new RegExp(req.query.search, 'i') },
      { email: new RegExp(req.query.search, 'i') }
    ];
  }

  // Role filter
  if (req.query.role) {
    query.role = req.query.role;
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    users,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
      limit
    }
  });
}));

/**
 * Update user role
 * @route PUT /api/admin/users/:id/role
 * @access Admin
 */
router.put('/users/:id/role', catchAsyncErrors(async (req, res, next) => {
  const { role } = req.body;

  if (!['user', 'seller', 'admin'].includes(role)) {
    return next(new ErrorHandler('Invalid role', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    user
  });
}));

/**
 * Update user status (block/unblock)
 * @route PUT /api/admin/users/:id/status
 * @access Admin
 */
router.put('/users/:id/status', catchAsyncErrors(async (req, res, next) => {
  const { action, reason } = req.body;

  if (!['block', 'unblock'].includes(action)) {
    return next(new ErrorHandler('Invalid action', 400));
  }

  const updateData = {
    isBlocked: action === 'block',
    blockReason: action === 'block' ? reason : null
  };

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  ).select('-password');

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: `User ${action}ed successfully`,
    user
  });
}));

/**
 * Delete user
 * @route DELETE /api/admin/users/:id
 * @access Admin
 */
router.delete('/users/:id', catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Prevent deleting self
  if (user._id.toString() === req.user._id.toString()) {
    return next(new ErrorHandler('Cannot delete your own account', 400));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
}));

export default router;
