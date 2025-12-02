import express from 'express';
import {
  get2FAStatus,
  setup2FA,
  verify2FA,
  disable2FA,
  generateBackupCodes,
  getTrustedDevices,
  removeTrustedDevice,
  getLoginHistory,
  getActiveSessions,
  terminateSession,
  terminateAllSessions,
  checkSuspiciousActivity,
} from '../controllers/securityController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// ==================== 2FA ROUTES ====================
router.get('/2fa/status', isAuthenticatedUser, get2FAStatus);
router.post('/2fa/setup', isAuthenticatedUser, setup2FA);
router.post('/2fa/verify', isAuthenticatedUser, verify2FA);
router.post('/2fa/disable', isAuthenticatedUser, disable2FA);
router.post('/2fa/backup-codes', isAuthenticatedUser, generateBackupCodes);
router.get('/2fa/trusted-devices', isAuthenticatedUser, getTrustedDevices);
router.delete('/2fa/trusted-devices/:deviceId', isAuthenticatedUser, removeTrustedDevice);

// ==================== LOGIN HISTORY & SESSIONS ROUTES ====================
router.get('/login-history', isAuthenticatedUser, getLoginHistory);
router.get('/sessions', isAuthenticatedUser, getActiveSessions);
router.delete('/sessions', isAuthenticatedUser, terminateAllSessions);
router.delete('/sessions/:sessionId', isAuthenticatedUser, terminateSession);
router.get('/suspicious-activity', isAuthenticatedUser, checkSuspiciousActivity);

export default router;
