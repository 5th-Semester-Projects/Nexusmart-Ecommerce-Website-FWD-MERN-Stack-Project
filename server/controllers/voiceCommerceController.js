import VoiceCommerce from '../models/VoiceCommerce.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/ErrorHandler.js';

// Start voice session
export const startVoiceSession = catchAsyncErrors(async (req, res, next) => {
  const { device, platform, language } = req.body;

  const session = await VoiceCommerce.create({
    user: req.user._id,
    sessionId: `VC${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    sessionDetails: {
      device,
      platform,
      language: language || 'en-US'
    }
  });

  res.status(201).json({
    success: true,
    message: 'Voice session started',
    session
  });
});

// Process voice command
export const processVoiceCommand = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, voiceInput, intent } = req.body;

  const session = await VoiceCommerce.findOne({ sessionId });

  if (!session) {
    return next(new ErrorHandler('Voice session not found', 404));
  }

  await session.processVoiceCommand(voiceInput, intent);

  res.status(200).json({
    success: true,
    message: 'Command processed',
    session
  });
});

// Voice search
export const voiceSearch = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, query, filters } = req.body;

  const session = await VoiceCommerce.findOne({ sessionId });

  if (!session) {
    return next(new ErrorHandler('Voice session not found', 404));
  }

  session.voiceSearch.push({
    query,
    transcription: query,
    confidence: 0.95,
    filters,
    resultCount: 0
  });

  await session.save();

  res.status(200).json({
    success: true,
    message: 'Voice search recorded'
  });
});

// Add to cart via voice
export const addToVoiceCart = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, productId, quantity } = req.body;

  const session = await VoiceCommerce.findOne({ sessionId });

  if (!session) {
    return next(new ErrorHandler('Voice session not found', 404));
  }

  await session.addToVoiceCart(productId, quantity);

  res.status(200).json({
    success: true,
    message: 'Product added to cart',
    cart: session.voiceCart
  });
});

// Place order via voice
export const placeVoiceOrder = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, orderDetails } = req.body;

  const session = await VoiceCommerce.findOne({ sessionId });

  if (!session) {
    return next(new ErrorHandler('Voice session not found', 404));
  }

  await session.placeVoiceOrder(orderDetails);

  res.status(200).json({
    success: true,
    message: 'Order placed successfully'
  });
});

// Voice checkout
export const voiceCheckout = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, paymentMethod, shippingAddress } = req.body;

  const session = await VoiceCommerce.findOne({ sessionId });

  if (!session) {
    return next(new ErrorHandler('Voice session not found', 404));
  }

  session.voiceCheckout.enabled = true;
  session.voiceCheckout.savedPaymentMethod = paymentMethod;
  session.voiceCheckout.savedShippingAddress = shippingAddress;

  await session.save();

  res.status(200).json({
    success: true,
    message: 'Checkout initiated'
  });
});

// Get voice session history
export const getSessionHistory = catchAsyncErrors(async (req, res, next) => {
  const sessions = await VoiceCommerce.getUserSessions(req.user._id);

  res.status(200).json({
    success: true,
    count: sessions.length,
    sessions
  });
});

// Update voice preferences
export const updateVoicePreferences = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, preferences } = req.body;

  const session = await VoiceCommerce.findOne({ sessionId });

  if (!session) {
    return next(new ErrorHandler('Voice session not found', 404));
  }

  session.nlu.userPreferences = {
    ...session.nlu.userPreferences,
    ...preferences
  };

  await session.save();

  res.status(200).json({
    success: true,
    message: 'Preferences updated'
  });
});

// Train voiceprint
export const trainVoiceprint = catchAsyncErrors(async (req, res, next) => {
  const { voiceprintId } = req.body;

  const session = await VoiceCommerce.findOne({ user: req.user._id })
    .sort({ 'sessionDetails.startTime': -1 });

  if (session) {
    session.voiceAuthentication.enabled = true;
    session.voiceAuthentication.voiceprintId = voiceprintId;
    session.voiceAuthentication.verified = true;
    session.voiceAuthentication.trustScore = 85;

    await session.save();
  }

  res.status(200).json({
    success: true,
    message: 'Voiceprint trained successfully'
  });
});

// Get voice analytics
export const getVoiceAnalytics = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const analytics = await VoiceCommerce.getVoiceAnalytics(
    startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate || new Date()
  );

  res.status(200).json({
    success: true,
    analytics
  });
});

// Handle voice error
export const handleVoiceError = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, errorType, errorMessage, userInput } = req.body;

  const session = await VoiceCommerce.findOne({ sessionId });

  if (!session) {
    return next(new ErrorHandler('Voice session not found', 404));
  }

  session.errorHandling.push({
    errorType,
    errorMessage,
    userInput,
    fallbackAction: 'retry',
    resolved: false
  });

  await session.save();

  res.status(200).json({
    success: true,
    message: 'Error logged'
  });
});
