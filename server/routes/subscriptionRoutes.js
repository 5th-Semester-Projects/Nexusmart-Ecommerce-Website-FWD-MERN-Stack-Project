import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  getSubscriptionPlans,
  getSubscriptionPlan,
  subscribeToPlan,
  getUserSubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  updateCustomization,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Public routes
router.get('/plans', getSubscriptionPlans);
router.get('/plans/:id', getSubscriptionPlan);

// User routes
router.post('/subscribe', isAuthenticatedUser, subscribeToPlan);
router.get('/my-subscriptions', isAuthenticatedUser, getUserSubscriptions);
router.put('/pause/:id', isAuthenticatedUser, pauseSubscription);
router.put('/resume/:id', isAuthenticatedUser, resumeSubscription);
router.delete('/cancel/:id', isAuthenticatedUser, cancelSubscription);
router.put('/customize/:id', isAuthenticatedUser, updateCustomization);

// Admin routes
router.post('/admin/plans', isAuthenticatedUser, authorizeRoles('admin'), createSubscriptionPlan);
router.put('/admin/plans/:id', isAuthenticatedUser, authorizeRoles('admin'), updateSubscriptionPlan);
router.delete('/admin/plans/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteSubscriptionPlan);

export default router;
