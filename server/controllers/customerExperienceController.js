import GestureControl from '../models/GestureControl.js';
import PWAFeatures from '../models/PWAFeatures.js';
import AccessibilityFeatures from '../models/AccessibilityFeatures.js';
import ARVirtualTryOn from '../models/ARVirtualTryOn.js';
import VoiceShopping from '../models/VoiceShopping.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Gesture Control Controllers

export const enableGestureControl = catchAsyncErrors(async (req, res, next) => {
  const { gestures, calibration } = req.body;

  let gestureControl = await GestureControl.findOne({ user: req.user.id });

  if (gestureControl) {
    gestureControl.enabled = true;
    gestureControl.gestures = gestures || gestureControl.gestures;
    gestureControl.calibration = calibration || gestureControl.calibration;
  } else {
    gestureControl = await GestureControl.create({
      user: req.user.id,
      enabled: true,
      gestures: gestures || [],
      calibration: calibration || {
        sensitivity: 5,
        handedness: 'right',
        distance: 'medium'
      }
    });
  }

  await gestureControl.save();

  res.status(200).json({
    success: true,
    data: gestureControl
  });
});

export const recordGestureSession = catchAsyncErrors(async (req, res, next) => {
  const { gesturesUsed, duration, accuracy } = req.body;

  const gestureControl = await GestureControl.findOne({ user: req.user.id });

  if (!gestureControl) {
    return next(new ErrorHandler('Gesture control not enabled', 404));
  }

  gestureControl.sessions.push({
    startedAt: new Date(Date.now() - duration * 1000),
    endedAt: Date.now(),
    gesturesUsed,
    accuracy
  });

  gestureControl.analytics.totalGestures += gesturesUsed;
  await gestureControl.save();

  res.status(200).json({
    success: true,
    data: gestureControl
  });
});

// PWA Features Controllers

export const installPWA = catchAsyncErrors(async (req, res, next) => {
  const { platform, version } = req.body;

  let pwa = await PWAFeatures.findOne({ user: req.user.id });

  if (pwa) {
    pwa.installation.installed = true;
    pwa.installation.installedAt = Date.now();
    pwa.installation.platform = platform;
    pwa.installation.version = version;
  } else {
    pwa = await PWAFeatures.create({
      user: req.user.id,
      installation: {
        installed: true,
        installedAt: Date.now(),
        platform,
        version
      }
    });
  }

  await pwa.save();

  res.status(200).json({
    success: true,
    data: pwa
  });
});

export const syncOfflineData = catchAsyncErrors(async (req, res, next) => {
  const { syncQueue } = req.body;

  const pwa = await PWAFeatures.findOne({ user: req.user.id });

  if (!pwa) {
    return next(new ErrorHandler('PWA not initialized', 404));
  }

  // Process sync queue
  for (const item of syncQueue) {
    const existingItem = pwa.syncQueue.find(i => i.action === item.action && !i.synced);
    if (existingItem) {
      existingItem.synced = true;
      existingItem.syncedAt = Date.now();
    }
  }

  pwa.offlineData.cart.lastSynced = Date.now();
  pwa.usage.lastOnline = Date.now();

  await pwa.save();

  res.status(200).json({
    success: true,
    data: pwa
  });
});

// Accessibility Features Controllers

export const updateAccessibilityPreferences = catchAsyncErrors(async (req, res, next) => {
  const { preferences } = req.body;

  let accessibility = await AccessibilityFeatures.findOne({ user: req.user.id });

  if (accessibility) {
    accessibility.preferences = {
      ...accessibility.preferences,
      ...preferences
    };
  } else {
    accessibility = await AccessibilityFeatures.create({
      user: req.user.id,
      preferences
    });
  }

  await accessibility.save();

  res.status(200).json({
    success: true,
    data: accessibility
  });
});

export const getAccessibilityPreferences = catchAsyncErrors(async (req, res, next) => {
  const accessibility = await AccessibilityFeatures.findOne({ user: req.user.id });

  if (!accessibility) {
    return res.status(200).json({
      success: true,
      data: {
        preferences: {
          screenReader: { enabled: false },
          voiceNavigation: { enabled: false },
          visual: { fontSize: 16, contrast: 'normal' },
          keyboard: { navigation: false }
        }
      }
    });
  }

  res.status(200).json({
    success: true,
    data: accessibility
  });
});

// AR Virtual Try-On Controllers

export const createARSession = catchAsyncErrors(async (req, res, next) => {
  const { productId, tryOnType } = req.body;

  const arSession = await ARVirtualTryOn.create({
    user: req.user.id,
    product: productId,
    sessionId: generateSessionId(),
    tryOnType: tryOnType || 'ar_glasses',
    status: 'active',
    startTime: Date.now()
  });

  res.status(201).json({
    success: true,
    data: arSession
  });
});

export const saveARCapture = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, imageUrl, liked } = req.body;

  const arSession = await ARVirtualTryOn.findOne({ sessionId });

  if (!arSession) {
    return next(new ErrorHandler('AR session not found', 404));
  }

  arSession.captures.push({
    imageUrl,
    timestamp: Date.now(),
    liked: liked || false,
    shared: false
  });

  if (liked) {
    arSession.interactions.saved++;
  }

  await arSession.save();

  res.status(200).json({
    success: true,
    data: arSession
  });
});

// Voice Shopping Controllers

export const processVoiceCommand = catchAsyncErrors(async (req, res, next) => {
  const { audioUrl, transcript, language } = req.body;

  // Simulate AI processing of voice command
  const intent = analyzeVoiceIntent(transcript);

  const voiceSession = await VoiceShopping.create({
    user: req.user.id,
    sessionId: generateSessionId(),
    platform: 'web',
    language: language || 'en',
    commands: [{
      transcript,
      intent: intent.intent,
      confidence: intent.confidence,
      timestamp: Date.now(),
      processed: true,
      response: intent.response
    }]
  });

  res.status(200).json({
    success: true,
    data: {
      intent: intent.intent,
      response: intent.response,
      confidence: intent.confidence,
      session: voiceSession
    }
  });
});

// Helper functions
function generateSessionId() {
  return 'SESSION-' + Date.now() + '-' + Math.random().toString(36).substring(7);
}

function analyzeVoiceIntent(transcript) {
  const lower = transcript.toLowerCase();

  if (lower.includes('search') || lower.includes('find') || lower.includes('show me')) {
    return {
      intent: 'search_products',
      confidence: 0.9,
      response: 'Searching for products based on your request...'
    };
  } else if (lower.includes('add to cart') || lower.includes('buy')) {
    return {
      intent: 'add_to_cart',
      confidence: 0.85,
      response: 'Adding item to your cart...'
    };
  } else if (lower.includes('order status') || lower.includes('track')) {
    return {
      intent: 'check_order',
      confidence: 0.88,
      response: 'Let me check your order status...'
    };
  } else {
    return {
      intent: 'general_query',
      confidence: 0.6,
      response: 'How can I help you today?'
    };
  }
}
