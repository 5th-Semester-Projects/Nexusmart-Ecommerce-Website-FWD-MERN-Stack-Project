import express from 'express';
import {
  createWarehouse,
  getAllWarehouses,
  getNearestWarehouse,
  addInventoryToWarehouse,
  getWarehouseInventory,
  checkLowStockItems,
  triggerAutoReorder,
  transferStock,
  getDemandForecast
} from '../controllers/warehouseController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Warehouse Management
router.post('/create', isAuthenticatedUser, authorizeRoles('admin'), createWarehouse);
router.get('/all', isAuthenticatedUser, authorizeRoles('admin'), getAllWarehouses);
router.get('/nearest', getNearestWarehouse);

// Inventory Management
router.post('/:warehouseId/inventory', isAuthenticatedUser, authorizeRoles('admin'), addInventoryToWarehouse);
router.get('/:warehouseId/inventory', isAuthenticatedUser, authorizeRoles('admin'), getWarehouseInventory);
router.get('/:warehouseId/low-stock', isAuthenticatedUser, authorizeRoles('admin'), checkLowStockItems);

// Auto-reorder
router.post('/auto-reorder', isAuthenticatedUser, authorizeRoles('admin'), triggerAutoReorder);

// Stock Transfer
router.post('/transfer', isAuthenticatedUser, authorizeRoles('admin'), transferStock);

// Demand Forecasting
router.get('/demand-forecast', isAuthenticatedUser, authorizeRoles('admin'), getDemandForecast);

export default router;
