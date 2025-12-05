import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaStar, FaThumbsUp, FaThumbsDown, FaQuoteLeft, FaLightbulb, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ReviewSummarizer = ({ reviews = [], productName }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    generateSummary();
  }, [reviews]);

  const generateSummary = async () => {
    setLoading(true);
    
    // Simulated AI summary generation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const totalReviews = reviews.length || 50;
    const avgRating = 4.5;

    setSummary({
      headline: `Highly rated with ${avgRating} stars from ${totalReviews} reviews`,
      overview: `Customers love this ${productName || 'product'} for its excellent quality and value. The majority of buyers are satisfied with their purchase and would recommend it to others.`,
      
      pros: [
        { text: 'Excellent build quality and durability', mentions: 45, percentage: 90 },
        { text: 'Great value for the price', mentions: 38, percentage: 76 },
        { text: 'Fast and reliable shipping', mentions: 32, percentage: 64 },
        { text: 'Easy to use and set up', mentions: 28, percentage: 56 },
        { text: 'Stylish and modern design', mentions: 25, percentage: 50 }
      ],
      
      cons: [
        { text: 'Size runs slightly small', mentions: 8, percentage: 16 },
        { text: 'Limited color options', mentions: 5, percentage: 10 },
        { text: 'Instructions could be clearer', mentions: 4, percentage: 8 }
      ],
      
      bestFor: ['Daily use', 'Gift giving', 'First-time buyers'],
      notIdealFor: ['Professional heavy-duty use'],
      
      topMentions: [
        { keyword: 'quality', count: 89, sentiment: 'positive' },
        { keyword: 'comfortable', count: 67, sentiment: 'positive' },
        { keyword: 'worth it', count: 54, sentiment: 'positive' },
        { keyword: 'fast delivery', count: 43, sentiment: 'positive' },
        { keyword: 'size', count: 23, sentiment: 'neutral' }
      ],
      
      buyerTips: [
        'Order one size up if you prefer a looser fit',
        'Check the size guide before ordering',
        'Great for gifting - comes in nice packaging'
      ],
      
      ratingBreakdown: {
        5: 65,
        4: 22,
        3: 8,
        2: 3,
        1: 2
      },
      
      verifiedPurchase: 92,
      wouldRecommend: 94,
      
      highlightedReview: {
        text: "Absolutely love this product! The quality exceeded my expectations and it arrived faster than expected. Would definitely buy again.",
        author: "Sarah M.",
        rating: 5,
        helpful: 127
      }
    });
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <FaRobot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Review Summary</h3>
            <p className="text-white/80 text-sm">{summary.headline}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview */}
        <div>
          <p className="text-gray-300 leading-relaxed">{summary.overview}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{summary.wouldRecommend}%</p>
            <p className="text-gray-400 text-sm">Would Recommend</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{summary.verifiedPurchase}%</p>
            <p className="text-gray-400 text-sm">Verified Buyers</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <FaStar className="text-yellow-400" />
              <span className="text-3xl font-bold text-white">4.5</span>
            </div>
            <p className="text-gray-400 text-sm">Average Rating</p>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Pros */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold flex items-center gap-2 mb-3">
              <FaThumbsUp /> What Customers Love
            </h4>
            <ul className="space-y-2">
              {summary.pros.slice(0, 4).map((pro, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm">{pro.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-gray-700 rounded-full">
                        <div className="h-1 bg-green-500 rounded-full" style={{ width: `${pro.percentage}%` }}></div>
                      </div>
                      <span className="text-gray-500 text-xs">{pro.mentions} mentions</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold flex items-center gap-2 mb-3">
              <FaThumbsDown /> Common Concerns
            </h4>
            <ul className="space-y-2">
              {summary.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">!</span>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm">{con.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-gray-700 rounded-full">
                        <div className="h-1 bg-red-500 rounded-full" style={{ width: `${con.percentage}%` }}></div>
                      </div>
                      <span className="text-gray-500 text-xs">{con.mentions} mentions</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Highlighted Review */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <FaQuoteLeft className="text-purple-400 mb-2" />
          <p className="text-gray-300 italic">"{summary.highlightedReview.text}"</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(summary.highlightedReview.rating)].map((_, i) => (
                  <FaStar key={i} className="w-4 h-4 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-400 text-sm">- {summary.highlightedReview.author}</span>
            </div>
            <span className="text-gray-500 text-sm">{summary.highlightedReview.helpful} found helpful</span>
          </div>
        </div>

        {/* Expandable Section */}
        <motion.div
          initial={false}
          animate={{ height: expanded ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-4 pt-2">
            {/* Best For / Not Ideal For */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-gray-400 text-sm mb-2">Best For:</h5>
                <div className="flex flex-wrap gap-2">
                  {summary.bestFor.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">{item}</span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-gray-400 text-sm mb-2">Not Ideal For:</h5>
                <div className="flex flex-wrap gap-2">
                  {summary.notIdealFor.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">{item}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Buyer Tips */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <h5 className="text-yellow-400 font-semibold flex items-center gap-2 mb-2">
                <FaLightbulb /> Buyer Tips
              </h5>
              <ul className="space-y-1">
                {summary.buyerTips.map((tip, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-yellow-400">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rating Breakdown */}
            <div>
              <h5 className="text-gray-400 text-sm mb-3">Rating Distribution</h5>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm w-8">{rating} ★</span>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-yellow-400 rounded-full" 
                        style={{ width: `${summary.ratingBreakdown[rating]}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-500 text-sm w-12">{summary.ratingBreakdown[rating]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Toggle Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 text-purple-400 hover:text-purple-300 flex items-center justify-center gap-2"
        >
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
          {expanded ? 'Show Less' : 'Show More Details'}
        </button>
      </div>
    </div>
  );
};

export default ReviewSummarizer;
