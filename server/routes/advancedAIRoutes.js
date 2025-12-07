import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import chatbotService from '../services/chatbotService.js';
import visualSearchService from '../services/visualSearchService.js';
import priceOptimizationService from '../services/priceOptimizationService.js';
import reviewsAIService from '../services/reviewsAIService.js';
import predictiveInventoryService from '../services/predictiveInventoryService.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * AI Chatbot Routes
 */
router.post('/chatbot/message', isAuthenticatedUser, async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const response = await chatbotService.chat(req.user._id, message, sessionId);
    res.status(200).json({ success: true, ...response });
  } catch (error) {
    next(error);
  }
});

router.get('/chatbot/quick-replies', (req, res) => {
  res.status(200).json({
    success: true,
    quickReplies: chatbotService.getQuickReplies()
  });
});

router.delete('/chatbot/history/:sessionId', isAuthenticatedUser, (req, res) => {
  chatbotService.clearHistory(req.params.sessionId);
  res.status(200).json({ success: true, message: 'History cleared' });
});

/**
 * Visual Search Routes
 */
router.post('/visual-search', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }
    const results = await visualSearchService.search(req.file.buffer);
    res.status(200).json({ success: true, ...results });
  } catch (error) {
    next(error);
  }
});

router.post('/visual-search/url', async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required' });
    }
    const results = await visualSearchService.search(imageUrl);
    res.status(200).json({ success: true, ...results });
  } catch (error) {
    next(error);
  }
});

router.get('/visual-search/similar/:productId', async (req, res, next) => {
  try {
    const products = await visualSearchService.findVisuallySimilar(req.params.productId);
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

/**
 * Price Optimization Routes (Admin)
 */
router.get('/price/optimize/:productId',
  isAuthenticatedUser,
  authorizeRoles('admin', 'seller'),
  async (req, res, next) => {
    try {
      const result = await priceOptimizationService.calculateOptimalPrice(req.params.productId);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/price/optimize/bulk',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const { productIds } = req.body;
      const results = await priceOptimizationService.optimizePrices(productIds);
      res.status(200).json({ success: true, results });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/price/apply/:productId',
  isAuthenticatedUser,
  authorizeRoles('admin', 'seller'),
  async (req, res, next) => {
    try {
      const { newPrice, reason } = req.body;
      const result = await priceOptimizationService.applyPriceChange(
        req.params.productId,
        newPrice,
        reason
      );
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Reviews AI Routes
 */
router.post('/reviews/analyze', async (req, res, next) => {
  try {
    const { text } = req.body;
    const sentiment = await reviewsAIService.analyzeSentiment(text);
    res.status(200).json({ success: true, sentiment });
  } catch (error) {
    next(error);
  }
});

router.get('/reviews/summary/:productId', async (req, res, next) => {
  try {
    const summary = await reviewsAIService.generateReviewSummary(req.params.productId);
    res.status(200).json({ success: true, ...summary });
  } catch (error) {
    next(error);
  }
});

router.get('/reviews/pros-cons/:productId', async (req, res, next) => {
  try {
    const prosAndCons = await reviewsAIService.extractProsAndCons(req.params.productId);
    res.status(200).json({ success: true, ...prosAndCons });
  } catch (error) {
    next(error);
  }
});

router.post('/reviews/check-fake',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const { review, userHistory } = req.body;
      const result = await reviewsAIService.detectFakeReview(review, userHistory);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/reviews/generate-response',
  isAuthenticatedUser,
  async (req, res, next) => {
    try {
      const { review } = req.body;
      const response = await reviewsAIService.generateResponseSuggestion(review);
      res.status(200).json({ success: true, ...response });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/reviews/moderate',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const { text } = req.body;
      const moderation = await reviewsAIService.moderateReview(text);
      res.status(200).json({ success: true, ...moderation });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Predictive Inventory Routes (Admin)
 */
router.get('/inventory/forecast/:productId',
  isAuthenticatedUser,
  authorizeRoles('admin', 'seller'),
  async (req, res, next) => {
    try {
      const days = parseInt(req.query.days) || 30;
      const forecast = await predictiveInventoryService.forecastDemand(req.params.productId, days);
      res.status(200).json({ success: true, ...forecast });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/inventory/forecast/bulk',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const { productIds, days } = req.body;
      const results = await predictiveInventoryService.bulkForecast(productIds, days);
      res.status(200).json({ success: true, results });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/inventory/reorder-alerts',
  isAuthenticatedUser,
  authorizeRoles('admin', 'seller'),
  async (req, res, next) => {
    try {
      const alerts = await predictiveInventoryService.getProductsNeedingReorder();
      res.status(200).json({ success: true, alerts });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
