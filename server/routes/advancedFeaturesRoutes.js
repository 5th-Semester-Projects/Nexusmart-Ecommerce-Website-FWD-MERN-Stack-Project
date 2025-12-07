import express from 'express';
import {
  createSubscriptionBox,
  subscribeToBox,
  pauseSubscription,
  createBundle,
  getBundleDetails,
  createPreOrder,
  cancelPreOrder,
  calculateShippingRates,
  getShippingRate
} from '../controllers/advancedFeaturesController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Subscription Boxes
router.post('/subscription-box', isAuthenticatedUser, authorizeRoles('admin'), createSubscriptionBox);
router.post('/subscription-box/:boxId/subscribe', isAuthenticatedUser, subscribeToBox);
router.post('/subscription-box/:boxId/pause', isAuthenticatedUser, pauseSubscription);

// Product Bundles
router.post('/bundle', isAuthenticatedUser, authorizeRoles('admin', 'seller'), createBundle);
router.get('/bundle/:bundleId', getBundleDetails);

// Pre-Orders
router.post('/pre-order', isAuthenticatedUser, createPreOrder);
router.post('/pre-order/:preOrderId/cancel', isAuthenticatedUser, cancelPreOrder);

// Shipping Rates
router.post('/shipping/calculate-rates', calculateShippingRates);
router.get('/shipping/rate/:rateId', getShippingRate);

export default router;
