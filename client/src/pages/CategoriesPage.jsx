import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingBag, FiMonitor, FiWatch, FiHeadphones, FiSmartphone,
  FiTrendingUp, FiPackage, FiGrid, FiLayers, FiZap
} from 'react-icons/fi';
import { FaTshirt, FaLaptop, FaMobileAlt, FaCamera, FaGamepad } from 'react-icons/fa';
import { GiRunningShoe, GiLipstick, GiClothes } from 'react-icons/gi';
import api from '../utils/api';
// Removed DarkMagicalParticles for performance
import MagicalGenie from '../components/common/MagicalGenie';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Icon and color mapping for dynamic categories
  const categoryConfig = {
    electronics: {
      icon: FiMonitor,
      color: 'from-blue-500 to-cyan-500',
      bgGlow: 'bg-blue-500/20',
      description: 'Latest gadgets and electronics'
    },
    men: {
      icon: FaTshirt,
      color: 'from-purple-500 to-pink-500',
      bgGlow: 'bg-purple-500/20',
      description: 'Fashion for modern men'
    },
    women: {
      icon: GiClothes,
      color: 'from-pink-500 to-rose-500',
      bgGlow: 'bg-pink-500/20',
      description: 'Trendy women\'s fashion'
    },
    accessories: {
      icon: FiWatch,
      color: 'from-cyan-500 to-teal-500',
      bgGlow: 'bg-cyan-500/20',
      description: 'Complete your look'
    },
    audio: {
      icon: FiHeadphones,
      color: 'from-indigo-500 to-purple-500',
      bgGlow: 'bg-indigo-500/20',
      description: 'Premium sound experience'
    },
    smartphones: {
      icon: FiSmartphone,
      color: 'from-green-500 to-emerald-500',
      bgGlow: 'bg-green-500/20',
      description: 'Latest mobile technology'
    },
    footwear: {
      icon: GiRunningShoe,
      color: 'from-orange-500 to-red-500',
      bgGlow: 'bg-orange-500/20',
      description: 'Step up your style'
    },
    beauty: {
      icon: GiLipstick,
      color: 'from-pink-500 to-fuchsia-500',
      bgGlow: 'bg-pink-500/20',
      description: 'Beauty essentials'
    },
    gaming: {
      icon: FaGamepad,
      color: 'from-red-500 to-orange-500',
      bgGlow: 'bg-red-500/20',
      description: 'Gaming gear & accessories'
    },
    cameras: {
      icon: FaCamera,
      color: 'from-yellow-500 to-orange-500',
      bgGlow: 'bg-yellow-500/20',
      description: 'Capture every moment'
    },
    laptops: {
      icon: FaLaptop,
      color: 'from-gray-500 to-slate-500',
      bgGlow: 'bg-gray-500/20',
      description: 'Powerful computing'
    },
    trending: {
      icon: FiTrendingUp,
      color: 'from-violet-500 to-purple-500',
      bgGlow: 'bg-violet-500/20',
      description: 'What\'s hot right now'
    },
    // Default fallback
    default: {
      icon: FiPackage,
      color: 'from-gray-500 to-slate-500',
      bgGlow: 'bg-gray-500/20',
      description: 'Explore this category'
    }
  };

  useEffect(() => {
    fetchCategoriesWithCounts();
  }, []);

  const fetchCategoriesWithCounts = async () => {
    try {
      // Fetch all products to count by category
      const productsResponse = await api.get('/products', { params: { limit: 1000 } });
      const allProducts = productsResponse.data?.products || [];
      
      // Count products per category and build dynamic categories
      const categoryCounts = {};
      allProducts.forEach(product => {
        const categoryName = typeof product.category === 'object' 
          ? product.category.name 
          : product.category;
        
        if (categoryName) {
          const catLower = categoryName.toLowerCase();
          categoryCounts[catLower] = (categoryCounts[catLower] || 0) + 1;
        }
      });

      // Build categories from actual data with icon/color mapping
      const dynamicCategories = Object.keys(categoryCounts).map(slug => {
        const config = categoryConfig[slug] || categoryConfig.default;
        return {
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug: slug,
          icon: config.icon,
          color: config.color,
          bgGlow: config.bgGlow,
          description: config.description,
          count: categoryCounts[slug]
        };
      });

      // Sort by count (highest first)
      dynamicCategories.sort((a, b) => b.count - a.count);
      
      setCategories(dynamicCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categorySlug) => {
    navigate(`/products?category=${categorySlug}`);
  };

  return (
    <>
      <Helmet>
        <title>Categories - NexusMart</title>
        <meta name="description" content="Browse all product categories at NexusMart" />
      </Helmet>

      <div className="min-h-screen relative py-12">
        {/* Lightweight CSS Background */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950"></div>

        {/* Magical Genie */}
        <MagicalGenie />

        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <FiGrid className="text-4xl text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="gradient-text">Explore Categories</span>
            </h1>
            <p className="text-xl text-purple-300/70 max-w-2xl mx-auto">
              Discover amazing products across all categories
            </p>
          </motion.div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 h-48 animate-pulse">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-xl mb-4"></div>
                  <div className="h-6 bg-purple-500/20 rounded mb-2"></div>
                  <div className="h-4 bg-purple-500/10 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onHoverStart={() => setHoveredCategory(category.slug)}
                    onHoverEnd={() => setHoveredCategory(null)}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="group relative cursor-pointer"
                  >
                    {/* Glow Effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${category.color} rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500`}></div>

                    {/* Card */}
                    <div className="relative glass-card rounded-2xl p-6 h-full flex flex-col">
                      {/* Floating Orb */}
                      <div className={`absolute top-0 right-0 w-32 h-32 ${category.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                      {/* Icon */}
                      <motion.div
                        animate={{
                          rotateY: hoveredCategory === category.slug ? 360 : 0,
                        }}
                        transition={{ duration: 0.6 }}
                        className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4 shadow-lg relative z-10`}
                      >
                        <Icon className="text-3xl text-white" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-grow relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all">
                          {category.name}
                        </h3>
                        <p className="text-purple-300/70 text-sm mb-3">
                          {category.description}
                        </p>
                        
                        {/* Product Count */}
                        <div className="flex items-center gap-2 text-cyan-400">
                          <FiPackage className="text-sm" />
                          <span className="text-sm font-semibold">{category.count} Products</span>
                        </div>
                      </div>

                      {/* Hover Arrow */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: hoveredCategory === category.slug ? 1 : 0,
                          x: hoveredCategory === category.slug ? 0 : -10
                        }}
                        className="absolute bottom-6 right-6"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center shadow-lg`}>
                          <FiZap className="text-white" />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 glass-card rounded-3xl p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <FiLayers className="text-2xl text-white" />
                </div>
                <h3 className="text-3xl font-bold gradient-text mb-2">{categories.length}+</h3>
                <p className="text-purple-300/70">Categories</p>
              </div>
              <div>
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-600 to-red-600 rounded-xl flex items-center justify-center mb-4">
                  <FiPackage className="text-2xl text-white" />
                </div>
                <h3 className="text-3xl font-bold gradient-text mb-2">
                  {categories.reduce((sum, cat) => sum + cat.count, 0)}+
                </h3>
                <p className="text-purple-300/70">Total Products</p>
              </div>
              <div>
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                  <FiTrendingUp className="text-2xl text-white" />
                </div>
                <h3 className="text-3xl font-bold gradient-text mb-2">100%</h3>
                <p className="text-purple-300/70">Quality Guaranteed</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default CategoriesPage;
