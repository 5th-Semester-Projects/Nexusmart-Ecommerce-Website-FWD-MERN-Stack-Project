import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryTree,
  getCategory,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getFeaturedCategories,
  reorderCategories,
} from '../controllers/categoryController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.route('/').get(getAllCategories);
router.route('/tree').get(getCategoryTree);
router.route('/featured').get(getFeaturedCategories);
router.route('/slug/:slug').get(getCategoryBySlug);
router.route('/:id').get(getCategory);

// Admin routes
router
  .route('/')
  .post(
    isAuthenticatedUser,
    authorizeRoles('admin'),
    uploadSingleImage,
    createCategory
  );

router
  .route('/:id')
  .put(
    isAuthenticatedUser,
    authorizeRoles('admin'),
    uploadSingleImage,
    updateCategory
  )
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCategory);

router
  .route('/admin/reorder')
  .put(isAuthenticatedUser, authorizeRoles('admin'), reorderCategories);

export default router;
