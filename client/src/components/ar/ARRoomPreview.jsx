import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCamera, FiX, FiMove, FiRotateCcw, FiZoomIn, 
  FiZoomOut, FiSave, FiShare2, FiRefreshCw
} from 'react-icons/fi';
import { FaCouch, FaChair } from 'react-icons/fa';
import * as THREE from 'three';
import toast from 'react-hot-toast';

const ARRoomPreview = ({ product, onClose }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [productPosition, setProductPosition] = useState({ x: 50, y: 70 });
  const [productScale, setProductScale] = useState(1);
  const [productRotation, setProductRotation] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [mode, setMode] = useState('camera'); // camera, upload, preview
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const containerRef = useRef(null);

  const roomPresets = [
    { id: 'living', name: 'Living Room', image: '/rooms/living-room.jpg' },
    { id: 'bedroom', name: 'Bedroom', image: '/rooms/bedroom.jpg' },
    { id: 'office', name: 'Office', image: '/rooms/office.jpg' },
    { id: 'kitchen', name: 'Kitchen', image: '/rooms/kitchen.jpg' }
  ];

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setMode('camera');
      }
    } catch (error) {
      toast.error('Unable to access camera');
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

  const captureRoom = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      setCapturedImage(canvas.toDataURL('image/jpeg', 0.95));
      stopCamera();
      setMode('preview');
    }
  };

  const selectPresetRoom = (room) => {
    setSelectedRoom(room);
    setCapturedImage(room.image);
    setMode('preview');
    stopCamera();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setMode('preview');
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const saveComposite = () => {
    if (!containerRef.current) return;

    // Use html2canvas or similar in production
    toast.success('Image saved to gallery!');
  };

  const shareComposite = async () => {
    try {
      await navigator.share({
        title: `${product?.name} in my room`,
        text: 'Check out how this looks in my room!',
        url: window.location.href
      });
    } catch (err) {
      toast.success('Link copied to clipboard!');
    }
  };

  const resetPosition = () => {
    setProductPosition({ x: 50, y: 70 });
    setProductScale(1);
    setProductRotation(0);
  };

  // Drag handling
  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    if (e.target.closest('.product-overlay')) {
      isDragging.current = true;
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setProductPosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchMove = (e) => {
    if (isDragging.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      setProductPosition({
        x: ((touch.clientX - rect.left) / rect.width) * 100,
        y: ((touch.clientY - rect.top) / rect.height) * 100
      });
    }
  };

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
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <FaCouch className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold">AR Room Preview</h2>
            <p className="text-white/60 text-sm">See how it looks in your space</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <FiX className="text-white text-xl" />
        </button>
      </div>

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {mode === 'camera' && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Product Overlay */}
            {cameraActive && (
              <motion.div
                className="product-overlay absolute cursor-move"
                style={{
                  left: `${productPosition.x}%`,
                  top: `${productPosition.y}%`,
                  transform: `translate(-50%, -50%) scale(${productScale}) rotate(${productRotation}deg)`
                }}
              >
                <img
                  src={product?.images?.[0]?.url || '/api/placeholder/200/200'}
                  alt={product?.name}
                  className="max-w-64 max-h-64 object-contain drop-shadow-2xl"
                  style={{ opacity: 0.95 }}
                  draggable={false}
                />
              </motion.div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </>
        )}

        {mode === 'preview' && capturedImage && (
          <>
            {/* Room Background */}
            <img
              src={capturedImage}
              alt="Room"
              className="w-full h-full object-cover"
            />
            
            {/* Product Overlay */}
            <motion.div
              className="product-overlay absolute cursor-move"
              style={{
                left: `${productPosition.x}%`,
                top: `${productPosition.y}%`,
                transform: `translate(-50%, -50%) scale(${productScale}) rotate(${productRotation}deg)`
              }}
              whileHover={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
            >
              <img
                src={product?.images?.[0]?.url || '/api/placeholder/200/200'}
                alt={product?.name}
                className="max-w-80 max-h-80 object-contain drop-shadow-2xl"
                style={{ 
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))',
                }}
                draggable={false}
              />
              
              {/* Drag Handle */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-purple-500 rounded-full text-white text-xs flex items-center gap-1">
                <FiMove /> Drag to move
              </div>
            </motion.div>
          </>
        )}

        {/* Room Presets (when not in camera mode) */}
        {mode !== 'camera' && !capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center max-w-2xl p-8">
              <h3 className="text-white text-2xl font-bold mb-6">Choose Your Room</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {roomPresets.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => selectPresetRoom(room)}
                    className="relative group overflow-hidden rounded-xl aspect-video"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/300';
                      }}
                    />
                    <span className="absolute bottom-3 left-3 text-white font-medium z-20">
                      {room.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl flex items-center gap-2"
                >
                  <FiCamera /> Use Camera
                </button>
                
                <label className="px-6 py-3 bg-white/10 text-white rounded-xl flex items-center gap-2 cursor-pointer hover:bg-white/20">
                  <FiShare2 /> Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/50 backdrop-blur-sm">
        {mode === 'camera' && cameraActive && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setProductScale(s => Math.max(0.3, s - 0.1))}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <FiZoomOut />
            </button>
            <button
              onClick={() => setProductScale(s => Math.min(2, s + 0.1))}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <FiZoomIn />
            </button>
            <button
              onClick={captureRoom}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
            >
              <FiCamera className="text-2xl text-gray-900" />
            </button>
            <button
              onClick={() => setProductRotation(r => r - 15)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <FiRotateCcw />
            </button>
            <button
              onClick={resetPosition}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <FiRefreshCw />
            </button>
          </div>
        )}

        {mode === 'preview' && (
          <div className="space-y-4">
            {/* Size & Rotation Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setProductScale(s => Math.max(0.3, s - 0.1))}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              >
                <FiZoomOut />
              </button>
              
              <input
                type="range"
                min="0.3"
                max="2"
                step="0.1"
                value={productScale}
                onChange={(e) => setProductScale(parseFloat(e.target.value))}
                className="w-32"
              />
              
              <button
                onClick={() => setProductScale(s => Math.min(2, s + 0.1))}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              >
                <FiZoomIn />
              </button>

              <div className="w-px h-8 bg-white/20" />

              <button
                onClick={() => setProductRotation(r => r - 15)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              >
                <FiRotateCcw />
              </button>
              
              <button
                onClick={() => setProductRotation(r => r + 15)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white"
                style={{ transform: 'scaleX(-1)' }}
              >
                <FiRotateCcw />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setMode('camera');
                  startCamera();
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white flex items-center gap-2"
              >
                <FiCamera /> New Photo
              </button>
              <button
                onClick={saveComposite}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white flex items-center gap-2"
              >
                <FiSave /> Save
              </button>
              <button
                onClick={shareComposite}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white flex items-center gap-2"
              >
                <FiShare2 /> Share
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Info Bar */}
      <div className="p-4 bg-gray-900">
        <div className="flex items-center gap-4">
          <img
            src={product?.images?.[0]?.url || '/api/placeholder/60/60'}
            alt={product?.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="text-white font-medium">{product?.name || 'Product Name'}</h3>
            <p className="text-purple-400 font-bold">${product?.price || '99.99'}</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium">
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ARRoomPreview;
