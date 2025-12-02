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
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// AI Chatbot Routes
router.post('/chat', chat);
router.get('/chat/:sessionId', getChatHistory);
router.post('/chat/:sessionId/rate', rateChatSession);

// Visual Search Routes
router.post('/visual-search', visualSearch);

// Price Features
router.get('/price-prediction/:productId', getPricePrediction);

// Recommendations
router.get('/recommendations', getRecommendations);

// Price Alerts
router.post('/price-alerts', isAuthenticatedUser, createPriceAlert);
router.get('/price-alerts', isAuthenticatedUser, getPriceAlerts);
router.delete('/price-alerts/:id', isAuthenticatedUser, deletePriceAlert);

export default router;
