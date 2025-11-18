import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight, FiPackage } from 'react-icons/fi';
import { removeItemFromWishlist, clearWishlist } from '../redux/slices/wishlistSlice';
import { addItemToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.wishlist);

  const handleRemoveItem = (productId) => {
    dispatch(removeItemFromWishlist(productId));
    toast.success('Removed from wishlist', {
      icon: '💔',
      style: {
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
      },
    });
  };

  const handleMoveToCart = (item) => {
    dispatch(addItemToCart({
      product: item._id,
      name: item.name,
      price: item.price,
      image: item.images?.[0]?.url || item.image,
      stock: item.stock,
      quantity: 1,
    }));
    dispatch(removeItemFromWishlist(item._id));
    toast.success('Moved to cart!', {
      icon: '🛒',
      style: {
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
      },
    });
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      dispatch(clearWishlist());
      toast.success('Wishlist cleared', {
        icon: '🗑️',
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
        },
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>My Wishlist - NexusMart</title>
        <meta name="description" content="View and manage your wishlist items" />
      </Helmet>

      <div className="min-h-screen relative py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <span className="gradient-text">My Wishlist</span>
                </h1>
                <p className="text-purple-300/70">
                  {items.length} {items.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>

              {items.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearWishlist}
                  icon={FiTrash2}
                >
                  Clear All
                </Button>
              )}
            </div>
          </motion.div>

          {/* Wishlist Items or Empty State */}
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              // Empty State
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card rounded-3xl p-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center"
                >
                  <FiHeart className="text-6xl text-purple-400" />
                </motion.div>

                <h2 className="text-3xl font-bold gradient-text mb-4">
                  Your Wishlist is Empty
                </h2>
                <p className="text-purple-300/70 mb-8 max-w-md mx-auto">
                  Start adding products you love to your wishlist and shop them later!
                </p>

                <Button
                  variant="3d"
                  onClick={() => navigate('/products')}
                  icon={FiPackage}
                >
                  Browse Products
                </Button>
              </motion.div>
            ) : (
              // Wishlist Items Grid
              <motion.div
                key="items"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    {/* Glow Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500"></div>

                    <div className="relative glass-card rounded-2xl p-6 h-full flex flex-col">
                      {/* Product Image */}
                      <div
                        className="relative aspect-square rounded-xl overflow-hidden mb-4 cursor-pointer"
                        onClick={() => navigate(`/products/${item._id}`)}
                      >
                        <img
                          src={item.images?.[0]?.url || item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Stock Status Badge */}
                        {item.stock === 0 && (
                          <div className="absolute top-2 left-2 px-3 py-1 bg-red-500 rounded-lg text-white text-xs font-bold">
                            Out of Stock
                          </div>
                        )}

                        {/* Discount Badge */}
                        {item.discount > 0 && (
                          <div className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg text-white text-xs font-bold">
                            -{item.discount}% OFF
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        {/* Category */}
                        {item.category && (
                          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2
                                       bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700
                                       dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300">
                            {typeof item.category === 'object' ? item.category.name : item.category}
                          </span>
                        )}

                        {/* Product Name */}
                        <h3
                          className="text-lg font-bold text-white mb-2 line-clamp-2 cursor-pointer hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-400 hover:to-cyan-400 transition-all"
                          onClick={() => navigate(`/products/${item._id}`)}
                        >
                          {item.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl font-bold gradient-text">
                            ${item.price?.toFixed(2)}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${item.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-auto relative z-30">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMoveToCart(item)}
                          disabled={item.stock === 0}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative z-30 cursor-pointer"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <FiShoppingCart />
                          <span className="hidden sm:inline">Add to Cart</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveItem(item._id)}
                          className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all relative z-30 cursor-pointer"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <FiTrash2 />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue Shopping */}
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 text-center"
            >
              <Button
                variant="outline"
                onClick={() => navigate('/products')}
                icon={FiArrowRight}
              >
                Continue Shopping
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistPage;
