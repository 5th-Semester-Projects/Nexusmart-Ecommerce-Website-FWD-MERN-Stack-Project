import express from 'express';
const router = express.Router();
import { isAuthenticatedUser } from '../middleware/auth.js';
import * as orderTrackingController from '../controllers/orderTrackingController.js';

router.post('/create', isAuthenticatedUser, orderTrackingController.createTracking);
router.get('/:trackingNumber', orderTrackingController.getTracking);
router.put('/:trackingNumber/status', isAuthenticatedUser, orderTrackingController.updateStatus);
router.post('/:trackingNumber/issue', isAuthenticatedUser, orderTrackingController.reportIssue);
router.get('/deliveries/today', isAuthenticatedUser, orderTrackingController.getDeliveriesToday);

export default router;
