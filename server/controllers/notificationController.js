import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { catchAsyncErrors as catchAsync } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = { user: req.user._id };

  // Filter by read status
  if (req.query.unread === 'true') {
    query.isRead = false;
  }

  // Filter by type
  if (req.query.type) {
    query.type = req.query.type;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(query),
    Notification.getUnreadCount(req.user._id),
  ]);

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    unreadCount,
    notifications,
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = catchAsync(async (req, res, next) => {
  const count = await Notification.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    unreadCount: count,
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:notificationId/read
// @access  Private
export const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.notificationId,
    user: req.user._id,
  });

  if (!notification) {
    return next(new ErrorHandler('Notification not found', 404));
  }

  await notification.markAsRead();

  res.status(200).json({
    success: true,
    notification,
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.markAllAsRead(req.user._id);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:notificationId
// @access  Private
export const deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.notificationId,
    user: req.user._id,
  });

  if (!notification) {
    return next(new ErrorHandler('Notification not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
export const clearReadNotifications = catchAsync(async (req, res, next) => {
  const result = await Notification.deleteMany({
    user: req.user._id,
    isRead: true,
  });

  res.status(200).json({
    success: true,
    message: `Deleted ${result.deletedCount} notifications`,
    deletedCount: result.deletedCount,
  });
});

// @desc    Update notification preferences
// @route   PATCH /api/notifications/preferences
// @access  Private
export const updatePreferences = catchAsync(async (req, res, next) => {
  const { preferences } = req.body;

  // Update user's notification preferences
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { notificationPreferences: preferences },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    preferences: user.notificationPreferences,
  });
});

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
export const getPreferences = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('notificationPreferences');

  res.status(200).json({
    success: true,
    preferences: user.notificationPreferences || {
      email: {
        orders: true,
        promotions: true,
        stockAlerts: true,
        newsletter: true,
      },
      push: {
        orders: true,
        promotions: false,
        stockAlerts: true,
      },
    },
  });
});

// ==================== ADMIN ROUTES ====================

// @desc    Send notification to user(s) (Admin)
// @route   POST /api/notifications/admin/send
// @access  Admin
export const sendNotification = catchAsync(async (req, res, next) => {
  const { userIds, type, title, message, icon, link, data, priority, broadcast } = req.body;

  if (!title || !message) {
    return next(new ErrorHandler('Title and message are required', 400));
  }

  let targetUserIds = userIds;

  // If broadcast, send to all users
  if (broadcast) {
    const users = await User.find({ isActive: true }).select('_id');
    targetUserIds = users.map(u => u._id);
  }

  if (!targetUserIds || targetUserIds.length === 0) {
    return next(new ErrorHandler('No target users specified', 400));
  }

  const notificationData = {
    type: type || 'system',
    title,
    message,
    icon: icon || 'bell',
    link,
    data,
    priority: priority || 'medium',
  };

  await Notification.createBulkNotifications(targetUserIds, notificationData);

  res.status(201).json({
    success: true,
    message: `Notification sent to ${targetUserIds.length} users`,
    recipientCount: targetUserIds.length,
  });
});

// @desc    Get notification statistics (Admin)
// @route   GET /api/notifications/admin/stats
// @access  Admin
export const getNotificationStats = catchAsync(async (req, res, next) => {
  const stats = await Notification.aggregate([
    {
      $facet: {
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ],
        readStats: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              read: { $sum: { $cond: ['$isRead', 1, 0] } },
              unread: { $sum: { $cond: ['$isRead', 0, 1] } },
            },
          },
        ],
        last7Days: [
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      byType: stats[0].byType,
      byPriority: stats[0].byPriority,
      readStats: stats[0].readStats[0] || { total: 0, read: 0, unread: 0 },
      last7Days: stats[0].last7Days,
    },
  });
});

// @desc    Delete old notifications (Admin cleanup)
// @route   DELETE /api/notifications/admin/cleanup
// @access  Admin
export const cleanupNotifications = catchAsync(async (req, res, next) => {
  const daysOld = parseInt(req.query.daysOld) || 90;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true,
  });

  res.status(200).json({
    success: true,
    message: `Deleted ${result.deletedCount} old notifications`,
    deletedCount: result.deletedCount,
  });
});

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  updatePreferences,
  getPreferences,
  sendNotification,
  getNotificationStats,
  cleanupNotifications,
};
