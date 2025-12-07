import express from 'express';
import {
  getAllIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  connectChannel,
  disconnectChannel,
  syncProducts,
  syncInventory,
  syncOrders,
  getActiveChannels,
  getSyncStatus
} from '../controllers/multiChannelIntegrationController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/integrations')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getAllIntegrations)
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), createIntegration);

router.route('/integrations/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getIntegrationById)
  .put(isAuthenticatedUser, authorizeRoles('admin', 'seller'), updateIntegration)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteIntegration);

router.route('/integrations/:id/connect')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), connectChannel);

router.route('/integrations/:id/disconnect')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), disconnectChannel);

router.route('/integrations/:id/sync-products')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), syncProducts);

router.route('/integrations/:id/sync-inventory')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), syncInventory);

router.route('/integrations/:id/sync-orders')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), syncOrders);

router.route('/integrations/active')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getActiveChannels);

router.route('/integrations/:id/sync-status')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getSyncStatus);

export default router;
