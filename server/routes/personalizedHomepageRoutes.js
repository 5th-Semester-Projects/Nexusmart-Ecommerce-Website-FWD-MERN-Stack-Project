import express from 'express';
const router = express.Router();
import { isAuthenticatedUser } from '../middleware/auth.js';
import * as personalizedHomepageController from '../controllers/personalizedHomepageController.js';

router.get('/me', isAuthenticatedUser, personalizedHomepageController.getUserHomepage);
router.put('/layout', isAuthenticatedUser, personalizedHomepageController.updateLayout);
router.put('/preferences', isAuthenticatedUser, personalizedHomepageController.updatePreferences);
router.post('/refresh', isAuthenticatedUser, personalizedHomepageController.refreshRecommendations);
router.post('/interaction', isAuthenticatedUser, personalizedHomepageController.trackInteraction);

export default router;
