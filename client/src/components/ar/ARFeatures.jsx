import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CameraIcon,
  CubeIcon,
  SparklesIcon,
  XMarkIcon,
  ArrowPathIcon,
  PhotoIcon,
  HeartIcon,
  ShareIcon,
  ShoppingCartIcon,
  SwatchIcon,
  ArrowsPointingOutIcon,
  ViewfinderCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Virtual Makeup Try-On Component
export const VirtualMakeupTryOn = ({ product, isOpen, onClose }) => {
  const [activeShade, setActiveShade] = useState(0);
  const [intensity, setIntensity] = useState(0.7);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liked, setLiked] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const shades = product?.shades || [
    { name: 'Natural Pink', color: '#E8B4B8' },
    { name: 'Coral Dream', color: '#E88B6C' },
    { name: 'Ruby Red', color: '#9B2335' },
    { name: 'Mauve', color: '#915F6D' },
    { name: 'Berry', color: '#8E4585' },
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      setCapturedImage(canvasRef.current.toDataURL('image/png'));
      stopCamera();
      applyMakeup();
    }
  };

  const applyMakeup = () => {
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Makeup applied! Looking gorgeous! 💄');
    }, 2000);
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 via-pink-900/20 to-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden border border-pink-500/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-pink-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Virtual Makeup Try-On</h3>
              <p className="text-xs text-gray-400">AR-powered beauty experience</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {/* Camera/Preview Area */}
          <div className="md:col-span-2">
            <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden">
              {!isCameraActive && !capturedImage ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <CameraIcon className="w-16 h-16 text-gray-500 mb-4" />
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                  >
                    Start Camera
                  </button>
                  <p className="text-gray-500 text-sm mt-4">or</p>
                  <label className="mt-2 px-4 py-2 border border-gray-600 rounded-full text-gray-400 hover:border-pink-500 hover:text-pink-400 cursor-pointer transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => setCapturedImage(e.target.result);
                        reader.readAsDataURL(file);
                      }
                    }} />
                    Upload Photo
                  </label>
                </div>
              ) : isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                    <button
                      onClick={capturePhoto}
                      className="p-4 bg-white rounded-full shadow-lg hover:scale-105 transition-transform"
                    >
                      <CameraIcon className="w-8 h-8 text-pink-500" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={capturedImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{ filter: `hue-rotate(${activeShade * 30}deg) saturate(${intensity + 0.5})` }}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center">
                        <ArrowPathIcon className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
                        <p className="text-white mt-2">Applying makeup magic...</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    <button
                      onClick={retake}
                      className="px-4 py-2 bg-gray-800/80 backdrop-blur text-white rounded-full text-sm hover:bg-gray-700 transition-colors"
                    >
                      <ArrowPathIcon className="w-4 h-4 inline mr-1" />
                      Retake
                    </button>
                    <button
                      onClick={() => setLiked(!liked)}
                      className="p-2 bg-gray-800/80 backdrop-blur rounded-full hover:bg-gray-700 transition-colors"
                    >
                      {liked ? (
                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button className="p-2 bg-gray-800/80 backdrop-blur rounded-full hover:bg-gray-700 transition-colors">
                      <ShareIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Shade Selection */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <SwatchIcon className="w-5 h-5" />
                Select Shade
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {shades.map((shade, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveShade(index)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      activeShade === index ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: shade.color }}
                    title={shade.name}
                  />
                ))}
              </div>
              <p className="text-gray-400 text-sm mt-2">{shades[activeShade]?.name}</p>
            </div>

            {/* Intensity Slider */}
            <div>
              <h4 className="text-white font-medium mb-3">Intensity</h4>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full accent-pink-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Light</span>
                <span>Full</span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-white font-medium">{product?.name || 'Luxury Lipstick'}</h4>
              <p className="text-pink-400 font-bold mt-1">${product?.price || '29.99'}</p>
              <button className="w-full mt-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2">
                <ShoppingCartIcon className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Furniture Placement AR Component
