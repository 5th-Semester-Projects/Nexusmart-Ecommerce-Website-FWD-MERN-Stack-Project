import React, { useState, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Text, Html } from '@react-three/drei';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiPackage, FiMaximize2, FiGrid, FiList } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import * as THREE from 'three';

// Product Display Pedestal
const Pedestal = ({ position, color = '#6366f1', onClick, label, price }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      {/* Pedestal Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.2, 32]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Product Box (placeholder) */}
      <mesh
        ref={meshRef}
        position={[0, 1, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.3}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Floating Label */}
      <Html position={[0, 2, 0]} center distanceFactor={10}>
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg transition-all ${hovered ? 'scale-110' : 'scale-100'}`}>
          <p className="text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">{label}</p>
          <p className="text-xs text-primary-600 dark:text-primary-400 font-bold">${price}</p>
        </div>
      </Html>

      {/* Glow Effect */}
      {hovered && (
        <pointLight position={[0, 1, 0]} intensity={2} distance={3} color={color} />
      )}
    </group>
  );
};

// Room Environment
const ShowroomEnvironment = () => {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#f3f4f6"
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Ambient Lighting */}
      <ambientLight intensity={0.4} />
      <spotLight
        position={[10, 20, 10]}
        angle={0.3}
        penumbra={1}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[-10, 20, -10]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />

      {/* Environment Map */}
      <Environment preset="warehouse" />
    </>
  );
};

// Loading Component
const Loader = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading Showroom...</p>
      </div>
    </Html>
  );
};

const VirtualShowroom = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('3d'); // 3d or grid
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Mock products data
  const products = [
    { id: 1, name: 'Wireless Headphones', price: 49.99, color: '#6366f1', position: [-3, 0, 0] },
    { id: 2, name: 'Smart Watch', price: 199.99, color: '#ec4899', position: [0, 0, 0] },
    { id: 3, name: 'Laptop Stand', price: 29.99, color: '#f59e0b', position: [3, 0, 0] },
    { id: 4, name: 'USB-C Cable', price: 19.99, color: '#10b981', position: [-3, 0, 3] },
    { id: 5, name: 'Keyboard', price: 89.99, color: '#8b5cf6', position: [0, 0, 3] },
    { id: 6, name: 'Mouse', price: 39.99, color: '#06b6d4', position: [3, 0, 3] },
  ];

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    // In a real app, navigate to product detail
    // navigate(`/products/${product.id}`);
  };

  return (
    <>
      <Helmet>
        <title>Virtual Showroom - NexusMart</title>
        <meta name="description" content="Explore products in our interactive 3D virtual showroom" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiPackage className="text-primary-600" />
                  Virtual Showroom
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Explore products in immersive 3D space
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                      viewMode === '3d'
                        ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <FiMaximize2 className="inline mr-2" />
                    3D View
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <FiGrid className="inline mr-2" />
                    Grid View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Showroom View */}
        {viewMode === '3d' && (
          <div className="relative" style={{ height: 'calc(100vh - 180px)' }}>
            <Canvas shadows dpr={[1, 2]}>
              <Suspense fallback={<Loader />}>
                <PerspectiveCamera makeDefault position={[0, 5, 10]} />
                
                <ShowroomEnvironment />

                {/* Products */}
                {products.map((product) => (
                  <Pedestal
                    key={product.id}
                    position={product.position}
                    color={product.color}
                    label={product.name}
                    price={product.price}
                    onClick={() => handleProductClick(product)}
                  />
                ))}

                <OrbitControls
                  enableZoom={true}
                  enablePan={true}
                  minDistance={5}
                  maxDistance={20}
                  minPolarAngle={Math.PI / 6}
                  maxPolarAngle={Math.PI / 2.5}
                  target={[0, 0, 1.5]}
                />
              </Suspense>
            </Canvas>

            {/* Instructions Overlay */}
            <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg px-4 py-3 shadow-xl max-w-xs">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">How to Navigate:</p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Click and drag to rotate view</li>
                <li>• Scroll to zoom in/out</li>
                <li>• Click on products to view details</li>
                <li>• Right-click and drag to pan</li>
              </ul>
            </div>

            {/* Product Count */}
            <div className="absolute top-6 right-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg px-4 py-2 shadow-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-primary-600">{products.length}</span> Products
              </p>
            </div>
          </div>
        )}

        {/* Grid View Fallback */}
        {viewMode === 'grid' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="card overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div
                    className="h-48 flex items-center justify-center"
                    style={{ backgroundColor: product.color }}
                  >
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-lg"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-bold">${product.price}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Product Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedProduct.name}
              </h2>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                ${selectedProduct.price}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Click below to view full product details and add to cart.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setSelectedProduct(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate(`/products/${selectedProduct.id}`)}
                >
                  View Details
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default VirtualShowroom;
