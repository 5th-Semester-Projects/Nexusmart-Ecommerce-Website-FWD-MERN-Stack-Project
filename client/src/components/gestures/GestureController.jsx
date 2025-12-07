import React, { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCrosshair, FiArrowLeft, FiArrowRight, FiArrowUp, FiArrowDown, FiZoomIn, FiZoomOut, FiRotateCw, FiSettings, FiX } from 'react-icons/fi';

/**
 * Gesture Controls Component
 * Advanced touch, mouse, and camera-based gesture recognition
 */

// Gesture context for app-wide gesture state
const GestureContext = createContext();

export const useGestures = () => {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error('useGestures must be used within a GestureProvider');
  }
  return context;
};

// Gesture types
const GESTURE_TYPES = {
  SWIPE_LEFT: 'swipe_left',
  SWIPE_RIGHT: 'swipe_right',
  SWIPE_UP: 'swipe_up',
  SWIPE_DOWN: 'swipe_down',
  PINCH_IN: 'pinch_in',
  PINCH_OUT: 'pinch_out',
  ROTATE_CW: 'rotate_cw',
  ROTATE_CCW: 'rotate_ccw',
  LONG_PRESS: 'long_press',
  DOUBLE_TAP: 'double_tap',
  TWO_FINGER_SWIPE: 'two_finger_swipe',
  THREE_FINGER_TAP: 'three_finger_tap'
};

// Default gesture mappings
const defaultGestureMappings = {
  [GESTURE_TYPES.SWIPE_LEFT]: 'navigate_next',
  [GESTURE_TYPES.SWIPE_RIGHT]: 'navigate_back',
  [GESTURE_TYPES.SWIPE_UP]: 'scroll_up',
  [GESTURE_TYPES.SWIPE_DOWN]: 'scroll_down',
  [GESTURE_TYPES.PINCH_IN]: 'zoom_out',
  [GESTURE_TYPES.PINCH_OUT]: 'zoom_in',
  [GESTURE_TYPES.DOUBLE_TAP]: 'quick_view',
  [GESTURE_TYPES.LONG_PRESS]: 'add_to_cart',
  [GESTURE_TYPES.TWO_FINGER_SWIPE]: 'switch_category',
  [GESTURE_TYPES.THREE_FINGER_TAP]: 'open_menu'
};

