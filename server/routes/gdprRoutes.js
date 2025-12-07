import express from 'express';
import {
  exportUserData,
  downloadExportedData,
  requestAccountDeletion,
  cancelAccountDeletion,
  deleteAccountNow,
  getConsentPreferences,
  updateConsentPreferences,
  getPrivacyReport,
  requestDataRectification,
  optOutProcessing
} from '../controllers/gdprController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

/**
 * GDPR & Privacy Routes
 * Handles data export, deletion, consent management
 */

// Data Export (Right to Data Portability)
router.get('/export', isAuthenticated, exportUserData);
router.get('/export/download', isAuthenticated, downloadExportedData);

// Account Deletion (Right to Erasure)
router.post('/delete-request', isAuthenticated, requestAccountDeletion);
router.post('/delete-cancel', isAuthenticated, cancelAccountDeletion);
router.post('/delete-now', isAuthenticated, deleteAccountNow);

// Consent Management
router.get('/consents', isAuthenticated, getConsentPreferences);
router.put('/consents', isAuthenticated, updateConsentPreferences);

// Privacy Report
router.get('/privacy-report', isAuthenticated, getPrivacyReport);

// Data Rectification (Right to Rectification)
router.post('/rectification', isAuthenticated, requestDataRectification);

// Opt-out (Right to Object)
router.post('/opt-out', isAuthenticated, optOutProcessing);

export default router;
