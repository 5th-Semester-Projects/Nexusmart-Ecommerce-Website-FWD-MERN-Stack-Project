import express from 'express';
import {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  syncInventoryToChannel,
  updateStockMovement,
  checkReorderPoints,
  transferStock,
  getLowStockProducts,
  getStockByWarehouse,
  getStockHistory
} from '../controllers/realtimeInventorySyncController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/inventory')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getAllInventories)
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), createInventory);

router.route('/inventory/:id')
  .get(isAuthenticatedUser, getInventoryById)
  .put(isAuthenticatedUser, authorizeRoles('admin', 'seller'), updateInventory)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteInventory);

router.route('/inventory/:id/sync/:channel')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), syncInventoryToChannel);

router.route('/inventory/:id/movement')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), updateStockMovement);

router.route('/inventory/check-reorder')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), checkReorderPoints);

router.route('/inventory/:id/transfer')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), transferStock);

router.route('/inventory/low-stock')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getLowStockProducts);

router.route('/inventory/warehouse/:warehouseId')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getStockByWarehouse);

router.route('/inventory/:id/history')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getStockHistory);

export default router;