export const GestureProvider = ({ children }) => {
  const [gestureMappings, setGestureMappings] = useState(() => {
    const stored = localStorage.getItem('gestureMappings');
    return stored ? JSON.parse(stored) : defaultGestureMappings;
  });
  
  const [gesturesEnabled, setGesturesEnabled] = useState(true);
  const [lastGesture, setLastGesture] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGesture, setFeedbackGesture] = useState(null);
  const gestureCallbacks = useRef(new Map());

  // Register gesture callback
  const registerGestureCallback = useCallback((action, callback) => {
    gestureCallbacks.current.set(action, callback);
    return () => gestureCallbacks.current.delete(action);
  }, []);

  // Trigger gesture
  const triggerGesture = useCallback((gestureType) => {
    if (!gesturesEnabled) return;
    
    const action = gestureMappings[gestureType];
    if (action) {
      setLastGesture(gestureType);
      setFeedbackGesture(gestureType);
      setShowFeedback(true);
      
      setTimeout(() => setShowFeedback(false), 600);
      
      const callback = gestureCallbacks.current.get(action);
      if (callback) {
        callback();
      }
    }
  }, [gesturesEnabled, gestureMappings]);

  // Update gesture mapping
  const updateGestureMapping = useCallback((gesture, action) => {
    setGestureMappings(prev => {
      const updated = { ...prev, [gesture]: action };
      localStorage.setItem('gestureMappings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Reset to defaults
  const resetMappings = useCallback(() => {
    setGestureMappings(defaultGestureMappings);
    localStorage.setItem('gestureMappings', JSON.stringify(defaultGestureMappings));
  }, []);

  const value = {
    gestureMappings,
    gesturesEnabled,
    setGesturesEnabled,
    lastGesture,
    triggerGesture,
    registerGestureCallback,
    updateGestureMapping,
    resetMappings,
    GESTURE_TYPES
  };

  return (
    <GestureContext.Provider value={value}>
      {children}
      
      {/* Gesture feedback overlay */}
      <AnimatePresence>
        {showFeedback && feedbackGesture && (
          <GestureFeedback gesture={feedbackGesture} />
        )}
      </AnimatePresence>
    </GestureContext.Provider>
  );
};

// Gesture feedback component
const GestureFeedback = ({ gesture }) => {
  const getGestureIcon = () => {
    switch (gesture) {
      case GESTURE_TYPES.SWIPE_LEFT:
        return <FiArrowLeft className="text-4xl" />;
      case GESTURE_TYPES.SWIPE_RIGHT:
        return <FiArrowRight className="text-4xl" />;
      case GESTURE_TYPES.SWIPE_UP:
        return <FiArrowUp className="text-4xl" />;
      case GESTURE_TYPES.SWIPE_DOWN:
        return <FiArrowDown className="text-4xl" />;
      case GESTURE_TYPES.PINCH_IN:
        return <FiZoomOut className="text-4xl" />;
      case GESTURE_TYPES.PINCH_OUT:
        return <FiZoomIn className="text-4xl" />;
      case GESTURE_TYPES.ROTATE_CW:
      case GESTURE_TYPES.ROTATE_CCW:
        return <FiRotateCw className="text-4xl" />;
      default:
        return <FiCrosshair className="text-4xl" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      <div className="bg-black/70 text-white p-6 rounded-2xl backdrop-blur-sm">
        {getGestureIcon()}
      </div>
    </motion.div>
  );
};

// Touch Gesture Handler Hook
export const useTouchGestures = (ref, options = {}) => {
  const { onGesture, threshold = 50, longPressDelay = 500 } = options;
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const touchStartDistance = useRef(0);
  const touchStartAngle = useRef(0);
  const longPressTimer = useRef(null);
  const lastTapTime = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const getDistance = (touches) => {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getAngle = (touches) => {
      if (touches.length < 2) return 0;
      return Math.atan2(
        touches[1].clientY - touches[0].clientY,
        touches[1].clientX - touches[0].clientX
      ) * (180 / Math.PI);
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      // Multi-touch gestures
      if (e.touches.length === 2) {
        touchStartDistance.current = getDistance(e.touches);
        touchStartAngle.current = getAngle(e.touches);
      }

      // Long press detection
      longPressTimer.current = setTimeout(() => {
        if (onGesture) {
          onGesture(GESTURE_TYPES.LONG_PRESS, { x: touch.clientX, y: touch.clientY });
        }
      }, longPressDelay);

      // Double tap detection
      const timeSinceLastTap = Date.now() - lastTapTime.current;
      if (timeSinceLastTap < 300) {
        if (onGesture) {
          onGesture(GESTURE_TYPES.DOUBLE_TAP, { x: touch.clientX, y: touch.clientY });
        }
      }
    };

    const handleTouchMove = (e) => {
      // Cancel long press if moving
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }

      // Pinch/Rotate detection
      if (e.touches.length === 2 && touchStartDistance.current > 0) {
        const currentDistance = getDistance(e.touches);
        const distanceDiff = currentDistance - touchStartDistance.current;
        
        if (Math.abs(distanceDiff) > threshold / 2) {
          if (onGesture) {
            onGesture(
              distanceDiff > 0 ? GESTURE_TYPES.PINCH_OUT : GESTURE_TYPES.PINCH_IN,
              { scale: currentDistance / touchStartDistance.current }
            );
          }
        }

        const currentAngle = getAngle(e.touches);
        const angleDiff = currentAngle - touchStartAngle.current;
        
        if (Math.abs(angleDiff) > 15) {
          if (onGesture) {
            onGesture(
              angleDiff > 0 ? GESTURE_TYPES.ROTATE_CW : GESTURE_TYPES.ROTATE_CCW,
              { angle: angleDiff }
            );
          }
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }

      lastTapTime.current = Date.now();

      if (e.changedTouches.length === 0) return;
      
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const duration = Date.now() - touchStart.current.time;

      // Quick swipe detection
      if (duration < 300) {
        if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) {
          if (onGesture) {
            onGesture(
              dx > 0 ? GESTURE_TYPES.SWIPE_RIGHT : GESTURE_TYPES.SWIPE_LEFT,
              { distance: Math.abs(dx), velocity: Math.abs(dx) / duration }
            );
          }
        } else if (Math.abs(dy) > threshold && Math.abs(dy) > Math.abs(dx)) {
          if (onGesture) {
            onGesture(
              dy > 0 ? GESTURE_TYPES.SWIPE_DOWN : GESTURE_TYPES.SWIPE_UP,
              { distance: Math.abs(dy), velocity: Math.abs(dy) / duration }
            );
          }
        }
      }

      // Reset multi-touch tracking
      touchStartDistance.current = 0;
      touchStartAngle.current = 0;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [ref, onGesture, threshold, longPressDelay]);
};

// Main Gesture Controller Component
const GestureController = ({ children, onNavigate, onZoom, onAction }) => {
  const containerRef = useRef(null);
  const { triggerGesture, registerGestureCallback } = useGestures();

  // Register callbacks
  useEffect(() => {
    const unsubscribes = [];

    if (onNavigate) {
      unsubscribes.push(
        registerGestureCallback('navigate_next', () => onNavigate('next')),
        registerGestureCallback('navigate_back', () => onNavigate('back'))
      );
    }

    if (onZoom) {
      unsubscribes.push(
        registerGestureCallback('zoom_in', () => onZoom('in')),
        registerGestureCallback('zoom_out', () => onZoom('out'))
      );
    }

    if (onAction) {
      unsubscribes.push(
        registerGestureCallback('quick_view', () => onAction('quick_view')),
        registerGestureCallback('add_to_cart', () => onAction('add_to_cart')),
        registerGestureCallback('open_menu', () => onAction('menu'))
      );
    }

    return () => unsubscribes.forEach(unsub => unsub());
  }, [onNavigate, onZoom, onAction, registerGestureCallback]);

  // Touch gesture handler
  useTouchGestures(containerRef, {
    onGesture: (type, data) => {
      triggerGesture(type);
    },
    threshold: 50
  });

  return (
    <div ref={containerRef} className="gesture-controller">
      {children}
    </div>
  );
};

// Gesture Settings Panel
export const GestureSettings = ({ isOpen, onClose }) => {
  const { gestureMappings, updateGestureMapping, resetMappings, gesturesEnabled, setGesturesEnabled, GESTURE_TYPES } = useGestures();

  const actions = [
    { value: 'navigate_next', label: 'Navigate Next' },
    { value: 'navigate_back', label: 'Navigate Back' },
    { value: 'scroll_up', label: 'Scroll Up' },
    { value: 'scroll_down', label: 'Scroll Down' },
    { value: 'zoom_in', label: 'Zoom In' },
    { value: 'zoom_out', label: 'Zoom Out' },
    { value: 'quick_view', label: 'Quick View' },
    { value: 'add_to_cart', label: 'Add to Cart' },
    { value: 'add_to_wishlist', label: 'Add to Wishlist' },
    { value: 'open_menu', label: 'Open Menu' },
    { value: 'switch_category', label: 'Switch Category' },
    { value: 'none', label: 'Disabled' }
  ];

  const gestureLabels = {
    [GESTURE_TYPES.SWIPE_LEFT]: 'Swipe Left',
    [GESTURE_TYPES.SWIPE_RIGHT]: 'Swipe Right',
    [GESTURE_TYPES.SWIPE_UP]: 'Swipe Up',
    [GESTURE_TYPES.SWIPE_DOWN]: 'Swipe Down',
    [GESTURE_TYPES.PINCH_IN]: 'Pinch In',
    [GESTURE_TYPES.PINCH_OUT]: 'Pinch Out',
    [GESTURE_TYPES.DOUBLE_TAP]: 'Double Tap',
    [GESTURE_TYPES.LONG_PRESS]: 'Long Press',
    [GESTURE_TYPES.TWO_FINGER_SWIPE]: 'Two-Finger Swipe',
    [GESTURE_TYPES.THREE_FINGER_TAP]: 'Three-Finger Tap'
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FiCrosshair className="text-xl text-primary-600" />
            <h2 className="text-xl font-bold dark:text-white">Gesture Controls</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <FiX className="text-xl text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
          {/* Enable/Disable Toggle */}
          <label className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <span className="font-medium dark:text-white">Enable Gestures</span>
            <input
              type="checkbox"
              checked={gesturesEnabled}
              onChange={(e) => setGesturesEnabled(e.target.checked)}
              className="w-5 h-5 accent-primary-600"
            />
          </label>

          {/* Gesture mappings */}
          <div className="space-y-3">
            {Object.entries(GESTURE_TYPES).map(([key, type]) => (
              <div key={type} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
                <span className="font-medium dark:text-white">{gestureLabels[type]}</span>
                <select
                  value={gestureMappings[type] || 'none'}
                  onChange={(e) => updateGestureMapping(type, e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                  disabled={!gesturesEnabled}
                >
                  {actions.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={resetMappings}
            className="w-full py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export { GestureController, GESTURE_TYPES };
export default GestureController;
