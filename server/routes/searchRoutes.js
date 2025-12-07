import express from 'express';
import {
  performVisualSearch,
  getVisualSearchHistory,
  naturalLanguageSearch,
  getSearchSuggestions,
  trackSearchAnalytics
} from '../controllers/searchController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// Visual Search
router.post('/visual', isAuthenticatedUser, performVisualSearch);
router.get('/visual/history', isAuthenticatedUser, getVisualSearchHistory);

// Natural Language Search
router.post('/natural-language', naturalLanguageSearch);

// Autocomplete
router.get('/suggestions', getSearchSuggestions);

// Analytics
router.post('/analytics/track', trackSearchAnalytics);

export default router;
