import express from 'express';
import {
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
} from '../controllers/notificationController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// ==================== USER ROUTES ====================
router.get('/', isAuthenticatedUser, getNotifications);
router.get('/unread-count', isAuthenticatedUser, getUnreadCount);
router.get('/preferences', isAuthenticatedUser, getPreferences);
router.patch('/preferences', isAuthenticatedUser, updatePreferences);
router.patch('/read-all', isAuthenticatedUser, markAllAsRead);
router.patch('/:notificationId/read', isAuthenticatedUser, markAsRead);
router.delete('/clear-read', isAuthenticatedUser, clearReadNotifications);
router.delete('/:notificationId', isAuthenticatedUser, deleteNotification);

// ==================== ADMIN ROUTES ====================
router.post('/admin/send', isAuthenticatedUser, authorizeRoles('admin'), sendNotification);
router.get('/admin/stats', isAuthenticatedUser, authorizeRoles('admin'), getNotificationStats);
router.delete('/admin/cleanup', isAuthenticatedUser, authorizeRoles('admin'), cleanupNotifications);

export default router;
