import express from 'express';
const router = express.Router();
import * as productComparisonController from '../controllers/productComparisonController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

router.post('/create', productComparisonController.createComparison);
router.get('/:comparisonId', productComparisonController.getComparison);
router.post('/:comparisonId/add', productComparisonController.addProduct);
router.delete('/:comparisonId/remove/:productId', productComparisonController.removeProduct);
router.get('/user/all', isAuthenticatedUser, productComparisonController.getUserComparisons);

export default router;
