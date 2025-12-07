import express from 'express';
import {
  autoCategorizProduct,
  getProductCategorization,
  batchCategorizeProducts,
  reviewCategorization
} from '../controllers/productCategorizationController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/categorize/:productId', isAuthenticatedUser, authorizeRoles('admin', 'seller'), autoCategorizProduct);
router.get('/categorization/:productId', getProductCategorization);
router.post('/batch-categorize', isAuthenticatedUser, authorizeRoles('admin'), batchCategorizeProducts);
router.put('/review/:productId', isAuthenticatedUser, authorizeRoles('admin'), reviewCategorization);

export default router;
