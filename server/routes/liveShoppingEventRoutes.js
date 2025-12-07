import express from 'express';
const router = express.Router();
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import * as liveShoppingEventController from '../controllers/liveShoppingEventController.js';

router.post('/create', isAuthenticatedUser, authorizeRoles('admin', 'vendor', 'influencer'), liveShoppingEventController.createEvent);
router.get('/upcoming', liveShoppingEventController.getUpcomingEvents);
router.get('/live', liveShoppingEventController.getLiveEvents);
router.get('/:slug', liveShoppingEventController.getEvent);
router.post('/:slug/start', isAuthenticatedUser, liveShoppingEventController.startStream);
router.post('/:slug/end', isAuthenticatedUser, liveShoppingEventController.endStream);
router.post('/:slug/viewers', liveShoppingEventController.updateViewerCount);

export default router;
