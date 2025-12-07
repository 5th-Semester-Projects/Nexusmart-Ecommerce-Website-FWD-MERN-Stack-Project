import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  checkEligibility,
  applyForBNPL,
  getBNPLPlans,
  createInstallmentPlan,
  getMyInstallmentPlans,
  payInstallment,
  getAllApplications,
  updateApplicationStatus
} from '../controllers/bnplController.js';

const router = express.Router();

// User routes
router.get('/eligibility', isAuthenticatedUser, checkEligibility);
router.post('/apply', isAuthenticatedUser, applyForBNPL);
router.get('/plans', isAuthenticatedUser, getBNPLPlans);
router.post('/create-plan', isAuthenticatedUser, createInstallmentPlan);
router.get('/my-plans', isAuthenticatedUser, getMyInstallmentPlans);
router.post('/pay', isAuthenticatedUser, payInstallment);

// Admin routes
router.get('/admin/applications', isAuthenticatedUser, authorizeRoles('admin'), getAllApplications);
router.put('/admin/application/:id', isAuthenticatedUser, authorizeRoles('admin'), updateApplicationStatus);

export default router;
