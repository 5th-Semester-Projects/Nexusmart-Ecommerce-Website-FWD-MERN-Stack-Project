import express from 'express';
import {
  startLiveChat,
  sendMessage,
  endLiveChat,
  getLiveChatHistory,
  rateLiveChat,
  getAgentChats,
  assignAgent,
  getOrderTracking,
  updateOrderTracking,
  startLiveTracking,
  getActiveFlashSales,
  createFlashSale,
  updateFlashSale,
  endFlashSale,
  getProductViewerCount,
  incrementViewerCount,
  decrementViewerCount,
  getProductActivityFeed,
  getSupportTickets,
  createSupportTicket,
  updateSupportTicket,
} from '../controllers/realTimeController.js';
import { isAuthenticated, authorizeRoles, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Live Chat Routes
router.post('/chat/start', isAuthenticated, startLiveChat);
router.post('/chat/:sessionId/message', isAuthenticated, sendMessage);
router.post('/chat/:sessionId/end', isAuthenticated, endLiveChat);
router.get('/chat/:sessionId', isAuthenticated, getLiveChatHistory);
router.post('/chat/:sessionId/rate', isAuthenticated, rateLiveChat);

// Agent Routes
router.get('/chat/agent/pending', isAuthenticated, authorizeRoles('admin', 'support'), getAgentChats);
router.post('/chat/:sessionId/assign', isAuthenticated, authorizeRoles('admin', 'support'), assignAgent);

// Order Tracking Routes
router.get('/tracking/:orderId', isAuthenticated, getOrderTracking);
router.put('/tracking/:orderId', isAuthenticated, authorizeRoles('admin', 'delivery'), updateOrderTracking);
router.post('/tracking/:orderId/live', isAuthenticated, startLiveTracking);

// Flash Sale Routes
router.get('/flash-sales', getActiveFlashSales);
router.post('/flash-sales', isAuthenticated, authorizeRoles('admin'), createFlashSale);
router.put('/flash-sales/:id', isAuthenticated, authorizeRoles('admin'), updateFlashSale);
router.post('/flash-sales/:id/end', isAuthenticated, authorizeRoles('admin'), endFlashSale);

// Product Viewers Routes
router.get('/viewers/:productId', getProductViewerCount);
router.post('/viewers/:productId/join', optionalAuth, incrementViewerCount);
router.post('/viewers/:productId/leave', optionalAuth, decrementViewerCount);
router.get('/activity/:productId', getProductActivityFeed);

// Support Tickets
router.get('/tickets', isAuthenticated, getSupportTickets);
router.post('/tickets', isAuthenticated, createSupportTicket);
router.put('/tickets/:id', isAuthenticated, updateSupportTicket);

export default router;
