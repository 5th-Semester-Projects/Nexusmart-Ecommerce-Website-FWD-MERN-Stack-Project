import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { ethers } from 'ethers';
import useWeb3 from '../../hooks/useWeb3';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const CryptoPayment = ({ amount, onSuccess, onCancel }) => {
  const { account, isConnected, connectWallet, sendTransaction, chainId } = useWeb3();
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed
  const [cryptoAmount, setCryptoAmount] = useState('0');
  const [exchangeRate, setExchangeRate] = useState(2000); // Mock: 1 ETH = $2000
  const [selectedCrypto, setSelectedCrypto] = useState('ETH');

  // Merchant wallet address (in production, this should come from backend)
  const MERCHANT_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  const cryptoOptions = [
    { symbol: 'ETH', name: 'Ethereum', rate: 2000, color: 'from-blue-500 to-purple-500' },
    { symbol: 'MATIC', name: 'Polygon', rate: 0.8, color: 'from-purple-500 to-pink-500' },
    { symbol: 'USDC', name: 'USD Coin', rate: 1, color: 'from-blue-400 to-blue-600' },
  ];

  const selectedCryptoData = cryptoOptions.find((c) => c.symbol === selectedCrypto);

  // Calculate crypto amount based on USD
  useEffect(() => {
    if (selectedCryptoData) {
      const calculated = (amount / selectedCryptoData.rate).toFixed(6);
      setCryptoAmount(calculated);
    }
  }, [amount, selectedCrypto, selectedCryptoData]);

  const handlePayment = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      await connectWallet();
      return;
    }

    // Check if on correct network for selected crypto
    if (selectedCrypto === 'MATIC' && chainId !== 137 && chainId !== 80001) {
      toast.error('Please switch to Polygon network for MATIC payments');
      return;
    }

    setPaymentStatus('processing');

    try {
      // Send transaction
      const receipt = await sendTransaction(MERCHANT_WALLET, cryptoAmount);

      if (receipt) {
        setPaymentStatus('success');
        toast.success('Payment successful!');
        
        // Call success callback with transaction details
        if (onSuccess) {
          onSuccess({
            transactionHash: receipt.hash,
            amount: cryptoAmount,
            currency: selectedCrypto,
            usdAmount: amount,
          });
        }
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast.error('Payment failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white">
          Select Cryptocurrency
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cryptoOptions.map((crypto) => (
            <motion.button
              key={crypto.symbol}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCrypto(crypto.symbol)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedCrypto === crypto.symbol
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${crypto.color} mx-auto mb-2 flex items-center justify-center`}>
                <span className="text-white font-bold">{crypto.symbol[0]}</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{crypto.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{crypto.symbol}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Order Total (USD)</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">${amount.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-center my-4">
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
          <FiDollarSign className="mx-3 text-gray-400" />
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">You Pay</span>
          <div className="text-right">
            <p className="text-2xl font-bold gradient-text">{cryptoAmount} {selectedCrypto}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rate: 1 {selectedCrypto} ≈ ${selectedCryptoData?.rate}
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Connection Status */}
      {!isConnected && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Wallet Not Connected</p>
              <p>Please connect your Web3 wallet to proceed with crypto payment.</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details */}
      {isConnected && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">From:</span>
            <span className="font-mono text-gray-900 dark:text-white">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">To:</span>
            <span className="font-mono text-gray-900 dark:text-white">
              {MERCHANT_WALLET.slice(0, 6)}...{MERCHANT_WALLET.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Network:</span>
            <span className="text-gray-900 dark:text-white">
              {chainId === 1 ? 'Ethereum' : chainId === 137 ? 'Polygon' : `Chain ${chainId}`}
            </span>
          </div>
        </div>
      )}

      {/* Payment Status */}
      {paymentStatus === 'processing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center"
        >
          <FiLoader className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3 animate-spin" />
          <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Processing Payment...</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">Please confirm the transaction in your wallet</p>
        </motion.div>
      )}

      {paymentStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-center"
        >
          <FiCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
          <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Payment Successful!</p>
          <p className="text-sm text-green-700 dark:text-green-300">Your order has been confirmed</p>
        </motion.div>
      )}

      {paymentStatus === 'failed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-center"
        >
          <FiAlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Payment Failed</p>
          <p className="text-sm text-red-700 dark:text-red-300">Please try again or use a different payment method</p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          fullWidth
          onClick={onCancel}
          disabled={paymentStatus === 'processing'}
        >
          Cancel
        </Button>
        {!isConnected ? (
          <Button
            variant="primary"
            fullWidth
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        ) : (
          <Button
            variant="primary"
            fullWidth
            onClick={handlePayment}
            disabled={paymentStatus === 'processing' || paymentStatus === 'success'}
            loading={paymentStatus === 'processing'}
          >
            {paymentStatus === 'success' ? 'Paid' : `Pay ${cryptoAmount} ${selectedCrypto}`}
          </Button>
        )}
      </div>

      {/* Security Notice */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          🔒 Secure payment powered by blockchain technology. Your transaction is encrypted and verified on-chain.
        </p>
      </div>
    </div>
  );
};

export default CryptoPayment;