export const FurniturePlacement = ({ product, isOpen, onClose }) => {
  const [roomImage, setRoomImage] = useState(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleDragStart = (e) => {
    setIsDragging(true);
  };

  const handleDrag = (e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 overflow-hidden border border-blue-500/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <CubeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Furniture Placement AR</h3>
              <p className="text-xs text-gray-400">See how it looks in your room</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          {/* Room Preview */}
          <div className="md:col-span-3">
            <div
              ref={containerRef}
              className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden cursor-crosshair"
              onMouseMove={handleDrag}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              {!roomImage ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <PhotoIcon className="w-16 h-16 text-gray-500 mb-4" />
                  <label className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium hover:shadow-lg cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => setRoomImage(e.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    Upload Room Photo
                  </label>
                  <p className="text-gray-500 text-sm mt-4">Take a photo of your room to get started</p>
                </div>
              ) : (
                <>
                  <img
                    src={roomImage}
                    alt="Room"
                    className="w-full h-full object-cover"
                  />
                  {/* Furniture Overlay */}
                  <motion.div
                    drag
                    dragMomentum={false}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    style={{
                      position: 'absolute',
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                    }}
                    className="cursor-move"
                  >
                    <img
                      src={product?.image || '/api/placeholder/200/200'}
                      alt={product?.name || 'Furniture'}
                      className="w-48 h-48 object-contain drop-shadow-2xl"
                      draggable={false}
                    />
                  </motion.div>
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setRoomImage(null)}
                      className="px-3 py-1 bg-gray-800/80 backdrop-blur text-white rounded-full text-sm hover:bg-gray-700"
                    >
                      Change Room
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Scale */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <ArrowsPointingOutIcon className="w-5 h-5" />
                Size
              </h4>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Rotation */}
            <div>
              <h4 className="text-white font-medium mb-3">Rotation</h4>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <p className="text-center text-gray-400 text-sm mt-1">{rotation}°</p>
            </div>

            {/* Product Info */}
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-white font-medium">{product?.name || 'Modern Sofa'}</h4>
              <p className="text-gray-400 text-sm mt-1">
                Dimensions: {product?.dimensions || '200 x 90 x 85 cm'}
              </p>
              <p className="text-blue-400 font-bold mt-2">${product?.price || '899.99'}</p>
              <button className="w-full mt-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <ShoppingCartIcon className="w-5 h-5" />
                Add to Cart
              </button>
            </div>

            {/* Tips */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-xs">
                💡 Tip: Drag the furniture to position it in your room. Use the sliders to adjust size and rotation.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Body Size Estimation Component
export const BodySizeEstimation = ({ onComplete, isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    chest: null,
    waist: null,
    hips: null,
    inseam: null,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 640 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Unable to access camera');
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setCapturedImage(canvas.toDataURL('image/png'));
    streamRef.current?.getTracks().forEach(track => track.stop());
    analyzeMeasurements();
  };

  const analyzeMeasurements = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setMeasurements(prev => ({
        ...prev,
        chest: 38,
        waist: 32,
        hips: 40,
        inseam: 32,
      }));
      setIsAnalyzing(false);
      setStep(3);
    }, 3000);
  };

  const getSizeRecommendation = () => {
    const { chest, waist } = measurements;
    if (chest <= 36 && waist <= 30) return 'S';
    if (chest <= 40 && waist <= 34) return 'M';
    if (chest <= 44 && waist <= 38) return 'L';
    return 'XL';
  };

  useEffect(() => {
    if (step === 2) {
      startCamera();
    }
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [step]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-purple-500/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <ViewfinderCircleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Size Estimation</h3>
              <p className="text-xs text-gray-400">AI-powered body measurement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Steps Indicator */}
          <div className="flex items-center justify-center mb-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      step > s ? 'bg-purple-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-white text-lg font-medium text-center">Enter Basic Info</h4>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={measurements.height}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                  placeholder="175"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={measurements.weight}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                  placeholder="70"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!measurements.height || !measurements.weight}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue to Body Scan
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-white text-lg font-medium text-center">Body Scan</h4>
              <p className="text-gray-400 text-sm text-center">
                Stand in front of your camera in fitted clothing
              </p>
              <div className="relative aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden">
                {!capturedImage ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-32 h-80 border-2 border-dashed border-purple-500/50 rounded-full" />
                    </div>
                    <button
                      onClick={capturePhoto}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 bg-purple-500 rounded-full shadow-lg hover:scale-105 transition-transform"
                    >
                      <CameraIcon className="w-6 h-6 text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                        <ArrowPathIcon className="w-12 h-12 text-purple-500 animate-spin" />
                        <p className="text-white mt-2">Analyzing measurements...</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-white text-lg font-medium text-center">Your Measurements</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Chest', value: measurements.chest, unit: 'in' },
                  { label: 'Waist', value: measurements.waist, unit: 'in' },
                  { label: 'Hips', value: measurements.hips, unit: 'in' },
                  { label: 'Inseam', value: measurements.inseam, unit: 'in' },
                ].map((m) => (
                  <div key={m.label} className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-gray-400 text-sm">{m.label}</p>
                    <p className="text-white text-2xl font-bold">{m.value}"</p>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center">
                <p className="text-gray-300 text-sm">Recommended Size</p>
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {getSizeRecommendation()}
                </p>
              </div>
              <button
                onClick={() => {
                  onComplete?.(measurements);
                  onClose();
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Save & Continue Shopping
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default {
  VirtualMakeupTryOn,
  FurniturePlacement,
  BodySizeEstimation
};
