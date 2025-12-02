import StockAlert from '../models/StockAlert.js';
import Product from '../models/Product.js';
import { catchAsyncErrors as catchAsync } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Subscribe to stock alerts for a product
// @route   POST /api/stock-alerts
// @access  Private
export const subscribeToStockAlert = catchAsync(async (req, res, next) => {
  const { productId, email, notifyMethod } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Check if alert already exists
  const existingAlert = await StockAlert.findOne({
    product: productId,
    user: req.user._id,
    isNotified: false,
  });

  if (existingAlert) {
    return res.status(200).json({
      success: true,
      message: 'You are already subscribed to stock alerts for this product',
      alert: existingAlert,
    });
  }

  const alert = await StockAlert.create({
    product: productId,
    user: req.user._id,
    email: email || req.user.email,
    notifyMethod: notifyMethod || 'email',
  });

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to stock alerts',
    alert,
  });
});

// @desc    Get user's stock alert subscriptions
// @route   GET /api/stock-alerts/my-alerts
// @access  Private
export const getMyStockAlerts = catchAsync(async (req, res, next) => {
  const alerts = await StockAlert.find({ user: req.user._id })
    .populate('product', 'name price images stock')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: alerts.length,
    alerts,
  });
});

// @desc    Unsubscribe from stock alert
// @route   DELETE /api/stock-alerts/:alertId
// @access  Private
export const unsubscribeFromStockAlert = catchAsync(async (req, res, next) => {
  const alert = await StockAlert.findOne({
    _id: req.params.alertId,
    user: req.user._id,
  });

  if (!alert) {
    return next(new ErrorHandler('Stock alert not found', 404));
  }

  await alert.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Successfully unsubscribed from stock alerts',
  });
});

// @desc    Check if user is subscribed to a product's stock alert
// @route   GET /api/stock-alerts/check/:productId
// @access  Private
export const checkStockAlertSubscription = catchAsync(async (req, res, next) => {
  const alert = await StockAlert.findOne({
    product: req.params.productId,
    user: req.user._id,
    isNotified: false,
  });

  res.status(200).json({
    success: true,
    isSubscribed: !!alert,
    alert,
  });
});

// ==================== ADMIN ROUTES ====================

// @desc    Get all stock alerts (Admin)
// @route   GET /api/stock-alerts/admin/all
// @access  Admin
export const getAllStockAlerts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {};

  // Filter by notification status
  if (req.query.notified) {
    query.isNotified = req.query.notified === 'true';
  }

  // Filter by product
  if (req.query.productId) {
    query.product = req.query.productId;
  }

  const [alerts, total] = await Promise.all([
    StockAlert.find(query)
      .populate('product', 'name price images stock')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    StockAlert.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: alerts.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    alerts,
  });
});

// @desc    Get products with most stock alert subscriptions
// @route   GET /api/stock-alerts/admin/popular
// @access  Admin
export const getPopularOutOfStock = catchAsync(async (req, res, next) => {
  const products = await StockAlert.aggregate([
    { $match: { isNotified: false } },
    {
      $group: {
        _id: '$product',
        alertCount: { $sum: 1 },
        subscribers: { $push: '$email' },
      },
    },
    { $sort: { alertCount: -1 } },
    { $limit: 20 },
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
        _id: 1,
        alertCount: 1,
        subscriberCount: { $size: '$subscribers' },
        product: {
          _id: 1,
          name: 1,
          price: 1,
          stock: 1,
          images: { $slice: ['$product.images', 1] },
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    products,
  });
});

// @desc    Notify subscribers when product is back in stock (triggered by stock update)
// @route   POST /api/stock-alerts/admin/notify/:productId
// @access  Admin
export const notifyStockAvailable = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  if (product.stock <= 0) {
    return next(new ErrorHandler('Product is still out of stock', 400));
  }

  // Get all pending alerts for this product
  const alerts = await StockAlert.find({
    product: productId,
    isNotified: false,
  }).populate('user', 'name email');

  if (alerts.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No pending alerts for this product',
      notifiedCount: 0,
    });
  }

  // In a real application, you would send emails/SMS here
  // For now, we'll just mark them as notified
  const emailsToNotify = alerts.map(alert => ({
    email: alert.email,
    userName: alert.user?.name || 'Customer',
    productName: product.name,
    productId: product._id,
  }));

  // Mark all alerts as notified
  await StockAlert.markNotified(productId);

  res.status(200).json({
    success: true,
    message: `Successfully notified ${alerts.length} subscribers`,
    notifiedCount: alerts.length,
    notifiedEmails: emailsToNotify,
  });
});

// @desc    Delete old notified alerts (cleanup)
// @route   DELETE /api/stock-alerts/admin/cleanup
// @access  Admin
export const cleanupOldAlerts = catchAsync(async (req, res, next) => {
  const daysOld = parseInt(req.query.daysOld) || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await StockAlert.deleteMany({
    isNotified: true,
    notifiedAt: { $lt: cutoffDate },
  });

  res.status(200).json({
    success: true,
    message: `Deleted ${result.deletedCount} old alerts`,
    deletedCount: result.deletedCount,
  });
});

export default {
  subscribeToStockAlert,
  getMyStockAlerts,
  unsubscribeFromStockAlert,
  checkStockAlertSubscription,
  getAllStockAlerts,
  getPopularOutOfStock,
  notifyStockAvailable,
  cleanupOldAlerts,
};
