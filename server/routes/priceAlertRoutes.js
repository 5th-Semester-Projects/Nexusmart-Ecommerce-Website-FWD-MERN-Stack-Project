import express from 'express';
const router = express.Router();
import { isAuthenticatedUser } from '../middleware/auth.js';
import * as priceAlertController from '../controllers/priceAlertController.js';

router.post('/create', isAuthenticatedUser, priceAlertController.createAlert);
router.get('/me', isAuthenticatedUser, priceAlertController.getUserAlerts);
router.post('/:alertId/check', priceAlertController.checkPrice);
router.post('/:alertId/cancel', isAuthenticatedUser, priceAlertController.cancelAlert);
router.post('/:alertId/pause', isAuthenticatedUser, priceAlertController.pauseAlert);
router.post('/:alertId/resume', isAuthenticatedUser, priceAlertController.resumeAlert);
router.get('/to-check', priceAlertController.getAlertsToCheck);

export default router;
