import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  getPreOrderConfig,
  createPreOrderConfig,
  updatePreOrderConfig,
  addToWaitlist,
  getUserWaitlist,
  notifyWaitlist,
  createPreOrder,
  fulfillOrder,
  getActivePreOrders,
  getBackorderQueue,
  updateInventoryAllocation,
  cancelPreOrder
} from '../controllers/preOrderBackorderController.js';

const router = express.Router();

router.route('/pre-order/config/:productId')
  .get(getPreOrderConfig);

router.route('/pre-order/config/new')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), createPreOrderConfig);

router.route('/pre-order/config/:id')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updatePreOrderConfig);

router.route('/pre-order/waitlist/add').post(isAuthenticatedUser, addToWaitlist);
router.route('/pre-order/waitlist/user').get(isAuthenticatedUser, getUserWaitlist);

router.route('/pre-order/waitlist/notify')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), notifyWaitlist);

router.route('/pre-order/create').post(isAuthenticatedUser, createPreOrder);

router.route('/pre-order/fulfill')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), fulfillOrder);

router.route('/pre-order/active')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getActivePreOrders);

router.route('/pre-order/backorder/queue/:productId')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getBackorderQueue);

router.route('/pre-order/inventory/allocate')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateInventoryAllocation);

router.route('/pre-order/:orderId/cancel').put(isAuthenticatedUser, cancelPreOrder);

export default router;
