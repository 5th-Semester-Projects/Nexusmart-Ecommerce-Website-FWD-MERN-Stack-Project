import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiShoppingCart, FiHeart, FiStar, FiChevronLeft, FiChevronRight, 
  FiMinus, FiPlus, FiPackage, FiTruck, FiShield, FiZap, FiMessageCircle 
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../redux/slices/cartSlice';
import { addItemToWishlist, removeItemFromWishlist } from '../../redux/slices/wishlistSlice';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Enhanced3DBackground from '../3d/Enhanced3DBackground';

const ProductQuickView = ({ product, onClose, relatedProducts = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  // Create 3 images for display (main image repeated with different transforms)
  const displayImages = [
    product.images?.[0]?.url,
    product.images?.[1]?.url || product.images?.[0]?.url,
    product.images?.[2]?.url || product.images?.[0]?.url,
  ];

  const handleAddToCart = () => {
    dispatch(addItemToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      stock: product.stock,
      quantity: quantity,
    }));
    toast.success(`Added ${quantity}x ${product.name} to cart!`, {
      icon: '🛒',
      style: {
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
      },
    });
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeItemFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      const wishlistItem = {
        ...product,
        category: typeof product.category === 'object' ? product.category?.name : product.category
      };
      dispatch(addItemToWishlist(wishlistItem));
      toast.success('Added to wishlist!');
    }
  };

  const rating = product.ratings || 4.5;
  const reviews = product.numOfReviews || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-3xl shadow-2xl border border-purple-500/30"
        >
          {/* Enhanced 3D Background */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <Enhanced3DBackground intensity="medium" colorScheme="gradient" />
          </div>

          {/* Content */}
          <div className="relative z-10">
          
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white shadow-lg shadow-purple-500/50"
          >
            <FiX className="text-xl" />
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* LEFT SIDE - 3D Floating Image Gallery */}
            <div className="relative">
              <div className="sticky top-8">
                {/* Main 3D Image Container */}
                <motion.div
                  className="relative h-[500px] rounded-2xl overflow-hidden perspective-1000"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Magical Glow Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-3xl"></div>
                  
                  {/* 3D Floating Images */}
                  <div className="relative h-full flex items-center justify-center">
                    {displayImages.map((img, index) => {
                      const offset = (index - selectedImage + displayImages.length) % displayImages.length;
                      const isCenter = offset === 0;
                      const isLeft = offset === displayImages.length - 1;
                      const isRight = offset === 1;

                      return (
                        <motion.div
                          key={index}
                          animate={{
                            x: isCenter ? 0 : isLeft ? -200 : isRight ? 200 : 400,
                            scale: isCenter ? 1 : 0.6,
                            z: isCenter ? 0 : -100,
                            opacity: isCenter ? 1 : isLeft || isRight ? 0.4 : 0,
                            rotateY: isCenter ? rotation.y : isLeft ? -45 : isRight ? 45 : 0,
                            rotateX: isCenter ? rotation.x : 0,
                          }}
                          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                          className="absolute cursor-pointer"
                          style={{
                            transformStyle: 'preserve-3d',
                          }}
                          onClick={() => {
                            setSelectedImage(index);
                          }}
                        >
                          <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${
                            isCenter ? 'w-80 h-80 shadow-purple-500/50' : 'w-64 h-64'
                          }`}>
                            <img
                              src={img}
                              alt={`${product.name} - View ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Holographic Overlay */}
                            {isCenter && (
                              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10"></div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-all"
                  >
                    <FiChevronLeft className="text-2xl" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % displayImages.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-all"
                  >
                    <FiChevronRight className="text-2xl" />
                  </button>
                </motion.div>

                {/* Thumbnail Dots */}
                <div className="flex justify-center gap-3 mt-6">
                  {displayImages.map((_, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedImage(index);
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        selectedImage === index
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 w-8'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Product Details */}
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.category && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30">
                      {typeof product.category === 'object' ? product.category.name : product.category}
                    </span>
                  )}
                  {product.featured && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                      <FiZap className="text-xs" /> Featured
                    </span>
                  )}
                </div>

                <h2 className="text-4xl font-bold text-white mb-4 gradient-text">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        className={`${
                          i < Math.floor(rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-white font-semibold">{rating}</span>
                  </div>
                  <span className="text-gray-400">({reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-5xl font-bold gradient-text">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-2xl text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-6">
                  <FiPackage className={product.stock > 0 ? 'text-green-400' : 'text-red-400'} />
                  <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Quantity:</span>
                <div className="flex items-center gap-3 bg-gray-800/50 rounded-full p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <FiMinus className="text-white" />
                  </button>
                  <span className="text-white font-semibold px-4">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <FiPlus className="text-white" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiShoppingCart className="text-xl" />
                  Add to Cart
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlistToggle}
                  className={`p-4 rounded-2xl transition-all ${
                    isInWishlist
                      ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg shadow-pink-500/50'
                      : 'bg-gray-800 text-gray-400 hover:text-pink-500'
                  }`}
                >
                  <FiHeart className={`text-2xl ${isInWishlist ? 'fill-current' : ''}`} />
                </motion.button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-800">
                <div className="text-center">
                  <FiTruck className="text-3xl text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Free Delivery</p>
                </div>
                <div className="text-center">
                  <FiShield className="text-3xl text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Secure Payment</p>
                </div>
                <div className="text-center">
                  <FiPackage className="text-3xl text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Easy Returns</p>
                </div>
              </div>

              {/* Tabs */}
              <div>
                <div className="flex gap-2 mb-4">
                  {['description', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                        activeTab === tab
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab === 'description' ? 'Description' : 'Reviews'}
                    </button>
                  ))}
                </div>

                <div className="bg-gray-800/30 rounded-2xl p-6">
                  {activeTab === 'description' ? (
                    <div>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {product.description || 'No description available.'}
                      </p>
                      <Link
                        to={`/products/${product._id}`}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
                      >
                        View Full Details →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <FiMessageCircle className="text-gray-400" />
                        <span className="text-gray-400">
                          {reviews} customer reviews
                        </span>
                      </div>
                      <Link
                        to={`/products/${product._id}#reviews`}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
                      >
                        Read All Reviews →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Related Products</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {relatedProducts.slice(0, 3).map((relatedProduct) => (
                      <motion.div
                        key={relatedProduct._id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            navigate(`/products/${relatedProduct._id}`);
                          }, 300);
                        }}
                        className="group relative rounded-xl overflow-hidden hover:shadow-lg hover:shadow-purple-500/30 transition-all cursor-pointer"
                      >
                        <img
                          src={relatedProduct.images?.[0]?.url}
                          alt={relatedProduct.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-sm font-semibold truncate">
                              {relatedProduct.name}
                            </p>
                            <p className="text-purple-400 text-xs">
                              ${relatedProduct.price}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductQuickView;
