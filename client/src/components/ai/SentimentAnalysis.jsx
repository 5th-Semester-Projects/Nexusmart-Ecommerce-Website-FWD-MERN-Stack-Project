import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSmile, FaMeh, FaFrown, FaAngry, FaGrinHearts,
  FaChartPie, FaFilter, FaSearch, FaStar,
  FaThumbsUp, FaThumbsDown, FaExclamationTriangle,
  FaLightbulb, FaChartBar, FaComment, FaTags
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const SentimentAnalysis = ({ productId, reviews = [] }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [analyzedReviews, setAnalyzedReviews] = useState([]);
  const [topicsBreakdown, setTopicsBreakdown] = useState([]);
  const [emotionTrends, setEmotionTrends] = useState([]);

  // Sentiment categories with colors and icons
  const sentimentCategories = {
    veryPositive: { icon: FaGrinHearts, color: 'from-green-500 to-emerald-400', label: 'Very Positive', range: [0.7, 1] },
    positive: { icon: FaSmile, color: 'from-green-400 to-green-300', label: 'Positive', range: [0.3, 0.7] },
    neutral: { icon: FaMeh, color: 'from-yellow-400 to-yellow-300', label: 'Neutral', range: [-0.3, 0.3] },
    negative: { icon: FaFrown, color: 'from-orange-400 to-orange-300', label: 'Negative', range: [-0.7, -0.3] },
    veryNegative: { icon: FaAngry, color: 'from-red-500 to-red-400', label: 'Very Negative', range: [-1, -0.7] }
  };

  useEffect(() => {
    analyzeReviews();
  }, [productId, reviews]);

  // NLP-based sentiment analysis simulation
  const analyzeText = (text) => {
    // Positive and negative word lists
    const positiveWords = [
      'amazing', 'excellent', 'perfect', 'love', 'great', 'best', 'wonderful',
      'fantastic', 'awesome', 'incredible', 'outstanding', 'superb', 'brilliant',
      'happy', 'satisfied', 'recommend', 'quality', 'beautiful', 'comfortable'
    ];
    
    const negativeWords = [
      'terrible', 'awful', 'bad', 'worst', 'hate', 'poor', 'disappointing',
      'horrible', 'broken', 'defective', 'waste', 'useless', 'cheap', 'flimsy',
      'uncomfortable', 'regret', 'refund', 'return', 'problem', 'issue'
    ];

    const intensifiers = ['very', 'extremely', 'really', 'absolutely', 'totally'];
    const negators = ['not', 'never', 'no', "don't", "doesn't", "didn't", "won't"];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    let confidence = 0.5;

    words.forEach((word, index) => {
      const prevWord = words[index - 1];
      const isNegated = negators.includes(prevWord);
      const isIntensified = intensifiers.includes(prevWord);
      
      let wordScore = 0;
      if (positiveWords.includes(word)) wordScore = 0.2;
      if (negativeWords.includes(word)) wordScore = -0.2;
      
      if (isNegated) wordScore *= -1;
      if (isIntensified) wordScore *= 1.5;
      
      score += wordScore;
    });

    // Normalize score between -1 and 1
    score = Math.max(-1, Math.min(1, score));
    
    // Calculate confidence based on text length and clarity
    confidence = Math.min(0.95, 0.5 + (words.length / 100) * 0.3);

    // Determine sentiment category
    let sentiment = 'neutral';
    if (score > 0.7) sentiment = 'veryPositive';
    else if (score > 0.3) sentiment = 'positive';
    else if (score < -0.7) sentiment = 'veryNegative';
    else if (score < -0.3) sentiment = 'negative';

    // Extract aspects/topics
    const aspects = extractAspects(text);
    
    // Detect emotions
    const emotions = detectEmotions(text);

    return { score, sentiment, confidence, aspects, emotions };
  };

  // Extract product aspects mentioned in review
  const extractAspects = (text) => {
    const aspectKeywords = {
      quality: ['quality', 'material', 'build', 'construction', 'durable', 'sturdy'],
      price: ['price', 'value', 'money', 'worth', 'expensive', 'cheap', 'affordable'],
      delivery: ['delivery', 'shipping', 'arrived', 'package', 'packaging'],
      design: ['design', 'look', 'style', 'appearance', 'color', 'beautiful'],
      comfort: ['comfort', 'comfortable', 'fit', 'size', 'wear'],
      performance: ['performance', 'works', 'function', 'fast', 'slow', 'battery'],
      service: ['service', 'support', 'customer', 'help', 'response']
    };

    const foundAspects = [];
    const lowerText = text.toLowerCase();

    Object.entries(aspectKeywords).forEach(([aspect, keywords]) => {
      if (keywords.some(kw => lowerText.includes(kw))) {
        foundAspects.push(aspect);
      }
    });

    return foundAspects;
  };

  // Detect emotions in text
  const detectEmotions = (text) => {
    const emotionKeywords = {
      joy: ['happy', 'love', 'excited', 'thrilled', 'delighted', '❤️', '😊', '🎉'],
      trust: ['reliable', 'trust', 'recommend', 'confident', 'safe'],
      surprise: ['surprised', 'unexpected', 'wow', 'amazing', '😮'],
      sadness: ['disappointed', 'sad', 'upset', 'regret', '😢'],
      anger: ['angry', 'frustrated', 'annoyed', 'furious', '😠'],
      fear: ['worried', 'concerned', 'afraid', 'nervous']
    };

    const detectedEmotions = {};
    const lowerText = text.toLowerCase();

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const count = keywords.filter(kw => lowerText.includes(kw)).length;
      if (count > 0) {
        detectedEmotions[emotion] = Math.min(1, count * 0.3);
      }
    });

    return detectedEmotions;
  };

  const analyzeReviews = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock reviews if none provided
      const mockReviews = reviews.length > 0 ? reviews : [
        { id: 1, text: "Absolutely amazing product! The quality is outstanding and it works perfectly. Very happy with my purchase!", rating: 5, date: "2024-01-15", user: "John D." },
        { id: 2, text: "Good product for the price. Delivery was fast. Some minor issues with the packaging but overall satisfied.", rating: 4, date: "2024-01-14", user: "Sarah M." },
        { id: 3, text: "Not what I expected. The quality is poor and it broke after a week. Very disappointed. Requested a refund.", rating: 1, date: "2024-01-13", user: "Mike R." },
        { id: 4, text: "Decent product. Nothing special but does the job. The design is nice but comfortable could be better.", rating: 3, date: "2024-01-12", user: "Emma L." },
        { id: 5, text: "I love this! Best purchase I've made this year. The performance is incredible and customer service was helpful.", rating: 5, date: "2024-01-11", user: "Alex K." },
        { id: 6, text: "Terrible experience. Product arrived damaged and support was unhelpful. Never buying from here again.", rating: 1, date: "2024-01-10", user: "Chris P." },
        { id: 7, text: "Great value for money! The build quality is excellent and it looks beautiful. Highly recommend!", rating: 5, date: "2024-01-09", user: "Lisa T." },
        { id: 8, text: "It's okay. Works as described but shipping took too long. The price was fair though.", rating: 3, date: "2024-01-08", user: "David W." }
      ];

      // Analyze each review
      const analyzed = mockReviews.map(review => ({
        ...review,
        analysis: analyzeText(review.text)
      }));

      setAnalyzedReviews(analyzed);

      // Calculate overall sentiment distribution
      const distribution = {
        veryPositive: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        veryNegative: 0
      };

      analyzed.forEach(r => {
        distribution[r.analysis.sentiment]++;
      });

      // Calculate aspect sentiments
      const aspectSentiments = {};
      analyzed.forEach(r => {
        r.analysis.aspects.forEach(aspect => {
          if (!aspectSentiments[aspect]) {
            aspectSentiments[aspect] = { positive: 0, negative: 0, neutral: 0 };
          }
          if (r.analysis.score > 0.3) aspectSentiments[aspect].positive++;
          else if (r.analysis.score < -0.3) aspectSentiments[aspect].negative++;
          else aspectSentiments[aspect].neutral++;
        });
      });

      const topics = Object.entries(aspectSentiments).map(([topic, counts]) => ({
        topic,
        ...counts,
        total: counts.positive + counts.negative + counts.neutral,
        sentiment: (counts.positive - counts.negative) / (counts.positive + counts.negative + counts.neutral || 1)
      })).sort((a, b) => b.total - a.total);

      setTopicsBreakdown(topics);

      // Calculate overall metrics
      const avgScore = analyzed.reduce((sum, r) => sum + r.analysis.score, 0) / analyzed.length;
      const avgConfidence = analyzed.reduce((sum, r) => sum + r.analysis.confidence, 0) / analyzed.length;

      setSentimentData({
        distribution,
        averageScore: avgScore,
        averageConfidence: avgConfidence,
        totalReviews: analyzed.length,
        recommendationRate: (distribution.veryPositive + distribution.positive) / analyzed.length * 100
      });

    } catch (error) {
      toast.error('Failed to analyze reviews');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentCategory = (score) => {
    if (score > 0.7) return 'veryPositive';
    if (score > 0.3) return 'positive';
    if (score < -0.7) return 'veryNegative';
    if (score < -0.3) return 'negative';
    return 'neutral';
  };

  const filteredReviews = selectedSentiment === 'all' 
    ? analyzedReviews 
    : analyzedReviews.filter(r => r.analysis.sentiment === selectedSentiment);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3 mb-6" />
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <FaChartPie className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Sentiment Analysis</h2>
            <p className="text-gray-400 text-sm">AI-powered review insights</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{sentimentData?.totalReviews}</p>
          <p className="text-gray-400 text-sm">Reviews Analyzed</p>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {Object.entries(sentimentCategories).map(([key, config]) => {
          const count = sentimentData?.distribution[key] || 0;
          const percentage = ((count / sentimentData?.totalReviews) * 100) || 0;
          const Icon = config.icon;
          
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSentiment(selectedSentiment === key ? 'all' : key)}
              className={`p-4 rounded-xl text-center transition-all ${
                selectedSentiment === key
                  ? `bg-gradient-to-r ${config.color} text-white`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs">{percentage.toFixed(0)}%</p>
            </motion.button>
          );
        })}
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaChartBar className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-sm">Avg. Sentiment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${
              sentimentData?.averageScore > 0.3 ? 'text-green-400' :
              sentimentData?.averageScore < -0.3 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {((sentimentData?.averageScore + 1) / 2 * 100).toFixed(0)}%
            </span>
            <span className="text-gray-500 text-sm">positive</span>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaThumbsUp className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-sm">Recommend Rate</span>
          </div>
          <span className="text-2xl font-bold text-green-400">
            {sentimentData?.recommendationRate.toFixed(0)}%
          </span>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaLightbulb className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm">AI Confidence</span>
          </div>
          <span className="text-2xl font-bold text-purple-400">
            {(sentimentData?.averageConfidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Topic Breakdown */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FaTags className="w-4 h-4 text-blue-400" />
          Topic Sentiment Breakdown
        </h3>
        <div className="space-y-3">
          {topicsBreakdown.slice(0, 5).map(topic => (
            <div key={topic.topic}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white capitalize">{topic.topic}</span>
                <span className={topic.sentiment > 0 ? 'text-green-400' : topic.sentiment < 0 ? 'text-red-400' : 'text-yellow-400'}>
                  {topic.sentiment > 0 ? '+' : ''}{(topic.sentiment * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-gray-700">
                <div 
                  className="bg-green-500" 
                  style={{ width: `${(topic.positive / topic.total) * 100}%` }} 
                />
                <div 
                  className="bg-yellow-500" 
                  style={{ width: `${(topic.neutral / topic.total) * 100}%` }} 
                />
                <div 
                  className="bg-red-500" 
                  style={{ width: `${(topic.negative / topic.total) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analyzed Reviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FaComment className="w-4 h-4 text-purple-400" />
            Analyzed Reviews
          </h3>
          <div className="flex items-center gap-2">
            <FaFilter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="bg-gray-800 text-white text-sm px-3 py-1 rounded-lg border border-gray-700"
            >
              <option value="all">All Sentiments</option>
              {Object.entries(sentimentCategories).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          <AnimatePresence>
            {filteredReviews.map((review, index) => {
              const sentConfig = sentimentCategories[review.analysis.sentiment];
              const Icon = sentConfig.icon;
              
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${sentConfig.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{review.user}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
                            ))}
                          </div>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        review.analysis.score > 0 ? 'text-green-400' : review.analysis.score < 0 ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {review.analysis.score > 0 ? '+' : ''}{(review.analysis.score * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {(review.analysis.confidence * 100).toFixed(0)}% confidence
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{review.text}</p>
                  
                  {/* Aspects */}
                  {review.analysis.aspects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {review.analysis.aspects.map(aspect => (
                        <span 
                          key={aspect} 
                          className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full capitalize"
                        >
                          {aspect}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;
