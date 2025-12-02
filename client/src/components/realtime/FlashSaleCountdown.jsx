import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaClock, FaFire, FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FlashSaleCountdown = ({ sale }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isEnding, setIsEnding] = useState(false);

  const defaultSale = sale || {
    id: 1,
    title: 'MEGA FLASH SALE',
    subtitle: 'Up to 70% OFF',
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    products: [
      { id: 1, name: 'Wireless Earbuds', originalPrice: 5999, salePrice: 1999, image: '/api/placeholder/100/100', stock: 15, sold: 85 },
      { id: 2, name: 'Smart Watch', originalPrice: 12999, salePrice: 4999, image: '/api/placeholder/100/100', stock: 8, sold: 92 },
      { id: 3, name: 'Power Bank 20000mAh', originalPrice: 3999, salePrice: 1499, image: '/api/placeholder/100/100', stock: 23, sold: 77 },
    ],
    bgGradient: 'from-red-600 via-orange-500 to-yellow-500'
  };

  const currentSale = sale || defaultSale;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(currentSale.endTime) - new Date();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ hours, minutes, seconds });
        setIsEnding(difference < 30 * 60 * 1000); // Less than 30 minutes
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [currentSale.endTime]);

  const TimeBlock = ({ value, label }) => (
    <div className="text-center">
      <motion.div
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold ${
          isEnding ? 'bg-red-600 animate-pulse' : 'bg-white/20'
        } backdrop-blur-sm`}
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <p className="text-xs mt-1 text-white/80">{label}</p>
    </div>
  );

  return (
    <div className={`bg-gradient-to-r ${currentSale.bgGradient} rounded-2xl overflow-hidden shadow-2xl`}>
      {/* Header */}
      <div className="p-6 text-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                scale: 0
              }}
              animate={{ 
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              <FaBolt className="text-4xl" />
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="relative z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaBolt className="text-yellow-300 text-3xl" />
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-wider">
              {currentSale.title}
            </h2>
            <FaBolt className="text-yellow-300 text-3xl" />
          </div>
          <p className="text-xl text-white/90 font-semibold">{currentSale.subtitle}</p>
        </motion.div>

        {/* Countdown Timer */}
        <div className="flex justify-center items-center gap-2 md:gap-4 mt-6 relative z-10">
          <TimeBlock value={timeLeft.hours} label="HOURS" />
          <span className="text-3xl text-white font-bold animate-pulse">:</span>
          <TimeBlock value={timeLeft.minutes} label="MINUTES" />
          <span className="text-3xl text-white font-bold animate-pulse">:</span>
          <TimeBlock value={timeLeft.seconds} label="SECONDS" />
        </div>

        {isEnding && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mt-4 text-yellow-300 font-bold text-lg relative z-10"
          >
            ⚡ HURRY! Sale ending soon! ⚡
          </motion.p>
        )}
      </div>

      {/* Products */}
      <div className="bg-gray-900/90 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentSale.products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-4 relative overflow-hidden group"
            >
              {/* Stock Warning */}
              {product.stock < 20 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <FaFire className="text-yellow-300" />
                  Only {product.stock} left!
                </div>
              )}

              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <FaShoppingCart className="text-gray-500 text-2xl" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm line-clamp-2">{product.name}</h3>
                  <div className="mt-2">
                    <span className="text-gray-500 line-through text-sm">Rs. {product.originalPrice}</span>
                    <span className="text-green-400 font-bold text-lg ml-2">Rs. {product.salePrice}</span>
                  </div>
                  {/* Stock Bar */}
                  <div className="mt-2">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${product.sold}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{product.sold}% Sold</p>
                  </div>
                </div>
              </div>

              {/* Buy Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
              >
                Buy Now
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <Link to="/deals" className="block mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl"
          >
            View All Flash Deals →
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

export default FlashSaleCountdown;
