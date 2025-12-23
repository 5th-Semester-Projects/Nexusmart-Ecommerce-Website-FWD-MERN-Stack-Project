import express from 'express';
import {
  performSearch,
  getAutocompleteSuggestions,
  getTrendingSearches,
  getSearchHistory,
  trackSearchClick,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch,
  getPopularFilters,
  getSearchAnalytics
} from '../controllers/advancedSearchFiltersController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/search')
  .get(performSearch);

router.route('/search/suggestions')
  .get(getAutocompleteSuggestions);

router.route('/search/trending')
  .get(getTrendingSearches);

router.route('/search/filters/popular')
  .get(getPopularFilters);

router.route('/search/save')
  .post(isAuthenticatedUser, saveSearch);

router.route('/search/saved')
  .get(isAuthenticatedUser, getSavedSearches);

router.route('/search/saved/:id')
  .delete(isAuthenticatedUser, deleteSavedSearch);

router.route('/search/history')
  .get(isAuthenticatedUser, getSearchHistory);

router.route('/search/track-click')
  .post(trackSearchClick);

router.route('/search/analytics')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getSearchAnalytics);

export default router;
