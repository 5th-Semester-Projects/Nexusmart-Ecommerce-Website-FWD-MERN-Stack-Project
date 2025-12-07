const ProgressiveWebApp = require('../models/ProgressiveWebApp');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Get PWA status
export const getPWAStatus = catchAsyncErrors(async (req, res) => {
  let pwa = await ProgressiveWebApp.findOne({ user: req.user._id });

  if (!pwa) {
    pwa = await ProgressiveWebApp.create({
      user: req.user._id,
      sessionId: `pwa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }

  res.status(200).json({
    success: true,
    pwa
  });
});

// Record session
export const recordSession = catchAsyncErrors(async (req, res) => {
  const { startTime, endTime, pagesViewed, isStandalone, isOffline } = req.body;

  let pwa = await ProgressiveWebApp.findOne({ user: req.user._id });

  if (!pwa) {
    pwa = await ProgressiveWebApp.create({
      user: req.user._id,
      sessionId: `pwa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }

  const duration = new Date(endTime) - new Date(startTime);
  pwa.recordSession(startTime, endTime, pagesViewed, isStandalone, isOffline);
  await pwa.save();

  res.status(200).json({
    success: true,
    message: 'Session recorded'
  });
});

// Track push notification
export const trackPushNotification = catchAsyncErrors(async (req, res) => {
  const { clicked } = req.body;

  const pwa = await ProgressiveWebApp.findOne({ user: req.user._id });

  if (!pwa) {
    return res.status(404).json({
      success: false,
      message: 'PWA record not found'
    });
  }

  pwa.trackPushNotification(clicked);
  await pwa.save();

  res.status(200).json({
    success: true,
    message: 'Notification tracked'
  });
});

// Subscribe to push
export const subscribeToPush = catchAsyncErrors(async (req, res) => {
  const { endpoint, keys } = req.body;

  let pwa = await ProgressiveWebApp.findOne({ user: req.user._id });

  if (!pwa) {
    pwa = await ProgressiveWebApp.create({
      user: req.user._id,
      sessionId: `pwa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }

  pwa.pushNotifications.subscribed = true;
  pwa.pushNotifications.subscribedAt = Date.now();
  pwa.pushNotifications.endpoint = endpoint;
  pwa.pushNotifications.keys = keys;
  await pwa.save();

  res.status(200).json({
    success: true,
    message: 'Subscribed to push notifications'
  });
});

// Mark as installed
export const markInstalled = catchAsyncErrors(async (req, res) => {
  const { source } = req.body;

  let pwa = await ProgressiveWebApp.findOne({ user: req.user._id });

  if (!pwa) {
    pwa = await ProgressiveWebApp.create({
      user: req.user._id,
      sessionId: `pwa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }

  pwa.installation.installed = true;
  pwa.installation.installedAt = Date.now();
  pwa.installation.installSource = source || 'browser_prompt';
  await pwa.save();

  res.status(200).json({
    success: true,
    message: 'PWA marked as installed'
  });
});

// Calculate retention
export const calculateRetention = catchAsyncErrors(async (req, res) => {
  const { userId } = req.params;

  const pwa = await ProgressiveWebApp.findOne({ user: userId || req.user._id });

  if (!pwa) {
    return res.status(404).json({
      success: false,
      message: 'PWA record not found'
    });
  }

  const retention = pwa.calculateRetention();

  res.status(200).json({
    success: true,
    retention
  });
});

// Get installation rate
export const getInstallationRate = catchAsyncErrors(async (req, res) => {
  const rate = await ProgressiveWebApp.getInstallationRate();

  res.status(200).json({
    success: true,
    installationRate: rate
  });
});

// Get active PWA users
export const getActivePWAUsers = catchAsyncErrors(async (req, res) => {
  const users = await ProgressiveWebApp.getActivePWAUsers();

  res.status(200).json({
    success: true,
    count: users.length,
    users
  });
});

module.exports = exports;
