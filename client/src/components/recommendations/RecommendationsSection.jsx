import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiTrendingUp, FiStar, FiZap } from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../products/ProductCard';
import { Spinner } from '../common/Loader';

const RecommendationsSection = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('recommended');

  useEffect(() => {
    loadRecommendations();
    loadTrending();
  }, [isAuthenticated, user]);

  const loadRecommendations = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      if (isAuthenticated && user?._id) {
        const { data } = await axios.get(`${API_URL}/recommendations/personalized/${user._id}`);
        setRecommendations(data.recommendations || []);
      } else {
        // Load popular products for non-authenticated users
        const { data } = await axios.get(`${API_URL}/products?sort=popular&limit=8`);
        setRecommendations(data.products || []);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrending = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const { data } = await axios.get(`${API_URL}/products/trending`);
      setTrending(data.products || []);
    } catch (error) {
      console.error('Failed to load trending products:', error);
      setTrending([]); // Set empty array on error
    }
  };

  const sections = [
    {
      id: 'recommended',
      name: isAuthenticated ? 'Recommended For You' : 'Popular Products',
      icon: FiStar,
      products: recommendations,
      color: 'from-primary-500 to-purple-500',
    },
    {
      id: 'trending',
      name: 'Trending Now',
      icon: FiTrendingUp,
      products: trending,
      color: 'from-pink-500 to-orange-500',
    },
  ];

  const activeData = sections.find((s) => s.id === activeSection);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!recommendations.length && !trending.length) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-full mb-4"
          >
            <FiZap className="text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              AI-Powered Recommendations
            </span>
          </motion.div>
          
          {/* Tab Switcher */}
          <div className="flex justify-center gap-4 mb-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r ' + section.color + ' text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <section.icon className="w-5 h-5" />
                {section.name}
              </button>
            ))}
          </div>

          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {isAuthenticated
              ? 'Curated selections based on your browsing history and preferences'
              : 'Discover the most popular products loved by our community'}
          </p>
        </div>

        {/* Products Grid */}
        {activeData && activeData.products.length > 0 && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {activeData.products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        )}

        {/* View All Button */}
        {activeData && activeData.products.length > 8 && (
          <div className="text-center mt-8">
            <button className="btn btn-outline">
              View All {activeData.name}
              <FiChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendationsSection;
