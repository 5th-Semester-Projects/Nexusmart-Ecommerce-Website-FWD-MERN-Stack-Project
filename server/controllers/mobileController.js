import PWA from '../models/PWA.js';
import DeepLink from '../models/DeepLink.js';
import QRCode from '../models/QRCode.js';
import MobileWallet from '../models/MobileWallet.js';
import Geofence from '../models/Geofence.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';

// Register PWA Installation
export const registerPWAInstall = catchAsyncErrors(async (req, res) => {
  const { platform, browser, installSource } = req.body;

  const pwa = await PWA.findOneAndUpdate(
    { user: req.user.id },
    {
      $set: {
        'installation.isInstalled': true,
        'installation.installedAt': new Date(),
        'installation.installSource': installSource,
        'installation.platform': platform,
        'installation.browser': browser
      }
    },
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'PWA installation registered',
    pwa
  });
});

// Update Service Worker
export const updateServiceWorker = catchAsyncErrors(async (req, res) => {
  const { version, cachedResources } = req.body;

  const pwa = await PWA.findOneAndUpdate(
    { user: req.user.id },
    {
      $set: {
        'serviceWorker.version': version,
        'serviceWorker.isActive': true,
        'serviceWorker.lastUpdated': new Date(),
        'serviceWorker.cachedResources': cachedResources
      }
    },
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'Service worker updated',
    pwa
  });
});

// Subscribe to Push Notifications
export const subscribePushNotifications = catchAsyncErrors(async (req, res) => {
  const { subscription, preferences } = req.body;

  const pwa = await PWA.findOneAndUpdate(
    { user: req.user.id },
    {
      $set: {
        'pushNotifications.isEnabled': true,
        'pushNotifications.subscription': subscription,
        'pushNotifications.preferences': preferences
      }
    },
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'Push notifications subscribed',
    pwa
  });
});

// Track Offline Usage
export const trackOfflineUsage = catchAsyncErrors(async (req, res) => {
  const { pagesViewed, actions } = req.body;

  const pwa = await PWA.findOneAndUpdate(
    { user: req.user.id },
    {
      $inc: { 'offlineUsage.offlineSessions': 1 },
      $set: { 'offlineUsage.lastOfflineAccess': new Date() },
      $push: {
        'offlineUsage.offlinePagesViewed': { $each: pagesViewed },
        'offlineUsage.offlineActionsQueued': { $each: actions }
      }
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    pwa
  });
});

// Track PWA Performance
export const trackPWAPerformance = catchAsyncErrors(async (req, res) => {
  const { metrics } = req.body;

  await PWA.findOneAndUpdate(
    { user: req.user.id },
    {
      $set: { 'performance': metrics }
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Performance metrics tracked'
  });
});

// Create Deep Link
export const createDeepLink = catchAsyncErrors(async (req, res) => {
  const { type, destination, parameters, campaign } = req.body;

  const linkId = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const deepLinkDomain = process.env.DEEP_LINK_DOMAIN || process.env.CLIENT_URL || 'https://app.link';
  const shortUrl = `${deepLinkDomain}/${linkId.substr(-8)}`;

  const deepLink = await DeepLink.create({
    linkId,
    type,
    destination,
    parameters,
    shortUrl,
    campaign,
    targeting: req.body.targeting || {},
    fallback: req.body.fallback || {},
    metadata: req.body.metadata || {},
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    deepLink
  });
});

// Track Deep Link Click
export const trackDeepLinkClick = catchAsyncErrors(async (req, res) => {
  const { linkId } = req.params;
  const { platform, country } = req.body;

  const deepLink = await DeepLink.findOneAndUpdate(
    { linkId },
    {
      $inc: {
        'analytics.clicks': 1,
        [`analytics.clicksByPlatform.${platform}`]: 1
      },
      $set: { 'analytics.lastClickedAt': new Date() }
    },
    { new: true }
  );

  if (!deepLink) {
    return res.status(404).json({
      success: false,
      message: 'Deep link not found'
    });
  }

  res.status(200).json({
    success: true,
    destination: deepLink.destination,
    parameters: deepLink.parameters
  });
});

