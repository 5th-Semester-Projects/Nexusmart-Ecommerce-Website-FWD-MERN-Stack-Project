const BiometricAuth = require('../models/BiometricAuth');
const User = require('../models/User');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const crypto = require('crypto');

// Enroll biometric
exports.enrollBiometric = catchAsyncErrors(async (req, res, next) => {
  const { biometricType, biometricData, deviceInfo } = req.body;

  let bioAuth = await BiometricAuth.findOne({ user: req.user.id });

  if (!bioAuth) {
    bioAuth = await BiometricAuth.create({
      user: req.user.id
    });
  }

  // Encrypt biometric template
  const encryptedTemplate = encryptBiometricData(biometricData);

  switch (biometricType) {
    case 'fingerprint':
      bioAuth.fingerprint.enabled = true;
      bioAuth.fingerprint.enrolledFingers.push({
        fingerId: req.body.fingerId || 'finger_1',
        template: encryptedTemplate,
        enrolledAt: Date.now()
      });
      break;

    case 'face':
      bioAuth.faceId.enabled = true;
      bioAuth.faceId.faceTemplate = encryptedTemplate;
      bioAuth.faceId.livenessDetection = true;
      bioAuth.faceId.enrolledAt = Date.now();
      bioAuth.faceId.accuracy = 0.95;
      break;

    case 'iris':
      bioAuth.iris.enabled = true;
      bioAuth.iris.irisTemplate = encryptedTemplate;
      bioAuth.iris.enrolledAt = Date.now();
      break;

    case 'voice':
      bioAuth.voice.enabled = true;
      bioAuth.voice.voicePrint = encryptedTemplate;
      bioAuth.voice.phrases = req.body.phrases || [];
      bioAuth.voice.enrolledAt = Date.now();
      break;
  }

  // Add device binding
  bioAuth.deviceBindings.push({
    deviceId: deviceInfo.deviceId,
    deviceType: deviceInfo.deviceType,
    biometricType: [biometricType],
    trusted: true,
    enrolledAt: Date.now()
  });

  bioAuth.security = {
    encryptionMethod: 'AES-256-GCM',
    templateVersion: '1.0',
    secureEnclaveUsed: deviceInfo.hasSecureEnclave || false,
    onDeviceProcessing: true
  };

  await bioAuth.save();

  res.status(201).json({
    success: true,
    message: `${biometricType} biometric enrolled successfully`,
    biometricAuth: bioAuth
  });
});

// Authenticate with biometric
exports.authenticateBiometric = catchAsyncErrors(async (req, res, next) => {
  const { biometricType, biometricData, deviceId } = req.body;

  const bioAuth = await BiometricAuth.findOne({ user: req.user.id });

  if (!bioAuth) {
    return next(new ErrorHandler('No biometric data enrolled', 404));
  }

  // Verify device
  const device = bioAuth.deviceBindings.find(d => d.deviceId === deviceId);
  if (!device) {
    return next(new ErrorHandler('Device not registered', 403));
  }

  // Verify biometric
  let verified = false;
  let storedTemplate = '';

  switch (biometricType) {
    case 'fingerprint':
      if (!bioAuth.fingerprint.enabled) {
        return next(new ErrorHandler('Fingerprint not enrolled', 400));
      }
      storedTemplate = bioAuth.fingerprint.enrolledFingers[0]?.template;
      bioAuth.fingerprint.lastUsed = Date.now();
      break;

    case 'face':
      if (!bioAuth.faceId.enabled) {
        return next(new ErrorHandler('Face ID not enrolled', 400));
      }
      storedTemplate = bioAuth.faceId.faceTemplate;
      bioAuth.faceId.lastUsed = Date.now();
      break;

    case 'iris':
      if (!bioAuth.iris.enabled) {
        return next(new ErrorHandler('Iris not enrolled', 400));
      }
      storedTemplate = bioAuth.iris.irisTemplate;
      bioAuth.iris.lastUsed = Date.now();
      break;

    case 'voice':
      if (!bioAuth.voice.enabled) {
        return next(new ErrorHandler('Voice not enrolled', 400));
      }
      storedTemplate = bioAuth.voice.voicePrint;
      bioAuth.voice.lastUsed = Date.now();
      break;
  }

  // Compare biometric templates
  verified = compareBiometricTemplates(biometricData, storedTemplate);

  // Calculate risk score
  const riskScore = calculateAuthRiskScore(req, device, verified);

  // Log authentication attempt
  bioAuth.authenticationHistory.push({
    timestamp: Date.now(),
    method: biometricType,
    success: verified,
    deviceId,
    ipAddress: req.ip,
    location: req.body.location,
    riskScore
  });

  if (!verified) {
    bioAuth.failedAttempts.count += 1;
    bioAuth.failedAttempts.lastAttempt = Date.now();

    if (bioAuth.failedAttempts.count >= 5) {
      bioAuth.failedAttempts.lockoutUntil = new Date(Date.now() + 30 * 60000); // 30 min lockout
    }

    await bioAuth.save();
    return next(new ErrorHandler('Biometric authentication failed', 401));
  }

  // Reset failed attempts on success
  bioAuth.failedAttempts.count = 0;
  device.lastAuthenticated = Date.now();

  await bioAuth.save();

  // Generate auth token
  const token = generateAuthToken(req.user.id);

  res.status(200).json({
    success: true,
    verified: true,
    message: 'Biometric authentication successful',
    token,
    riskScore
  });
});

