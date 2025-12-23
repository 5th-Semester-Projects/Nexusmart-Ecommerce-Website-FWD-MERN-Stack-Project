import {
  AIChatSession,
  VisualSearch,
  PriceHistory,
  PricePrediction,
  UserRecommendation,
} from '../models/AIFeatures.js';
import PriceAlert from '../models/PriceAlert.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import crypto from 'crypto';

// ==================== AI CHATBOT ====================

const CHATBOT_RESPONSES = {
  greeting: [
    "Hello! 👋 I'm NexusBot, your AI shopping assistant. How can I help you today?",
    "Hi there! Welcome to NexusMart! I'm here to help you find what you're looking for.",
    "Hey! 🤖 Ready to help you with your shopping journey. What can I do for you?",
  ],
  product_search: "I can help you find products! What are you looking for? You can describe the item, mention a category, or even tell me your budget.",
  order_status: "I can check your order status. Please provide your order number or I can show you your recent orders.",
  return_refund: "For returns and refunds, we have a 30-day return policy. Would you like me to help you initiate a return or check the status of an existing one?",
  payment: "We accept multiple payment methods including Credit/Debit cards, PayPal, and Crypto payments. Is there a specific payment issue you're facing?",
  shipping: "We offer Standard (5-7 days), Express (2-3 days), and Same-day delivery in select areas. What would you like to know about shipping?",
  fallback: "I'm not sure I understand. Could you please rephrase? You can ask me about:\n• Product search\n• Order status\n• Returns & Refunds\n• Payment issues\n• Shipping information",
};

const detectIntent = (message) => {
  const msg = message.toLowerCase();

  if (msg.match(/\b(hi|hello|hey|greetings)\b/)) return 'greeting';
  if (msg.match(/\b(find|search|looking for|show me|want|need|buy)\b/)) return 'product_search';
  if (msg.match(/\b(order|tracking|delivery|where is|status)\b/)) return 'order_status';
  if (msg.match(/\b(return|refund|exchange|cancel)\b/)) return 'return_refund';
  if (msg.match(/\b(pay|payment|card|billing)\b/)) return 'payment';
  if (msg.match(/\b(ship|shipping|delivery time|express)\b/)) return 'shipping';

  return 'fallback';
};

const extractEntities = (message) => {
  const entities = {
    products: [],
    categories: [],
    priceRange: null,
    colors: [],
    sizes: [],
  };

  // Extract price range
  const priceMatch = message.match(/\$(\d+)(?:\s*-\s*\$?(\d+))?|under\s*\$?(\d+)|below\s*\$?(\d+)|above\s*\$?(\d+)/i);
  if (priceMatch) {
    if (priceMatch[3] || priceMatch[4]) {
      entities.priceRange = { max: parseInt(priceMatch[3] || priceMatch[4]) };
    } else if (priceMatch[5]) {
      entities.priceRange = { min: parseInt(priceMatch[5]) };
    } else {
      entities.priceRange = {
        min: parseInt(priceMatch[1]),
        max: priceMatch[2] ? parseInt(priceMatch[2]) : null,
      };
    }
  }

  // Extract colors
  const colors = ['red', 'blue', 'green', 'black', 'white', 'pink', 'purple', 'yellow', 'orange', 'brown', 'gray'];
  colors.forEach(color => {
    if (message.toLowerCase().includes(color)) {
      entities.colors.push(color);
    }
  });

  // Extract categories
  const categories = ['electronics', 'clothing', 'shoes', 'accessories', 'home', 'beauty', 'sports'];
  categories.forEach(cat => {
    if (message.toLowerCase().includes(cat)) {
      entities.categories.push(cat);
    }
  });

  return entities;
};

