import express from 'express';
import {
  subscribeToStockAlert,
  getMyStockAlerts,
  unsubscribeFromStockAlert,
  checkStockAlertSubscription,
  getAllStockAlerts,
  getPopularOutOfStock,
  notifyStockAvailable,
  cleanupOldAlerts,
} from '../controllers/stockAlertController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// ==================== USER ROUTES ====================
router.post('/', isAuthenticatedUser, subscribeToStockAlert);
router.get('/my-alerts', isAuthenticatedUser, getMyStockAlerts);
router.get('/check/:productId', isAuthenticatedUser, checkStockAlertSubscription);
router.delete('/:alertId', isAuthenticatedUser, unsubscribeFromStockAlert);

// ==================== ADMIN ROUTES ====================
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), getAllStockAlerts);
router.get('/admin/popular', isAuthenticatedUser, authorizeRoles('admin'), getPopularOutOfStock);
router.post('/admin/notify/:productId', isAuthenticatedUser, authorizeRoles('admin'), notifyStockAvailable);
router.delete('/admin/cleanup', isAuthenticatedUser, authorizeRoles('admin'), cleanupOldAlerts);

export default router;
