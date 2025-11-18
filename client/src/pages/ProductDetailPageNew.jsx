import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiHeart, FiShoppingCart, FiStar, FiTruck, FiShield, FiRotateCcw, 
  FiChevronLeft, FiChevronRight, FiShare2, FiCheck, FiPackage, 
  FiAward, FiCreditCard, FiLock, FiZap
} from 'react-icons/fi';
import { fetchProductById } from '../redux/slices/productSlice';
import { addItemToCart } from '../redux/slices/cartSlice';
import { addItemToWishlist, removeItemFromWishlist } from '../redux/slices/wishlistSlice';
import Button from '../components/common/Button';
import { PageLoader } from '../components/common/Loader';
import toast from 'react-hot-toast';

const Floating3DImages = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(images.length, 3));
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Take only first 3 images or repeat if less
  const displayImages = images.length >= 3 
    ? images.slice(0, 3)
    : [...images, ...images, ...images].slice(0, 3);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      {/* Circuit Background */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      
      {/* Central Display - Main Image */}
      <motion.div
        className="relative z-20"
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="w-80 h-80 rounded-full flex items-center justify-center glass-robotic overflow-hidden">
          <img
            src={displayImages[currentIndex]}
            alt="Product"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Energy Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Orbiting Images - 3 Small Circles */}
      {displayImages.map((image, index) => {
        const angle = (index * 120 * Math.PI) / 180;
        const radius = 250;
        
        return (
          <motion.div
            key={index}
            className="absolute z-10"
            animate={{
              x: [
                Math.cos(angle) * radius,
                Math.cos(angle + Math.PI * 2) * radius,
              ],
              y: [
                Math.sin(angle) * radius,
                Math.sin(angle + Math.PI * 2) * radius,
              ],
              rotateY: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
              delay: index * 0.3,
            }}
            style={{
              left: '50%',
              top: '50%',
            }}
          >
            <motion.div
              className="w-32 h-32 rounded-full glass-robotic overflow-hidden cursor-pointer
                       border-2 border-purple-400/50 shadow-lg relative"
              whileHover={{ scale: 1.2, zIndex: 50 }}
              onClick={() => setCurrentIndex(index)}
              animate={{
                boxShadow: currentIndex === index 
                  ? ['0 0 20px rgba(0, 212, 255, 0.6)', '0 0 40px rgba(0, 212, 255, 0.8)', '0 0 20px rgba(0, 212, 255, 0.6)']
                  : '0 0 10px rgba(136, 0, 255, 0.4)',
              }}
              transition={{
                boxShadow: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {currentIndex === index && (
                <motion.div
                  className="absolute inset-0 border-4 border-cyan-400 rounded-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
            
            {/* Particle Trail */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-cyan-400"
              style={{
                marginLeft: '-4px',
                marginTop: '-4px',
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: index * 0.5,
              }}
            />
          </motion.div>
        );
      })}

      {/* Corner Tech Elements */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-400/30"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-400/30"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-400/30"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-400/30"></div>
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, loading } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [id, dispatch]);

  if (loading || !currentProduct) {
    return <PageLoader />;
  }

  const product = currentProduct;
  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  // Product images (use multiple or repeat single image)
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image, product.image, product.image];

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeItemFromWishlist(product._id));
      toast.success('Removed from wishlist', {
        style: { background: '#ff0044', color: '#fff' }
      });
    } else {
      const wishlistItem = {
        ...product,
        category: typeof product.category === 'object' ? product.category?.name : product.category
      };
      dispatch(addItemToWishlist(wishlistItem));
      toast.success('Added to wishlist!', {
        style: { background: '#00d4ff', color: '#0a0a0f' }
      });
    }
  };

  const handleAddToCart = () => {
    dispatch(addItemToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    }));
    toast.success('Added to cart!', {
      style: { background: '#8800ff', color: '#fff' }
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ 
        title: product.name, 
        text: product.description, 
        url: window.location.href 
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${product?.name || 'Product'} - NexusMart`}</title>
        <meta name="description" content={product?.description || 'Product details'} />
      </Helmet>

      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Circuit Background */}
        <div className="circuit-bg"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/products')}
            className="mb-8 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 
                     transition-colors font-tech"
          >
            <FiChevronLeft /> BACK TO PRODUCTS
          </motion.button>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* LEFT SIDE: 3D Floating Images */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Floating3DImages images={productImages} />
            </motion.div>

            {/* RIGHT SIDE: Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col"
            >
              {/* Product Header */}
              <div className="glass-robotic p-8 rounded-2xl mb-6">
                {/* Category Badge */}
                <span className="inline-block px-4 py-1 bg-cyan-400/20 text-cyan-400 
                               rounded-full text-sm font-tech mb-4">
                  {typeof product.category === 'object' ? product.category?.name : product.category}
                </span>

                {/* Product Name */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4" 
                    style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <span className="gradient-text-robotic">{product.name}</span>
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-cyan-400 font-tech">
                    {product.rating || 4.5} ({product.reviews || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-5xl font-bold text-cyan-400" 
                        style={{ fontFamily: 'Russo One' }}>
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
                  {product.stock > 0 ? (
                    <>
                      <FiCheck className="text-green-400" />
                      <span className="text-green-400 font-tech">IN STOCK</span>
                      <span className="text-gray-400 font-tech">
                        ({product.stock} units available)
                      </span>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <FiZap className="text-red-400" />
                      </motion.div>
                      <span className="text-red-400 font-tech">OUT OF STOCK</span>
                    </>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="mb-6 relative z-20">
                  <label className="block text-sm text-gray-400 mb-2 font-tech">
                    QUANTITY
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl border-2 border-cyan-400/30 
                               hover:border-cyan-400 text-cyan-400 flex items-center 
                               justify-center transition-all relative z-10 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-cyan-400 w-16 text-center"
                          style={{ fontFamily: 'Russo One' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 rounded-xl border-2 border-cyan-400/30 
                               hover:border-cyan-400 text-cyan-400 flex items-center 
                               justify-center transition-all relative z-10 cursor-pointer"
                      disabled={quantity >= product.stock}
                      style={{ pointerEvents: 'auto' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="btn-cyber flex-1 min-w-[200px]"
                  >
                    <FiShoppingCart className="inline-block mr-2" />
                    ADD TO CART
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="btn-cyber flex-1 min-w-[200px]"
                    style={{
                      background: 'linear-gradient(135deg, #8800ff, #6600cc)',
                      borderColor: '#8800ff',
                    }}
                  >
                    <FiZap className="inline-block mr-2" />
                    BUY NOW
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleWishlistToggle}
                    className={`flex-1 px-6 py-3 rounded-xl border-2 transition-all
                             ${isInWishlist 
                               ? 'border-red-400 bg-red-400/20 text-red-400' 
                               : 'border-cyan-400/30 hover:border-cyan-400 text-cyan-400'
                             }`}
                  >
                    <FiHeart className={`inline-block mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                    <span className="font-tech">
                      {isInWishlist ? 'WISHLISTED' : 'WISHLIST'}
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-cyan-400/30 
                             hover:border-cyan-400 text-cyan-400 transition-all"
                  >
                    <FiShare2 className="inline-block mr-2" />
                    <span className="font-tech">SHARE</span>
                  </motion.button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: FiTruck, text: 'Free Shipping', color: 'cyan' },
                  { icon: FiShield, text: '1 Year Warranty', color: 'purple' },
                  { icon: FiRotateCcw, text: '30 Days Return', color: 'green' },
                  { icon: FiLock, text: 'Secure Payment', color: 'red' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="glass-robotic p-4 rounded-xl flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-full bg-${feature.color}-400/20 
                                  flex items-center justify-center`}>
                      <feature.icon className={`text-${feature.color}-400`} />
                    </div>
                    <span className="text-sm font-tech text-gray-300">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Description Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12"
          >
            <div className="glass-robotic rounded-2xl overflow-hidden">
              {/* Tabs Header */}
              <div className="flex border-b border-cyan-400/20 relative z-20">
                {['description', 'specifications', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 font-tech uppercase tracking-wider
                             transition-all relative z-10 cursor-pointer ${
                      activeTab === tab
                        ? 'text-cyan-400 bg-cyan-400/10'
                        : 'text-gray-400 hover:text-cyan-300'
                    }`}
                    style={{ pointerEvents: 'auto' }}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tabs Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-2xl font-bold mb-4 gradient-text-robotic"
                          style={{ fontFamily: 'Orbitron' }}>
                        PRODUCT DESCRIPTION
                      </h3>
                      <p className="text-gray-300 leading-relaxed font-body">
                        {product.description}
                      </p>
                    </motion.div>
                  )}

                  {activeTab === 'specifications' && (
                    <motion.div
                      key="specifications"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-2xl font-bold mb-4 gradient-text-robotic"
                          style={{ fontFamily: 'Orbitron' }}>
                        SPECIFICATIONS
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.specifications ? (
                          Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b border-cyan-400/10 pb-2">
                              <span className="text-gray-400 font-tech">{key}:</span>
                              <span className="text-cyan-400 font-tech">{value}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 col-span-2">No specifications available.</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-2xl font-bold mb-4 gradient-text-robotic"
                          style={{ fontFamily: 'Orbitron' }}>
                        CUSTOMER REVIEWS
                      </h3>
                      <p className="text-gray-400 font-body">
                        No reviews yet. Be the first to review this product!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
