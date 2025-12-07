import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Eye,
  Flag,
  Sparkles,
  RefreshCw,
  Download,
  Settings,
  Zap
} from 'lucide-react';
import axios from 'axios';

const AIReviewsAnalyzer = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchReviewsAnalysis();
  }, [filter]);

  const fetchReviewsAnalysis = async () => {
    setIsLoading(true);
    try {
      const [reviewsRes, statsRes, sentimentRes] = await Promise.all([
        axios.get(`/api/v1/ai/reviews/analyze?filter=${filter}`),
        axios.get('/api/v1/ai/reviews/stats'),
        axios.get('/api/v1/ai/reviews/sentiment')
      ]);

      setReviews(reviewsRes.data.reviews);
      setStats(statsRes.data.stats);
      setSentiment(sentimentRes.data.sentiment);
    } catch (error) {
      console.error('Error fetching reviews analysis:', error);
      // Fallback data
      setStats({
        totalReviews: 1250,
        averageRating: 4.3,
        positivePercentage: 78,
        negativePercentage: 12,
        neutralPercentage: 10,
        fakeReviewsDetected: 8,
        responseRate: 85
      });
      setSentiment({
        positive: ['Great quality', 'Fast shipping', 'Excellent customer service', 'Good value'],
        negative: ['Slow delivery', 'Packaging issues', 'Size mismatch'],
        trending: [
          { topic: 'Quality', sentiment: 'positive', count: 245 },
          { topic: 'Delivery', sentiment: 'mixed', count: 180 },
          { topic: 'Price', sentiment: 'positive', count: 156 }
        ]
      });
      setReviews([
        {
          _id: '1',
          customer: { name: 'John D.', avatar: null },
          product: { name: 'Wireless Headphones', image: null },
          rating: 5,
          title: 'Amazing sound quality!',
          text: 'These headphones exceeded my expectations. The sound quality is incredible and the battery life is excellent.',
          date: new Date().toISOString(),
          sentiment: 'positive',
          score: 0.92,
          pros: ['Sound quality', 'Battery life', 'Comfort'],
          cons: [],
          isFake: false,
          helpful: 24,
          replied: true
        },
        {
          _id: '2',
          customer: { name: 'Sarah M.', avatar: null },
          product: { name: 'Smart Watch', image: null },
          rating: 2,
          title: 'Disappointed with battery',
          text: 'The watch looks great but the battery only lasts one day. Expected much better for this price.',
          date: new Date(Date.now() - 86400000).toISOString(),
          sentiment: 'negative',
          score: 0.25,
          pros: ['Design'],
          cons: ['Battery life', 'Price'],
          isFake: false,
          helpful: 12,
          replied: false
        },
        {
          _id: '3',
          customer: { name: 'Mike R.', avatar: null },
          product: { name: 'USB Hub', image: null },
          rating: 4,
          title: 'Good but not perfect',
          text: 'Works well for my needs. Could be a bit faster but overall satisfied with the purchase.',
          date: new Date(Date.now() - 172800000).toISOString(),
          sentiment: 'neutral',
          score: 0.65,
          pros: ['Compatibility', 'Build quality'],
          cons: ['Speed'],
          isFake: false,
          helpful: 8,
          replied: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateResponse = async (reviewId) => {
    try {
      const response = await axios.post(`/api/v1/ai/reviews/${reviewId}/generate-response`);
      // Show generated response
      alert(`Generated Response: ${response.data.response}`);
    } catch (error) {
      console.error('Error generating response:', error);
    }
  };

  const handleFlagReview = async (reviewId) => {
    try {
      await axios.post(`/api/v1/ai/reviews/${reviewId}/flag`);
      fetchReviewsAnalysis();
    } catch (error) {
      console.error('Error flagging review:', error);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Analyzing reviews with AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Reviews Analyzer
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Deep sentiment analysis and fake review detection
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button 
              onClick={fetchReviewsAnalysis}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
          >
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.totalReviews?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-500">Total Reviews</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.averageRating || 0}
              </p>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-sm text-gray-500">Avg Rating</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4"
          >
            <p className="text-2xl font-bold text-green-600">{stats?.positivePercentage || 0}%</p>
            <p className="text-sm text-green-700 dark:text-green-400">Positive</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4"
          >
            <p className="text-2xl font-bold text-yellow-600">{stats?.neutralPercentage || 0}%</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">Neutral</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4"
          >
            <p className="text-2xl font-bold text-red-600">{stats?.negativePercentage || 0}%</p>
            <p className="text-sm text-red-700 dark:text-red-400">Negative</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4"
          >
            <p className="text-2xl font-bold text-orange-600">{stats?.fakeReviewsDetected || 0}</p>
            <p className="text-sm text-orange-700 dark:text-orange-400">Fake Detected</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4"
          >
            <p className="text-2xl font-bold text-blue-600">{stats?.responseRate || 0}%</p>
            <p className="text-sm text-blue-700 dark:text-blue-400">Response Rate</p>
          </motion.div>
        </div>

        {/* Trending Topics & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Positive Keywords */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <ThumbsUp className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Top Positive Mentions</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {sentiment?.positive?.map((keyword, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Negative Keywords */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <ThumbsDown className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Areas for Improvement</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {sentiment?.negative?.map((keyword, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Trending Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Trending Topics</h3>
            </div>
            <div className="space-y-3">
              {sentiment?.trending?.map((topic, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{topic.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getSentimentColor(topic.sentiment)}`}>
                      {topic.sentiment}
                    </span>
                    <span className="text-sm text-gray-500">{topic.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'positive', 'neutral', 'negative', 'flagged'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="divide-y dark:divide-gray-700">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                      {review.customer?.name?.charAt(0) || '?'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {review.customer?.name}
                      </span>
                      <div className="flex items-center">{renderStars(review.rating)}</div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getSentimentColor(review.sentiment)}`}>
                        {review.sentiment}
                      </span>
                      {review.isFake && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Potential Fake
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mb-2">
                      {review.product?.name} • {new Date(review.date).toLocaleDateString()}
                    </p>

                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {review.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {review.text}
                    </p>

                    {/* Pros & Cons */}
                    <div className="flex flex-wrap gap-4 mb-3">
                      {review.pros?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-500">
                            {review.pros.join(', ')}
                          </span>
                        </div>
                      )}
                      {review.cons?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-500">
                            {review.cons.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {review.helpful} found helpful
                      </span>
                      
                      {review.replied ? (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Replied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleGenerateResponse(review._id)}
                          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          <Sparkles className="w-4 h-4" />
                          Generate AI Response
                        </button>
                      )}

                      {!review.isFake && (
                        <button
                          onClick={() => handleFlagReview(review._id)}
                          className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <Flag className="w-4 h-4" />
                          Flag
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(review.score * 100)}%
                    </div>
                    <p className="text-xs text-gray-500">Confidence</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIReviewsAnalyzer;
