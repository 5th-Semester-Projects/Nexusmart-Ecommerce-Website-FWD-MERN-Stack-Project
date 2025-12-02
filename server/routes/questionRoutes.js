import express from 'express';
import {
  getProductQuestions,
  askQuestion,
  answerQuestion,
  voteQuestion,
  voteAnswer,
  getMyQuestions,
  deleteQuestion,
  getAllQuestions,
  updateQuestionStatus,
  getQAStats,
} from '../controllers/questionController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.get('/product/:productId', getProductQuestions);

// ==================== USER ROUTES ====================
router.post('/', isAuthenticatedUser, askQuestion);
router.get('/my-questions', isAuthenticatedUser, getMyQuestions);
router.post('/:questionId/answer', isAuthenticatedUser, answerQuestion);
router.post('/:questionId/vote', isAuthenticatedUser, voteQuestion);
router.post('/:questionId/answer/:answerId/vote', isAuthenticatedUser, voteAnswer);
router.delete('/:questionId', isAuthenticatedUser, deleteQuestion);

// ==================== ADMIN ROUTES ====================
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), getAllQuestions);
router.get('/admin/stats', isAuthenticatedUser, authorizeRoles('admin'), getQAStats);
router.patch('/admin/:questionId/status', isAuthenticatedUser, authorizeRoles('admin'), updateQuestionStatus);

export default router;
