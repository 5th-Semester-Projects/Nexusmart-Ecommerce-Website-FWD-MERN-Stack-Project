import ProductQuestion from '../models/ProductQuestion.js';
import Product from '../models/Product.js';
import { catchAsyncErrors as catchAsync } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Get all questions for a product
// @route   GET /api/questions/product/:productId
// @access  Public
export const getProductQuestions = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  const result = await ProductQuestion.getProductQuestions(productId, page, limit);

  res.status(200).json({
    success: true,
    ...result,
  });
});

// @desc    Ask a question about a product
// @route   POST /api/questions
// @access  Private
export const askQuestion = catchAsync(async (req, res, next) => {
  const { productId, question } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  const newQuestion = await ProductQuestion.create({
    product: productId,
    user: req.user._id,
    question,
  });

  await newQuestion.populate('user', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Question submitted successfully',
    question: newQuestion,
  });
});

// @desc    Answer a question
// @route   POST /api/questions/:questionId/answer
// @access  Private
export const answerQuestion = catchAsync(async (req, res, next) => {
  const { questionId } = req.params;
  const { answer } = req.body;

  const question = await ProductQuestion.findById(questionId);
  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  // Check if user already answered
  const existingAnswer = question.answers.find(
    a => a.user.toString() === req.user._id.toString()
  );

  if (existingAnswer) {
    return next(new ErrorHandler('You have already answered this question', 400));
  }

  // Determine if this is a verified purchase or seller answer
  const product = await Product.findById(question.product);
  const isVerifiedPurchase = false; // You would check order history here
  const isSeller = req.user.role === 'admin' || req.user.role === 'seller';

  question.answers.push({
    user: req.user._id,
    answer,
    isVerifiedPurchase,
    isSeller,
  });

  await question.save();
  await question.populate('answers.user', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Answer submitted successfully',
    question,
  });
});

// @desc    Vote on a question (helpful)
// @route   POST /api/questions/:questionId/vote
// @access  Private
export const voteQuestion = catchAsync(async (req, res, next) => {
  const { questionId } = req.params;
  const { voteType } = req.body; // 'up' or 'down'

  const question = await ProductQuestion.findById(questionId);
  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  const userId = req.user._id.toString();
  const upVoteIndex = question.upvotes.findIndex(id => id.toString() === userId);
  const downVoteIndex = question.downvotes.findIndex(id => id.toString() === userId);

  if (voteType === 'up') {
    // Remove from downvotes if exists
    if (downVoteIndex !== -1) {
      question.downvotes.splice(downVoteIndex, 1);
    }
    // Toggle upvote
    if (upVoteIndex !== -1) {
      question.upvotes.splice(upVoteIndex, 1);
    } else {
      question.upvotes.push(req.user._id);
    }
  } else if (voteType === 'down') {
    // Remove from upvotes if exists
    if (upVoteIndex !== -1) {
      question.upvotes.splice(upVoteIndex, 1);
    }
    // Toggle downvote
    if (downVoteIndex !== -1) {
      question.downvotes.splice(downVoteIndex, 1);
    } else {
      question.downvotes.push(req.user._id);
    }
  }

  await question.save();

  res.status(200).json({
    success: true,
    upvotes: question.upvotes.length,
    downvotes: question.downvotes.length,
    userVote: question.upvotes.includes(req.user._id)
      ? 'up'
      : question.downvotes.includes(req.user._id)
        ? 'down'
        : null,
  });
});