// @desc    Start or continue chat session
// @route   POST /api/ai/chat
// @access  Public (with optional auth)
export const chat = catchAsyncErrors(async (req, res) => {
  const { message, sessionId } = req.body;
  const userId = req.user?._id;

  let session = await AIChatSession.findOne({ sessionId });

  if (!session) {
    session = await AIChatSession.create({
      user: userId,
      sessionId: sessionId || crypto.randomUUID(),
      messages: [],
      context: {},
    });
  }

  // Add user message
  session.messages.push({
    role: 'user',
    content: message,
  });

  // Detect intent and extract entities
  const intent = detectIntent(message);
  const entities = extractEntities(message);

  let responseContent;
  let suggestedProducts = [];

  // Generate response based on intent
  if (intent === 'greeting') {
    responseContent = CHATBOT_RESPONSES.greeting[Math.floor(Math.random() * CHATBOT_RESPONSES.greeting.length)];
  } else if (intent === 'product_search') {
    // Search for products
    const searchQuery = {};
    if (entities.priceRange) {
      searchQuery.price = {};
      if (entities.priceRange.min) searchQuery.price.$gte = entities.priceRange.min;
      if (entities.priceRange.max) searchQuery.price.$lte = entities.priceRange.max;
    }
    if (entities.colors.length > 0) {
      searchQuery.tags = { $in: entities.colors };
    }

    const products = await Product.find(searchQuery)
      .select('name price images ratings')
      .limit(5);

    if (products.length > 0) {
      suggestedProducts = products.map(p => p._id);
      responseContent = `I found ${products.length} products matching your criteria! Here are some options:\n\n` +
        products.map((p, i) => `${i + 1}. ${p.name} - $${p.price} ⭐${p.ratings}`).join('\n') +
        '\n\nWould you like more details on any of these?';
    } else {
      responseContent = "I couldn't find exact matches, but let me suggest some popular products in similar categories.";
    }
  } else if (intent === 'order_status' && userId) {
    const orders = await Order.find({ user: userId })
      .select('orderNumber status createdAt')
      .sort({ createdAt: -1 })
      .limit(3);

    if (orders.length > 0) {
      responseContent = `Here are your recent orders:\n\n` +
        orders.map(o => `📦 Order #${o.orderNumber}\nStatus: ${o.status}\nPlaced: ${o.createdAt.toLocaleDateString()}`).join('\n\n') +
        '\n\nWould you like more details on any order?';
    } else {
      responseContent = "I couldn't find any orders. Have you placed an order with us? If yes, please log in to see your orders.";
    }
  } else {
    responseContent = CHATBOT_RESPONSES[intent] || CHATBOT_RESPONSES.fallback;
  }

  // Add assistant response
  session.messages.push({
    role: 'assistant',
    content: responseContent,
    metadata: {
      intent,
      entities: Object.keys(entities).filter(k =>
        Array.isArray(entities[k]) ? entities[k].length > 0 : entities[k] !== null
      ),
      confidence: 0.85,
      suggestedProducts,
    },
  });

  await session.save();

  res.status(200).json({
    success: true,
    data: {
      sessionId: session.sessionId,
      response: responseContent,
      suggestedProducts,
      intent,
    },
  });
});

// @desc    Get chat history
// @route   GET /api/ai/chat/:sessionId
// @access  Private
export const getChatHistory = catchAsyncErrors(async (req, res) => {
  const session = await AIChatSession.findOne({
    sessionId: req.params.sessionId,
  }).populate('messages.metadata.suggestedProducts', 'name price images');

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Chat session not found',
    });
  }

  res.status(200).json({
    success: true,
    data: session,
  });
});

// @desc    Rate chat session
// @route   POST /api/ai/chat/:sessionId/rate
// @access  Private
export const rateChatSession = catchAsyncErrors(async (req, res) => {
  const { rating, feedback } = req.body;

  const session = await AIChatSession.findOneAndUpdate(
    { sessionId: req.params.sessionId },
    {
      satisfaction: { rating, feedback },
      status: 'closed',
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Thank you for your feedback!',
  });
});

// ==================== VISUAL SEARCH ====================

// @desc    Search products by image
// @route   POST /api/ai/visual-search
// @access  Public
export const visualSearch = catchAsyncErrors(async (req, res) => {
  const { imageUrl, imageBase64 } = req.body;

  // In a real implementation, this would use ML model for image analysis
  // For now, we'll simulate feature detection
  const detectedFeatures = simulateImageAnalysis(imageBase64 || imageUrl);

  // Search products based on detected features
  const searchQuery = {
    isActive: true,
    $or: [
      { tags: { $in: [...detectedFeatures.colors, ...detectedFeatures.categories] } },
      { 'category.name': { $in: detectedFeatures.categories } },
    ],
  };

  const products = await Product.find(searchQuery)
    .select('name price images ratings category tags')
    .limit(20);

  // Calculate similarity scores (simulated)
  const matchedProducts = products.map(product => ({
    product: product._id,
    similarity: Math.floor(Math.random() * 30) + 70, // 70-100%
  })).sort((a, b) => b.similarity - a.similarity);

  // Save visual search record
  const imageHash = crypto.createHash('md5').update(imageBase64 || imageUrl).digest('hex');
  await VisualSearch.create({
    user: req.user?._id,
    imageUrl: imageUrl || 'uploaded_image',
    imageHash,
    detectedFeatures,
    matchedProducts: matchedProducts.slice(0, 10),
    searchQuery: JSON.stringify(searchQuery),
  });

  res.status(200).json({
    success: true,
    data: {
      detectedFeatures,
      products: await Product.find({
        _id: { $in: matchedProducts.slice(0, 10).map(m => m.product) },
      }).select('name price images ratings'),
      matchedProducts: matchedProducts.slice(0, 10),
    },
  });
});

