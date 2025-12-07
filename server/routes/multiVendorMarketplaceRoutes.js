import express from 'express';
const router = express.Router();
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import * as multiVendorMarketplaceController from '../controllers/multiVendorMarketplaceController.js';

router.post('/create', isAuthenticatedUser, authorizeRoles('vendor'), multiVendorMarketplaceController.createStore);
router.get('/:slug', multiVendorMarketplaceController.getStore);
router.put('/update', isAuthenticatedUser, authorizeRoles('vendor'), multiVendorMarketplaceController.updateStore);
router.post('/:storeId/rating', isAuthenticatedUser, multiVendorMarketplaceController.updateRating);
router.post('/payout/request', isAuthenticatedUser, authorizeRoles('vendor'), multiVendorMarketplaceController.requestPayout);
router.get('/top/vendors', multiVendorMarketplaceController.getTopVendors);

export default router;
