import express from 'express';
import {
  createSupportTicket,
  getTicketDetails,
  reassignTicket,
  analyzeSentiment,
  getSentimentTrends,
  scheduleVideoCall,
  startVideoSession,
  endVideoSession,
  searchKnowledgeBase,
  getAISuggestions,
  scheduleCallback
} from '../controllers/enhancedCustomerServiceController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// AI Chat Triaging
router.post('/tickets', isAuthenticatedUser, createSupportTicket);
router.get('/tickets/:ticketId', isAuthenticatedUser, getTicketDetails);
router.put('/tickets/:ticketId/reassign', isAuthenticatedUser, authorizeRoles('admin', 'support'), reassignTicket);

// Sentiment Analysis
router.post('/sentiment/analyze', isAuthenticatedUser, analyzeSentiment);
router.get('/sentiment/trends', isAuthenticatedUser, authorizeRoles('admin'), getSentimentTrends);

// Video Support
router.post('/video/schedule', isAuthenticatedUser, scheduleVideoCall);
router.post('/video/:sessionId/start', isAuthenticatedUser, authorizeRoles('admin', 'support'), startVideoSession);
router.post('/video/:sessionId/end', isAuthenticatedUser, authorizeRoles('admin', 'support'), endVideoSession);

// Knowledge Base AI
router.get('/kb/search', searchKnowledgeBase);
router.get('/kb/suggestions/:ticketId', isAuthenticatedUser, authorizeRoles('admin', 'support'), getAISuggestions);

// Callback Scheduling
router.post('/callback', isAuthenticatedUser, scheduleCallback);

export default router;