// Simulate image analysis (in production, use ML model like TensorFlow.js)
const simulateImageAnalysis = (image) => {
  const possibleColors = ['red', 'blue', 'black', 'white', 'green', 'pink', 'purple'];
  const possibleCategories = ['clothing', 'electronics', 'shoes', 'accessories', 'home'];
  const possiblePatterns = ['solid', 'striped', 'printed', 'geometric'];
  const possibleStyles = ['casual', 'formal', 'sporty', 'vintage', 'modern'];

  return {
    colors: possibleColors.slice(0, Math.floor(Math.random() * 3) + 1),
    categories: [possibleCategories[Math.floor(Math.random() * possibleCategories.length)]],
    patterns: [possiblePatterns[Math.floor(Math.random() * possiblePatterns.length)]],
    objects: ['product'],
    style: possibleStyles[Math.floor(Math.random() * possibleStyles.length)],
  };
};

// ==================== SMART RECOMMENDATIONS ====================

// @desc    Get personalized recommendations
// @route   GET /api/ai/recommendations
// @access  Private
export const getRecommendations = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;
  const { type = 'personalized', productId } = req.query;

  let recommendations;

  if (type === 'similar' && productId) {
    recommendations = await getSimilarProducts(productId);
  } else if (type === 'frequently_bought' && productId) {
    recommendations = await getFrequentlyBoughtTogether(productId);
  } else {
    recommendations = await getPersonalizedRecommendations(userId);
  }

  res.status(200).json({
    success: true,
    data: recommendations,
  });
});

const getSimilarProducts = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) return [];

  const similar = await Product.find({
    _id: { $ne: productId },
    isActive: true,
    $or: [
      { category: product.category },
      { tags: { $in: product.tags || [] } },
      { brand: product.brand },
    ],
  })
    .select('name price images ratings discount')
    .limit(8);

  return similar.map(p => ({
    product: p,
    score: Math.floor(Math.random() * 20) + 80,
    reason: 'Similar to what you\'re viewing',
  }));
};

const getFrequentlyBoughtTogether = async (productId) => {
  // Find orders containing this product
  const orders = await Order.find({
    'orderItems.product': productId,
  }).select('orderItems');

  // Get other products from same orders
  const productCounts = {};
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      if (item.product.toString() !== productId) {
        productCounts[item.product] = (productCounts[item.product] || 0) + 1;
      }
    });
  });

  const topProductIds = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const products = await Product.find({
    _id: { $in: topProductIds },
    isActive: true,
  }).select('name price images ratings');

  return products.map(p => ({
    product: p,
    score: 90,
    reason: 'Frequently bought together',
  }));
};

const getPersonalizedRecommendations = async (userId) => {
  const user = await User.findById(userId)
    .populate('browsingHistory.product', 'category tags')
    .populate('wishlist', 'category tags');

  // Collect categories and tags from user history
  const categories = new Set();
  const tags = new Set();

  if (user.browsingHistory) {
    user.browsingHistory.slice(-20).forEach(item => {
      if (item.product?.category) categories.add(item.product.category.toString());
      if (item.product?.tags) item.product.tags.forEach(t => tags.add(t));
    });
  }

  if (user.wishlist) {
    user.wishlist.forEach(item => {
      if (item.category) categories.add(item.category.toString());
      if (item.tags) item.tags.forEach(t => tags.add(t));
    });
  }

  // Get products matching user preferences
  const products = await Product.find({
    isActive: true,
    $or: [
      { category: { $in: Array.from(categories) } },
      { tags: { $in: Array.from(tags) } },
    ],
  })
    .select('name price images ratings discount')
    .limit(12);

  return products.map(p => ({
    product: p,
    score: Math.floor(Math.random() * 15) + 85,
    reason: 'Based on your browsing history',
  }));
};

// ==================== PRICE PREDICTION ====================

