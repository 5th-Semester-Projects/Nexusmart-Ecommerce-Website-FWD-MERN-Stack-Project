import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  getAllARProducts,
  getARProduct,
  createARConfiguration,
  updateARConfiguration,
  deleteARConfiguration,
  startARSession,
  trackARAction,
  endARSession,
  upload3DModel,
  getARAnalytics,
  getTopPerformingAR,
  submitARFeedback
} from '../controllers/arTryOnController.js';

const router = express.Router();

router.route('/ar/products').get(getAllARProducts);
router.route('/ar/products/:productId').get(getARProduct);
router.route('/ar/top-performing').get(getTopPerformingAR);

router.route('/ar/config/new')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), createARConfiguration);

router.route('/ar/config/:id')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateARConfiguration)
  .delete(isAuthenticatedUser, authorizeRoles('seller', 'admin'), deleteARConfiguration);

router.route('/ar/session/start').post(isAuthenticatedUser, startARSession);
router.route('/ar/session/track').post(isAuthenticatedUser, trackARAction);
router.route('/ar/session/end').post(isAuthenticatedUser, endARSession);

router.route('/ar/model/upload')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), upload3DModel);

router.route('/ar/analytics/:productId')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getARAnalytics);

router.route('/ar/feedback').post(isAuthenticatedUser, submitARFeedback);

export default router;