// Generate QR Code
export const generateQRCode = catchAsyncErrors(async (req, res) => {
  const { type, target, targetId, design } = req.body;

  const code = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const qrCode = await QRCode.create({
    code,
    type,
    target,
    targetId,
    design: design || {},
    qrImage: {
      url: process.env.QR_CODE_API_URL
        ? `${process.env.QR_CODE_API_URL}?data=${encodeURIComponent(target)}&size=300x300`
        : `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(target)}&size=300x300`,
      format: 'png',
      size: 300
    },
    settings: req.body.settings || {},
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    qrCode
  });
});

// Scan QR Code
export const scanQRCode = catchAsyncErrors(async (req, res) => {
  const { code } = req.params;
  const { location, device } = req.body;

  const qrCode = await QRCode.findOneAndUpdate(
    { code },
    {
      $inc: {
        'usage.scans': 1,
        [`usage.scansByDevice.${device}`]: 1
      },
      $set: { 'usage.lastScannedAt': new Date() },
      $push: {
        scanHistory: {
          scannedBy: req.user?.id,
          scannedAt: new Date(),
          location,
          device
        }
      }
    },
    { new: true }
  );

  if (!qrCode || !qrCode.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Invalid or expired QR code'
    });
  }

  res.status(200).json({
    success: true,
    qrCode,
    target: qrCode.target,
    data: qrCode.data
  });
});

// Add Mobile Wallet
export const addMobileWallet = catchAsyncErrors(async (req, res) => {
  const { walletType, deviceInfo, cardDetails } = req.body;

  const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const wallet = await MobileWallet.create({
    user: req.user.id,
    walletId,
    provider: walletType,
    deviceInfo,
    cards: cardDetails ? [cardDetails] : []
  });

  res.status(201).json({
    success: true,
    message: 'Wallet added successfully',
    wallet
  });
});

// Process Wallet Payment
export const processWalletPayment = catchAsyncErrors(async (req, res) => {
  const { orderId, amount } = req.body;

  const wallet = await MobileWallet.findOne({ user: req.user.id });

  if (!wallet || !wallet.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found or inactive'
    });
  }

  const transaction = {
    transactionId: `txn_${Date.now()}`,
    type: 'debit',
    amount,
    order: orderId,
    status: 'completed',
    timestamp: new Date()
  };

  wallet.transactions.push(transaction);
  await wallet.save();

  res.status(200).json({
    success: true,
    message: 'Payment processed',
    transaction
  });
});

// Create Geofence
export const createGeofence = catchAsyncErrors(async (req, res) => {
  const { name, location, radius, type, triggers } = req.body;

  const geofence = await Geofence.create({
    name,
    description: req.body.description,
    location,
    radius,
    type,
    triggers,
    targeting: req.body.targeting || {},
    schedule: req.body.schedule || {},
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Geofence created',
    geofence
  });
});

// Check Geofence Entry
export const checkGeofenceEntry = catchAsyncErrors(async (req, res) => {
  const { latitude, longitude } = req.body;

  const geofences = await Geofence.find({
    isActive: true,
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: 5000 // 5km max
      }
    }
  });

  // Process triggers
  const triggeredGeofences = [];
  for (const geofence of geofences) {
    const event = {
      user: req.user.id,
      event: 'enter',
      timestamp: new Date(),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      triggered: true
    };

    geofence.analytics.totalEnters += 1;
    geofence.events.push(event);
    await geofence.save();

    triggeredGeofences.push(geofence);
  }

  res.status(200).json({
    success: true,
    triggeredGeofences
  });
});

// Get Geofence Analytics
export const getGeofenceAnalytics = catchAsyncErrors(async (req, res) => {
  const { geofenceId } = req.params;

  const geofence = await Geofence.findById(geofenceId);

  res.status(200).json({
    success: true,
    analytics: geofence.analytics,
    events: geofence.events
  });
});

module.exports = exports;
