import express from 'express';
import {
  createStripeIntent,
  verifyStripe,
  createRazorpayOrderHandler,
  verifyRazorpay,
  processRefund,
  stripeWebhook,
  razorpayWebhook,
  getPaymentMethods,
} from '../controllers/paymentController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.route('/methods').get(getPaymentMethods);

// Webhook routes (no auth required)
router.route('/webhook/stripe').post(stripeWebhook);
router.route('/webhook/razorpay').post(razorpayWebhook);

// Stripe routes
router.route('/stripe/create-intent').post(isAuthenticatedUser, createStripeIntent);
router.route('/stripe/verify').post(isAuthenticatedUser, verifyStripe);

// Razorpay routes
router.route('/razorpay/create-order').post(isAuthenticatedUser, createRazorpayOrderHandler);
router.route('/razorpay/verify').post(isAuthenticatedUser, verifyRazorpay);

// Refund route (Admin only)
router
  .route('/refund')
  .post(isAuthenticatedUser, authorizeRoles('admin'), processRefund);

export default router;
