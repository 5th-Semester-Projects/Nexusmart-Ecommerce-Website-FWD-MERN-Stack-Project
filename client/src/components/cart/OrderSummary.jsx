import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTag, FiX, FiCheck } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { applyCoupon, removeCoupon } from '../../redux/slices/cartSlice';
import Button from '../common/Button';
import Input from '../common/Input';
import toast from 'react-hot-toast';

const OrderSummary = ({ onCheckout, isCheckoutPage = false }) => {
  const dispatch = useDispatch();
  const { items, coupon, loading } = useSelector((state) => state.cart);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  
  const shippingFee = subtotal > 100 ? 0 : 10; // Free shipping over $100
  
  const discount = coupon?.discount || 0;
  const discountAmount = coupon?.type === 'percentage' 
    ? (subtotal * discount) / 100 
    : discount;
  
  const total = subtotal + tax + shippingFee - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    try {
      await dispatch(applyCoupon(couponCode)).unwrap();
      toast.success('Coupon applied successfully! 🎉');
      setCouponCode('');
    } catch (error) {
      toast.error(error.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.success('Coupon removed');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-6 space-y-6 ${isCheckoutPage ? '' : 'lg:sticky lg:top-24'}`}
    >
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Summary</h2>

      {/* Coupon Code Section */}
      {!coupon ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Have a coupon code?
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
            />
            <Button
              variant="outline"
              icon={FiTag}
              onClick={handleApplyCoupon}
              loading={applyingCoupon}
              disabled={!couponCode.trim()}
            >
              Apply
            </Button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  {coupon.code}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `$${coupon.discount} OFF`}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 border-t border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Tax (8%)</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span>Shipping</span>
            {shippingFee === 0 && (
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                FREE
              </span>
            )}
          </div>
          <span className="font-medium">
            {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
          </span>
        </div>

        {subtotal < 100 && subtotal > 0 && (
          <div className="text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 p-2 rounded-lg">
            💡 Add ${(100 - subtotal).toFixed(2)} more for free shipping!
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span className="font-medium">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-xl font-semibold text-gray-900 dark:text-white">Total</span>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            ${total.toFixed(2)}
          </div>
          {discountAmount > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
              ${(total + discountAmount).toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Button */}
      {!isCheckoutPage && (
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={onCheckout}
          disabled={items.length === 0 || loading}
          loading={loading}
        >
          Proceed to Checkout
        </Button>
      )}

      {/* Payment Methods */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
          We accept
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          {['Visa', 'Mastercard', 'PayPal', 'Stripe'].map((method) => (
            <div
              key={method}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              {method}
            </div>
          ))}
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Secure checkout powered by Stripe</span>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
