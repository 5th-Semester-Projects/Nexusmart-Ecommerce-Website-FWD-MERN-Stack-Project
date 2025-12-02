import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  isOfficial: {
    type: Boolean,
    default: false,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const questionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: [true, 'Please enter your question'],
    trim: true,
    maxlength: [1000, 'Question cannot exceed 1000 characters'],
  },
  answers: [answerSchema],
  votes: {
    type: Number,
    default: 0,
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isAnswered: {
    type: Boolean,
    default: false,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
questionSchema.index({ product: 1, createdAt: -1 });
questionSchema.index({ product: 1, votes: -1 });
questionSchema.index({ product: 1, isAnswered: 1 });

// Update isAnswered when answers are added
questionSchema.pre('save', function (next) {
  this.isAnswered = this.answers.length > 0;
  next();
});

// Virtual for answer count
questionSchema.virtual('answerCount').get(function () {
  return this.answers.length;
});

// Method to add vote
questionSchema.methods.vote = async function (userId, voteType) {
  const userIdStr = userId.toString();
  const hasUpvoted = this.upvotes.some(id => id.toString() === userIdStr);
  const hasDownvoted = this.downvotes.some(id => id.toString() === userIdStr);

  if (voteType === 'up') {
    if (hasUpvoted) {
      // Remove upvote
      this.upvotes = this.upvotes.filter(id => id.toString() !== userIdStr);
      this.votes -= 1;
    } else {
      // Add upvote
      if (hasDownvoted) {
        this.downvotes = this.downvotes.filter(id => id.toString() !== userIdStr);
        this.votes += 1;
      }
      this.upvotes.push(userId);
      this.votes += 1;
    }
  } else if (voteType === 'down') {
    if (hasDownvoted) {
      // Remove downvote
      this.downvotes = this.downvotes.filter(id => id.toString() !== userIdStr);
      this.votes += 1;
    } else {
      // Add downvote
      if (hasUpvoted) {
        this.upvotes = this.upvotes.filter(id => id.toString() !== userIdStr);
        this.votes -= 1;
      }
      this.downvotes.push(userId);
      this.votes -= 1;
    }
  }

  await this.save();
  return this;
};

// Method to add answer
questionSchema.methods.addAnswer = async function (userId, answerText, isOfficial = false) {
  this.answers.push({
    user: userId,
    answer: answerText,
    isOfficial,
  });

  await this.save();
  return this.answers[this.answers.length - 1];
};

// Static method to get questions for product
questionSchema.statics.getProductQuestions = async function (productId, options = {}) {
  const { sort = 'recent', page = 1, limit = 10 } = options;

  let sortOption = {};
  switch (sort) {
    case 'votes':
      sortOption = { isPinned: -1, votes: -1, createdAt: -1 };
      break;
    case 'answered':
      sortOption = { isPinned: -1, isAnswered: -1, votes: -1, createdAt: -1 };
      break;
    default:
      sortOption = { isPinned: -1, createdAt: -1 };
  }

  const questions = await this.find({
    product: productId,
    status: 'approved',
  })
    .populate('user', 'name')
    .populate('answers.user', 'name')
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await this.countDocuments({
    product: productId,
    status: 'approved',
  });

  return {
    questions,
    total,
    pages: Math.ceil(total / limit),
    page,
  };
};

export default mongoose.model('ProductQuestion', questionSchema);
