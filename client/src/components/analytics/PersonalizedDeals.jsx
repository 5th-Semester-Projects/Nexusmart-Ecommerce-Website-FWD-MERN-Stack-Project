import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTag, FaPercent, FaGift, FaClock, FaStar, FaFire } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PersonalizedDeals = ({ userId }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchPersonalizedDeals();
  }, []);

  const fetchPersonalizedDeals = async () => {
    try {
      const { data } = await axios.get('/api/v1/analytics/personalized-deals');
      setDeals(data.deals);
    } catch (error) {
      // Sample deals based on user behavior
      setDeals(sampleDeals);
    } finally {
      setLoading(false);
    }
  };

  const sampleDeals = [
    {
      id: 1,
      type: 'flash',
      title: 'Flash Deal for You!',
      description: 'Based on your interest in electronics',
      discount: 40,
      code: 'TECH40',
      product: { name: 'Wireless Earbuds Pro', originalPrice: 7999, salePrice: 4799, image: null },
      expiresIn: 3600000, // 1 hour
      category: 'electronics'
    },
    {
      id: 2,
      type: 'personal',
      title: 'Special Offer',
      description: 'You viewed this product 3 times',
      discount: 25,
      code: 'FORYOU25',
      product: { name: 'Running Shoes Nike', originalPrice: 12999, salePrice: 9749, image: null },
      expiresIn: 86400000, // 24 hours
      category: 'sports'
    },
    {
      id: 3,
      type: 'bundle',
      title: 'Bundle Deal',
      description: 'Complete your collection',
      discount: 35,
      code: null,
      product: { name: 'Smart Watch + Band', originalPrice: 15999, salePrice: 10399, image: null },
      expiresIn: 172800000, // 48 hours
      category: 'electronics'
    },
    {
      id: 4,
      type: 'loyalty',
      title: 'Loyalty Reward',
      description: 'Thank you for being a loyal customer',
      discount: 20,
      code: 'LOYAL20',
      product: null,
      expiresIn: 604800000, // 7 days
      category: 'all'
    },
    {
      id: 5,
      type: 'comeback',
      title: 'We Miss You!',
      description: 'Here\'s a special welcome back offer',
      discount: 30,
      code: 'COMEBACK30',
      product: null,
      expiresIn: 259200000, // 3 days
      category: 'all'
    }
  ];

  const formatTimeLeft = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon!';
  };

  const dealIcons = {
    flash: FaFire,
    personal: FaStar,
    bundle: FaGift,
    loyalty: FaPercent,
    comeback: FaTag
  };

  const dealColors = {
    flash: 'from-red-600 to-orange-500',
    personal: 'from-purple-600 to-pink-500',
    bundle: 'from-blue-600 to-cyan-500',
    loyalty: 'from-green-600 to-emerald-500',
    comeback: 'from-yellow-600 to-orange-500'
  };

  const categories = ['all', 'electronics', 'sports', 'fashion', 'home'];

  const filteredDeals = activeCategory === 'all' 
    ? deals 
    : deals.filter(d => d.category === activeCategory || d.category === 'all');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaTag className="text-pink-500" /> Deals Just For You
        </h2>
        <p className="text-gray-400 mt-1">Personalized offers based on your preferences</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="wait">
          {filteredDeals.map((deal, index) => {
            const IconComponent = dealIcons[deal.type] || FaTag;
            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-xl bg-gray-800/50 border border-gray-700/50 group"
              >
                {/* Header Gradient */}
                <div className={`bg-gradient-to-r ${dealColors[deal.type]} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="text-white text-xl" />
                      <span className="text-white font-semibold">{deal.title}</span>
                    </div>
                    <span className="text-white text-2xl font-bold">-{deal.discount}%</span>
                  </div>
                  <p className="text-white/80 text-sm mt-1">{deal.description}</p>
                </div>

                {/* Content */}
                <div className="p-4">
                  {deal.product && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                        <FaGift className="text-gray-500 text-2xl" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{deal.product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500 line-through text-sm">
                            Rs. {deal.product.originalPrice.toLocaleString()}
                          </span>
                          <span className="text-green-400 font-bold">
                            Rs. {deal.product.salePrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coupon Code */}
                  {deal.code && (
                    <div className="bg-gray-900/50 rounded-lg p-3 mb-4 border-2 border-dashed border-gray-600">
                      <p className="text-gray-400 text-xs mb-1">Use Code</p>
                      <p className="text-white font-mono font-bold text-lg">{deal.code}</p>
                    </div>
                  )}

                  {/* Timer & Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <FaClock />
                      <span className={deal.expiresIn < 7200000 ? 'text-red-400' : ''}>
                        {formatTimeLeft(deal.expiresIn)}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r ${dealColors[deal.type]} text-white`}
                    >
                      {deal.product ? 'Shop Now' : 'Apply'}
                    </motion.button>
                  </div>
                </div>

                {/* Urgency Badge */}
                {deal.expiresIn < 7200000 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    Ending Soon!
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View All Link */}
      <Link to="/deals" className="block mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl"
        >
          View All Deals →
        </motion.button>
      </Link>
    </div>
  );
};

export default PersonalizedDeals;
