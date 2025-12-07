import ProductQA from '../models/ProductQA.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/ErrorHandler.js';

// Get product questions
export const getProductQuestions = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { status, category } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const questions = await ProductQA.getProductQuestions(productId, filter);

  res.status(200).json({
    success: true,
    count: questions.length,
    questions
  });
});

// Get question by ID
export const getQuestion = catchAsyncErrors(async (req, res, next) => {
  const question = await ProductQA.findById(req.params.id)
    .populate('question.askedBy answers.answeredBy.user product');

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  question.engagement.views += 1;
  await question.save();

  res.status(200).json({
    success: true,
    question
  });
});

// Ask question
export const askQuestion = catchAsyncErrors(async (req, res, next) => {
  const { productId, text, category, images, isAnonymous } = req.body;

  const questionData = {
    product: productId,
    seller: req.body.sellerId,
    question: {
      askedBy: req.user._id,
      text,
      category,
      images: images || [],
      isAnonymous: isAnonymous || false
    }
  };

  const question = await ProductQA.create(questionData);

  res.status(201).json({
    success: true,
    message: 'Question posted successfully',
    question
  });
});

// Add answer
export const addAnswer = catchAsyncErrors(async (req, res, next) => {
  const { questionId } = req.params;
  const { text, images, videos, userType, isOfficial } = req.body;

  const question = await ProductQA.findById(questionId);

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  const answerData = {
    userId: req.user._id,
    text,
    images: images || [],
    videos: videos || [],
    userType,
    isOfficial: isOfficial || false
  };

  await question.addAnswer(answerData);

  res.status(200).json({
    success: true,
    message: 'Answer added successfully',
    question
  });
});

// Vote answer
export const voteAnswer = catchAsyncErrors(async (req, res, next) => {
  const { questionId, answerId } = req.params;
  const { voteType } = req.body;

  const question = await ProductQA.findById(questionId);

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  await question.voteAnswer(answerId, req.user._id, voteType);

  res.status(200).json({
    success: true,
    message: 'Vote recorded'
  });
});

// Mark answer as helpful
export const markAnswerHelpful = catchAsyncErrors(async (req, res, next) => {
  const { questionId, answerId } = req.params;

  const question = await ProductQA.findById(questionId);

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  const answer = question.answers.id(answerId);

  if (!answer) {
    return next(new ErrorHandler('Answer not found', 404));
  }

  if (!answer.helpful.users.includes(req.user._id)) {
    answer.helpful.users.push(req.user._id);
    answer.helpful.count += 1;
    await question.save();
  }

  res.status(200).json({
    success: true,
    message: 'Marked as helpful'
  });
});

// Mark best answer
export const markBestAnswer = catchAsyncErrors(async (req, res, next) => {
  const { questionId, answerId } = req.params;

  const question = await ProductQA.findById(questionId);

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  if (question.question.askedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Only question author can mark best answer', 403));
  }

  await question.markBestAnswer(answerId, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Best answer marked',
    question
  });
});

// Edit answer
export const editAnswer = catchAsyncErrors(async (req, res, next) => {
  const { questionId, answerId } = req.params;
  const { text } = req.body;

  const question = await ProductQA.findById(questionId);

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  const answer = question.answers.id(answerId);

  if (!answer) {
    return next(new ErrorHandler('Answer not found', 404));
  }

  if (answer.answeredBy.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  answer.editHistory.push({
    text: answer.text,
    editedAt: Date.now()
  });

  answer.text = text;
  answer.isEdited = true;
  answer.editedAt = Date.now();

  await question.save();

  res.status(200).json({
    success: true,
    message: 'Answer updated'
  });
});

// Search questions
export const searchQuestions = catchAsyncErrors(async (req, res, next) => {
  const { productId, searchText } = req.query;

  const questions = await ProductQA.searchQuestions(searchText, productId);

  res.status(200).json({
    success: true,
    count: questions.length,
    questions
  });
});

// Flag question/answer
export const flagContent = catchAsyncErrors(async (req, res, next) => {
  const { questionId } = req.params;
  const { reason, description } = req.body;

  const question = await ProductQA.findById(questionId);

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  question.moderation.flags.push({
    flaggedBy: req.user._id,
    reason,
    description
  });

  question.moderation.status = 'flagged';
  await question.save();

  res.status(200).json({
    success: true,
    message: 'Content flagged for review'
  });
});

// Moderate question
export const moderateQuestion = catchAsyncErrors(async (req, res, next) => {
  const { questionId } = req.params;
  const { status, reason } = req.body;

  const question = await ProductQA.findById(questionId);

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  question.moderation.status = status;
  question.moderation.moderatedBy = req.user._id;
  question.moderation.moderatedAt = Date.now();
  question.moderation.reason = reason;

  await question.save();

  res.status(200).json({
    success: true,
    message: 'Question moderated'
  });
});

// Get unanswered questions
export const getUnansweredQuestions = catchAsyncErrors(async (req, res, next) => {
  const questions = await ProductQA.find({
    status: 'unanswered',
    'moderation.status': 'approved'
  })
    .populate('question.askedBy product')
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: questions.length,
    questions
  });
});
