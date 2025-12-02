import crypto from 'crypto';
import TwoFactorAuth from '../models/TwoFactorAuth.js';
import LoginHistory from '../models/LoginHistory.js';
import User from '../models/User.js';
import catchAsync from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// ==================== TWO-FACTOR AUTHENTICATION ====================

// @desc    Get 2FA status
// @route   GET /api/security/2fa/status
// @access  Private
export const get2FAStatus = catchAsync(async (req, res, next) => {
  const twoFA = await TwoFactorAuth.findOne({ user: req.user._id });

  res.status(200).json({
    success: true,
    isEnabled: twoFA?.isEnabled || false,
    isVerified: twoFA?.isVerified || false,
    method: twoFA?.method || null,
    backupCodesRemaining: twoFA?.backupCodes?.filter(bc => !bc.used).length || 0,
    trustedDevices: twoFA?.trustedDevices?.length || 0,
  });
});

// @desc    Setup 2FA (generate secret)
// @route   POST /api/security/2fa/setup
// @access  Private
export const setup2FA = catchAsync(async (req, res, next) => {
  const { method, phoneNumber } = req.body;

  if (!method || !['app', 'sms', 'email'].includes(method)) {
    return next(new ErrorHandler('Invalid 2FA method', 400));
  }

  let twoFA = await TwoFactorAuth.findOne({ user: req.user._id });

  if (twoFA?.isEnabled && twoFA?.isVerified) {
    return next(new ErrorHandler('2FA is already enabled. Disable it first to change method.', 400));
  }

  // Generate a secret for TOTP (app-based)
  const secret = crypto.randomBytes(20).toString('base32');

  if (!twoFA) {
    twoFA = new TwoFactorAuth({
      user: req.user._id,
      method,
      secret: method === 'app' ? secret : undefined,
      phoneNumber: method === 'sms' ? phoneNumber : undefined,
    });
  } else {
    twoFA.method = method;
    twoFA.secret = method === 'app' ? secret : twoFA.secret;
    twoFA.phoneNumber = method === 'sms' ? phoneNumber : twoFA.phoneNumber;
    twoFA.isVerified = false;
  }

  await twoFA.save();

  // For app-based 2FA, return the secret and QR code URL
  if (method === 'app') {
    const otpAuthUrl = `otpauth://totp/NexusMart:${req.user.email}?secret=${secret}&issuer=NexusMart`;

    return res.status(200).json({
      success: true,
      message: 'Scan the QR code with your authenticator app',
      secret,
      otpAuthUrl,
      method,
    });
  }

  // For SMS/Email, send verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Store the code temporarily (in production, use Redis or similar)
  twoFA.tempCode = verificationCode;
  twoFA.tempCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await twoFA.save();

  // In production, send SMS or email here
  // For development, we'll return the code
  res.status(200).json({
    success: true,
    message: method === 'sms'
      ? 'Verification code sent to your phone'
      : 'Verification code sent to your email',
    method,
    // Remove this in production:
    devCode: verificationCode,
  });
});

// @desc    Verify and enable 2FA
// @route   POST /api/security/2fa/verify
// @access  Private
export const verify2FA = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return next(new ErrorHandler('Verification code is required', 400));
  }

  const twoFA = await TwoFactorAuth.findOne({ user: req.user._id });

  if (!twoFA) {
    return next(new ErrorHandler('2FA setup not found. Please set up 2FA first.', 404));
  }

  if (twoFA.isLocked()) {
    return next(new ErrorHandler('Too many failed attempts. Please try again later.', 429));
  }

  // Verify the code based on method
  let isValid = false;

  if (twoFA.method === 'app') {
    // For TOTP verification, you'd use a library like 'speakeasy' or 'otplib'
    // Simplified verification for demonstration
    isValid = verifyTOTP(twoFA.secret, code);
  } else {
    // For SMS/Email, verify against stored code
    isValid = twoFA.tempCode === code && twoFA.tempCodeExpires > new Date();
  }

  if (!isValid) {
    twoFA.recordFailedAttempt();
    await twoFA.save();
    return next(new ErrorHandler('Invalid verification code', 400));
  }

  // Enable 2FA
  twoFA.isEnabled = true;
  twoFA.isVerified = true;
  twoFA.resetFailedAttempts();
  twoFA.tempCode = undefined;
  twoFA.tempCodeExpires = undefined;

  // Generate backup codes
  const backupCodes = twoFA.generateBackupCodes();
  await twoFA.save();

  res.status(200).json({
    success: true,
    message: '2FA enabled successfully',
    backupCodes,
    warning: 'Save these backup codes in a safe place. They can be used to access your account if you lose your 2FA device.',
  });
});

