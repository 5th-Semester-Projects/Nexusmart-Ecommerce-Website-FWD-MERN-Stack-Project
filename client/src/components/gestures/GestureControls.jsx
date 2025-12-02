import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  FaHeart, FaTrash, FaShoppingCart, FaShare, 
  FaArrowLeft, FaArrowRight, FaInfoCircle 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const GestureControls = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp,
  onSwipeDown,
  onDoubleTap,
  onLongPress,
  leftAction = 'wishlist',
  rightAction = 'cart',
  showHints = true
}) => {
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showActionHint, setShowActionHint] = useState(null);
  const lastTap = useRef(0);
  const longPressTimer = useRef(null);

  // Transform x position to opacity for action indicators
  const leftOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  const rotate = useTransform(x, [-150, 0, 150], [-5, 0, 5]);

  const actionConfig = {
    wishlist: { icon: FaHeart, color: 'text-pink-500', bg: 'bg-pink-500/20', label: 'Add to Wishlist' },
    cart: { icon: FaShoppingCart, color: 'text-green-500', bg: 'bg-green-500/20', label: 'Add to Cart' },
    delete: { icon: FaTrash, color: 'text-red-500', bg: 'bg-red-500/20', label: 'Remove' },
    share: { icon: FaShare, color: 'text-blue-500', bg: 'bg-blue-500/20', label: 'Share' }
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    setShowActionHint(null);

    const threshold = 100;
    const velocity = 500;

    if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      // Swipe Left
      if (onSwipeLeft) {
        onSwipeLeft();
      } else {
        handleAction(leftAction);
      }
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    } else if (info.offset.x > threshold || info.velocity.x > velocity) {
      // Swipe Right
      if (onSwipeRight) {
        onSwipeRight();
      } else {
        handleAction(rightAction);
      }
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    } else if (info.offset.y < -threshold || info.velocity.y < -velocity) {
      // Swipe Up
      onSwipeUp?.();
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
    } else if (info.offset.y > threshold || info.velocity.y > velocity) {
      // Swipe Down
      onSwipeDown?.();
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
    } else {
      // Reset position
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
      animate(y, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  };

  const handleAction = (action) => {
    const config = actionConfig[action];
    if (config) {
      toast.success(config.label, {
        icon: <config.icon className={config.color} />
      });
    }
  };

  const handleDrag = (event, info) => {
    setIsDragging(true);
    if (info.offset.x < -50) {
      setShowActionHint('left');
    } else if (info.offset.x > 50) {
      setShowActionHint('right');
    } else {
      setShowActionHint(null);
    }
  };

  const handleTap = (event) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap
      onDoubleTap?.();
      toast.success('Added to favorites!', { icon: '❤️' });
    }
    lastTap.current = now;
  };

  const handleTapStart = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress?.();
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTapEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const LeftAction = actionConfig[leftAction];
  const RightAction = actionConfig[rightAction];

  return (
    <div ref={constraintsRef} className="relative overflow-hidden">
      {/* Action Indicators */}
      <motion.div
        style={{ opacity: leftOpacity }}
        className={`absolute inset-y-0 left-0 w-20 ${LeftAction.bg} flex items-center justify-center z-0`}
      >
        <LeftAction.icon className={`text-3xl ${LeftAction.color}`} />
      </motion.div>
      
      <motion.div
        style={{ opacity: rightOpacity }}
        className={`absolute inset-y-0 right-0 w-20 ${RightAction.bg} flex items-center justify-center z-0`}
      >
        <RightAction.icon className={`text-3xl ${RightAction.color}`} />
      </motion.div>

      {/* Draggable Content */}
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        onTapStart={handleTapStart}
        onTapCancel={handleTapEnd}
        style={{ x, scale, rotate }}
        className="relative z-10 bg-gray-900 cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>

      {/* Gesture Hints */}
      {showHints && !isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-gray-500"
        >
          <div className="flex items-center gap-1">
            <FaArrowLeft /> {LeftAction.label}
          </div>
          <div className="flex items-center gap-1">
            {RightAction.label} <FaArrowRight />
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Swipeable Product Card
export const SwipeableProductCard = ({ product, onAddToCart, onAddToWishlist, onRemove }) => {
  return (
    <GestureControls
      leftAction="wishlist"
      rightAction="cart"
      onSwipeLeft={() => onAddToWishlist?.(product)}
      onSwipeRight={() => onAddToCart?.(product)}
      onDoubleTap={() => onAddToWishlist?.(product)}
    >
      <div className="p-4 flex gap-4 items-center">
        <div className="w-20 h-20 bg-gray-800 rounded-lg flex-shrink-0"></div>
        <div className="flex-1">
          <h3 className="text-white font-semibold">{product?.name || 'Product Name'}</h3>
          <p className="text-purple-400 font-bold">Rs. {product?.price?.toLocaleString() || '2,999'}</p>
        </div>
      </div>
    </GestureControls>
  );
};

// Pull to Refresh
export const PullToRefresh = ({ children, onRefresh }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const pullOpacity = useTransform(y, [0, 50, 100], [0, 0.5, 1]);
  const pullScale = useTransform(y, [0, 50, 100], [0.5, 0.8, 1]);

  const handleDragEnd = async (event, info) => {
    if (info.offset.y > 100) {
      setIsRefreshing(true);
      await onRefresh?.();
      setIsRefreshing(false);
    }
    animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
    setIsPulling(false);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Pull indicator */}
      <motion.div
        style={{ opacity: pullOpacity, scale: pullScale }}
        className="absolute top-0 left-1/2 -translate-x-1/2 py-4"
      >
        <div className={`w-8 h-8 border-2 border-purple-500 rounded-full ${isRefreshing ? 'animate-spin' : ''}`}>
          {!isRefreshing && <div className="w-full h-full flex items-center justify-center text-purple-500">↓</div>}
        </div>
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDragStart={() => setIsPulling(true)}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default GestureControls;
