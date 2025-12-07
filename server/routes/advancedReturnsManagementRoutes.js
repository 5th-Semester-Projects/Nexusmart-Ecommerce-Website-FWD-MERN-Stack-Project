import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  getUserReturns,
  getReturn,
  createReturnRequest,
  updateReturnStatus,
  approveReturn,
  processInstantRefund,
  inspectReturn,
  generateShippingLabel,
  getExchangeSuggestions,
  getPendingReturns,
  getReturnAnalytics,
  cancelReturn
} from '../controllers/advancedReturnsManagementController.js';

const router = express.Router();

router.route('/returns').get(isAuthenticatedUser, getUserReturns);
router.route('/returns/new').post(isAuthenticatedUser, createReturnRequest);
router.route('/returns/pending')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getPendingReturns);
router.route('/returns/analytics')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getReturnAnalytics);

router.route('/returns/:id').get(isAuthenticatedUser, getReturn);

router.route('/returns/:id/status')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateReturnStatus);

router.route('/returns/:id/approve')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), approveReturn);

router.route('/returns/:id/instant-refund')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), processInstantRefund);

router.route('/returns/:id/inspect')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), inspectReturn);

router.route('/returns/:id/shipping-label')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), generateShippingLabel);

router.route('/returns/:id/exchange-suggestions').get(isAuthenticatedUser, getExchangeSuggestions);

router.route('/returns/:id/cancel').put(isAuthenticatedUser, cancelReturn);

export default router;
