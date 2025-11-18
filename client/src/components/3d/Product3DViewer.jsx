import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stage, Environment, useGLTF, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { FiMaximize2, FiMinimize2, FiRotateCw, FiMove } from 'react-icons/fi';
import * as THREE from 'three';

// 3D Model Component
const Model = ({ modelUrl, scale = 1, autoRotate }) => {
  const meshRef = useRef();
  
  // Try to load GLTF model, fallback to basic geometry
  let model = null;
  try {
    if (modelUrl && modelUrl.endsWith('.glb') || modelUrl?.endsWith('.gltf')) {
      const gltf = useGLTF(modelUrl);
      model = gltf.scene;
    }
  } catch (error) {
    console.error('Failed to load 3D model:', error);
  }

  // Auto-rotation animation
  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Fallback to basic box if no model
  if (!model) {
    return (
      <mesh ref={meshRef} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6366f1" metalness={0.6} roughness={0.4} />
      </mesh>
    );
  }

  return (
    <primitive ref={meshRef} object={model} scale={scale} />
  );
};

// Loading fallback component
const Loader = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading 3D Model...</p>
      </div>
    </Html>
  );
};

const Product3DViewer = ({ modelUrl, productName, className = '' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden ${className}`}
      style={{ height: isFullscreen ? '100vh' : '500px' }}
    >
      {/* 3D Canvas */}
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={<Loader />}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
            shadow-mapSize={[512, 512]}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* Environment for realistic reflections */}
          <Environment preset="city" />
          
          {/* 3D Model */}
          <Stage intensity={0.5} environment="city">
            <Model modelUrl={modelUrl} scale={1.5} autoRotate={autoRotate} />
          </Stage>
          
          {/* Camera Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>

      {/* Control Panel */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-full px-6 py-3 shadow-xl flex items-center gap-4"
        >
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg transition-colors ${
              autoRotate
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title={autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
          >
            <FiRotateCw className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiMove className="w-4 h-4" />
            <span className="hidden sm:inline">Drag to rotate • Scroll to zoom</span>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
          </button>
        </motion.div>
      )}

      {/* Product Info Badge */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg px-4 py-2 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">3D View</p>
        {productName && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{productName}</p>
        )}
      </div>

      {/* View Mode Indicator */}
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-600 dark:text-gray-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded px-2 py-1">
          Interactive
        </span>
      </div>
    </motion.div>
  );
};

export default Product3DViewer;
