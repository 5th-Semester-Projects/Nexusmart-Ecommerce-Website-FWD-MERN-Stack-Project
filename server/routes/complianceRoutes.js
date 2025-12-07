import express from 'express';
import {
  performAMLScreening,
  getAMLStatus,
  verifyAge,
  getAgeVerificationStatus,
  calculateESGScore,
  getESGScore
} from '../controllers/complianceController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// AML Screening
router.post('/aml/screen', isAuthenticatedUser, performAMLScreening);
router.get('/aml/status', isAuthenticatedUser, getAMLStatus);

// Age Verification
router.post('/age/verify', isAuthenticatedUser, verifyAge);
router.get('/age/status', isAuthenticatedUser, getAgeVerificationStatus);

// ESG Scoring
router.post('/esg/calculate', isAuthenticatedUser, authorizeRoles('admin', 'seller'), calculateESGScore);
router.get('/esg/:entityType/:entityId', getESGScore);

export default router;
