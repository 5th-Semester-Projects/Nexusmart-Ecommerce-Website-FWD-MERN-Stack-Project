import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'order_placed',
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'payment_received',
      'payment_failed',
      'stock_alert',
      'price_drop',
      'new_review',
      'review_reply',
      'question_answered',
      'promotion',
      'system',
      'security_alert',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'bell',
  },
  link: {
    type: String, // URL to navigate when clicked
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Additional data (orderId, productId, etc.)
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  expiresAt: {
    type: Date, // Optional expiration date
  },
}, {
  timestamps: true,
});

// Index for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ user: userId, isRead: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to create notification
notificationSchema.statics.createNotification = async function ({
  userId,
  type,
  title,
  message,
  icon,
  link,
  data,
  priority,
  expiresAt,
}) {
  return this.create({
    user: userId,
    type,
    title,
    message,
    icon,
    link,
    data,
    priority,
    expiresAt,
  });
};

// Static method to create bulk notifications (for promotions)
notificationSchema.statics.createBulkNotifications = async function (userIds, notificationData) {
  const notifications = userIds.map(userId => ({
    user: userId,
    ...notificationData,
  }));
  return this.insertMany(notifications);
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
export { Notification };
