import express from 'express';
import { isAuthenticatedUser } from '../middleware/auth.js';
import {
  getUserSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  skipNextDelivery,
  cancelSubscription,
  getDueDeliveries,
  getSubscriptionAnalytics,
  updatePaymentMethod,
  processRecurringPayment
} from '../controllers/subscriptionManagementController.js';

const router = express.Router();

router.route('/subscriptions').get(isAuthenticatedUser, getUserSubscriptions);
router.route('/subscriptions/new').post(isAuthenticatedUser, createSubscription);
router.route('/subscriptions/due').get(isAuthenticatedUser, getDueDeliveries);
router.route('/subscriptions/analytics').get(isAuthenticatedUser, getSubscriptionAnalytics);

router.route('/subscriptions/:id')
  .get(isAuthenticatedUser, getSubscription)
  .put(isAuthenticatedUser, updateSubscription);

router.route('/subscriptions/:id/pause').put(isAuthenticatedUser, pauseSubscription);
router.route('/subscriptions/:id/resume').put(isAuthenticatedUser, resumeSubscription);
router.route('/subscriptions/:id/skip').put(isAuthenticatedUser, skipNextDelivery);
router.route('/subscriptions/:id/cancel').put(isAuthenticatedUser, cancelSubscription);
router.route('/subscriptions/:id/payment').put(isAuthenticatedUser, updatePaymentMethod);
router.route('/subscriptions/:id/process-payment').post(isAuthenticatedUser, processRecurringPayment);

export default router;