// @desc    Get price prediction for product
// @route   GET /api/ai/price-prediction/:productId
// @access  Public
export const getPricePrediction = catchAsyncErrors(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Get price history
  const priceHistory = await PriceHistory.find({ product: productId })
    .sort({ recordedAt: -1 })
    .limit(90); // Last 90 days

  // Check for existing valid prediction
  let prediction = await PricePrediction.findOne({
    product: productId,
    validUntil: { $gt: new Date() },
  });

  if (!prediction) {
    // Generate new prediction
    prediction = await generatePricePrediction(product, priceHistory);
  }

  res.status(200).json({
    success: true,
    data: {
      currentPrice: product.price,
      prediction: {
        predictedPrice: prediction.predictedPrice,
        predictedDate: prediction.predictedDate,
        confidence: prediction.confidence,
        trend: prediction.trend,
        recommendation: prediction.recommendation,
        factors: prediction.factors,
      },
      priceHistory: priceHistory.slice(0, 30).map(h => ({
        price: h.price,
        date: h.recordedAt,
      })),
    },
  });
});

const generatePricePrediction = async (product, priceHistory) => {
  // Simulate ML prediction (in production, use actual ML model)
  const currentPrice = product.price;
  const avgHistoricalPrice = priceHistory.length > 0
    ? priceHistory.reduce((sum, h) => sum + h.price, 0) / priceHistory.length
    : currentPrice;

  // Factors affecting price
  const factors = [
    {
      name: 'Historical Trend',
      impact: currentPrice > avgHistoricalPrice ? 'negative' : 'positive',
      weight: 0.3,
    },
    {
      name: 'Stock Level',
      impact: product.stock < product.lowStockThreshold ? 'negative' : 'neutral',
      weight: 0.2,
    },
    {
      name: 'Popularity',
      impact: product.ratings >= 4 ? 'negative' : 'positive',
      weight: 0.25,
    },
    {
      name: 'Seasonal Demand',
      impact: 'neutral',
      weight: 0.25,
    },
  ];

  // Calculate prediction
  let priceChange = 0;
  factors.forEach(factor => {
    if (factor.impact === 'positive') priceChange -= currentPrice * 0.05 * factor.weight;
    else if (factor.impact === 'negative') priceChange += currentPrice * 0.05 * factor.weight;
  });

  const predictedPrice = Math.max(currentPrice * 0.7, currentPrice + priceChange);
  const trend = priceChange < -5 ? 'falling' : priceChange > 5 ? 'rising' : 'stable';
  const recommendation = trend === 'rising' ? 'buy_now' : trend === 'falling' ? 'wait' : 'buy_now';

  const prediction = await PricePrediction.create({
    product: product._id,
    currentPrice,
    predictedPrice: Math.round(predictedPrice * 100) / 100,
    predictedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
    confidence: Math.floor(Math.random() * 15) + 75, // 75-90%
    trend,
    recommendation,
    factors,
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
  });

  return prediction;
};

// @desc    Create price alert
// @route   POST /api/ai/price-alert
// @access  Private
export const createPriceAlert = catchAsyncErrors(async (req, res) => {
  const { productId, targetPrice, alertType = 'below', dropPercent } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  const existingAlert = await PriceAlert.findOne({
    user: req.user._id,
    product: productId,
    isActive: true,
  });

  if (existingAlert) {
    existingAlert.targetPrice = targetPrice;
    existingAlert.alertType = alertType;
    existingAlert.dropPercent = dropPercent;
    existingAlert.currentPrice = product.price;
    await existingAlert.save();

    return res.status(200).json({
      success: true,
      message: 'Price alert updated',
      data: existingAlert,
    });
  }

  const alert = await PriceAlert.create({
    user: req.user._id,
    product: productId,
    targetPrice,
    currentPrice: product.price,
    alertType,
    dropPercent,
  });

  res.status(201).json({
    success: true,
    message: 'Price alert created',
    data: alert,
  });
});

// @desc    Get user's price alerts
// @route   GET /api/ai/price-alerts
// @access  Private
export const getPriceAlerts = catchAsyncErrors(async (req, res) => {
  const alerts = await PriceAlert.find({
    user: req.user._id,
    isActive: true,
  }).populate('product', 'name price images');

  res.status(200).json({
    success: true,
    data: alerts,
  });
});

// @desc    Delete price alert
// @route   DELETE /api/ai/price-alert/:alertId
// @access  Private
export const deletePriceAlert = catchAsyncErrors(async (req, res) => {
  await PriceAlert.findOneAndUpdate(
    { _id: req.params.alertId, user: req.user._id },
    { isActive: false }
  );

  res.status(200).json({
    success: true,
    message: 'Price alert removed',
  });
});

// ==================== RECORD PRICE HISTORY ====================
export const recordPriceChange = async (productId, price, originalPrice, discount) => {
  await PriceHistory.create({
    product: productId,
    price,
    originalPrice,
    discount,
  });
};

export default {
  chat,
  getChatHistory,
  rateChatSession,
  visualSearch,
  getRecommendations,
  getPricePrediction,
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert,
  recordPriceChange,
};
