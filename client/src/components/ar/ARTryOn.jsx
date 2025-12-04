import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCamera, FiX, FiRotateCcw, FiZoomIn, FiZoomOut,
  FiDownload, FiShare2, FiMaximize, FiImage
} from 'react-icons/fi';
import { FaGlasses, FaTshirt } from 'react-icons/fa';
import * as THREE from 'three';
import toast from 'react-hot-toast';

const ARTryOn = ({ product, onClose }) => {
  const [mode, setMode] = useState('camera'); // camera, upload
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [productOverlay, setProductOverlay] = useState(null);
  const [position, setPosition] = useState({ x: 50, y: 30 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  // Product categories that support AR try-on
  const supportedCategories = ['glasses', 'sunglasses', 'hats', 'watches', 'jewelry', 'clothing'];

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        startFaceDetection();
      }
    } catch (error) {
      toast.error('Unable to access camera. Please check permissions.');
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startFaceDetection = async () => {
    // Simulated face detection
    // In production, use TensorFlow.js face-api or similar
    const detectFace = () => {
      // Simulated face position
      setFaceDetected(true);
      setPosition({ 
        x: 50 + (Math.random() - 0.5) * 5, 
        y: 30 + (Math.random() - 0.5) * 3 
      });
      animationRef.current = requestAnimationFrame(detectFace);
    };
    
    setTimeout(() => {
      detectFace();
    }, 1000);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Mirror the image
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      
      // Draw product overlay
      if (overlayRef.current && productOverlay) {
        const overlayImg = overlayRef.current;
        const x = (position.x / 100) * canvas.width - (overlayImg.width * scale) / 2;
        const y = (position.y / 100) * canvas.height - (overlayImg.height * scale) / 2;
        
        ctx.save();
        ctx.translate(x + (overlayImg.width * scale) / 2, y + (overlayImg.height * scale) / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(-1, 1); // Mirror back for overlay
        ctx.drawImage(
          overlayImg,
          -(overlayImg.width * scale) / 2,
          -(overlayImg.height * scale) / 2,
          overlayImg.width * scale,
          overlayImg.height * scale
        );
        ctx.restore();
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(dataUrl);
      stopCamera();
      toast.success('Photo captured!');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setMode('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.download = `nexusmart-tryon-${Date.now()}.jpg`;
      link.href = capturedImage;
      link.click();
      toast.success('Image downloaded!');
    }
  };

  const shareImage = async () => {
    if (capturedImage && navigator.share) {
      try {
        const blob = await (await fetch(capturedImage)).blob();
        const file = new File([blob], 'tryon.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: 'Check out my NexusMart try-on!',
          files: [file]
        });
      } catch (error) {
        toast.error('Unable to share');
      }
    } else {
      // Fallback - copy link
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setMode('camera');
  };

  // Set product overlay image
  useEffect(() => {
    if (product?.images?.[0]?.url) {
      setProductOverlay(product.images[0].url);
    }
  }, [product]);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPosition({ x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) });
    }
  }, []);

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <FaGlasses className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold">AR Try-On</h2>
            <p className="text-white/60 text-sm">{product?.name || 'Virtual Try-On'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <FiX className="text-white text-xl" />
        </button>
      </div>

      {/* Main View */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onMouseDown={handleMouseDown}
      >
        {!capturedImage ? (
          <>
            {/* Live Camera */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Product Overlay */}
            {productOverlay && faceDetected && (
              <motion.div
                className="absolute cursor-move"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`
                }}
                drag
                dragMomentum={false}
                onDrag={(e, info) => {
                  if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    setPosition({
                      x: ((info.point.x - rect.left) / rect.width) * 100,
                      y: ((info.point.y - rect.top) / rect.height) * 100
                    });
                  }
                }}
              >
                <img
                  ref={overlayRef}
                  src={productOverlay}
                  alt="Product overlay"
                  className="max-w-48 max-h-48 object-contain pointer-events-none"
                  style={{ opacity: 0.9 }}
                />
              </motion.div>
            )}

            {/* Face Detection Indicator */}
            {!faceDetected && cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-64 h-64 border-2 border-dashed border-white/50 rounded-full mx-auto mb-4" />
                  <p>Position your face in the circle</p>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          /* Captured Image */
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p>Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/50 backdrop-blur-sm">
        {!capturedImage ? (
          <>
            {/* Adjustment Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <FiZoomOut />
              </button>
              <button
                onClick={() => setScale(s => Math.min(2, s + 0.1))}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <FiZoomIn />
              </button>
              <button
                onClick={() => setRotation(r => r - 15)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <FiRotateCcw />
              </button>
              <button
                onClick={() => setRotation(r => r + 15)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
                style={{ transform: 'scaleX(-1)' }}
              >
                <FiRotateCcw />
              </button>
            </div>

            {/* Capture Button */}
            <div className="flex items-center justify-center gap-4">
              <label className="p-4 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer">
                <FiImage className="text-white text-xl" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={capturePhoto}
                disabled={!cameraActive}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center disabled:opacity-50"
              >
                <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full" />
              </button>

              <button className="p-4 bg-white/10 hover:bg-white/20 rounded-full">
                <FiMaximize className="text-white text-xl" />
              </button>
            </div>
          </>
        ) : (
          /* Post-Capture Controls */
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={retake}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white flex items-center gap-2"
            >
              <FiRotateCcw /> Retake
            </button>
            <button
              onClick={downloadImage}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white flex items-center gap-2"
            >
              <FiDownload /> Download
            </button>
            <button
              onClick={shareImage}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white flex items-center gap-2"
            >
              <FiShare2 /> Share
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 bg-gray-900">
        <div className="flex items-center gap-4">
          <img
            src={product?.images?.[0]?.url || '/api/placeholder/60/60'}
            alt={product?.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="text-white font-medium">{product?.name}</h3>
            <p className="text-purple-400 font-bold">${product?.price}</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium">
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ARTryOn;
