import express from 'express';
const router = express.Router();
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import * as bundleDealsController from '../controllers/bundleDealsController.js';

router.post('/create', isAuthenticatedUser, authorizeRoles('admin', 'vendor'), bundleDealsController.createBundle);
router.get('/active', bundleDealsController.getActiveBundles);
router.get('/featured', bundleDealsController.getFeaturedBundles);
router.get('/:slug', bundleDealsController.getBundle);
router.get('/:bundleId/availability', bundleDealsController.checkAvailability);
router.post('/:bundleId/analytics', bundleDealsController.trackAnalytics);

export default router;