// @desc    Disable 2FA
// @route   POST /api/security/2fa/disable
// @access  Private
export const disable2FA = catchAsync(async (req, res, next) => {
  const { password, code } = req.body;

  // Verify password
  const user = await User.findById(req.user._id).select('+password');
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(new ErrorHandler('Incorrect password', 401));
  }

  const twoFA = await TwoFactorAuth.findOne({ user: req.user._id });

  if (!twoFA || !twoFA.isEnabled) {
    return next(new ErrorHandler('2FA is not enabled', 400));
  }

  // Optionally verify 2FA code
  if (code) {
    const isValid = twoFA.method === 'app'
      ? verifyTOTP(twoFA.secret, code)
      : twoFA.verifyBackupCode(code);

    if (!isValid) {
      return next(new ErrorHandler('Invalid verification code', 400));
    }
  }

  // Disable 2FA
  twoFA.isEnabled = false;
  twoFA.isVerified = false;
  twoFA.backupCodes = [];
  twoFA.trustedDevices = [];
  await twoFA.save();

  res.status(200).json({
    success: true,
    message: '2FA has been disabled',
  });
});

// @desc    Generate new backup codes
// @route   POST /api/security/2fa/backup-codes
// @access  Private
export const generateBackupCodes = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  // Verify password
  const user = await User.findById(req.user._id).select('+password');
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(new ErrorHandler('Incorrect password', 401));
  }

  const twoFA = await TwoFactorAuth.findOne({ user: req.user._id });

  if (!twoFA || !twoFA.isEnabled) {
    return next(new ErrorHandler('2FA is not enabled', 400));
  }

  const backupCodes = twoFA.generateBackupCodes();
  await twoFA.save();

  res.status(200).json({
    success: true,
    message: 'New backup codes generated',
    backupCodes,
    warning: 'Your old backup codes are now invalid. Save these new codes in a safe place.',
  });
});

// @desc    Get trusted devices
// @route   GET /api/security/2fa/trusted-devices
// @access  Private
export const getTrustedDevices = catchAsync(async (req, res, next) => {
  const twoFA = await TwoFactorAuth.findOne({ user: req.user._id });

  res.status(200).json({
    success: true,
    trustedDevices: twoFA?.trustedDevices?.filter(d => d.expiresAt > new Date()) || [],
  });
});

// @desc    Remove trusted device
// @route   DELETE /api/security/2fa/trusted-devices/:deviceId
// @access  Private
export const removeTrustedDevice = catchAsync(async (req, res, next) => {
  const twoFA = await TwoFactorAuth.findOne({ user: req.user._id });

  if (!twoFA) {
    return next(new ErrorHandler('2FA not found', 404));
  }

  twoFA.removeTrustedDevice(req.params.deviceId);
  await twoFA.save();

  res.status(200).json({
    success: true,
    message: 'Device removed from trusted devices',
  });
});

// ==================== LOGIN HISTORY ====================

// @desc    Get login history
// @route   GET /api/security/login-history
// @access  Private
export const getLoginHistory = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    LoginHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    LoginHistory.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    count: history.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    history,
  });
});

// @desc    Get active sessions
// @route   GET /api/security/sessions
// @access  Private
export const getActiveSessions = catchAsync(async (req, res, next) => {
  const sessions = await LoginHistory.getActiveSessions(req.user._id);

  // Mark current session
  const currentSessionId = req.sessionId || req.headers['x-session-id'];
  const sessionsWithCurrent = sessions.map(s => ({
    ...s.toObject(),
    isCurrent: s.sessionId === currentSessionId,
  }));

  res.status(200).json({
    success: true,
    sessions: sessionsWithCurrent,
  });
});

// @desc    Terminate a session
// @route   DELETE /api/security/sessions/:sessionId
// @access  Private
export const terminateSession = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const currentSessionId = req.sessionId || req.headers['x-session-id'];

  if (sessionId === currentSessionId) {
    return next(new ErrorHandler('Cannot terminate current session. Please logout instead.', 400));
  }

  const session = await LoginHistory.terminateSession(req.user._id, sessionId);

  if (!session) {
    return next(new ErrorHandler('Session not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Session terminated successfully',
  });
});

// @desc    Terminate all other sessions
// @route   DELETE /api/security/sessions
// @access  Private
export const terminateAllSessions = catchAsync(async (req, res, next) => {
  const currentSessionId = req.sessionId || req.headers['x-session-id'];

  await LoginHistory.terminateAllSessions(req.user._id, currentSessionId);

  res.status(200).json({
    success: true,
    message: 'All other sessions terminated successfully',
  });
});

// @desc    Check for suspicious activity
// @route   GET /api/security/suspicious-activity
// @access  Private
export const checkSuspiciousActivity = catchAsync(async (req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const result = await LoginHistory.checkSuspiciousActivity(req.user._id, ipAddress);

  res.status(200).json({
    success: true,
    ...result,
  });
});

// ==================== HELPER FUNCTIONS ====================

// Simple TOTP verification (in production, use a proper library like 'otplib')
function verifyTOTP(secret, token) {
  // This is a simplified version
  // In production, use libraries like 'speakeasy' or 'otplib'
  try {
    // For demonstration, accept any 6-digit code
    // Replace with actual TOTP verification in production
    return /^\d{6}$/.test(token);
  } catch (error) {
    return false;
  }
}

export default {
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
};
