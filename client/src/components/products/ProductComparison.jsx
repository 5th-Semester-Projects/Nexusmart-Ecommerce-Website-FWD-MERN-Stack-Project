import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiShoppingCart,
  FiHeart,
  FiCheck,
  FiXCircle
} from 'react-icons/fi';
import { HiOutlineScale, HiArrowsRightLeft, HiTrash } from 'react-icons/hi2';
import { addItemToCart } from '../../redux/slices/cartSlice';
import { addItemToWishlist } from '../../redux/slices/wishlistSlice';
import toast from 'react-hot-toast';

// Comparison Context - to manage comparison list globally
export const ComparisonContext = React.createContext();

export const ComparisonProvider = ({ children }) => {
  const [comparisonList, setComparisonList] = useState(() => {
    const saved = localStorage.getItem('comparisonList');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
  }, [comparisonList]);

  const addToComparison = (product) => {
    if (comparisonList.length >= 4) {
      toast.error('Maximum 4 products can be compared!');
      return false;
    }
    if (comparisonList.find(p => p._id === product._id)) {
      toast.error('Product already in comparison!');
      return false;
    }
    setComparisonList(prev => [...prev, product]);
    toast.success('Added to comparison!');
    return true;
  };

  const removeFromComparison = (productId) => {
    setComparisonList(prev => prev.filter(p => p._id !== productId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const isInComparison = (productId) => {
    return comparisonList.some(p => p._id === productId);
  };

  return (
    <ComparisonContext.Provider value={{
      comparisonList,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};

// Hook to use comparison
export const useComparison = () => {
  const context = React.useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
};

// Floating Compare Button (shows when items are in comparison)
export const CompareFloatingButton = ({ onClick }) => {
  const { comparisonList } = useComparison();

  if (comparisonList.length < 2) return null;

  return (
    <motion.button
      initial={{ scale: 0, y: 100 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: 100 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-3 
                 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold 
                 rounded-full shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 
                 transition-all duration-300"
    >
      <HiOutlineScale className="w-6 h-6" />
      <span>Compare ({comparisonList.length})</span>
      <HiArrowsRightLeft className="w-5 h-5 animate-pulse" />
    </motion.button>
  );
};

// Add to Compare Button (for product cards)
export const AddToCompareButton = ({ product, className = '' }) => {
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const inComparison = isInComparison(product._id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inComparison) {
      removeFromComparison(product._id);
      toast.success('Removed from comparison');
    } else {
      addToComparison(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-300 ${className}
                  ${inComparison 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/40'}`}
    >
      <HiOutlineScale className="w-4 h-4" />
      {inComparison ? 'In Compare' : 'Compare'}
    </button>
  );
};

// Main Comparison Modal
const ProductComparisonModal = ({ isOpen, onClose }) => {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();
  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    dispatch(addItemToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.image,
      stock: product.stock,
      quantity: 1,
    }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleAddToWishlist = (product) => {
    dispatch(addItemToWishlist(product));
    toast.success(`${product.name} added to wishlist!`);
  };

  // Comparison attributes
  const attributes = [
    { key: 'price', label: 'Price', format: (val) => `Rs. ${val?.toLocaleString() || 'N/A'}` },
    { key: 'originalPrice', label: 'Original Price', format: (val) => val ? `Rs. ${val.toLocaleString()}` : '-' },
    { key: 'discount', label: 'Discount', format: (val, product) => {
      if (product.originalPrice && product.price) {
        const disc = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        return disc > 0 ? `${disc}% OFF` : '-';
      }
      return '-';
    }},
    { key: 'rating', label: 'Rating', format: (val) => val ? `⭐ ${val.toFixed(1)}` : 'No ratings' },
    { key: 'numReviews', label: 'Reviews', format: (val) => val || 0 },
    { key: 'stock', label: 'Stock', format: (val) => val > 0 ? `${val} available` : 'Out of Stock' },
    { key: 'category', label: 'Category', format: (val) => val?.name || val || 'N/A' },
    { key: 'brand', label: 'Brand', format: (val) => val || 'N/A' },
    { key: 'isFeatured', label: 'Featured', format: (val) => val ? '✓ Yes' : '✗ No' },
    { key: 'isOnSale', label: 'On Sale', format: (val) => val ? '✓ Yes' : '✗ No' },
  ];

  // Find best value for each attribute
  const getBestValue = (key) => {
    if (comparisonList.length < 2) return null;
    
    if (key === 'price') {
      const min = Math.min(...comparisonList.map(p => p.price || Infinity));
      return comparisonList.find(p => p.price === min)?._id;
    }
    if (key === 'rating') {
      const max = Math.max(...comparisonList.map(p => p.rating || 0));
      return comparisonList.find(p => p.rating === max)?._id;
    }
    if (key === 'stock') {
      const max = Math.max(...comparisonList.map(p => p.stock || 0));
      return comparisonList.find(p => p.stock === max)?._id;
    }
    if (key === 'discount') {
      const discounts = comparisonList.map(p => {
        if (p.originalPrice && p.price) {
          return { id: p._id, disc: ((p.originalPrice - p.price) / p.originalPrice) * 100 };
        }
        return { id: p._id, disc: 0 };
      });
      const max = Math.max(...discounts.map(d => d.disc));
      return discounts.find(d => d.disc === max)?.id;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 
                     rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-black/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                <HiOutlineScale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Product Comparison</h2>
                <p className="text-sm text-purple-300">Compare {comparisonList.length} products side by side</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearComparison}
                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(90vh-80px)]">
            {comparisonList.length < 2 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <HiOutlineScale className="w-16 h-16 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Add More Products</h3>
                <p className="text-gray-400 mb-6">Add at least 2 products to compare them</p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <table className="w-full">
                {/* Product Images & Names */}
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="p-4 text-left text-gray-400 font-medium w-40 sticky left-0 bg-gray-900/95 backdrop-blur-sm">
                      Product
                    </th>
                    {comparisonList.map((product) => (
                      <th key={product._id} className="p-4 min-w-[200px]">
                        <div className="relative group">
                          <button
                            onClick={() => removeFromComparison(product._id)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full 
                                       opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                          <Link to={`/products/${product._id}`} onClick={onClose}>
                            <div className="relative overflow-hidden rounded-xl mb-3 bg-white/5 aspect-square">
                              <img
                                src={product.images?.[0]?.url || product.image || '/placeholder.png'}
                                alt={product.name}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                              />
                              {product.isOnSale && (
                                <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                  SALE
                                </span>
                              )}
                            </div>
                            <h3 className="text-white font-semibold text-sm line-clamp-2 hover:text-purple-400 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Comparison Rows */}
                <tbody>
                  {attributes.map((attr, index) => {
                    const bestId = getBestValue(attr.key);
                    return (
                      <tr 
                        key={attr.key} 
                        className={`border-b border-purple-500/10 ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                      >
                        <td className="p-4 text-gray-400 font-medium sticky left-0 bg-gray-900/95 backdrop-blur-sm">
                          {attr.label}
                        </td>
                        {comparisonList.map((product) => {
                          const isBest = bestId === product._id;
                          return (
                            <td 
                              key={product._id} 
                              className={`p-4 text-center ${isBest ? 'bg-green-500/10' : ''}`}
                            >
                              <span className={`font-semibold ${
                                isBest ? 'text-green-400' : 
                                attr.key === 'price' ? 'text-purple-300' : 'text-white'
                              }`}>
                                {attr.format(product[attr.key], product)}
                                {isBest && attr.key !== 'category' && attr.key !== 'brand' && (
                                  <span className="ml-2 text-xs text-green-400">★ Best</span>
                                )}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Action Buttons Row */}
                  <tr className="bg-purple-500/10">
                    <td className="p-4 text-gray-400 font-medium sticky left-0 bg-gray-900/95 backdrop-blur-sm">
                      Actions
                    </td>
                    {comparisonList.map((product) => (
                      <td key={product._id} className="p-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                            className="flex items-center justify-center gap-2 px-4 py-2 
                                       bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold 
                                       rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleAddToWishlist(product)}
                            className="flex items-center justify-center gap-2 px-4 py-2 
                                       bg-pink-500/20 text-pink-300 font-medium 
                                       rounded-lg hover:bg-pink-500/30 transition-all"
                          >
                            <FiHeart className="w-4 h-4" />
                            Wishlist
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductComparisonModal;
