import express from 'express';
const router = express.Router();
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import * as inventoryManagementController from '../controllers/inventoryManagementController.js';

router.post('/create', isAuthenticatedUser, authorizeRoles('admin', 'vendor'), inventoryManagementController.createInventory);
router.get('/sku/:sku', isAuthenticatedUser, inventoryManagementController.getInventoryBySKU);
router.post('/sku/:sku/adjust', isAuthenticatedUser, authorizeRoles('admin', 'vendor'), inventoryManagementController.adjustStock);
router.post('/sku/:sku/reserve', isAuthenticatedUser, inventoryManagementController.reserveStock);
router.post('/sku/:sku/release', isAuthenticatedUser, inventoryManagementController.releaseStock);
router.post('/sku/:sku/transfer', isAuthenticatedUser, authorizeRoles('admin', 'vendor'), inventoryManagementController.transferStock);
router.get('/low-stock', isAuthenticatedUser, authorizeRoles('admin', 'vendor'), inventoryManagementController.getLowStockItems);
router.get('/out-of-stock', isAuthenticatedUser, authorizeRoles('admin', 'vendor'), inventoryManagementController.getOutOfStockItems);

export default router;
