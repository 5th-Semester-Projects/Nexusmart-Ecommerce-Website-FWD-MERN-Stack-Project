import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaVrCardboard, FaExpand, FaCompress, FaShoppingCart,
  FaWalking, FaHandPointer, FaVolumeUp, FaVolumeMute,
  FaMapMarkerAlt, FaCube, FaStore, FaArrowLeft, FaArrowRight,
  FaArrowUp, FaArrowDown, FaEye, FaInfoCircle
} from 'react-icons/fa';

const VRStore = ({ products = [], onAddToCart, onProductSelect }) => {
  const [isVRMode, setIsVRMode] = useState(false);
  const [currentZone, setCurrentZone] = useState('entrance');
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [visitedZones, setVisitedZones] = useState(['entrance']);
  const [cartItems, setCartItems] = useState([]);
  const containerRef = useRef(null);
  const audioRef = useRef(null);

  // Store zones configuration
  const storeZones = {
    entrance: {
      name: 'Store Entrance',
      description: 'Welcome to NexusMart VR Experience',
      color: '#3B82F6',
      products: [],
      connections: ['electronics', 'fashion', 'home']
    },
    electronics: {
      name: 'Electronics Zone',
      description: 'Latest gadgets and tech',
      color: '#8B5CF6',
      products: products.filter(p => p.category === 'electronics'),
      connections: ['entrance', 'gaming', 'fashion']
    },
    fashion: {
      name: 'Fashion District',
      description: 'Trending styles and accessories',
      color: '#EC4899',
      products: products.filter(p => p.category === 'fashion'),
      connections: ['entrance', 'electronics', 'beauty']
    },
    home: {
      name: 'Home & Living',
      description: 'Furniture and home decor',
      color: '#10B981',
      products: products.filter(p => p.category === 'home'),
      connections: ['entrance', 'beauty', 'sports']
    },
    gaming: {
      name: 'Gaming Arena',
      description: 'Games, consoles, and accessories',
      color: '#F59E0B',
      products: products.filter(p => p.category === 'gaming'),
      connections: ['electronics', 'sports']
    },
    beauty: {
      name: 'Beauty & Care',
      description: 'Skincare, makeup, and wellness',
      color: '#F472B6',
      products: products.filter(p => p.category === 'beauty'),
      connections: ['fashion', 'home']
    },
    sports: {
      name: 'Sports & Outdoors',
      description: 'Athletic gear and equipment',
      color: '#14B8A6',
      products: products.filter(p => p.category === 'sports'),
      connections: ['gaming', 'home', 'checkout']
    },
    checkout: {
      name: 'Checkout Counter',
      description: 'Complete your purchase',
      color: '#EF4444',
      products: [],
      connections: ['sports', 'entrance']
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVRMode) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          setPosition(prev => ({ ...prev, z: prev.z - 10 }));
          break;
        case 'ArrowDown':
        case 's':
          setPosition(prev => ({ ...prev, z: prev.z + 10 }));
          break;
        case 'ArrowLeft':
        case 'a':
          setPosition(prev => ({ ...prev, x: prev.x - 10 }));
          break;
        case 'ArrowRight':
        case 'd':
          setPosition(prev => ({ ...prev, x: prev.x + 10 }));
          break;
        case 'q':
          setRotation(prev => ({ ...prev, y: prev.y - 15 }));
          break;
        case 'e':
          setRotation(prev => ({ ...prev, y: prev.y + 15 }));
          break;
        case 'Escape':
          setIsVRMode(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVRMode]);

  // Navigate to zone
  const navigateToZone = (zoneName) => {
    setCurrentZone(zoneName);
    if (!visitedZones.includes(zoneName)) {
      setVisitedZones(prev => [...prev, zoneName]);
    }
    // Play navigation sound
    if (!isMuted && audioRef.current) {
      audioRef.current.play();
    }
  };

  // Add to VR cart
  const addToVRCart = (product) => {
    setCartItems(prev => [...prev, product]);
    if (onAddToCart) onAddToCart(product);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const currentZoneData = storeZones[currentZone];

  return (
    <div ref={containerRef} className="relative">
      {/* VR Entry Button */}
      {!isVRMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30"
        >
          <div className="text-center">
            <motion.div
              animate={{ 
                rotateY: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <FaVrCardboard className="w-24 h-24 text-purple-400" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              🌐 NexusMart VR Store
            </h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Experience shopping in Virtual Reality! Walk through our store,
              explore products in 3D, and shop like never before.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: FaWalking, label: 'Walk Around', desc: 'Explore the store' },
                { icon: FaCube, label: '3D Products', desc: 'View in 360°' },
                { icon: FaHandPointer, label: 'Interact', desc: 'Pick up items' },
                { icon: FaShoppingCart, label: 'Shop', desc: 'Add to cart in VR' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 rounded-xl p-4"
                >
                  <feature.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-white font-medium text-sm">{feature.label}</p>
                  <p className="text-gray-400 text-xs">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVRMode(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 flex items-center gap-3 mx-auto"
            >
              <FaVrCardboard className="w-6 h-6" />
              Enter VR Store
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* VR Mode Interface */}
      <AnimatePresence>
        {isVRMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            {/* 3D Environment */}
            <div 
              className="relative w-full h-full overflow-hidden"
              style={{
                perspective: '1000px',
                background: `radial-gradient(ellipse at center, ${currentZoneData.color}20 0%, #000 70%)`
              }}
            >
              {/* Animated stars/particles background */}
              <div className="absolute inset-0">
                {[...Array(100)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.5 + 0.2
                    }}
                    animate={{
                      opacity: [0.2, 0.8, 0.2],
                      scale: [1, 1.5, 1]
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>

              {/* Floor grid */}
              <div 
                className="absolute inset-0"
                style={{
                  transform: `rotateX(60deg) translateZ(-200px) translateX(${position.x}px) translateY(${position.z}px)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div 
                  className="w-[2000px] h-[2000px] mx-auto"
                  style={{
                    backgroundImage: `
                      linear-gradient(${currentZoneData.color}40 1px, transparent 1px),
                      linear-gradient(90deg, ${currentZoneData.color}40 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                  }}
                />
              </div>

              {/* Zone Content */}
              <motion.div
                key={currentZone}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
              >
                {/* Zone Header */}
                <motion.div
                  initial={{ y: -50 }}
                  animate={{ y: 0 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-2"
                    style={{ textShadow: `0 0 30px ${currentZoneData.color}` }}
                  >
                    {currentZoneData.name}
                  </h1>
                  <p className="text-xl text-gray-300">{currentZoneData.description}</p>
                </motion.div>

                {/* Products in Zone */}
                {currentZoneData.products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl w-full">
                    {currentZoneData.products.slice(0, 8).map((product, i) => (
                      <motion.div
                        key={product._id || i}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ 
                          scale: 1.1, 
                          rotateY: 10,
                          z: 50
                        }}
                        onClick={() => setSelectedProduct(product)}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 cursor-pointer border border-white/20 hover:border-purple-500/50 transition-all"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                          {product.images?.[0] ? (
                            <img 
                              src={product.images[0].url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaCube className="w-12 h-12 text-gray-600" />
                          )}
                        </div>
                        <h3 className="text-white font-medium text-sm truncate">{product.name}</h3>
                        <p className="text-purple-400 font-bold">${product.price}</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToVRCart(product);
                          }}
                          className="w-full mt-2 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                        >
                          <FaShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                ) : currentZone === 'entrance' ? (
                  <div className="text-center">
                    <FaStore className="w-32 h-32 text-purple-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400 text-xl">Choose a zone to explore</p>
                  </div>
                ) : currentZone === 'checkout' ? (
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <FaShoppingCart className="text-purple-400" />
                      Your VR Cart
                    </h2>
                    {cartItems.length > 0 ? (
                      <>
                        {cartItems.map((item, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-white">{item.name}</span>
                            <span className="text-purple-400">${item.price}</span>
                          </div>
                        ))}
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <div className="flex justify-between text-xl font-bold">
                            <span className="text-white">Total:</span>
                            <span className="text-green-400">
                              ${cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                            </span>
                          </div>
                          <button className="w-full mt-4 py-3 bg-green-600 text-white rounded-xl font-bold">
                            Proceed to Checkout
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 text-center py-8">Your cart is empty</p>
                    )}
                  </div>
                ) : null}

                {/* Navigation Portals */}
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-4">
                  {currentZoneData.connections.map((zone) => (
                    <motion.button
                      key={zone}
                      whileHover={{ scale: 1.1, y: -10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigateToZone(zone)}
                      className="px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${storeZones[zone].color}80, ${storeZones[zone].color}40)`,
                        border: `2px solid ${storeZones[zone].color}`,
                        boxShadow: `0 0 20px ${storeZones[zone].color}40`
                      }}
                    >
                      <FaMapMarkerAlt className="text-white" />
                      <span className="text-white">{storeZones[zone].name}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Controls */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 bg-white/10 backdrop-blur rounded-xl text-white"
                >
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={toggleFullscreen}
                  className="p-3 bg-white/10 backdrop-blur rounded-xl text-white"
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowMinimap(!showMinimap)}
                  className="p-3 bg-white/10 backdrop-blur rounded-xl text-white"
                >
                  <FaMapMarkerAlt />
                </motion.button>
              </div>

              {/* Minimap */}
              <AnimatePresence>
                {showMinimap && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-4 right-4 w-48 h-48 bg-black/80 backdrop-blur-xl rounded-xl p-3 border border-white/20"
                  >
                    <p className="text-xs text-gray-400 mb-2">Store Map</p>
                    <div className="relative w-full h-full">
                      {Object.entries(storeZones).map(([key, zone], i) => {
                        const positions = {
                          entrance: { x: 50, y: 90 },
                          electronics: { x: 20, y: 60 },
                          fashion: { x: 80, y: 60 },
                          home: { x: 50, y: 60 },
                          gaming: { x: 20, y: 30 },
                          beauty: { x: 80, y: 30 },
                          sports: { x: 50, y: 30 },
                          checkout: { x: 50, y: 10 }
                        };
                        const pos = positions[key];
                        return (
                          <motion.div
                            key={key}
                            className={`absolute w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                              currentZone === key ? 'ring-2 ring-white' : ''
                            }`}
                            style={{
                              left: `${pos.x}%`,
                              top: `${pos.y}%`,
                              backgroundColor: zone.color,
                              opacity: visitedZones.includes(key) ? 1 : 0.3
                            }}
                            whileHover={{ scale: 1.5 }}
                            onClick={() => navigateToZone(key)}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cart indicator */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-xl rounded-xl px-4 py-2 flex items-center gap-2">
                <FaShoppingCart className="text-purple-400" />
                <span className="text-white font-bold">{cartItems.length}</span>
              </div>

              {/* Exit VR */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsVRMode(false)}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-red-600/80 backdrop-blur text-white rounded-xl font-medium"
              >
                Exit VR Mode (ESC)
              </motion.button>

              {/* Movement instructions */}
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-xl rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">Controls</p>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div></div>
                  <div className="p-2 bg-white/10 rounded text-white text-xs">W/↑</div>
                  <div></div>
                  <div className="p-2 bg-white/10 rounded text-white text-xs">A/←</div>
                  <div className="p-2 bg-white/10 rounded text-white text-xs">S/↓</div>
                  <div className="p-2 bg-white/10 rounded text-white text-xs">D/→</div>
                </div>
              </div>
            </div>

            {/* Product Detail Modal */}
            <AnimatePresence>
              {selectedProduct && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 flex items-center justify-center z-60"
                  onClick={() => setSelectedProduct(null)}
                >
                  <motion.div
                    initial={{ scale: 0.8, rotateY: -30 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    exit={{ scale: 0.8, rotateY: 30 }}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="flex gap-6">
                      <div className="w-1/2 aspect-square bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl flex items-center justify-center">
                        {selectedProduct.images?.[0] ? (
                          <motion.img 
                            src={selectedProduct.images[0].url} 
                            alt={selectedProduct.name}
                            className="w-full h-full object-contain"
                            animate={{ rotateY: [0, 360] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                          />
                        ) : (
                          <FaCube className="w-24 h-24 text-gray-600" />
                        )}
                      </div>
                      <div className="w-1/2">
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedProduct.name}</h2>
                        <p className="text-3xl font-bold text-purple-400 mb-4">${selectedProduct.price}</p>
                        <p className="text-gray-400 mb-6">{selectedProduct.description}</p>
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              addToVRCart(selectedProduct);
                              setSelectedProduct(null);
                            }}
                            className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                          >
                            <FaShoppingCart />
                            Add to Cart
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedProduct(null)}
                            className="px-6 py-3 bg-gray-700 text-white rounded-xl"
                          >
                            Close
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio element for ambient sounds */}
      <audio ref={audioRef} src="/sounds/whoosh.mp3" />
    </div>
  );
};

export default VRStore;
