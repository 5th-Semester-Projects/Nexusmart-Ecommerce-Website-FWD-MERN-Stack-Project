import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiZap, FiClock, FiPercent, FiTrendingUp, FiStar, FiShoppingCart,
  FiHeart, FiEye, FiTag, FiGift
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addItemToWishlist, removeItemFromWishlist } from '../redux/slices/wishlistSlice';
import { addItemToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import api from '../utils/api';
import EnergyParticles from '../components/3d/EnergyParticles';
import MagicalGenie from '../components/common/MagicalGenie';

const DealsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    fetchDeals();
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await api.get('/products?limit=100');
      let products = response.data?.products || [];
      
      // If no products or less than 10, create mock deals
      if (products.length < 10) {
        products = generateMockDeals();
      }
      
      // Add random discounts to products without them
      products = products.map(product => {
        const hasDiscount = product.discount > 0 || (product.originalPrice && product.originalPrice > product.price);
        
        if (!hasDiscount) {
          // Randomly assign discount between 10% to 70%
          const randomDiscount = Math.floor(Math.random() * 61) + 10; // 10-70%
          const originalPrice = product.price / (1 - randomDiscount / 100);
          
          return {
            ...product,
            originalPrice: Math.round(originalPrice * 100) / 100,
            discount: randomDiscount
          };
        }
        
        return product;
      });
      
      // Filter and enhance deals data
      const dealsData = products
        .filter(p => p.discount > 0 || (p.originalPrice && p.originalPrice > p.price))
        .map(product => ({
          ...product,
          discount: product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100),
          dealType: product.discount >= 50 ? 'hot' : product.discount >= 30 ? 'trending' : 'regular',
          soldCount: Math.floor(Math.random() * 100) + 20,
          stock: product.stock || Math.floor(Math.random() * 50) + 10
        }))
        .sort((a, b) => b.discount - a.discount)
        .slice(0, 20); // Show top 20 deals
      
      setDeals(dealsData);
    } catch (error) {
      console.error('Error fetching deals:', error);
      // Fallback to mock deals on error
      setDeals(generateMockDeals());
    } finally {
      setLoading(false);
    }
  };

  const generateMockDeals = () => {
    const categories = ['Electronics', 'Men', 'Women', 'Accessories'];
    const mockProducts = [];
    
    for (let i = 0; i < 20; i++) {
      const discount = Math.floor(Math.random() * 61) + 10; // 10-70%
      const price = Math.floor(Math.random() * 200) + 20;
      const originalPrice = Math.round((price / (1 - discount / 100)) * 100) / 100;
      
      mockProducts.push({
        _id: `deal-${i}`,
        name: `Deal Product ${i + 1}`,
        price: price,
        originalPrice: originalPrice,
        discount: discount,
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
        numOfReviews: Math.floor(Math.random() * 500),
        category: categories[Math.floor(Math.random() * categories.length)],
        stock: Math.floor(Math.random() * 50) + 10,
        images: [{
          url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=400&h=400&fit=crop`
        }],
        dealType: discount >= 50 ? 'hot' : discount >= 30 ? 'trending' : 'regular',
        soldCount: Math.floor(Math.random() * 100) + 20
      });
    }
    
    return mockProducts.sort((a, b) => b.discount - a.discount);
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    
    if (isInWishlist(product._id)) {
      dispatch(removeItemFromWishlist(product._id));
      toast.success('Removed from wishlist', { icon: '💔' });
    } else {
      dispatch(addItemToWishlist({
        ...product,
        category: typeof product.category === 'object' ? product.category?.name : product.category
      }));
      toast.success('Added to wishlist!', { icon: '💜' });
    }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    
    dispatch(addItemToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.image,
      stock: product.stock,
      quantity: 1,
    }));
    
    toast.success('Added to cart!', { icon: '🛒' });
  };

  const getDealBadge = (dealType) => {
    switch (dealType) {
      case 'hot':
        return { text: 'HOT DEAL', color: 'from-red-500 to-orange-500', icon: FiZap };
      case 'trending':
        return { text: 'TRENDING', color: 'from-purple-500 to-pink-500', icon: FiTrendingUp };
      default:
        return { text: 'DEAL', color: 'from-blue-500 to-cyan-500', icon: FiTag };
    }
  };

  return (
    <>
      <Helmet>
        <title>Hot Deals - NexusMart</title>
        <meta name="description" content="Best deals and discounts on NexusMart" />
      </Helmet>

      <div className="min-h-screen relative py-12">
        {/* Energy Particles Background */}
        <div className="fixed inset-0 -z-10">
          <EnergyParticles intensity="medium" />
        </div>

        {/* Magical Genie */}
        <MagicalGenie />

        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header with Countdown */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {/* Title */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                <FiZap className="text-4xl text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="gradient-text">🔥 Hot Deals</span>
            </h1>
            <p className="text-xl text-purple-300/70 mb-8">
              Limited time offers - Grab them before they're gone!
            </p>

            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-4 glass-card rounded-2xl p-6"
            >
              <FiClock className="text-3xl text-cyan-400" />
              <div className="flex items-center gap-2">
                <span className="text-purple-300/70 text-sm">Deals end in:</span>
                <div className="flex gap-2">
                  <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-lg px-3 py-2 min-w-[60px]">
                    <div className="text-2xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-xs text-white/70">Hours</div>
                  </div>
                  <div className="text-2xl text-purple-300">:</div>
                  <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-lg px-3 py-2 min-w-[60px]">
                    <div className="text-2xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-xs text-white/70">Minutes</div>
                  </div>
                  <div className="text-2xl text-purple-300">:</div>
                  <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-lg px-3 py-2 min-w-[60px]">
                    <div className="text-2xl font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-xs text-white/70">Seconds</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Deals Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 h-96 animate-pulse"></div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center">
              <FiGift className="text-6xl text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold gradient-text mb-2">No Deals Available</h2>
              <p className="text-purple-300/70">Check back soon for amazing offers!</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {deals.map((deal, index) => {
                const badge = getDealBadge(deal.dealType);
                const BadgeIcon = badge.icon;
                const progressPercentage = (deal.soldCount / (deal.soldCount + deal.stock)) * 100;

                return (
                  <motion.div
                    key={deal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    onClick={() => navigate(`/products/${deal._id}`)}
                    className="group relative cursor-pointer"
                  >
                    {/* Glow Effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${badge.color} rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500`}></div>

                    {/* Card */}
                    <div className="relative glass-card rounded-2xl overflow-hidden h-full">
                      {/* Deal Badge */}
                      <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 bg-gradient-to-r ${badge.color} rounded-full text-white text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse`}>
                        <BadgeIcon />
                        {badge.text}
                      </div>

                      {/* Wishlist Button */}
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleWishlistToggle(e, deal)}
                        className={`absolute top-4 right-4 z-20 p-3 rounded-full backdrop-blur-xl transition-all ${
                          isInWishlist(deal._id)
                            ? 'bg-gradient-to-br from-pink-500 to-red-500 text-white'
                            : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <FiHeart className={isInWishlist(deal._id) ? 'fill-current' : ''} />
                      </motion.button>

                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={deal.images?.[0]?.url || deal.image}
                          alt={deal.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Discount Badge */}
                        <div className="absolute bottom-4 left-4 px-4 py-2 bg-red-500 rounded-xl text-white font-bold text-2xl shadow-lg">
                          -{deal.discount}%
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>

                      {/* Product Details */}
                      <div className="p-6">
                        {/* Category */}
                        {deal.category && (
                          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 bg-purple-500/20 text-purple-300">
                            {typeof deal.category === 'object' ? deal.category.name : deal.category}
                          </span>
                        )}

                        {/* Name */}
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400">
                          {deal.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`text-sm ${
                                  i < Math.floor(deal.rating || 4.5)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-purple-300/70">({deal.numOfReviews || 0})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl font-bold gradient-text">
                            ${deal.price?.toFixed(2)}
                          </span>
                          {deal.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${deal.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-purple-300/70 mb-1">
                            <span>Sold: {deal.soldCount}</span>
                            <span>Available: {deal.stock}</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercentage}%` }}
                              transition={{ delay: index * 0.05 + 0.3, duration: 1 }}
                              className={`h-full bg-gradient-to-r ${badge.color}`}
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleAddToCart(e, deal)}
                          disabled={deal.stock === 0}
                          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiShoppingCart />
                          {deal.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 glass-card rounded-3xl p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <FiPercent className="text-4xl text-red-400 mx-auto mb-2" />
                <h3 className="text-3xl font-bold gradient-text mb-1">Up to 70%</h3>
                <p className="text-purple-300/70">Maximum Discount</p>
              </div>
              <div>
                <FiZap className="text-4xl text-orange-400 mx-auto mb-2" />
                <h3 className="text-3xl font-bold gradient-text mb-1">{deals.length}+</h3>
                <p className="text-purple-300/70">Active Deals</p>
              </div>
              <div>
                <FiGift className="text-4xl text-purple-400 mx-auto mb-2" />
                <h3 className="text-3xl font-bold gradient-text mb-1">Daily</h3>
                <p className="text-purple-300/70">New Offers</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default DealsPage;
