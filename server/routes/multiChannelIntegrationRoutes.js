import express from 'express';
import {
  getIntegration,
  createIntegration,
  updateIntegration,
  enableChannel,
  disableChannel,
  syncProductsToChannel,
  getActiveIntegrations,
  getSyncHistory,
  getInstagramAnalytics,
  getFacebookAnalytics,
  getAmazonAnalytics,
  getTotalRevenue
} from '../controllers/multiChannelIntegrationController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/integrations')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getActiveIntegrations)
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), createIntegration);

router.route('/integrations/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getIntegration)
  .put(isAuthenticatedUser, authorizeRoles('admin', 'seller'), updateIntegration);

router.route('/integrations/:id/enable')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), enableChannel);

router.route('/integrations/:id/disable')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), disableChannel);

router.route('/integrations/:id/sync-products')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), syncProductsToChannel);

router.route('/integrations/:id/sync-history')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getSyncHistory);

router.route('/integrations/analytics/instagram')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getInstagramAnalytics);

router.route('/integrations/analytics/facebook')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getFacebookAnalytics);

router.route('/integrations/analytics/amazon')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getAmazonAnalytics);

router.route('/integrations/revenue')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getTotalRevenue);

export default router;
