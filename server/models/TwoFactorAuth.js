import mongoose from 'mongoose';
import crypto from 'crypto';

const twoFactorAuthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  method: {
    type: String,
    enum: ['app', 'sms', 'email'],
    required: true,
  },
  secret: {
    type: String, // For TOTP (app-based 2FA)
  },
  phoneNumber: {
    type: String, // For SMS-based 2FA
  },
  isEnabled: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  backupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: Date,
  }],
  recoveryCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false,
    },
  }],
  lastUsed: {
    type: Date,
  },
  failedAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: {
    type: Date,
  },
  trustedDevices: [{
    deviceId: String,
    deviceName: String,
    browser: String,
    os: String,
    ipAddress: String,
    trustedAt: Date,
    expiresAt: Date,
  }],
}, {
  timestamps: true,
});

// Generate backup codes
twoFactorAuthSchema.methods.generateBackupCodes = function () {
  this.backupCodes = Array(10).fill(null).map(() => ({
    code: crypto.randomBytes(4).toString('hex').toUpperCase(),
    used: false,
  }));
  return this.backupCodes.map(bc => bc.code);
};

// Generate recovery codes
twoFactorAuthSchema.methods.generateRecoveryCodes = function () {
  this.recoveryCodes = Array(5).fill(null).map(() => ({
    code: crypto.randomBytes(8).toString('hex'),
    used: false,
  }));
  return this.recoveryCodes.map(rc => rc.code);
};

// Verify backup code
twoFactorAuthSchema.methods.verifyBackupCode = function (code) {
  const backupCode = this.backupCodes.find(
    bc => bc.code === code.toUpperCase() && !bc.used
  );

  if (backupCode) {
    backupCode.used = true;
    backupCode.usedAt = new Date();
    return true;
  }
  return false;
};

// Check if locked
twoFactorAuthSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > new Date();
};

// Record failed attempt
twoFactorAuthSchema.methods.recordFailedAttempt = function () {
  this.failedAttempts += 1;

  // Lock after 5 failed attempts for 15 minutes
  if (this.failedAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
};

// Reset failed attempts
twoFactorAuthSchema.methods.resetFailedAttempts = function () {
  this.failedAttempts = 0;
  this.lockedUntil = undefined;
  this.lastUsed = new Date();
};

// Add trusted device
twoFactorAuthSchema.methods.addTrustedDevice = function ({
  deviceId,
  deviceName,
  browser,
  os,
  ipAddress,
}) {
  // Remove old trusted devices (max 5)
  if (this.trustedDevices.length >= 5) {
    this.trustedDevices.shift();
  }

  this.trustedDevices.push({
    deviceId,
    deviceName,
    browser,
    os,
    ipAddress,
    trustedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });
};

// Check if device is trusted
twoFactorAuthSchema.methods.isDeviceTrusted = function (deviceId) {
  const device = this.trustedDevices.find(d => d.deviceId === deviceId);
  return device && device.expiresAt > new Date();
};

// Remove trusted device
twoFactorAuthSchema.methods.removeTrustedDevice = function (deviceId) {
  this.trustedDevices = this.trustedDevices.filter(d => d.deviceId !== deviceId);
};

// Static method to check if user has 2FA enabled
twoFactorAuthSchema.statics.isEnabled = async function (userId) {
  const twoFA = await this.findOne({ user: userId });
  return twoFA?.isEnabled && twoFA?.isVerified;
};

export default mongoose.model('TwoFactorAuth', twoFactorAuthSchema);
