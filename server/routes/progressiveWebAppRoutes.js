import express from 'express';
const router = express.Router();
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import * as progressiveWebAppController from '../controllers/progressiveWebAppController.js';

router.get('/status', isAuthenticatedUser, progressiveWebAppController.getPWAStatus);
router.post('/session/record', isAuthenticatedUser, progressiveWebAppController.recordSession);
router.post('/push/track', isAuthenticatedUser, progressiveWebAppController.trackPushNotification);
router.post('/push/subscribe', isAuthenticatedUser, progressiveWebAppController.subscribeToPush);
router.post('/install', isAuthenticatedUser, progressiveWebAppController.markInstalled);
router.get('/retention/:userId?', isAuthenticatedUser, progressiveWebAppController.calculateRetention);
router.get('/installation-rate', isAuthenticatedUser, authorizeRoles('admin'), progressiveWebAppController.getInstallationRate);
router.get('/active-users', isAuthenticatedUser, authorizeRoles('admin'), progressiveWebAppController.getActivePWAUsers);

export default router;
