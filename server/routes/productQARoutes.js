import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  getProductQuestions,
  getQuestion,
  askQuestion,
  addAnswer,
  voteAnswer,
  markAnswerHelpful,
  markBestAnswer,
  editAnswer,
  searchQuestions,
  flagContent,
  moderateQuestion,
  getUnansweredQuestions
} from '../controllers/productQAController.js';

const router = express.Router();

router.route('/qa/product/:productId').get(getProductQuestions);
router.route('/qa/search').get(searchQuestions);
router.route('/qa/unanswered')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getUnansweredQuestions);

router.route('/qa/:id').get(getQuestion);

router.route('/qa/ask').post(isAuthenticatedUser, askQuestion);

router.route('/qa/:questionId/answer').post(isAuthenticatedUser, addAnswer);

router.route('/qa/:questionId/answer/:answerId/vote')
  .post(isAuthenticatedUser, voteAnswer);

router.route('/qa/:questionId/answer/:answerId/helpful')
  .post(isAuthenticatedUser, markAnswerHelpful);

router.route('/qa/:questionId/answer/:answerId/best')
  .put(isAuthenticatedUser, markBestAnswer);

router.route('/qa/:questionId/answer/:answerId/edit')
  .put(isAuthenticatedUser, editAnswer);

router.route('/qa/:questionId/flag').post(isAuthenticatedUser, flagContent);

router.route('/qa/:questionId/moderate')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), moderateQuestion);

export default router;
