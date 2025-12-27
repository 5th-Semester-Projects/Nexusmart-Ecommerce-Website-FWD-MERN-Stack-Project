import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['product_knowledge', 'brand_trivia', 'general', 'seasonal', 'promotional']
  },
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: Number,
    points: {
      type: Number,
      default: 10
    },
    explanation: String,
    image: String
  }],
  rewards: {
    participation: {
      points: Number,
      coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
      }
    },
    completion: {
      points: Number,
      coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
      }
    },
    perfectScore: {
      points: Number,
      coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
      },
      badge: String
    }
  },
  settings: {
    timeLimit: Number, // seconds per quiz
    passingScore: Number, // percentage
    maxAttempts: Number,
    randomizeQuestions: Boolean,
    showCorrectAnswers: Boolean
  },
  attempts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    correctAnswers: Number,
    totalQuestions: Number,
    timeToken: Number,
    answers: [{
      question: Number,
      selectedAnswer: Number,
      isCorrect: Boolean
    }],
    completedAt: Date,
    rewardClaimed: Boolean
  }],
  analytics: {
    totalAttempts: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  schedule: {
    startDate: Date,
    endDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

quizSchema.index({ isActive: 1 });
quizSchema.index({ 'attempts.user': 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
export { Quiz };
