import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiX, FiTrash2, FiShoppingCart, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'nexusmart_recently_viewed';
const MAX_ITEMS = 20;

// Utility functions for managing recently viewed
export const addToRecentlyViewed = (product) => {
  if (!product || !product._id) return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let items = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists
    items = items.filter(item => item._id !== product._id);
    
    // Add to beginning
    items.unshift({
      _id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images?.[0]?.url || product.images?.[0] || product.image,
      category: product.category?.name || product.category,
      rating: product.rating,
      stock: product.stock,
      viewedAt: new Date().toISOString(),
    });
    
    // Keep only MAX_ITEMS
    items = items.slice(0, MAX_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving to recently viewed:', error);
  }
};

export const getRecentlyViewed = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const clearRecentlyViewed = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const removeFromRecentlyViewed = (productId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let items = stored ? JSON.parse(stored) : [];
    items = items.filter(item => item._id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error removing from recently viewed:', error);
  }
};

// Recently Viewed Sidebar Component
const RecentlyViewedSidebar = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      setItems(getRecentlyViewed());
    }
  }, [isOpen]);

  const handleClear = () => {
    clearRecentlyViewed();
    setItems([]);
    toast.success('History cleared');
  };

  const handleRemove = (productId) => {
    removeFromRecentlyViewed(productId);
    setItems(items.filter(item => item._id !== productId));
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
    toast.success('Added to cart!');
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-purple-500/30 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <FiClock className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Recently Viewed</h2>
                  <p className="text-purple-300/50 text-sm">{items.length} items</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-purple-400 hover:text-white transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Clear All Button */}
            {items.length > 0 && (
              <div className="p-4 border-b border-purple-500/20">
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  <FiTrash2 /> Clear All History
                </button>
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <FiEye className="w-16 h-16 mx-auto text-purple-500/30 mb-4" />
                  <p className="text-purple-300/50">No recently viewed products</p>
                  <p className="text-purple-300/30 text-sm mt-1">Products you view will appear here</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-purple-900/30 rounded-xl p-3 flex gap-3 group hover:bg-purple-900/50 transition-colors"
                  >
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleViewProduct(item._id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-white font-medium text-sm line-clamp-2 cursor-pointer hover:text-cyan-400 transition-colors"
                        onClick={() => handleViewProduct(item._id)}
                      >
                        {item.name}
                      </p>
                      <p className="text-purple-300/50 text-xs mt-1">{item.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-cyan-400 font-bold">${item.price?.toFixed(2)}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-purple-400/50 text-xs line-through">
                            ${item.originalPrice?.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-purple-400/40 text-xs mt-1">{formatTimeAgo(item.viewedAt)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="p-2 bg-purple-600/30 text-purple-300 rounded-lg hover:bg-purple-600 hover:text-white transition-colors"
                        title="Add to Cart"
                      >
                        <FiShoppingCart className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="p-2 text-purple-400/50 hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Recently Viewed Section for Pages
export const RecentlyViewedSection = ({ maxItems = 6 }) => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setItems(getRecentlyViewed().slice(0, maxItems));
  }, [maxItems]);

  if (items.length === 0) return null;

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiClock className="text-cyan-400" />
          Recently Viewed
        </h2>
        <button
          onClick={() => navigate('/recently-viewed')}
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          View All →
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <motion.div
            key={item._id}
            whileHover={{ scale: 1.02 }}
            className="glass-card rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => navigate(`/product/${item._id}`)}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={item.image || '/placeholder.jpg'}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
              <p className="text-cyan-400 font-bold text-sm mt-1">${item.price?.toFixed(2)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedSidebar;
