import DeviceFingerprinting from '../models/DeviceFingerprinting.js';
import SessionRecording from '../models/SessionRecording.js';
import BlockchainIdentity from '../models/BlockchainIdentity.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import crypto from 'crypto';

// Device Fingerprinting Controllers

export const generateFingerprint = catchAsyncErrors(async (req, res, next) => {
  const { deviceInfo } = req.body;

  // Generate unique device fingerprint hash
  const fingerprintData = JSON.stringify(deviceInfo);
  const hash = crypto.createHash('sha256').update(fingerprintData).digest('hex');

  let fingerprint = await DeviceFingerprinting.findOne({
    user: req.user.id,
    fingerprintHash: hash
  });

  if (!fingerprint) {
    // New device detected
    fingerprint = await DeviceFingerprinting.create({
      user: req.user.id,
      fingerprintHash: hash,
      deviceCharacteristics: deviceInfo,
      riskAssessment: {
        score: calculateRiskScore(deviceInfo),
        level: 'low',
        factors: []
      },
      sessions: [{
        sessionId: req.sessionID || 'session_' + Date.now(),
        startTime: Date.now(),
        ipAddress: req.ip,
        location: deviceInfo.location || {}
      }]
    });
  } else {
    // Known device - update session
    fingerprint.sessions.push({
      sessionId: req.sessionID || 'session_' + Date.now(),
      startTime: Date.now(),
      ipAddress: req.ip,
      location: deviceInfo.location || {}
    });
    fingerprint.lastSeen = Date.now();
    await fingerprint.save();
  }

  res.status(200).json({
    success: true,
    data: {
      fingerprintId: fingerprint._id,
      isKnownDevice: fingerprint.sessions.length > 1,
      riskLevel: fingerprint.riskAssessment.level
    }
  });
});

export const checkDeviceRisk = catchAsyncErrors(async (req, res, next) => {
  const { fingerprintId } = req.params;

  const fingerprint = await DeviceFingerprinting.findById(fingerprintId);

  if (!fingerprint) {
    return next(new ErrorHandler('Device fingerprint not found', 404));
  }

  // Perform anomaly detection
  const anomalies = detectAnomalies(fingerprint);

  if (anomalies.length > 0) {
    fingerprint.riskAssessment.score += 20;
    fingerprint.riskAssessment.level = 'high';
    fingerprint.riskAssessment.factors.push(...anomalies);
    await fingerprint.save();
  }

  res.status(200).json({
    success: true,
    data: {
      riskLevel: fingerprint.riskAssessment.level,
      riskScore: fingerprint.riskAssessment.score,
      anomalies
    }
  });
});

export const getUserDevices = catchAsyncErrors(async (req, res, next) => {
  const devices = await DeviceFingerprinting.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: devices.length,
    data: devices
  });
});

// Session Recording Controllers

export const startSessionRecording = catchAsyncErrors(async (req, res, next) => {
  const { consent, metadata } = req.body;

  if (!consent) {
    return next(new ErrorHandler('User consent required for session recording', 400));
  }

  const session = await SessionRecording.create({
    user: req.user.id,
    sessionId: req.sessionID || 'session_' + Date.now(),
    startTime: Date.now(),
    consent: true,
    metadata: {
      page: metadata.page || 'homepage',
      device: metadata.device || 'desktop',
      browser: metadata.browser || 'chrome',
      screenResolution: metadata.screenResolution || '1920x1080'
    },
    events: []
  });

  res.status(201).json({
    success: true,
    data: {
      recordingId: session._id,
      sessionId: session.sessionId
    }
  });
});

export const recordSessionEvent = catchAsyncErrors(async (req, res, next) => {
  const { recordingId } = req.params;
  const { events } = req.body;

  const session = await SessionRecording.findById(recordingId);

  if (!session) {
    return next(new ErrorHandler('Session recording not found', 404));
  }

  // Add events to session
  events.forEach(event => {
    session.events.push({
      type: event.type,
      timestamp: event.timestamp || Date.now(),
      data: event.data
    });
  });

  await session.save();

  res.status(200).json({
    success: true,
    message: 'Events recorded'
  });
});

export const endSessionRecording = catchAsyncErrors(async (req, res, next) => {
  const { recordingId } = req.params;

  const session = await SessionRecording.findById(recordingId);

  if (!session) {
    return next(new ErrorHandler('Session recording not found', 404));
  }

  session.endTime = Date.now();
  session.duration = session.endTime - session.startTime;

  // Generate analytics
  session.analytics = generateSessionAnalytics(session);

  await session.save();

  res.status(200).json({
    success: true,
    data: session
  });
});

export const getSessionHeatmap = catchAsyncErrors(async (req, res, next) => {
  const { page } = req.query;

  const sessions = await SessionRecording.find({
    'metadata.page': page,
    consent: true
  }).limit(100);

  const heatmapData = generateHeatmapData(sessions);

  res.status(200).json({
    success: true,
    data: heatmapData
  });
});

