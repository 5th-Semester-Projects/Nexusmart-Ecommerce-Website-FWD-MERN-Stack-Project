import express from 'express';
import {
  generateFingerprint,
  checkDeviceRisk,
  getUserDevices,
  startSessionRecording,
  recordSessionEvent,
  endSessionRecording,
  getSessionHeatmap,
  createBlockchainIdentity,
  verifyIdentity,
  addCredential,
  linkExternalAccount
} from '../controllers/securityFeaturesController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// Device Fingerprinting
router.post('/fingerprint/generate', isAuthenticatedUser, generateFingerprint);
router.get('/fingerprint/:fingerprintId/risk', isAuthenticatedUser, checkDeviceRisk);
router.get('/fingerprint/devices', isAuthenticatedUser, getUserDevices);

// Session Recording
router.post('/session/start', isAuthenticatedUser, startSessionRecording);
router.post('/session/:recordingId/events', isAuthenticatedUser, recordSessionEvent);
router.post('/session/:recordingId/end', isAuthenticatedUser, endSessionRecording);
router.get('/session/heatmap', getSessionHeatmap);

// Blockchain Identity
router.post('/blockchain/create', isAuthenticatedUser, createBlockchainIdentity);
router.post('/blockchain/verify', isAuthenticatedUser, verifyIdentity);
router.post('/blockchain/credential', isAuthenticatedUser, addCredential);
router.post('/blockchain/link', isAuthenticatedUser, linkExternalAccount);

export default router;
