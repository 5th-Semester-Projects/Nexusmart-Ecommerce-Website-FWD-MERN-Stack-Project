import express from 'express';
import {
  getAllBundles,
  getBundleById,
  createBundle,
  updateBundle,
  deleteBundle,
  addItemToBundle,
  removeItemFromBundle,
  calculateBundlePrice,
  checkBundleAvailability,
  validateBundle,
  getPopularBundles,
  getFeaturedBundles,
  updateBundleInventory,
  getBundlePerformance,
  trackBundleInteraction,
  getBundleRecommendations,
  createCustomBundle
} from '../controllers/productBundleKitController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/bundles')
  .get(getAllBundles)
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), createBundle);

router.route('/bundles/popular')
  .get(getPopularBundles);

router.route('/bundles/featured')
  .get(getFeaturedBundles);

router.route('/bundles/custom')
  .post(isAuthenticatedUser, createCustomBundle);

router.route('/bundles/:id')
  .get(getBundleById)
  .put(isAuthenticatedUser, authorizeRoles('admin', 'seller'), updateBundle)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteBundle);

router.route('/bundles/:id/items')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), addItemToBundle);

router.route('/bundles/:id/items/:productId')
  .delete(isAuthenticatedUser, authorizeRoles('admin', 'seller'), removeItemFromBundle);

router.route('/bundles/:id/calculate-price')
  .post(calculateBundlePrice);

router.route('/bundles/:id/availability')
  .get(checkBundleAvailability);

router.route('/bundles/:id/validate')
  .post(validateBundle);

router.route('/bundles/:id/inventory')
  .put(isAuthenticatedUser, authorizeRoles('admin', 'seller'), updateBundleInventory);

router.route('/bundles/:id/performance')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getBundlePerformance);

router.route('/bundles/:id/track')
  .post(trackBundleInteraction);

router.route('/bundles/:id/recommendations')
  .get(getBundleRecommendations);

export default router;
