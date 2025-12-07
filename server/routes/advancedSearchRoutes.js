import express from 'express';
const router = express.Router();
import * as advancedSearchController from '../controllers/advancedSearchController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

router.post('/search', advancedSearchController.search);
router.post('/:searchId/interaction', advancedSearchController.trackInteraction);
router.get('/history', isAuthenticatedUser, advancedSearchController.getSearchHistory);
router.get('/popular', advancedSearchController.getPopularSearches);

export default router;
