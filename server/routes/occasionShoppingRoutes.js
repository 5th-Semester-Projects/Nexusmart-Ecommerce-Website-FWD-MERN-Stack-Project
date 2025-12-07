import express from 'express';
import {
  createOccasionPlan,
  getUserOccasionPlans,
  updateOccasionPlan,
  addProductToOccasion,
  setOccasionReminder,
  shareOccasionPlan
} from '../controllers/occasionShoppingController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', isAuthenticatedUser, createOccasionPlan);
router.get('/my-plans', isAuthenticatedUser, getUserOccasionPlans);
router.put('/:id', isAuthenticatedUser, updateOccasionPlan);
router.post('/:id/add-product', isAuthenticatedUser, addProductToOccasion);
router.post('/:id/reminder', isAuthenticatedUser, setOccasionReminder);
router.post('/:id/share', isAuthenticatedUser, shareOccasionPlan);

export default router;
