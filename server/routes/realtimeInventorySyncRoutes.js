import express from 'express';
import {
  getInventoryBySKU,
  createInventory,
  updateWarehouseStock,
  getLowStockItems,
  getOutOfStockItems,
  syncWithChannel,
  getPendingReorders,
  getActiveAlerts,
  acknowledgeAlert,
  getInventoryAnalytics
} from '../controllers/realtimeInventorySyncController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Available routes based on controller exports
router.route('/inventory/sku/:sku')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getInventoryBySKU);

router.route('/inventory')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), createInventory);

router.route('/inventory/warehouse/:warehouseId')
  .put(isAuthenticatedUser, authorizeRoles('admin', 'seller'), updateWarehouseStock);

router.route('/inventory/low-stock')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getLowStockItems);

router.route('/inventory/out-of-stock')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getOutOfStockItems);

router.route('/inventory/sync/:channelId')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), syncWithChannel);

router.route('/inventory/pending-reorders')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getPendingReorders);

router.route('/inventory/alerts')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getActiveAlerts);

router.route('/inventory/alerts/:alertId/acknowledge')
  .put(isAuthenticatedUser, authorizeRoles('admin', 'seller'), acknowledgeAlert);

router.route('/inventory/analytics')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getInventoryAnalytics);

export default router;
