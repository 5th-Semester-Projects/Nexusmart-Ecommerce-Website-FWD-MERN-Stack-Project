import express from 'express';
import {
  generateProductImages,
  getProductGeneratedImages,
  approveGeneratedImage,
  regenerateImages,
  getAllImageGenerations
} from '../controllers/imageGenerationController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate/:productId', isAuthenticatedUser, authorizeRoles('admin', 'seller'), generateProductImages);
router.get('/product/:productId', getProductGeneratedImages);
router.put('/approve', isAuthenticatedUser, authorizeRoles('admin', 'seller'), approveGeneratedImage);
router.post('/regenerate/:imageGenerationId', isAuthenticatedUser, authorizeRoles('admin', 'seller'), regenerateImages);
router.get('/all', isAuthenticatedUser, authorizeRoles('admin'), getAllImageGenerations);

export default router;
