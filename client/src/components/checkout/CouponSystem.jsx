import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTag, FiPercent, FiCopy, FiCheck, FiX, FiGift, 
  FiClock, FiAlertCircle, FiChevronDown, FiShoppingBag
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Coupon Input Component for Checkout
export const CouponInput = ({ 
  cartTotal = 0, 
  onApply, 
  appliedCoupon = null,
  onRemove,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAvailable, setShowAvailable] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await api.get('/coupons/available');
        setAvailableCoupons(data.coupons || []);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };
    fetchCoupons();
  }, []);

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/coupons/validate', {
        code: code.toUpperCase(),
        cartTotal,
      });

      if (data.valid) {
        onApply?.({
          code: data.coupon.code,
          discount: data.discount,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
        });
        toast.success(`Coupon applied! You save Rs. ${data.discount.toLocaleString()}`);
        setCode('');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid coupon code';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoupon = (coupon) => {
    setCode(coupon.code);
    setShowAvailable(false);
  };

  return (
    <div className="space-y-4">
      {/* Applied Coupon */}
      {appliedCoupon ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <FiTag className="text-green-400" />
            </div>
            <div>
              <p className="font-bold text-green-400">{appliedCoupon.code}</p>
              <p className="text-sm text-gray-400">
                Saving Rs. {appliedCoupon.discount.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <FiX className="text-gray-400 hover:text-red-400" />
          </button>
        </motion.div>
      ) : (
        <>
          {/* Coupon Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter coupon code"
                className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:ring-1 outline-none uppercase ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-cyan-500 focus:ring-cyan-500'
                }`}
              />
            </div>
            <button
              onClick={handleApply}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Apply'
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1">
              <FiAlertCircle />
              {error}
            </p>
          )}

          {/* Available Coupons Toggle */}
          {availableCoupons.length > 0 && (
            <button
              onClick={() => setShowAvailable(!showAvailable)}
              className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <FiGift />
              View {availableCoupons.length} available coupon{availableCoupons.length > 1 ? 's' : ''}
              <FiChevronDown className={`transition-transform ${showAvailable ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Available Coupons List */}
          <AnimatePresence>
            {showAvailable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {availableCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon._id || coupon.code}
                    coupon={coupon}
                    onSelect={() => handleSelectCoupon(coupon)}
                    cartTotal={cartTotal}
                    compact
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

// Coupon Card Component
export const CouponCard = ({ 
  coupon, 
  onSelect, 
  onCopy,
  cartTotal = 0, 
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);

  const isEligible = !coupon.minPurchase || cartTotal >= coupon.minPurchase;
  const daysLeft = coupon.expiresAt 
    ? Math.ceil((new Date(coupon.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success('Coupon code copied!');
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const discountText = coupon.discountType === 'percentage'
    ? `${coupon.discountValue}% OFF`
    : `Rs. ${coupon.discountValue.toLocaleString()} OFF`;

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => isEligible && onSelect?.()}
        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
          isEligible
            ? 'bg-white/5 border-white/10 hover:border-cyan-500/50'
            : 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            coupon.discountType === 'percentage'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-cyan-500/20 text-cyan-400'
          }`}>
            {coupon.discountType === 'percentage' ? <FiPercent /> : <FiTag />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{coupon.code}</span>
              <span className="text-sm text-green-400">{discountText}</span>
            </div>
            {coupon.minPurchase && (
              <p className="text-xs text-gray-400">
                Min. purchase Rs. {coupon.minPurchase.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        {isEligible ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg transition-colors"
          >
            Apply
          </button>
        ) : (
          <span className="text-xs text-gray-500">Not eligible</span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10"
    >
      {/* Decorative Elements */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-950 rounded-full" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-950 rounded-full" />
      <div className="absolute top-0 left-6 right-6 border-t border-dashed border-white/10" style={{ top: '50%' }} />

      {/* Top Section */}
      <div className="p-5 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3 ${
              coupon.discountType === 'percentage'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {coupon.discountType === 'percentage' ? <FiPercent /> : <FiTag />}
              {discountText}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{coupon.description || 'Special Discount'}</h3>
            {coupon.minPurchase && (
              <p className="text-sm text-gray-400">
                On orders above Rs. {coupon.minPurchase.toLocaleString()}
              </p>
            )}
          </div>
          {daysLeft !== null && daysLeft <= 7 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs">
              <FiClock />
              {daysLeft <= 0 ? 'Expires today' : `${daysLeft} days left`}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-5 pt-6 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-mono font-bold text-white bg-white/10 px-4 py-2 rounded-xl">
            {coupon.code}
          </span>
          <button
            onClick={handleCopy}
            className={`p-2 rounded-xl transition-colors ${
              copied ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {copied ? <FiCheck /> : <FiCopy />}
          </button>
        </div>
        <button
          onClick={() => onSelect?.()}
          disabled={!isEligible}
          className={`px-5 py-2 rounded-xl font-medium transition-all ${
            isEligible
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isEligible ? 'Use Coupon' : 'Not Eligible'}
        </button>
      </div>

      {/* Max Discount Badge */}
      {coupon.maxDiscount && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs">
          Max Rs. {coupon.maxDiscount.toLocaleString()} off
        </div>
      )}
    </motion.div>
  );
};

// Coupons Page/Section Component
export const CouponsSection = ({ onSelectCoupon }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'percentage' | 'fixed'

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await api.get('/coupons/public');
        setCoupons(data.coupons || []);
      } catch (error) {
        console.error('Error fetching coupons:', error);
        // Demo coupons for display
        setCoupons([
          {
            _id: '1',
            code: 'WELCOME20',
            discountType: 'percentage',
            discountValue: 20,
            description: 'Welcome Offer - 20% Off',
            minPurchase: 2000,
            maxDiscount: 1000,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            _id: '2',
            code: 'FLAT500',
            discountType: 'fixed',
            discountValue: 500,
            description: 'Flat Rs. 500 Off',
            minPurchase: 3000,
          },
          {
            _id: '3',
            code: 'MEGA30',
            discountType: 'percentage',
            discountValue: 30,
            description: 'Mega Sale - 30% Off',
            minPurchase: 5000,
            maxDiscount: 2000,
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const filteredCoupons = coupons.filter(coupon => {
    if (filter === 'all') return true;
    return coupon.discountType === filter;
  });

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiGift className="text-cyan-400" />
          Available Coupons
        </h2>
        <div className="flex gap-2">
          {['all', 'percentage', 'fixed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'percentage' ? '% Off' : 'Flat'}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredCoupons.map((coupon) => (
          <CouponCard
            key={coupon._id}
            coupon={coupon}
            onSelect={() => onSelectCoupon?.(coupon)}
          />
        ))}
      </div>

      {filteredCoupons.length === 0 && (
        <div className="text-center py-12 bg-white/5 rounded-2xl">
          <FiTag className="text-5xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Coupons Available</h3>
          <p className="text-gray-400">Check back later for exciting offers!</p>
        </div>
      )}
    </div>
  );
};

export default CouponInput;
