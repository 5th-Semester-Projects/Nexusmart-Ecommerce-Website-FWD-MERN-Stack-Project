import express from 'express';
import {
  chat,
  getChatHistory,
  rateChatSession,
  visualSearch,
  getPricePrediction,
  getRecommendations,
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert,
} from '../controllers/aiController.js';
import { isAuthenticated, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// AI Chatbot Routes
router.post('/chat', optionalAuth, chat);
router.get('/chat/:sessionId', getChatHistory);
router.post('/chat/:sessionId/rate', rateChatSession);

// Visual Search Routes
router.post('/visual-search', optionalAuth, visualSearch);

// Price Features
router.get('/price-prediction/:productId', getPricePrediction);

// Recommendations
router.get('/recommendations', optionalAuth, getRecommendations);

// Price Alerts
router.post('/price-alerts', isAuthenticated, createPriceAlert);
router.get('/price-alerts', isAuthenticated, getPriceAlerts);
router.delete('/price-alerts/:id', isAuthenticated, deletePriceAlert);

export default router;
