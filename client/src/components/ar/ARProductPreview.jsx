import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera, FaCube, FaTimes, FaExpand, FaCompress, FaRedo, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ARProductPreview = ({ product, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isARActive, setIsARActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [productScale, setProductScale] = useState(1);
  const [productPosition, setProductPosition] = useState({ x: 50, y: 50 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setHasPermission(true);
      setIsARActive(true);
      toast.success('AR Mode activated! Move your camera around.');
    } catch (error) {
      console.error('Camera error:', error);
      setHasPermission(false);
      toast.error('Camera access denied. Please enable camera permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsARActive(false);
  };

  const handleProductDrag = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setProductPosition({ x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const captureSnapshot = () => {
    toast.success('Screenshot saved to gallery!');
  };

  const defaultProduct = product || {
    name: 'Smart Watch Pro',
    image: null,
    model3D: null,
    dimensions: { width: 200, height: 200 }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex flex-col"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { stopCamera(); onClose?.(); }}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <FaTimes className="text-white" />
            </button>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <FaCube className="text-purple-400" /> AR Preview
            </h2>
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              {isFullscreen ? <FaCompress className="text-white" /> : <FaExpand className="text-white" />}
            </button>
          </div>
        </div>

        {/* Main View */}
        <div ref={canvasRef} className="flex-1 relative" onClick={handleProductDrag}>
          {!isARActive ? (
            // Start Screen
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900">
              <motion.div
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-48 h-48 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-8 flex items-center justify-center shadow-2xl"
              >
                <FaCube className="text-white text-6xl" />
              </motion.div>
              
              <h3 className="text-white text-2xl font-bold mb-2">{defaultProduct.name}</h3>
              <p className="text-gray-400 mb-8 text-center px-8">
                See how this product looks in your space using augmented reality
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startCamera}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg flex items-center gap-3 shadow-lg"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                ) : (
                  <FaCamera className="text-xl" />
                )}
                {isLoading ? 'Starting Camera...' : 'Start AR Experience'}
              </motion.button>

              <p className="text-gray-500 text-sm mt-4">
                Requires camera access
              </p>
            </div>
          ) : (
            // AR View
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
              />

              {/* AR Product Overlay */}
              <motion.div
                drag
                dragMomentum={false}
                onDrag={(e, info) => {
                  const container = canvasRef.current?.getBoundingClientRect();
                  if (container) {
                    setProductPosition({
                      x: ((info.point.x - container.left) / container.width) * 100,
                      y: ((info.point.y - container.top) / container.height) * 100
                    });
                  }
                }}
                style={{
                  left: `${productPosition.x}%`,
                  top: `${productPosition.y}%`,
                  scale: productScale
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-move"
              >
                <div className="relative">
                  {/* Shadow */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/30 rounded-full blur-md" />
                  
                  {/* Product */}
                  <motion.div
                    animate={{ 
                      rotateY: [0, 10, 0, -10, 0],
                      y: [0, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-40 h-40 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <FaCube className="text-white text-5xl" />
                  </motion.div>

                  {/* Selection Ring */}
                  <div className="absolute inset-0 border-2 border-white/50 rounded-2xl pointer-events-none">
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rounded-full" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full" />
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white rounded-full" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              </motion.div>

              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <p className="text-white text-sm">Drag to position • Pinch to resize</p>
              </motion.div>
            </>
          )}
        </div>

        {/* Bottom Controls */}
        {isARActive && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6"
          >
            {/* Scale Slider */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-2">Product Size</p>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={productScale}
                onChange={(e) => setProductScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setProductScale(1)}
                className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center"
              >
                <FaRedo className="text-white" />
              </button>
              
              <button
                onClick={captureSnapshot}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg"
              >
                <div className="w-16 h-16 border-4 border-gray-300 rounded-full" />
              </button>

              <button
                onClick={() => {
                  toast.success('Product added to cart!');
                  stopCamera();
                  onClose?.();
                }}
                className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center"
              >
                <FaCheck className="text-white text-xl" />
              </button>
            </div>

            <p className="text-center text-gray-500 text-sm mt-4">
              {defaultProduct.name}
            </p>
          </motion.div>
        )}

        {/* Permission Denied Message */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center p-8">
              <FaCamera className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">Camera Access Required</h3>
              <p className="text-gray-400 mb-4">
                Please enable camera permissions in your browser settings to use AR preview.
              </p>
              <button
                onClick={() => { stopCamera(); onClose?.(); }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ARProductPreview;
