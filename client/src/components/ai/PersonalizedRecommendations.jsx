import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMagic, FaStar, FaHeart, FaShoppingCart, FaEye,
  FaChartLine, FaRobot, FaFire, FaGem, FaClock,
  FaUserFriends, FaHistory, FaTags, FaArrowRight,
  FaThumbsUp, FaPercent, FaSpinner
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const PersonalizedRecommendations = ({ 
  userId, 
  currentProduct = null,
  viewMode = 'full', // 'full' | 'compact' | 'carousel'
  limit = 12 
}) => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [recommendations, setRecommendations] = useState({
    forYou: [],
    trending: [],
    basedOnHistory: [],
    frequentlyBought: [],
    similarProducts: [],
    newArrivals: []
  });
  const [activeTab, setActiveTab] = useState('forYou');
  const [isLoading, setIsLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState({
    categories: [],
    priceRange: { min: 0, max: 1000 },
    brands: [],
    styles: []
  });

  // Recommendation Engine Algorithm
  const calculateRecommendationScore = (product, userProfile) => {
    let score = 0;
    
    // Category match (30% weight)
    if (userProfile.viewedCategories?.includes(product.category)) {
      score += 30 * (userProfile.categoryFrequency?.[product.category] || 1);
    }
    
    // Price preference match (20% weight)
    const avgPurchasePrice = userProfile.avgPurchasePrice || 50;
    const priceDiff = Math.abs(product.price - avgPurchasePrice);
    score += Math.max(0, 20 - (priceDiff / avgPurchasePrice) * 20);
    
    // Brand affinity (15% weight)
    if (userProfile.favoriteBrands?.includes(product.brand)) {
      score += 15;
    }
    
    // Rating factor (15% weight)
    score += (product.rating / 5) * 15;
    
    // Recency factor (10% weight)
    const daysSinceCreated = (Date.now() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - daysSinceCreated / 30);
    
    // Popularity factor (10% weight)
    score += Math.min(10, product.numReviews / 10);
    
    return score;
  };

  // Collaborative Filtering Simulation
  const getCollaborativeRecommendations = (userPurchases, allUsers) => {
    // Find users with similar purchase patterns
    const similarUsers = allUsers.filter(u => {
      const commonPurchases = u.purchases?.filter(p => 
        userPurchases.some(up => up.product === p.product)
      );
      return commonPurchases?.length > 2;
    });

    // Get products bought by similar users
    const recommendedProducts = [];
    similarUsers.forEach(user => {
      user.purchases?.forEach(p => {
        if (!userPurchases.some(up => up.product === p.product)) {
          recommendedProducts.push(p.product);
        }
      });
    });

    return recommendedProducts;
  };

  // Content-Based Filtering
  const getContentBasedRecommendations = (viewedProducts, allProducts) => {
    const avgFeatures = {
      avgPrice: viewedProducts.reduce((sum, p) => sum + p.price, 0) / viewedProducts.length,
      categories: [...new Set(viewedProducts.map(p => p.category))],
      avgRating: viewedProducts.reduce((sum, p) => sum + p.rating, 0) / viewedProducts.length
    };

    return allProducts
      .filter(p => !viewedProducts.some(vp => vp._id === p._id))
      .map(product => ({
        ...product,
        score: calculateRecommendationScore(product, {
          viewedCategories: avgFeatures.categories,
          avgPurchasePrice: avgFeatures.avgPrice
        })
      }))
      .sort((a, b) => b.score - a.score);
  };

  // Load recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call with ML recommendations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - In production, this would come from ML backend
        const mockProducts = generateMockProducts();
        
        setRecommendations({
          forYou: mockProducts.slice(0, 8).map((p, i) => ({
            ...p,
            matchScore: 95 - i * 3,
            reason: getRecommendationReason(i)
          })),
          trending: mockProducts.slice(8, 16).map(p => ({
            ...p,
            trendScore: Math.floor(Math.random() * 50) + 50,
            salesIncrease: Math.floor(Math.random() * 200) + 50
          })),
          basedOnHistory: mockProducts.slice(16, 24).map(p => ({
            ...p,
            relatedTo: 'Previous purchase'
          })),
          frequentlyBought: mockProducts.slice(24, 28),
          similarProducts: currentProduct ? mockProducts.slice(28, 34) : [],
          newArrivals: mockProducts.slice(34, 40).map(p => ({
            ...p,
            isNew: true,
            addedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          }))
        });
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, currentProduct]);

  // Generate mock products
  const generateMockProducts = () => {
    const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'];
    const products = [];
    
    for (let i = 0; i < 50; i++) {
      products.push({
        _id: `prod_${i}`,
        name: `Premium Product ${i + 1}`,
        price: Math.floor(Math.random() * 200) + 20,
        originalPrice: Math.floor(Math.random() * 100) + 200,
        rating: (Math.random() * 2 + 3).toFixed(1),
        numReviews: Math.floor(Math.random() * 500) + 10,
        category: categories[Math.floor(Math.random() * categories.length)],
        images: [{ url: `https://via.placeholder.com/300x400?text=Product+${i + 1}` }],
        stock: Math.floor(Math.random() * 100),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    
    return products;
  };

  // Get recommendation reason
  const getRecommendationReason = (index) => {
    const reasons = [
      'Based on your browsing history',
      'Popular in your preferred categories',
      'Matches your style preferences',
      'Frequently bought by similar customers',
      'Trending in your area',
      'Highly rated in your favorite category',
      'New arrival you might like',
      'Based on your wishlist'
    ];
    return reasons[index % reasons.length];
  };

  // Tab configuration
  const tabs = [
    { id: 'forYou', label: 'For You', icon: FaMagic, color: 'purple' },
    { id: 'trending', label: 'Trending', icon: FaFire, color: 'red' },
    { id: 'basedOnHistory', label: 'Based on History', icon: FaHistory, color: 'blue' },
    { id: 'frequentlyBought', label: 'Frequently Bought', icon: FaUserFriends, color: 'green' },
    { id: 'newArrivals', label: 'New Arrivals', icon: FaGem, color: 'pink' }
  ];

  // Render product card
  const ProductCard = ({ product, index, showMatchScore = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="bg-gray-900 rounded-xl overflow-hidden group cursor-pointer"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.images[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Match Score Badge */}
        {showMatchScore && product.matchScore && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs text-white font-semibold flex items-center gap-1">
            <FaMagic className="w-3 h-3" />
            {product.matchScore}% Match
          </div>
        )}

        {/* Trend Score */}
        {product.trendScore && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full text-xs text-white font-semibold flex items-center gap-1">
            <FaFire className="w-3 h-3" />
            Hot!
          </div>
        )}

        {/* New Badge */}
        {product.isNew && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-green-600 to-teal-600 rounded-full text-xs text-white font-semibold">
            NEW
          </div>
        )}

        {/* Discount Badge */}
        {product.originalPrice > product.price && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 rounded text-xs text-white font-semibold">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Added to wishlist');
            }}
            className="p-2 bg-white rounded-full shadow-lg"
          >
            <FaHeart className="w-4 h-4 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Added to cart');
            }}
            className="p-2 bg-white rounded-full shadow-lg"
          >
            <FaShoppingCart className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-purple-400 mb-1">{product.category}</p>
        
        {/* Name */}
        <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Recommendation Reason */}
        {product.reason && (
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <FaRobot className="w-3 h-3" />
            {product.reason}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <FaStar className="w-3 h-3 text-yellow-400" />
          <span className="text-white text-xs">{product.rating}</span>
          <span className="text-gray-500 text-xs">({product.numReviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">${product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-gray-500 text-sm line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Trend indicator */}
        {product.salesIncrease && (
          <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
            <FaChartLine className="w-3 h-3" />
            +{product.salesIncrease}% sales this week
          </div>
        )}
      </div>
    </motion.div>
  );

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-gray-900 rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-[3/4] bg-gray-800" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-800 rounded w-1/3" />
            <div className="h-4 bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-800 rounded w-2/3" />
            <div className="h-5 bg-gray-800 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FaSpinner className="w-6 h-6 text-purple-500 animate-spin" />
          <span className="text-white">Personalizing recommendations for you...</span>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <FaMagic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Recommended For You</h2>
            <p className="text-gray-400 text-sm">AI-powered personalized suggestions</p>
          </div>
        </div>
        
        {/* AI Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full">
          <FaRobot className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm">Powered by AI</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? `bg-${tab.color}-600 text-white`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              style={isActive ? { backgroundColor: `var(--${tab.color}-600, #9333ea)` } : {}}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs opacity-70">
                ({recommendations[tab.id]?.length || 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {recommendations[activeTab]?.slice(0, limit).map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              index={index}
              showMatchScore={activeTab === 'forYou'}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* View All Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/products')}
        className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center gap-2"
      >
        View All Recommendations
        <FaArrowRight className="w-4 h-4" />
      </motion.button>

      {/* Similar Products Section (if current product exists) */}
      {currentProduct && recommendations.similarProducts?.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaTags className="w-5 h-5 text-blue-400" />
            Similar to "{currentProduct.name}"
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.similarProducts.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;