// @desc    Vote on an answer
// @route   POST /api/questions/:questionId/answer/:answerId/vote
// @access  Private
export const voteAnswer = catchAsync(async (req, res, next) => {
  const { questionId, answerId } = req.params;
  const { voteType } = req.body;

  const question = await ProductQuestion.findById(questionId);
  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  const answer = question.answers.id(answerId);
  if (!answer) {
    return next(new ErrorHandler('Answer not found', 404));
  }

  const userId = req.user._id.toString();
  const upVoteIndex = answer.upvotes.findIndex(id => id.toString() === userId);
  const downVoteIndex = answer.downvotes.findIndex(id => id.toString() === userId);

  if (voteType === 'up') {
    if (downVoteIndex !== -1) {
      answer.downvotes.splice(downVoteIndex, 1);
    }
    if (upVoteIndex !== -1) {
      answer.upvotes.splice(upVoteIndex, 1);
    } else {
      answer.upvotes.push(req.user._id);
    }
  } else if (voteType === 'down') {
    if (upVoteIndex !== -1) {
      answer.upvotes.splice(upVoteIndex, 1);
    }
    if (downVoteIndex !== -1) {
      answer.downvotes.splice(downVoteIndex, 1);
    } else {
      answer.downvotes.push(req.user._id);
    }
  }

  await question.save();

  res.status(200).json({
    success: true,
    upvotes: answer.upvotes.length,
    downvotes: answer.downvotes.length,
    userVote: answer.upvotes.includes(req.user._id)
      ? 'up'
      : answer.downvotes.includes(req.user._id)
        ? 'down'
        : null,
  });
});

// @desc    Get user's questions
// @route   GET /api/questions/my-questions
// @access  Private
export const getMyQuestions = catchAsync(async (req, res, next) => {
  const questions = await ProductQuestion.find({ user: req.user._id })
    .populate('product', 'name images price')
    .populate('answers.user', 'name avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: questions.length,
    questions,
  });
});

// @desc    Delete a question (owner or admin only)
// @route   DELETE /api/questions/:questionId
// @access  Private
export const deleteQuestion = catchAsync(async (req, res, next) => {
  const question = await ProductQuestion.findById(req.params.questionId);

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  // Check if user is owner or admin
  if (question.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorHandler('Not authorized to delete this question', 403));
  }

  await question.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Question deleted successfully',
  });
});

// ==================== ADMIN ROUTES ====================

// @desc    Get all questions (Admin)
// @route   GET /api/questions/admin/all
// @access  Admin
export const getAllQuestions = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {};

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by product
  if (req.query.productId) {
    query.product = req.query.productId;
  }

  // Filter unanswered
  if (req.query.unanswered === 'true') {
    query['answers.0'] = { $exists: false };
  }

  const [questions, total] = await Promise.all([
    ProductQuestion.find(query)
      .populate('product', 'name images')
      .populate('user', 'name email')
      .populate('answers.user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ProductQuestion.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: questions.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    questions,
  });
});

// @desc    Update question status (Admin)
// @route   PATCH /api/questions/admin/:questionId/status
// @access  Admin
export const updateQuestionStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const question = await ProductQuestion.findByIdAndUpdate(
    req.params.questionId,
    { status },
    { new: true, runValidators: true }
  );

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  res.status(200).json({
    success: true,
    question,
  });
});

// @desc    Get Q&A statistics (Admin)
// @route   GET /api/questions/admin/stats
// @access  Admin
export const getQAStats = catchAsync(async (req, res, next) => {
  const stats = await ProductQuestion.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        unanswered: [
          { $match: { 'answers.0': { $exists: false } } },
          { $count: 'count' },
        ],
        totalQuestions: [{ $count: 'count' }],
        totalAnswers: [
          { $project: { answerCount: { $size: '$answers' } } },
          { $group: { _id: null, total: { $sum: '$answerCount' } } },
        ],
        recentQuestions: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'products',
              localField: 'product',
              foreignField: '_id',
              as: 'product',
            },
          },
          { $unwind: '$product' },
          {
            $project: {
              question: 1,
              createdAt: 1,
              'product.name': 1,
              answerCount: { $size: '$answers' },
            },
          },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      byStatus: stats[0].byStatus,
      unanswered: stats[0].unanswered[0]?.count || 0,
      totalQuestions: stats[0].totalQuestions[0]?.count || 0,
      totalAnswers: stats[0].totalAnswers[0]?.total || 0,
      recentQuestions: stats[0].recentQuestions,
    },
  });
});

export default {
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
};
