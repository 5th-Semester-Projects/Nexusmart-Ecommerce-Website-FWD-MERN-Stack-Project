import express from 'express';
import {
  subscribe,
  confirmSubscription,
  unsubscribe,
  updatePreferences,
  getSubscriptionStatus,
  getAllSubscribers,
  getNewsletterStats,
  exportSubscribers,
  sendNewsletter,
  deleteSubscriber,
} from '../controllers/newsletterController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.post('/subscribe', subscribe);
router.get('/confirm/:token', confirmSubscription);
router.post('/unsubscribe', unsubscribe);

// ==================== USER ROUTES ====================
router.get('/status', isAuthenticatedUser, getSubscriptionStatus);
router.patch('/preferences', isAuthenticatedUser, updatePreferences);

// ==================== ADMIN ROUTES ====================
router.get('/admin/subscribers', isAuthenticatedUser, authorizeRoles('admin'), getAllSubscribers);
router.get('/admin/stats', isAuthenticatedUser, authorizeRoles('admin'), getNewsletterStats);
router.get('/admin/export', isAuthenticatedUser, authorizeRoles('admin'), exportSubscribers);
router.post('/admin/send', isAuthenticatedUser, authorizeRoles('admin'), sendNewsletter);
router.delete('/admin/:subscriberId', isAuthenticatedUser, authorizeRoles('admin'), deleteSubscriber);

export default router;
