import chatbotService from '../services/chatbotService.js';
import visualSearchService from '../services/visualSearchService.js';
import priceOptimizationService from '../services/priceOptimizationService.js';
import reviewsAIService from '../services/reviewsAIService.js';
import predictiveInventoryService from '../services/predictiveInventoryService.js';

/**
 * Advanced AI Controller
 * Unified controller for all AI-powered features
 */

// ==================== CHATBOT ====================

// Chat with AI
export const chat = async (req, res, next) => {
  try {
    const { message, sessionId, context } = req.body;

    const response = await chatbotService.chat({
      message,
      sessionId,
      userId: req.user?._id,
      context
    });

    res.status(200).json({
      success: true,
      response: response.message,
      suggestions: response.suggestions,
      actions: response.actions
    });
  } catch (error) {
    next(error);
  }
};

// Get chat history
export const getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const history = await chatbotService.getHistory(sessionId);

    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};

// ==================== VISUAL SEARCH ====================

// Search by image
export const visualSearch = async (req, res, next) => {
  try {
    const { imageUrl, imageBase64 } = req.body;

    if (!imageUrl && !imageBase64 && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const image = imageBase64 || imageUrl || req.file?.path;
    const results = await visualSearchService.search(image);

    res.status(200).json({
      success: true,
      features: results.features,
      products: results.products,
      similarityScores: results.scores
    });
  } catch (error) {
    next(error);
  }
};

// Extract features from image
export const extractFeatures = async (req, res, next) => {
  try {
    const { imageUrl, imageBase64 } = req.body;

    const image = imageBase64 || imageUrl;
    const features = await visualSearchService.extractFeatures(image);

    res.status(200).json({
      success: true,
      features
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PRICE OPTIMIZATION ====================

// Get pricing suggestions
export const getPricingSuggestions = async (req, res, next) => {
  try {
    const { strategy = 'balanced', category, limit = 20 } = req.query;

    const suggestions = await priceOptimizationService.getSuggestions({
      strategy,
      category,
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    next(error);
  }
};

// Get pricing stats
export const getPricingStats = async (req, res, next) => {
  try {
    const stats = await priceOptimizationService.getStats();

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// Optimize single product price
export const optimizePrice = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { strategy } = req.body;

    const result = await priceOptimizationService.optimizeProduct(productId, strategy);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// Apply suggested price
export const applyPrice = async (req, res, next) => {
  try {
    const { productId, newPrice } = req.body;

    await priceOptimizationService.applyPrice(productId, newPrice, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Price updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== REVIEWS AI ====================

// Analyze reviews
export const analyzeReviews = async (req, res, next) => {
  try {
    const { filter = 'all', productId } = req.query;

    const reviews = await reviewsAIService.analyze({ filter, productId });

    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews stats
export const getReviewsStats = async (req, res, next) => {
  try {
    const { productId } = req.query;

    const stats = await reviewsAIService.getStats(productId);

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// Get sentiment analysis
export const getSentimentAnalysis = async (req, res, next) => {
  try {
    const { productId } = req.query;

    const sentiment = await reviewsAIService.getSentiment(productId);

    res.status(200).json({
      success: true,
      sentiment
    });
  } catch (error) {
    next(error);
  }
};

// Generate AI response for review
export const generateReviewResponse = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const response = await reviewsAIService.generateResponse(reviewId);

    res.status(200).json({
      success: true,
      response
    });
  } catch (error) {
    next(error);
  }
};

// Flag suspicious review
export const flagReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    await reviewsAIService.flagReview(reviewId, reason, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Review flagged for review'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PREDICTIVE INVENTORY ====================

// Get inventory forecasts
export const getInventoryForecasts = async (req, res, next) => {
  try {
    const { range = '30days', category } = req.query;

    const forecasts = await predictiveInventoryService.getForecast({
      range,
      category
    });

    res.status(200).json({
      success: true,
      forecasts
    });
  } catch (error) {
    next(error);
  }
};

// Get inventory alerts
export const getInventoryAlerts = async (req, res, next) => {
  try {
    const alerts = await predictiveInventoryService.getAlerts();

    res.status(200).json({
      success: true,
      alerts
    });
  } catch (error) {
    next(error);
  }
};

// Get inventory stats
export const getInventoryStats = async (req, res, next) => {
  try {
    const stats = await predictiveInventoryService.getStats();

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// Create reorder
export const createReorder = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const reorder = await predictiveInventoryService.createReorder({
      productId,
      quantity,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Reorder created successfully',
      reorder
    });
  } catch (error) {
    next(error);
  }
};

// Get demand prediction for product
export const getDemandPrediction = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;

    const prediction = await predictiveInventoryService.predictDemand(
      productId,
      parseInt(days)
    );

    res.status(200).json({
      success: true,
      prediction
    });
  } catch (error) {
    next(error);
  }
};

export default {
  // Chatbot
  chat,
  getChatHistory,

  // Visual Search
  visualSearch,
  extractFeatures,

  // Price Optimization
  getPricingSuggestions,
  getPricingStats,
  optimizePrice,
  applyPrice,

  // Reviews AI
  analyzeReviews,
  getReviewsStats,
  getSentimentAnalysis,
  generateReviewResponse,
  flagReview,

  // Predictive Inventory
  getInventoryForecasts,
  getInventoryAlerts,
  getInventoryStats,
  createReorder,
  getDemandPrediction
};
