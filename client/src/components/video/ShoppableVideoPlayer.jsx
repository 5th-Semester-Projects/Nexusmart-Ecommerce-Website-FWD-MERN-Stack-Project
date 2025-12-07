import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, 
  FiPause, 
  FiVolume2, 
  FiVolumeX, 
  FiHeart,
  FiShare2,
  FiMessageCircle,
  FiShoppingCart,
  FiChevronUp,
  FiChevronDown,
  FiMaximize,
  FiX
} from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { Link } from 'react-router-dom';

/**
 * Shoppable Video Player Component
 * TikTok-style video with product hotspots
 */
const ShoppableVideoPlayer = ({ video, onNext, onPrevious, isFullscreen = false }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showProducts, setShowProducts] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const videoRef = useRef(null);
  const dispatch = useDispatch();
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleTimeUpdate = () => {
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(progress);
      
      // Check for hotspots
      if (video.hotspots) {
        const currentHotspot = video.hotspots.find(
          h => videoElement.currentTime >= h.timestamp && 
               videoElement.currentTime <= h.timestamp + (h.duration || 3)
        );
        setActiveHotspot(currentHotspot || null);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      onNext?.();
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [video, onNext]);
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleLike = async () => {
    try {
      await fetch(`/api/v1/videos/videos/${video._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Like failed:', error);
    }
  };
  
  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    
    // Track conversion
    fetch(`/api/v1/videos/videos/${video._id}/add-to-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  };
  
  const handleProductClick = (productId) => {
    // Track click
    fetch(`/api/v1/videos/videos/${video._id}/product-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };
  
  return (
    <div className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full max-w-md'} bg-black rounded-2xl overflow-hidden`}>
      {/* Video */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        className="w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        loop={false}
        playsInline
        onClick={togglePlay}
      />
      
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
        <motion.div
          className="h-full bg-white"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Play/Pause Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={togglePlay}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <FiPlay className="w-10 h-10 text-white ml-1" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hotspot Product Card */}
      <AnimatePresence>
        {activeHotspot && activeHotspot.product && (
          <motion.div
            className="absolute"
            style={{
              left: `${activeHotspot.position?.x || 50}%`,
              top: `${activeHotspot.position?.y || 50}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div className="bg-white rounded-xl p-3 shadow-xl min-w-[200px]">
              <div className="flex items-center gap-3">
                <img
                  src={activeHotspot.product.images?.[0]?.url}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">
                    {activeHotspot.product.name}
                  </p>
                  <p className="text-purple-600 font-bold">
                    ${activeHotspot.product.price}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleAddToCart(activeHotspot.product)}
                className="w-full mt-2 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium"
              >
                Add to Cart
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Side Controls */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isLiked ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm'
          }`}>
            <FiHeart className={`w-6 h-6 ${isLiked ? 'text-white fill-current' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs mt-1">{video.likes || 0}</span>
        </button>
        
        {/* Comments */}
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <FiMessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">{video.comments || 0}</span>
        </button>
        
        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <FiShare2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">Share</span>
        </button>
        
        {/* Products */}
        <button onClick={() => setShowProducts(!showProducts)} className="flex flex-col items-center">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
            <FiShoppingCart className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">Shop</span>
        </button>
      </div>
      
      {/* Navigation */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        {onPrevious && (
          <button
            onClick={onPrevious}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <FiChevronUp className="w-6 h-6 text-white" />
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <FiChevronDown className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
      
      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <p className="text-white font-bold">@{video.createdBy?.name}</p>
            <p className="text-white/80 text-sm mt-1 line-clamp-2">{video.title}</p>
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {video.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-white/60 text-xs">#{tag}</span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={toggleMute}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ml-4"
          >
            {isMuted ? (
              <FiVolumeX className="w-5 h-5 text-white" />
            ) : (
              <FiVolume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
      
      {/* Products Panel */}
      <AnimatePresence>
        {showProducts && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl max-h-[60%] overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
          >
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Products in this video
              </h3>
              <button onClick={() => setShowProducts(false)}>
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(60vh-60px)]">
              <div className="space-y-4">
                {video.products?.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <Link 
                      to={`/product/${item.product._id}`}
                      onClick={() => handleProductClick(item.product._id)}
                    >
                      <img
                        src={item.product.images?.[0]?.url}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link 
                        to={`/product/${item.product._id}`}
                        onClick={() => handleProductClick(item.product._id)}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                          {item.product.name}
                        </h4>
                      </Link>
                      <p className="text-purple-600 font-bold mt-1">
                        ${item.product.price}
                      </p>
                      {item.timestamp && (
                        <p className="text-xs text-gray-500 mt-1">
                          Appears at {Math.floor(item.timestamp / 60)}:{String(item.timestamp % 60).padStart(2, '0')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(item.product)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShoppableVideoPlayer;
