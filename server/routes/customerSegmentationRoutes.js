import express from 'express';
const router = express.Router();
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import * as customerSegmentationController from '../controllers/customerSegmentationController.js';

router.get('/me', isAuthenticatedUser, customerSegmentationController.getUserSegmentation);
router.post('/rfm/calculate', isAuthenticatedUser, customerSegmentationController.calculateRFM);
router.post('/segment/determine', isAuthenticatedUser, customerSegmentationController.determineSegment);
router.post('/update', isAuthenticatedUser, customerSegmentationController.updateFromOrder);
router.get('/distribution', isAuthenticatedUser, authorizeRoles('admin'), customerSegmentationController.getSegmentDistribution);
router.get('/high-value', isAuthenticatedUser, authorizeRoles('admin'), customerSegmentationController.getHighValueCustomers);
router.get('/at-risk', isAuthenticatedUser, authorizeRoles('admin'), customerSegmentationController.getAtRiskCustomers);

export default router;
