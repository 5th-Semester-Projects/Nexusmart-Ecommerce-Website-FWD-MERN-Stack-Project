import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiHeart, FiShoppingCart, FiStar, FiTruck, FiShield, FiRotateCcw, 
  FiChevronLeft, FiChevronRight, FiZoomIn, FiShare2, FiCheck, FiX,
  FiPackage, FiAward, FiCreditCard, FiLock, FiMessageCircle
} from 'react-icons/fi';
import { fetchProductById } from '../redux/slices/productSlice';
import { addItemToCart } from '../redux/slices/cartSlice';
import { addItemToWishlist, removeItemFromWishlist } from '../redux/slices/wishlistSlice';
import Button from '../components/common/Button';
import { PageLoader } from '../components/common/Loader';
import toast from 'react-hot-toast';
import { mockProducts } from '../utils/mockData';

// New Feature Components
import { 
  RecentlyViewed, 
  ProductImageZoom, 
  SizeGuide, 
  StockAlerts, 
  ProductQA, 
  EnhancedReviews 
} from '../components/products';
import { SocialShare } from '../components/social';
import { LiveViewerCount } from '../components/realtime';
import { PriceHistoryChart } from '../components/analytics';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, loading } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  // Use mock data for now
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showImageModal, setShowImageModal] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);

  // Create 3 images for display
  const displayImages = [
    product?.images?.[0]?.url || product?.image,
    product?.images?.[1]?.url || product?.images?.[0]?.url || product?.image,
    product?.images?.[2]?.url || product?.images?.[0]?.url || product?.image,
  ];

  useEffect(() => {
    // Reset states when product ID changes
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab('description');
    
    dispatch(fetchProductById(id));
  }, [id, dispatch]);

  useEffect(() => {
    // Update product when currentProduct changes
    if (currentProduct && currentProduct._id === id) {
      setProduct(currentProduct);
    } else if (!loading && !currentProduct) {
      // Use mock product as fallback if API fails
      const mockProduct = mockProducts.find(p => p._id === id) || mockProducts[0];
      if (mockProduct) {
        setProduct(mockProduct);
      }
    }
  }, [currentProduct, id, loading]);

  if (loading || !product) return <PageLoader text="Loading magical product..." />;

  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeItemFromWishlist(product._id));
      toast.success('💔 Removed from wishlist', {
        style: { background: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(190, 24, 93))', color: '#fff', borderRadius: '12px' }
      });
    } else {
      const wishlistItem = {
        ...product,
        category: typeof product.category === 'object' ? product.category?.name : product.category
      };
      dispatch(addItemToWishlist(wishlistItem));
      toast.success('❤️ Added to wishlist!', {
        style: { background: 'linear-gradient(135deg, rgb(236, 72, 153), rgb(219, 39, 119))', color: '#fff', borderRadius: '12px' }
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
    toast.success('🛒 Added to cart!', {
      style: { background: 'linear-gradient(135deg, rgb(139, 92, 246), rgb(59, 130, 246))', color: '#fff', borderRadius: '12px' }
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, text: product.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('🔗 Link copied!', {
        style: { background: 'linear-gradient(135deg, rgb(139, 92, 246), rgb(59, 130, 246))', color: '#fff', borderRadius: '12px' }
      });
    }
  };

  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: FiShield, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: FiRotateCcw, title: '30-Day Returns', desc: 'Easy return policy' },
    { icon: FiAward, title: 'Quality Guarantee', desc: 'Premium products' },
  ];

  return (
    <>
      <Helmet>
        <title>{`${product.name || 'Product'} - NexusMart`}</title>
        <meta name="description" content={product.description || 'Product details'} />
      </Helmet>

      <div className="min-h-screen relative">
        {/* Lightweight CSS Background */}
        <div className="fixed inset-0 overflow-hidden -z-10 bg-gradient-to-br from-purple-950 via-gray-950 to-purple-950/50"></div>

        {/* Breadcrumb */}
        <div className="relative py-6 border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 text-sm text-purple-300/70">
              <button onClick={() => navigate('/')} className="hover:text-cyan-400">Home</button>
              <span>/</span>
              <button onClick={() => navigate('/products')} className="hover:text-cyan-400">Products</button>
              <span>/</span>
              <span className="text-purple-300">{typeof product.category === 'object' ? product.category?.name : product.category}</span>
              <span>/</span>
              <span className="text-cyan-400">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* 3D Floating Images Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* 3D Main Image Container */}
              <div
                className="relative h-[500px] rounded-2xl overflow-hidden perspective-1000 glass-card p-4"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Magical Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-3xl"></div>
                
                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-8 left-8 z-20">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl
                               text-white font-bold text-lg shadow-lg shadow-pink-500/50"
                    >
                      -{product.discount}% OFF
                    </motion.div>
                  </div>
                )}

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
                        style={{ transformStyle: 'preserve-3d' }}
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-all"
                >
                  <FiChevronLeft className="text-2xl" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev + 1) % displayImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-all"
                >
                  <FiChevronRight className="text-2xl" />
                </button>

                {/* Zoom Button */}
                <button
                  onClick={() => setShowImageZoom(true)}
                  className="absolute bottom-8 right-8 z-20 p-4 bg-gray-900/80 hover:bg-gray-900
                           border-2 border-purple-500/30 hover:border-cyan-500
                           rounded-xl text-purple-300 hover:text-cyan-400
                           transition-all duration-300 backdrop-blur-sm"
                >
                  <FiZoomIn className="text-2xl" />
                </button>
              </div>

              {/* Thumbnail Dots */}
              <div className="flex justify-center gap-3">
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
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Category Badge */}
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 
                            border border-purple-500/30 rounded-xl">
                <span className="text-cyan-400 font-semibold">{typeof product.category === 'object' ? product.category?.name : product.category}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span className="gradient-text">{product.name}</span>
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar
                      key={i}
                      className={`text-xl ${
                        i < Math.floor(product.rating || 4.5)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-purple-300">
                  {product.rating || 4.5} ({product.reviews || 0} reviews)
                </span>
              </div>

              {/* Live Viewer Count */}
              <LiveViewerCount productId={product._id} />

              {/* Price */}
              <div className="flex items-baseline space-x-4">
                <span className="text-5xl font-bold gradient-text">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-2xl text-purple-300/50 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                {product.stock > 0 ? (
                  <>
                    <FiCheck className="text-green-400 text-xl" />
                    <span className="text-green-400 font-semibold">
                      In Stock ({product.stock} available)
                    </span>
                  </>
                ) : (
                  <>
                    <FiX className="text-red-400 text-xl" />
                    <span className="text-red-400 font-semibold">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-purple-300/70 text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Quantity Selector */}
              <div className="glass-card p-6 rounded-2xl relative z-20">
                <label className="block text-purple-300 font-semibold mb-3">Quantity</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-purple-500/10 hover:bg-purple-500/20 border-2 border-purple-500/30
                             rounded-xl text-purple-300 hover:text-cyan-400 transition-all duration-300
                             flex items-center justify-center text-2xl font-bold relative z-30 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-purple-300 w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-12 h-12 bg-purple-500/10 hover:bg-purple-500/20 border-2 border-purple-500/30
                             rounded-xl text-purple-300 hover:text-cyan-400 transition-all duration-300
                             flex items-center justify-center text-2xl font-bold relative z-30 cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ pointerEvents: 'auto' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="3d"
                  fullWidth
                  onClick={handleAddToCart}
                  icon={FiShoppingCart}
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="neon"
                  fullWidth
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                >
                  Buy Now
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="glass"
                  fullWidth
                  onClick={handleWishlistToggle}
                  icon={FiHeart}
                  className={isInWishlist ? 'text-pink-400 border-pink-500/50' : ''}
                >
                  {isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}
                </Button>
                <Button
                  variant="glass"
                  fullWidth
                  onClick={() => setShowSocialShare(true)}
                  icon={FiShare2}
                >
                  Share
                </Button>
              </div>

              {/* Size Guide Button (for clothing/shoes) */}
              {['clothing', 'shoes', 'fashion'].some(cat => 
                (typeof product.category === 'string' ? product.category : product.category?.name || '')
                  .toLowerCase().includes(cat)
              ) && (
                <Button
                  variant="glass"
                  fullWidth
                  onClick={() => setShowSizeGuide(true)}
                >
                  📏 View Size Guide
                </Button>
              )}

              {/* Stock Alert for Out of Stock */}
              {product.stock === 0 && (
                <Button
                  variant="neon"
                  fullWidth
                  onClick={() => setShowStockAlert(true)}
                  icon={FiMessageCircle}
                >
                  🔔 Notify When Available
                </Button>
              )}

              {/* Features */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 
                                    rounded-xl flex items-center justify-center flex-shrink-0">
                        <feature.icon className="text-white text-lg" />
                      </div>
                      <div>
                        <p className="text-purple-300 font-semibold text-sm">{feature.title}</p>
                        <p className="text-purple-300/50 text-xs">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <div className="glass-card rounded-3xl overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-purple-500/20 relative z-20">
                {['description', 'specifications', 'reviews', 'q&a'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-lg font-semibold capitalize transition-all duration-300 relative z-10 cursor-pointer ${
                      activeTab === tab
                        ? 'text-cyan-400 bg-purple-500/10 border-b-2 border-cyan-500'
                        : 'text-purple-300/70 hover:text-purple-300 hover:bg-purple-500/5'
                    }`}
                    style={{ pointerEvents: 'auto' }}
                  >
                    {tab === 'q&a' ? 'Q&A' : tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h3 className="text-2xl font-bold gradient-text mb-4">Product Description</h3>
                      <p className="text-purple-300/70 leading-relaxed">
                        {product.description || 'This product features cutting-edge technology and premium quality materials. Perfect for those who demand the best in performance and style.'}
                      </p>
                    </motion.div>
                  )}

                  {activeTab === 'specifications' && (
                    <motion.div
                      key="specifications"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h3 className="text-2xl font-bold gradient-text mb-4">Specifications</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { label: 'Brand', value: 'Premium' },
                          { label: 'Model', value: product.name },
                          { label: 'Category', value: typeof product.category === 'object' ? product.category?.name : product.category },
                          { label: 'Stock', value: product.stock },
                        ].map((spec, idx) => (
                          <div key={idx} className="flex justify-between p-4 bg-purple-500/5 rounded-xl">
                            <span className="text-purple-300/70">{spec.label}</span>
                            <span className="text-purple-300 font-semibold">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <EnhancedReviews productId={product._id} />
                    </motion.div>
                  )}

                  {activeTab === 'q&a' && (
                    <motion.div
                      key="qa"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <ProductQA productId={product._id} productName={product.name} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Recently Viewed Products */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <RecentlyViewed currentProductId={product._id} />
          </motion.div>

          {/* Price History Chart */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 max-w-xl"
          >
            <PriceHistoryChart productId={product._id} currentPrice={product.price} />
          </motion.div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
            className="fixed inset-0 z-[60] bg-gray-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              src={product.images?.[selectedImage]?.url || product.image}
              alt={product.name}
              className="max-w-full max-h-full rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Guide Modal */}
      <SizeGuide 
        isOpen={showSizeGuide} 
        onClose={() => setShowSizeGuide(false)}
        category={typeof product.category === 'string' ? product.category : product.category?.name}
      />

      {/* Stock Alert Modal */}
      <StockAlerts
        isOpen={showStockAlert}
        onClose={() => setShowStockAlert(false)}
        productId={product._id}
        productName={product.name}
      />

      {/* Social Share Modal */}
      <SocialShare
        isOpen={showSocialShare}
        onClose={() => setShowSocialShare(false)}
        product={product}
      />

      {/* Image Zoom Modal */}
      <ProductImageZoom
        isOpen={showImageZoom}
        onClose={() => setShowImageZoom(false)}
        images={displayImages}
        productName={product.name}
        initialIndex={selectedImage}
      />
    </>
  );
};

export default ProductDetailPage;
