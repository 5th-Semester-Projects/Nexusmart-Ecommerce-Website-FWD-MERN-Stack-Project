import express from 'express';
import * as fraudDetectionController from '../controllers/fraudDetectionController.js';
import { authenticate, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Risk Analysis Routes
router.post('/analyze', authenticate, fraudDetectionController.analyzeTransactionRisk);

// Transaction Monitoring Routes
router.get('/monitor/patterns', adminAuth, fraudDetectionController.monitorTransactionPatterns);
router.post('/monitor/alert', adminAuth, fraudDetectionController.sendTransactionAlert);

// Chargeback Prevention Routes
router.post('/chargeback/predict', authenticate, fraudDetectionController.predictChargebackRisk);
router.post('/chargeback/file', authenticate, fraudDetectionController.fileChargeback);

// Identity Verification Routes
router.post('/verify/initiate', authenticate, fraudDetectionController.initiateIdentityVerification);
router.post('/verify/identity', authenticate, fraudDetectionController.verifyIdentity);
router.post('/verify/document', authenticate, fraudDetectionController.verifyDocument);

// Fraud Analytics Routes
router.get('/analytics/dashboard', adminAuth, fraudDetectionController.getFraudDashboard);

export default router;
