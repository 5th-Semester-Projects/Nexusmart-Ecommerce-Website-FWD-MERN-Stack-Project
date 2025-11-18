import express from 'express';
import {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  requestReturn,
  processReturn,
  updateTracking,
  getOrderStats,
  deleteOrder,
} from '../controllers/orderController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.route('/').post(isAuthenticatedUser, createOrder);
router.route('/my-orders').get(isAuthenticatedUser, getMyOrders);
router.route('/:id').get(isAuthenticatedUser, getOrder);
router.route('/:id/cancel').put(isAuthenticatedUser, cancelOrder);
router.route('/:id/return').post(isAuthenticatedUser, requestReturn);

// Admin routes
router
  .route('/admin/all')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);

router
  .route('/admin/stats')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getOrderStats);

router
  .route('/:id/status')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);

router
  .route('/:id/return/process')
  .put(isAuthenticatedUser, authorizeRoles('admin'), processReturn);

router
  .route('/:id/tracking')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateTracking);

router
  .route('/:id')
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

export default router;
