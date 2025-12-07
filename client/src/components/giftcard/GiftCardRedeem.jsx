import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  CreditCard,
  Check,
  X,
  AlertCircle,
  Wallet,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const GiftCardRedeem = ({ onSuccess, onClose }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardDetails, setCardDetails] = useState(null);
  const [isRedeemed, setIsRedeemed] = useState(false);

  const handleCheckBalance = async () => {
    if (!code.trim()) {
      setError('Please enter a gift card code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`/api/v1/giftcards/balance/${code}`);
      setCardDetails(response.data.giftCard);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid gift card code');
      setCardDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/v1/giftcards/redeem', { code });
      setIsRedeemed(true);
      
      if (onSuccess) {
        onSuccess(response.data.balance);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to redeem gift card');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCode = (value) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Add dashes every 4 characters
    const formatted = cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
    return formatted.slice(0, 19); // XXXX-XXXX-XXXX-XXXX
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Redeem Gift Card</h2>
              <p className="text-white/80 text-sm">Add balance to your account</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {isRedeemed ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-10 h-10 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Gift Card Redeemed!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  ${cardDetails?.balance?.toFixed(2)} has been added to your wallet.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Done
                </button>
              </motion.div>
            ) : cardDetails ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Gift Card Preview */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-6">
                  <div className="flex justify-between items-start mb-8">
                    <Sparkles className="w-8 h-8" />
                    <span className="text-3xl font-bold">
                      ${cardDetails.balance?.toFixed(2)}
                    </span>
                  </div>
                  <p className="font-mono text-lg tracking-wider opacity-90">
                    {code}
                  </p>
                  <div className="flex justify-between items-center mt-4 text-sm opacity-75">
                    <span>Original: ${cardDetails.originalAmount?.toFixed(2)}</span>
                    <span>
                      Expires: {cardDetails.expiresAt 
                        ? new Date(cardDetails.expiresAt).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>
                </div>

                {cardDetails.balance > 0 ? (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Available Balance
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ${cardDetails.balance?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setCardDetails(null);
                          setCode('');
                        }}
                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRedeem}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Redeem Now
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      This gift card has no remaining balance.
                    </p>
                    <button
                      onClick={() => {
                        setCardDetails(null);
                        setCode('');
                      }}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Try Another Code
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter Gift Card Code
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(formatCode(e.target.value))}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="w-full pl-12 pr-4 py-4 text-lg font-mono tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                      maxLength={19}
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </motion.p>
                  )}
                </div>

                <button
                  onClick={handleCheckBalance}
                  disabled={isLoading || code.length < 19}
                  className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Check Balance
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Find the code on your gift card or email
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default GiftCardRedeem;
