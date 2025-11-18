import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getTrendingProducts,
  getNewArrivals,
  getSimilarProducts,
  searchProducts,
  getRecommendations,
  getProductStats,
} from '../controllers/productController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { uploadProductMedia } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/trending', getTrendingProducts);
router.get('/new-arrivals', getNewArrivals);
router.post('/search', searchProducts);
router.get('/:id', getProductById);
router.get('/:id/similar', getSimilarProducts);

// Protected routes
router.get(
  '/recommendations',
  isAuthenticatedUser,
  getRecommendations
);

// Admin/Seller routes
router.post(
  '/',
  isAuthenticatedUser,
  authorizeRoles('admin', 'seller'),
  uploadProductMedia,
  createProduct
);

router.put(
  '/:id',
  isAuthenticatedUser,
  authorizeRoles('admin', 'seller'),
  uploadProductMedia,
  updateProduct
);

router.delete(
  '/:id',
  isAuthenticatedUser,
  authorizeRoles('admin', 'seller'),
  deleteProduct
);

// Admin only routes
router.get(
  '/admin/stats',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  getProductStats
);

export default router;
