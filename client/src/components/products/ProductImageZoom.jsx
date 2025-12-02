import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiZoomIn, FiZoomOut, FiMaximize2 } from 'react-icons/fi';

const ProductImageZoom = ({ 
  src, 
  alt = 'Product Image',
  zoomLevel = 2.5,
  enableFullscreen = true,
}) => {
  const [isZooming, setIsZooming] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setPosition({ x: 50, y: 50 });
  };

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!containerRef.current || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    setPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  }, []);

  return (
    <>
      {/* Main Image Container */}
      <div className="relative group">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl cursor-zoom-in"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsZooming(true)}
          onTouchEnd={() => setIsZooming(false)}
          onTouchMove={handleTouchMove}
        >
          {/* Base Image */}
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* Zoom Overlay */}
          {isZooming && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${src})`,
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundSize: `${zoomLevel * 100}%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}

          {/* Zoom Indicator */}
          <div className={`absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
            isZooming 
              ? 'bg-cyan-500/90 text-white' 
              : 'bg-black/50 text-white/70'
          }`}>
            {isZooming ? <FiZoomOut /> : <FiZoomIn />}
            <span className="text-sm">{isZooming ? 'Release to exit zoom' : 'Hover to zoom'}</span>
          </div>

          {/* Fullscreen Button */}
          {enableFullscreen && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-4 right-4 p-3 bg-black/50 text-white rounded-xl hover:bg-purple-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <FiMaximize2 />
            </button>
          )}

          {/* Magnifier Glass Effect */}
          {isZooming && (
            <div
              className="absolute w-32 h-32 border-4 border-cyan-400/50 rounded-full pointer-events-none shadow-lg shadow-cyan-500/30"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                background: `url(${src})`,
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundSize: `${zoomLevel * 300}%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors z-10"
          >
            ✕
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain"
          />
        </motion.div>
      )}
    </>
  );
};

// Image Gallery with Zoom
export const ProductGalleryZoom = ({ images = [], productName = 'Product' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentImage = images[selectedIndex]?.url || images[selectedIndex] || images[0]?.url || images[0] || '/placeholder.jpg';

  return (
    <div className="space-y-4">
      {/* Main Image with Zoom */}
      <ProductImageZoom
        src={currentImage}
        alt={`${productName} - Image ${selectedIndex + 1}`}
        zoomLevel={2.5}
        enableFullscreen={true}
      />

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => {
            const imgUrl = img?.url || img;
            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-cyan-500 shadow-lg shadow-cyan-500/30'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductImageZoom;
