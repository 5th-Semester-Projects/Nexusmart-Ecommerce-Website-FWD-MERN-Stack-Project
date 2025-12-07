import express from 'express';
import {
  searchProducts,
  getSearchById,
  createSearch,
  updateSearch,
  deleteSearch,
  getSuggestions,
  getTrendingSearches,
  getPopularFilters,
  saveSearch,
  getSearchHistory,
  getFilteredResults,
  trackClickThrough
} from '../controllers/advancedSearchFiltersController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/search')
  .get(searchProducts)
  .post(isAuthenticatedUser, createSearch);

router.route('/search/:id')
  .get(isAuthenticatedUser, getSearchById)
  .put(isAuthenticatedUser, updateSearch)
  .delete(isAuthenticatedUser, deleteSearch);

router.route('/search/suggestions')
  .get(getSuggestions);

router.route('/search/trending')
  .get(getTrendingSearches);

router.route('/search/filters/popular')
  .get(getPopularFilters);

router.route('/search/save')
  .post(isAuthenticatedUser, saveSearch);

router.route('/search/history')
  .get(isAuthenticatedUser, getSearchHistory);

router.route('/search/filtered')
  .get(getFilteredResults);

router.route('/search/track-click')
  .post(trackClickThrough);

export default router;
