import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiX, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import Button from '../common/Button';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const ARTryOn = ({ modelUrl, productName, isOpen, onClose }) => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [arSession, setArSession] = useState(null);
  const canvasRef = useRef(null);

  // Check AR support on mount
  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    if ('xr' in navigator) {
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        setIsARSupported(supported);
      } catch (error) {
        console.error('AR support check failed:', error);
        setIsARSupported(false);
      }
    } else {
      setIsARSupported(false);
    }
  };

  const startARSession = async () => {
    if (!isARSupported) {
      toast.error('AR is not supported on this device');
      return;
    }

    setIsLoading(true);
    try {
      // Request AR session
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        domOverlay: { root: document.body },
      });

      setArSession(session);

      // Setup WebGL context
      const gl = canvasRef.current.getContext('webgl', { xrCompatible: true });
      
      // Create XR reference space
      const refSpace = await session.requestReferenceSpace('local');

      // Animation loop
      const onFrame = (time, frame) => {
        session.requestAnimationFrame(onFrame);
        
        const pose = frame.getViewerPose(refSpace);
        if (pose) {
          // Render 3D model in AR space
          // This is a simplified version - full implementation would use three.js
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }
      };

      session.requestAnimationFrame(onFrame);

      // Handle session end
      session.addEventListener('end', () => {
        setArSession(null);
        setIsLoading(false);
      });

      toast.success('AR session started! Point your camera at a surface.');
    } catch (error) {
      console.error('Failed to start AR session:', error);
      toast.error('Failed to start AR. Please try again.');
      setIsLoading(false);
    }
  };

  const stopARSession = () => {
    if (arSession) {
      arSession.end();
      setArSession(null);
    }
  };

  const handleClose = () => {
    stopARSession();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AR Try-On" size="lg">
      <div className="space-y-6">
        {/* AR Support Check */}
        {!isARSupported ? (
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  AR Not Supported
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Your device doesn't support AR features. To use AR try-on, you need:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>A mobile device with ARCore (Android) or ARKit (iOS)</li>
                  <li>A compatible browser (Chrome, Safari, Firefox Reality)</li>
                  <li>Camera permissions enabled</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Instructions */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">AR is Ready!</p>
                  <p>Click "Start AR" to see {productName} in your space. Point your camera at a flat surface and tap to place the product.</p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FiCamera className="w-8 h-8 text-white" />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900 dark:text-white">{productName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View in your space with AR</p>
              </div>
            </div>

            {/* AR Canvas (hidden, used for rendering) */}
            <canvas
              ref={canvasRef}
              className="hidden"
              width={window.innerWidth}
              height={window.innerHeight}
            />

            {/* AR Session Active Indicator */}
            <AnimatePresence>
              {arSession && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <p className="font-semibold text-green-800 dark:text-green-200">AR Session Active</p>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    Point your camera at a flat surface. Tap the screen to place the product.
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      Reset Position
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      Rotate Model
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!arSession ? (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={startARSession}
                  loading={isLoading}
                  icon={FiCamera}
                >
                  Start AR Experience
                </Button>
              ) : (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={stopARSession}
                  icon={FiX}
                >
                  Exit AR
                </Button>
              )}
            </div>

            {/* Tips */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">AR Tips:</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Move your device slowly to scan the environment</li>
                <li>• Ensure good lighting for better tracking</li>
                <li>• Use a flat surface for best results</li>
                <li>• Pinch to scale, drag to move the model</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ARTryOn;
