import express from 'express';
import {
  enableGestureControl,
  recordGestureSession,
  installPWA,
  syncOfflineData,
  updateAccessibilityPreferences,
  getAccessibilityPreferences,
  createARSession,
  saveARCapture,
  processVoiceCommand
} from '../controllers/customerExperienceController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// Gesture Control
router.post('/gesture/enable', isAuthenticatedUser, enableGestureControl);
router.post('/gesture/session', isAuthenticatedUser, recordGestureSession);

// PWA
router.post('/pwa/install', isAuthenticatedUser, installPWA);
router.post('/pwa/sync', isAuthenticatedUser, syncOfflineData);

// Accessibility
router.put('/accessibility/preferences', isAuthenticatedUser, updateAccessibilityPreferences);
router.get('/accessibility/preferences', isAuthenticatedUser, getAccessibilityPreferences);

// AR Virtual Try-On
router.post('/ar/session', isAuthenticatedUser, createARSession);
router.post('/ar/capture', isAuthenticatedUser, saveARCapture);

// Voice Shopping
router.post('/voice/command', isAuthenticatedUser, processVoiceCommand);

export default router;
