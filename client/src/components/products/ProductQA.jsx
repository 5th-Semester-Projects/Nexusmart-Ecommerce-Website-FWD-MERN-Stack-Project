import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageCircle, FiThumbsUp, FiThumbsDown, FiChevronDown, 
  FiChevronUp, FiUser, FiClock, FiCheck, FiSend, FiX, FiEdit2, FiTrash2
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Format Date Helper
const formatDate = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(date).toLocaleDateString('en-PK', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Single Question Component
const QuestionItem = ({ 
  question, 
  onAnswer, 
  onVote, 
  onDelete,
  isAdmin = false,
  currentUserId = null,
}) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    setSubmitting(true);
    try {
      await onAnswer(question._id, answerText);
      setAnswerText('');
      setShowAnswerForm(false);
      setShowAnswers(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Question Header */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Votes */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => onVote(question._id, 'up')}
              className={`p-2 rounded-lg transition-colors ${
                question.userVote === 'up'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-cyan-400'
              }`}
            >
              <FiThumbsUp />
            </button>
            <span className="text-sm font-bold text-white">{question.votes || 0}</span>
            <button
              onClick={() => onVote(question._id, 'down')}
              className={`p-2 rounded-lg transition-colors ${
                question.userVote === 'down'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-red-400'
              }`}
            >
              <FiThumbsDown />
            </button>
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <p className="text-white font-medium mb-2">{question.question}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FiUser className="text-cyan-400" />
                {question.user?.name || 'Anonymous'}
              </span>
              <span className="flex items-center gap-1">
                <FiClock />
                {formatDate(question.createdAt)}
              </span>
              {question.answers?.length > 0 && (
                <span className="flex items-center gap-1 text-green-400">
                  <FiCheck />
                  {question.answers.length} answer{question.answers.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {(isAdmin || currentUserId === question.user?._id) && (
            <button
              onClick={() => onDelete(question._id)}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      </div>

      {/* Answers Section */}
      {question.answers?.length > 0 && (
        <>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full px-4 py-2 flex items-center justify-between text-sm text-cyan-400 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span>{showAnswers ? 'Hide' : 'Show'} Answers ({Array.isArray(question.answers) ? question.answers.length : 0})</span>
            {showAnswers ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          <AnimatePresence>
            {showAnswers && Array.isArray(question.answers) && question.answers.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/10"
              >
                {question.answers.map((answer, index) => (
                  <div
                    key={answer._id || index}
                    className={`p-4 ${index > 0 ? 'border-t border-white/5' : ''} ${
                      answer.isOfficial ? 'bg-green-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        answer.isOfficial 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-purple-600/30'
                      }`}>
                        {answer.isOfficial ? (
                          <FiCheck className="text-white" />
                        ) : (
                          <FiUser className="text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${
                            answer.isOfficial ? 'text-green-400' : 'text-white'
                          }`}>
                            {answer.user?.name || 'Store'}
                          </span>
                          {answer.isOfficial && (
                            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                              Official
                            </span>
                          )}
                          <span className="text-xs text-gray-500">{formatDate(answer.createdAt)}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{answer.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Answer Form */}
      <div className="border-t border-white/10">
        {showAnswerForm ? (
          <form onSubmit={handleSubmitAnswer} className="p-4">
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Write your answer..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setShowAnswerForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !answerText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiSend />
                )}
                Submit Answer
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAnswerForm(true)}
            className="w-full px-4 py-3 text-sm text-gray-400 hover:text-cyan-400 flex items-center justify-center gap-2 transition-colors"
          >
            <FiEdit2 />
            Answer this question
          </button>
        )}
      </div>
    </div>
  );
};

// Main Product Q&A Component
const ProductQA = ({ productId, productName }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAskForm, setShowAskForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'votes' | 'answered'
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Fetch questions
  useEffect(() => {
    fetchQuestions();
  }, [productId, sortBy]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${productId}/questions?sort=${sortBy}`);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Set empty array on error
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    if (!isAuthenticated) {
      toast.error('Please login to ask a question');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/products/${productId}/questions`, {
        question: questionText,
      });
      setQuestions(prev => [data.question, ...prev]);
      setQuestionText('');
      setShowAskForm(false);
      toast.success('Question posted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = async (questionId, answer) => {
    try {
      const { data } = await api.post(`/products/${productId}/questions/${questionId}/answers`, {
        answer,
      });
      setQuestions(prev => prev.map(q => 
        q._id === questionId 
          ? { ...q, answers: [...(q.answers || []), data.answer] }
          : q
      ));
      toast.success('Answer posted!');
    } catch (error) {
      toast.error('Failed to post answer');
    }
  };

  const handleVote = async (questionId, type) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    try {
      await api.post(`/products/${productId}/questions/${questionId}/vote`, { type });
      setQuestions(prev => prev.map(q => {
        if (q._id === questionId) {
          const prevVote = q.userVote;
          let votes = q.votes || 0;
          
          if (prevVote === type) {
            // Remove vote
            votes = type === 'up' ? votes - 1 : votes + 1;
            return { ...q, votes, userVote: null };
          } else if (prevVote) {
            // Change vote
            votes = type === 'up' ? votes + 2 : votes - 2;
            return { ...q, votes, userVote: type };
          } else {
            // New vote
            votes = type === 'up' ? votes + 1 : votes - 1;
            return { ...q, votes, userVote: type };
          }
        }
        return q;
      }));
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await api.delete(`/products/${productId}/questions/${questionId}`);
      setQuestions(prev => prev.filter(q => q._id !== questionId));
      toast.success('Question deleted');
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiMessageCircle className="text-cyan-400" />
          Customer Questions & Answers
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none"
        >
          <option value="recent">Most Recent</option>
          <option value="votes">Most Votes</option>
          <option value="answered">Answered First</option>
        </select>
      </div>

      {/* Ask Question Button/Form */}
      <AnimatePresence mode="wait">
        {showAskForm ? (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleAskQuestion}
            className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/30 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Ask a Question</h3>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={`Ask a question about "${productName}"...`}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-400 mt-2 mb-4">
              Be specific about your question. Include any relevant details.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAskForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !questionText.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiSend />
                )}
                Post Question
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAskForm(true)}
            className="w-full py-4 border-2 border-dashed border-white/20 hover:border-cyan-500/50 rounded-2xl text-gray-400 hover:text-cyan-400 transition-all flex items-center justify-center gap-2"
          >
            <FiMessageCircle />
            Have a question? Ask the community
          </motion.button>
        )}
      </AnimatePresence>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-24 bg-white/10 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl">
          <FiMessageCircle className="text-5xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Questions Yet</h3>
          <p className="text-gray-400 mb-6">Be the first to ask about this product!</p>
          <button
            onClick={() => setShowAskForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium"
          >
            Ask a Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionItem
              key={question._id}
              question={question}
              onAnswer={handleAnswer}
              onVote={handleVote}
              onDelete={handleDeleteQuestion}
              isAdmin={user?.role === 'admin'}
              currentUserId={user?._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductQA;
