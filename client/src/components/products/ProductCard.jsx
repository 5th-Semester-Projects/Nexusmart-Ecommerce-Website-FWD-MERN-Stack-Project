import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiEye, FiStar, FiZap } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToWishlist, removeItemFromWishlist } from '../../redux/slices/wishlistSlice';
import { addItemToCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onQuickView }) => {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist) {
      dispatch(removeItemFromWishlist(product._id));
      toast.success('💔 Removed from wishlist', {
        icon: '✨',
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
        },
      });
    } else {
      const wishlistItem = {
        ...product,
        category: typeof product.category === 'object' ? product.category?.name : product.category
      };
      dispatch(addItemToWishlist(wishlistItem));
      toast.success('💜 Added to wishlist!', {
        icon: '✨',
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#fff',
        },
      });
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addItemToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.image,
      stock: product.stock,
      quantity: 1,
    }));
    
    toast.success('🛒 Added to cart!', {
      icon: '🎉',
      style: {
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
      },
    });
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const discountPercentage = product.discount || 
    (product.originalPrice && product.price 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  const rating = product.ratings || product.rating || 4.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Neon glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500 pointer-events-none"></div>
      
      <div className="relative neon-card p-4">
        {/* Magical gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>

        {/* Product Image with magical hover effect */}
        <div className="relative">
          {/* Discount Badge with glow */}
          {discountPercentage > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 left-2 z-50 px-3 py-1.5 rounded-full text-xs font-bold text-white
                         bg-gradient-to-r from-pink-500 via-red-500 to-orange-500
                         shadow-lg shadow-pink-500/50 dark:shadow-pink-500/30 pointer-events-none"
            >
              <FiZap className="inline mr-1" />
              {discountPercentage}% OFF
            </motion.div>
          )}

          {/* Wishlist Button with magical effect */}
          <motion.button
            whileHover={{ scale: 1.2, rotate: isInWishlist ? 0 : 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 z-50 p-3 rounded-full backdrop-blur-xl transition-all duration-300 cursor-pointer
              ${isInWishlist
                ? 'bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/50'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 hover:text-pink-500 hover:bg-white dark:hover:bg-gray-800'
              }`}
          >
            <FiHeart className={`text-lg ${isInWishlist ? 'fill-current' : ''}`} />
          </motion.button>

          <Link to={`/products/${product._id}`} className="block relative aspect-square overflow-hidden rounded-xl mb-4">
          
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
          )}
          
          <img
            src={product.images?.[0]?.url || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23667eea' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='20' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(product.name.substring(0, 20))}%3C/text%3E%3C/svg%3E`}
            alt={product.name}
            onLoad={() => {
              console.log(`✅ Image loaded: ${product.name}`);
              setImageLoaded(true);
            }}
            onError={(e) => {
              e.target.onerror = null;
              console.error(`❌ Image failed for: ${product.name}`, product.images?.[0]?.url);
              setImageLoaded(true);
              setImageError(true);
              // Use simple data URL SVG fallback
              e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23667eea' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(product.name.substring(0, 25))}%3C/text%3E%3C/svg%3E`;
            }}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          />
          
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Quick action buttons appear on hover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleQuickView}
              className="p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-full text-purple-600 dark:text-purple-400 hover:bg-white dark:hover:bg-gray-900 transition-all shadow-lg"
            >
              <FiEye className="text-lg" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
            >
              <FiShoppingCart />
              <span>Add to Cart</span>
            </motion.button>
          </motion.div>
        </Link>
        </div>

        {/* Product Details */}
        <div className="relative z-10">
          {/* Category badge */}
          {product.category && (
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2
                           bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700
                           dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300">
              {typeof product.category === 'object' ? product.category.name : product.category}
            </span>
          )}

          {/* Product Name */}
          <Link to={`/products/${product._id}`}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`text-sm ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {rating} ({product.numOfReviews || product.reviews || 0})
            </span>
          </div>

          {/* Price section with magical gradient */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              {product.stock > 0 ? (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                  ✓ In Stock
                </span>
              ) : (
                <span className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Add to cart icon button (mobile) */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="md:hidden p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <FiShoppingCart className="text-lg" />
            </motion.button>
          </div>
        </div>

        {/* Sparkle effect on corners */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDelay: '0.6s' }}></div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
