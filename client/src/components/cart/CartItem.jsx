import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { updateItemQuantity, removeItemFromCart } from '../../redux/slices/cartSlice';
import Button from '../common/Button';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > item.stock) return;
    
    setIsUpdating(true);
    try {
      await dispatch(updateItemQuantity({ productId: item.product, quantity: newQuantity })).unwrap();
    } catch (error) {
      toast.error(error.message || 'Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = () => {
    dispatch(removeItemFromCart(item.product));
    toast.success('Item removed from cart');
    setShowRemoveModal(false);
  };

  const incrementQuantity = () => {
    if (item.quantity < item.stock) {
      handleQuantityChange(item.quantity + 1);
    } else {
      toast.error('Maximum available quantity reached');
    }
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      handleQuantityChange(item.quantity - 1);
    }
  };

  const subtotal = item.price * item.quantity;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className="card p-4 flex flex-col sm:flex-row gap-4"
      >
        {/* Product Image */}
        <Link to={`/products/${item.product}`} className="flex-shrink-0">
          <div className="w-full sm:w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={item.image || '/placeholder-product.jpg'}
              alt={item.name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-grow space-y-2">
          {/* Product Name & Remove Button */}
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/products/${item.product}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
            >
              {item.name}
            </Link>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowRemoveModal(true)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
              aria-label="Remove item"
            >
              <FiTrash2 className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Variants */}
          {item.variants && Object.keys(item.variants).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(item.variants).map(([type, value]) => (
                <span
                  key={type}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full"
                >
                  {type}: {value}
                </span>
              ))}
            </div>
          )}

          {/* Stock Status */}
          {item.stock < 10 && (
            <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              {item.stock === 0 ? '❌ Out of Stock' : `⚠️ Only ${item.stock} left in stock`}
            </p>
          )}

          {/* Price & Quantity Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Qty:</span>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={decrementQuantity}
                  disabled={item.quantity <= 1 || isUpdating}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiMinus className="w-4 h-4" />
                </motion.button>
                
                <span className="px-4 py-2 min-w-[3rem] text-center font-semibold text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-600">
                  {isUpdating ? '...' : item.quantity}
                </span>
                
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={incrementQuantity}
                  disabled={item.quantity >= item.stock || isUpdating}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Price Info */}
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ${subtotal.toFixed(2)}
              </div>
              {item.quantity > 1 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ${item.price.toFixed(2)} each
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Item"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to remove <strong>{item.name}</strong> from your cart?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowRemoveModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleRemove}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CartItem;
