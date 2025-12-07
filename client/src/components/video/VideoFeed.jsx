import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiSearch, FiGrid, FiUser, FiFilter } from 'react-icons/fi';
import ShoppableVideoPlayer from './ShoppableVideoPlayer';

/**
 * Video Feed Component
 * TikTok-style infinite scroll video feed
 */
const VideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  
  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, [category]);
  
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('limit', '20');
      
      const response = await fetch(`/api/v1/videos/feed?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const goToNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, videos.length]);
  
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);
  
  // Touch handlers for swipe navigation
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        goToPrevious();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);
  
  // Mouse wheel navigation
  const handleWheel = useCallback((e) => {
    if (Math.abs(e.deltaY) > 50) {
      if (e.deltaY > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  }, [goToNext, goToPrevious]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <FiGrid className="w-16 h-16 text-gray-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
        <p className="text-gray-400">Check back later for shoppable content</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className="relative h-screen bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">Shop Videos</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full"
          >
            <FiFilter className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* Category Filter */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="flex gap-2 mt-3 overflow-x-auto pb-2"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <button
                onClick={() => setCategory('')}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  !category
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => setCategory(cat._id)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    category === cat._id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Video Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="h-full w-full"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
        >
          <ShoppableVideoPlayer
            video={videos[currentIndex]}
            onNext={currentIndex < videos.length - 1 ? goToNext : null}
            onPrevious={currentIndex > 0 ? goToPrevious : null}
            isFullscreen
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Video Counter */}
      <div className="absolute top-20 right-4 z-20">
        <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white text-sm">
            {currentIndex + 1} / {videos.length}
          </span>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center text-white">
            <FiHome className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center text-white/60">
            <FiSearch className="w-6 h-6" />
            <span className="text-xs mt-1">Discover</span>
          </button>
          <button className="flex flex-col items-center text-white/60">
            <FiGrid className="w-6 h-6" />
            <span className="text-xs mt-1">Shop</span>
          </button>
          <button className="flex flex-col items-center text-white/60">
            <FiUser className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
