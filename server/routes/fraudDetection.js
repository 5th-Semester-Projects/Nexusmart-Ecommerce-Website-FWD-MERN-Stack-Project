import express from 'express';
import * as fraudDetectionController from '../controllers/fraudDetectionController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Risk Analysis Routes
router.post('/analyze', isAuthenticatedUser, fraudDetectionController.analyzeTransactionRisk);

// Transaction Monitoring Routes
router.get('/monitor/patterns', isAuthenticatedUser, authorizeRoles('admin'), fraudDetectionController.monitorTransactionPatterns);
router.post('/monitor/alert', isAuthenticatedUser, authorizeRoles('admin'), fraudDetectionController.sendTransactionAlert);

// Chargeback Prevention Routes
router.post('/chargeback/predict', isAuthenticatedUser, fraudDetectionController.predictChargebackRisk);
router.post('/chargeback/file', isAuthenticatedUser, fraudDetectionController.fileChargeback);

// Identity Verification Routes
router.post('/verify/initiate', isAuthenticatedUser, fraudDetectionController.initiateIdentityVerification);
router.post('/verify/identity', isAuthenticatedUser, fraudDetectionController.verifyIdentity);
router.post('/verify/document', isAuthenticatedUser, fraudDetectionController.verifyDocument);

// Fraud Analytics Routes
router.get('/analytics/dashboard', isAuthenticatedUser, authorizeRoles('admin'), fraudDetectionController.getFraudDashboard);

export default router;
