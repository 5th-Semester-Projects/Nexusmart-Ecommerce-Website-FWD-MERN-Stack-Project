import express from 'express';
const router = express.Router();
import { isAuthenticatedUser } from '../middleware/auth.js';
import * as oneClickCheckoutController from '../controllers/oneClickCheckoutController.js';

router.get('/settings', isAuthenticatedUser, oneClickCheckoutController.getSettings);
router.post('/payment/add', isAuthenticatedUser, oneClickCheckoutController.addPaymentMethod);
router.post('/shipping/add', isAuthenticatedUser, oneClickCheckoutController.addShippingAddress);
router.post('/payment/default', isAuthenticatedUser, oneClickCheckoutController.setDefaultPayment);
router.post('/shipping/default', isAuthenticatedUser, oneClickCheckoutController.setDefaultShipping);
router.post('/validate', isAuthenticatedUser, oneClickCheckoutController.validatePurchase);
router.post('/analytics', isAuthenticatedUser, oneClickCheckoutController.updateAnalytics);

export default router;
