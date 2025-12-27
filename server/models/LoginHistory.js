import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  device: {
    type: String, // 'desktop', 'mobile', 'tablet'
    default: 'unknown',
  },
  browser: {
    type: String,
  },
  os: {
    type: String,
  },
  location: {
    country: String,
    city: String,
    region: String,
  },
  loginMethod: {
    type: String,
    enum: ['password', 'google', 'facebook', 'token', '2fa'],
    default: 'password',
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'blocked', '2fa_required'],
    default: 'success',
  },
  failureReason: {
    type: String,
  },
  sessionId: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  loggedOutAt: {
    type: Date,
  },
  isTrusted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
loginHistorySchema.index({ user: 1, createdAt: -1 });
loginHistorySchema.index({ user: 1, isActive: 1 });

// Static method to log a login attempt
loginHistorySchema.statics.logLogin = async function ({
  userId,
  ipAddress,
  userAgent,
  loginMethod,
  status,
  failureReason,
  sessionId,
}) {
  // Parse user agent for device info
  const deviceInfo = parseUserAgent(userAgent);

  return this.create({
    user: userId,
    ipAddress,
    userAgent,
    device: deviceInfo.device,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    loginMethod,
    status,
    failureReason,
    sessionId,
    isActive: status === 'success',
  });
};

// Static method to get active sessions
loginHistorySchema.statics.getActiveSessions = async function (userId) {
  return this.find({
    user: userId,
    isActive: true,
    status: 'success',
  }).sort({ createdAt: -1 });
};

// Static method to terminate session
loginHistorySchema.statics.terminateSession = async function (userId, sessionId) {
  return this.findOneAndUpdate(
    { user: userId, sessionId },
    { isActive: false, loggedOutAt: new Date() },
    { new: true }
  );
};

// Static method to terminate all sessions except current
loginHistorySchema.statics.terminateAllSessions = async function (userId, currentSessionId) {
  return this.updateMany(
    { user: userId, sessionId: { $ne: currentSessionId }, isActive: true },
    { isActive: false, loggedOutAt: new Date() }
  );
};

// Static method to check for suspicious activity
loginHistorySchema.statics.checkSuspiciousActivity = async function (userId, ipAddress) {
  const recentLogins = await this.find({
    user: userId,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  }).sort({ createdAt: -1 });

  // Check for multiple failed attempts
  const failedAttempts = recentLogins.filter(l => l.status === 'failed').length;

  // Check for logins from different IPs
  const uniqueIps = [...new Set(recentLogins.map(l => l.ipAddress))];

  // Check if this IP is known
  const knownIp = recentLogins.some(l => l.ipAddress === ipAddress && l.status === 'success');

  return {
    isSuspicious: failedAttempts >= 5 || (uniqueIps.length > 5 && !knownIp),
    failedAttempts,
    uniqueIpCount: uniqueIps.length,
    isNewIp: !knownIp,
  };
};

// Helper function to parse user agent
function parseUserAgent(userAgent) {
  if (!userAgent) {
    return { device: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  // Simple parsing - in production use a library like ua-parser-js
  const ua = userAgent.toLowerCase();

  let device = 'desktop';
  if (ua.includes('mobile') || ua.includes('android')) device = 'mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) device = 'tablet';

  let browser = 'unknown';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  let os = 'unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'MacOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  return { device, browser, os };
}

export default mongoose.model('LoginHistory', loginHistorySchema);