// Enable payment authentication
exports.enablePaymentAuth = catchAsyncErrors(async (req, res, next) => {
  const { methods, thresholdAmount } = req.body;

  const bioAuth = await BiometricAuth.findOne({ user: req.user.id });

  if (!bioAuth) {
    return next(new ErrorHandler('Please enroll biometric first', 404));
  }

  bioAuth.paymentAuthentication = {
    enabled: true,
    requiredFor: {
      allPayments: req.body.allPayments || false,
      thresholdAmount: thresholdAmount || 100
    },
    methods
  };

  await bioAuth.save();

  res.status(200).json({
    success: true,
    message: 'Payment authentication enabled',
    settings: bioAuth.paymentAuthentication
  });
});

// Verify payment with biometric
exports.verifyPayment = catchAsyncErrors(async (req, res, next) => {
  const { orderId, amount, biometricType, biometricData } = req.body;

  const bioAuth = await BiometricAuth.findOne({ user: req.user.id });

  if (!bioAuth || !bioAuth.paymentAuthentication.enabled) {
    return next(new ErrorHandler('Biometric payment authentication not enabled', 400));
  }

  // Check if amount requires authentication
  const requiresAuth = bioAuth.paymentAuthentication.requiredFor.allPayments ||
    amount >= bioAuth.paymentAuthentication.requiredFor.thresholdAmount;

  if (!requiresAuth) {
    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment amount below threshold'
    });
  }

  // Verify biometric for payment
  const verified = await verifyBiometricForPayment(bioAuth, biometricType, biometricData);

  if (!verified) {
    return next(new ErrorHandler('Payment authentication failed', 401));
  }

  res.status(200).json({
    success: true,
    verified: true,
    message: 'Payment authorized',
    orderId
  });
});

// Get biometric settings
exports.getBiometricSettings = catchAsyncErrors(async (req, res, next) => {
  const bioAuth = await BiometricAuth.findOne({ user: req.user.id });

  if (!bioAuth) {
    return res.status(200).json({
      success: true,
      enrolled: false,
      settings: null
    });
  }

  // Remove sensitive data
  const settings = {
    enrolled: true,
    fingerprint: {
      enabled: bioAuth.fingerprint.enabled,
      fingersEnrolled: bioAuth.fingerprint.enrolledFingers.length
    },
    faceId: {
      enabled: bioAuth.faceId.enabled,
      livenessDetection: bioAuth.faceId.livenessDetection
    },
    iris: {
      enabled: bioAuth.iris.enabled
    },
    voice: {
      enabled: bioAuth.voice.enabled
    },
    paymentAuthentication: bioAuth.paymentAuthentication,
    deviceBindings: bioAuth.deviceBindings.map(d => ({
      deviceType: d.deviceType,
      biometricType: d.biometricType,
      lastAuthenticated: d.lastAuthenticated
    }))
  };

  res.status(200).json({
    success: true,
    settings
  });
});

// Helper Functions
function encryptBiometricData(data) {
  // Mock encryption - use proper encryption in production
  const algorithm = 'aes-256-gcm';
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    key: key.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function compareBiometricTemplates(providedData, storedTemplate) {
  // Mock comparison - use actual biometric matching algorithms
  // In production, use specialized biometric matching libraries
  return Math.random() > 0.1; // 90% success rate for demo
}

function calculateAuthRiskScore(req, device, verified) {
  let riskScore = 0;

  if (!verified) riskScore += 50;
  if (!device.trusted) riskScore += 30;
  if (req.ip !== device.lastIP) riskScore += 10;
  // Add more risk factors

  return Math.min(100, riskScore);
}

function generateAuthToken(userId) {
  // Generate JWT token
  return `token_${userId}_${Date.now()}`;
}

async function verifyBiometricForPayment(bioAuth, biometricType, biometricData) {
  // Verify biometric for high-value transactions
  let storedTemplate;

  switch (biometricType) {
    case 'fingerprint':
      storedTemplate = bioAuth.fingerprint.enrolledFingers[0]?.template;
      break;
    case 'face':
      storedTemplate = bioAuth.faceId.faceTemplate;
      break;
    case 'iris':
      storedTemplate = bioAuth.iris.irisTemplate;
      break;
  }

  return compareBiometricTemplates(biometricData, storedTemplate);
}