// Blockchain Identity Controllers

export const createBlockchainIdentity = catchAsyncErrors(async (req, res, next) => {
  const { blockchainAddress, did } = req.body;

  // Check if identity already exists
  let identity = await BlockchainIdentity.findOne({ user: req.user.id });

  if (identity) {
    return next(new ErrorHandler('Blockchain identity already exists', 400));
  }

  identity = await BlockchainIdentity.create({
    user: req.user.id,
    blockchainAddress,
    did: did || `did:ethr:${blockchainAddress}`,
    verifications: [],
    credentials: []
  });

  res.status(201).json({
    success: true,
    data: identity
  });
});

export const verifyIdentity = catchAsyncErrors(async (req, res, next) => {
  const { verificationType, proof } = req.body;

  const identity = await BlockchainIdentity.findOne({ user: req.user.id });

  if (!identity) {
    return next(new ErrorHandler('Blockchain identity not found', 404));
  }

  // Add verification
  identity.verifications.push({
    type: verificationType,
    verifier: 'TrustedVerifier',
    proof,
    verifiedAt: Date.now(),
    status: 'verified'
  });

  await identity.save();

  res.status(200).json({
    success: true,
    data: identity
  });
});

export const addCredential = catchAsyncErrors(async (req, res, next) => {
  const { credentialType, issuer, claim } = req.body;

  const identity = await BlockchainIdentity.findOne({ user: req.user.id });

  if (!identity) {
    return next(new ErrorHandler('Blockchain identity not found', 404));
  }

  identity.credentials.push({
    type: credentialType,
    issuer,
    issuedAt: Date.now(),
    claim,
    proof: generateProof(claim)
  });

  await identity.save();

  res.status(200).json({
    success: true,
    data: identity
  });
});

export const linkExternalAccount = catchAsyncErrors(async (req, res, next) => {
  const { platform, accountId, proof } = req.body;

  const identity = await BlockchainIdentity.findOne({ user: req.user.id });

  if (!identity) {
    return next(new ErrorHandler('Blockchain identity not found', 404));
  }

  identity.linkedAccounts.push({
    platform,
    accountId,
    linkedAt: Date.now(),
    verified: true,
    proof
  });

  await identity.save();

  res.status(200).json({
    success: true,
    data: identity
  });
});

// Helper functions
function calculateRiskScore(deviceInfo) {
  let score = 0;

  // Check for suspicious patterns
  if (deviceInfo.isVPN) score += 20;
  if (deviceInfo.isProxy) score += 20;
  if (deviceInfo.isTor) score += 30;
  if (!deviceInfo.userAgent) score += 15;

  return score;
}

function detectAnomalies(fingerprint) {
  const anomalies = [];

  // Check for location changes
  if (fingerprint.sessions.length > 1) {
    const locations = fingerprint.sessions.map(s => s.location.country).filter(Boolean);
    const uniqueLocations = [...new Set(locations)];

    if (uniqueLocations.length > 2) {
      anomalies.push({
        type: 'location_anomaly',
        description: 'Multiple countries detected',
        severity: 'medium'
      });
    }
  }

  // Check for rapid session creation
  if (fingerprint.sessions.length > 10) {
    const recentSessions = fingerprint.sessions.slice(-10);
    const timespan = recentSessions[9].startTime - recentSessions[0].startTime;

    if (timespan < 3600000) { // Less than 1 hour
      anomalies.push({
        type: 'rapid_sessions',
        description: 'Unusual session frequency',
        severity: 'high'
      });
    }
  }

  return anomalies;
}

function generateSessionAnalytics(session) {
  const clicks = session.events.filter(e => e.type === 'click').length;
  const pageViews = session.events.filter(e => e.type === 'pageview').length;
  const scrolls = session.events.filter(e => e.type === 'scroll').length;

  return {
    totalEvents: session.events.length,
    eventBreakdown: {
      clicks,
      pageViews,
      scrolls
    },
    engagement: clicks + scrolls > 10 ? 'high' : 'low',
    duration: session.duration
  };
}

function generateHeatmapData(sessions) {
  const clickData = [];

  sessions.forEach(session => {
    const clicks = session.events.filter(e => e.type === 'click');
    clicks.forEach(click => {
      if (click.data && click.data.x && click.data.y) {
        clickData.push({
          x: click.data.x,
          y: click.data.y,
          timestamp: click.timestamp
        });
      }
    });
  });

  return {
    clicks: clickData,
    totalSessions: sessions.length
  };
}

function generateProof(claim) {
  const claimString = JSON.stringify(claim);
  return crypto.createHash('sha256').update(claimString).digest('hex');
}
