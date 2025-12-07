import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CurrencyDollarIcon,
  QrCodeIcon,
  WalletIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Cryptocurrency Payment Component
export const CryptoPayment = ({ amount, onComplete, isOpen, onClose }) => {
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, completed, failed
  const [cryptoAmount, setCryptoAmount] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  const cryptos = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿', rate: 43500, color: 'from-orange-500 to-yellow-500' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', rate: 2300, color: 'from-purple-500 to-blue-500' },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: '₮', rate: 1, color: 'from-green-500 to-emerald-500' },
    { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '◎', rate: 98, color: 'from-purple-400 to-pink-500' },
  ];

  useEffect(() => {
    if (isOpen) {
      const crypto = cryptos.find(c => c.id === selectedCrypto);
      setCryptoAmount((amount / crypto.rate).toFixed(8));
      setWalletAddress(`${crypto.id}1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0p`);
    }
  }, [isOpen, selectedCrypto, amount]);

  useEffect(() => {
    if (paymentStatus === 'pending' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentStatus, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Address copied!');
  };

  const confirmPayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('completed');
      onComplete?.();
    }, 3000);
  };

  if (!isOpen) return null;

  const selectedCryptoData = cryptos.find(c => c.id === selectedCrypto);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-800"
      >
        <div className="p-6">
          {paymentStatus === 'pending' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Pay with Crypto</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full">
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Crypto Selection */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {cryptos.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => setSelectedCrypto(crypto.id)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedCrypto === crypto.id
                        ? `bg-gradient-to-r ${crypto.color} text-white`
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{crypto.icon}</span>
                    <span className="text-xs">{crypto.symbol}</span>
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Amount to pay</span>
                  <span className="text-gray-400">${amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{cryptoAmount}</span>
                  <span className="text-xl text-gray-300">{selectedCryptoData.symbol}</span>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <p className="text-gray-400 text-sm mb-2">Send to this address:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-white text-sm break-all font-mono bg-gray-900 p-2 rounded">
                    {walletAddress}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ClipboardDocumentIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-white rounded-xl p-4 mb-6 flex items-center justify-center">
                <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCodeIcon className="w-20 h-20 text-gray-400" />
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm">Payment expires in</p>
                <p className="text-2xl font-bold text-orange-400">{formatTime(timeLeft)}</p>
              </div>

              <button
                onClick={confirmPayment}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                I've Sent the Payment
              </button>
            </>
          )}

          {paymentStatus === 'processing' && (
            <div className="py-12 text-center">
              <ArrowPathIcon className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-6" />
              <h4 className="text-xl font-bold text-white mb-2">Confirming Payment...</h4>
              <p className="text-gray-400">Please wait while we verify your transaction</p>
            </div>
          )}

          {paymentStatus === 'completed' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Payment Confirmed!</h4>
              <p className="text-gray-400 mb-6">Your crypto payment has been verified</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// QR Code Payment Component
export const QRCodePayment = ({ amount, onComplete, isOpen, onClose }) => {
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const simulatePayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('completed');
      onComplete?.();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-gray-800"
      >
        <div className="p-6">
          {paymentStatus === 'pending' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Scan to Pay</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full">
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 mb-6">
                <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCodeIcon className="w-24 h-24 text-gray-400" />
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm">Amount</p>
                <p className="text-3xl font-bold text-white">${amount}</p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {['GPay', 'Apple Pay', 'PayPal', 'Venmo'].map((app) => (
                  <span key={app} className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-sm">
                    {app}
                  </span>
                ))}
              </div>

              <button
                onClick={simulatePayment}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium"
              >
                Simulate Scan
              </button>
            </>
          )}

          {paymentStatus === 'processing' && (
            <div className="py-12 text-center">
              <ArrowPathIcon className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
              <h4 className="text-xl font-bold text-white mb-2">Processing...</h4>
            </div>
          )}

          {paymentStatus === 'completed' && (
            <div className="py-12 text-center">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h4 className="text-xl font-bold text-white mb-2">Payment Successful!</h4>
              <button onClick={onClose} className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg">
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Split Payment Component
export const SplitPayment = ({ totalAmount, onComplete, isOpen, onClose }) => {
  const [participants, setParticipants] = useState([
    { id: 1, name: 'You', email: '', amount: 0, status: 'pending', isHost: true },
  ]);
  const [newParticipant, setNewParticipant] = useState('');

  const splitEqually = () => {
    const perPerson = totalAmount / participants.length;
    setParticipants(participants.map(p => ({ ...p, amount: perPerson.toFixed(2) })));
  };

  const addParticipant = () => {
    if (!newParticipant.trim()) return;
    setParticipants([
      ...participants,
      { id: Date.now(), name: newParticipant.trim(), email: '', amount: 0, status: 'pending', isHost: false }
    ]);
    setNewParticipant('');
  };

  const removeParticipant = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const sendRequests = () => {
    toast.success('Payment requests sent to all participants!');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-800"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Split Payment</h3>
                <p className="text-gray-400 text-sm">Total: ${totalAmount}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Add Participant */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              placeholder="Add friend's name or email"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
            />
            <button
              onClick={addParticipant}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Add
            </button>
          </div>

          <button
            onClick={splitEqually}
            className="w-full py-2 mb-4 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Split Equally
          </button>

          {/* Participants List */}
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                  {p.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium flex items-center gap-2">
                    {p.name}
                    {p.isHost && (
                      <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                        You
                      </span>
                    )}
                  </p>
                  <p className={`text-sm ${p.status === 'paid' ? 'text-green-400' : 'text-gray-500'}`}>
                    {p.status === 'paid' ? 'Paid' : 'Pending'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">${p.amount || '0.00'}</span>
                  {!p.isHost && (
                    <button
                      onClick={() => removeParticipant(p.id)}
                      className="p-1 text-gray-500 hover:text-red-400"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={sendRequests}
            disabled={participants.length < 2}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            Send Payment Requests
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Wallet Transfer Component
export const WalletTransfer = ({ onComplete, isOpen, onClose }) => {
  const [balance] = useState(250.00);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState(1);

  const handleTransfer = () => {
    if (!recipient || !amount) {
      toast.error('Please fill in all fields');
      return;
    }
    if (parseFloat(amount) > balance) {
      toast.error('Insufficient balance');
      return;
    }
    setStep(2);
    setTimeout(() => {
      setStep(3);
      onComplete?.();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-800"
      >
        <div className="p-6">
          {step === 1 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <WalletIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Wallet Transfer</h3>
                    <p className="text-gray-400 text-sm">Balance: ${balance.toFixed(2)}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full">
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Recipient</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Email or phone number"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white focus:border-green-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Note (Optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What's this for?"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleTransfer}
                className="w-full mt-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all"
              >
                Send Money
              </button>
            </>
          )}

          {step === 2 && (
            <div className="py-12 text-center">
              <ArrowPathIcon className="w-16 h-16 text-green-500 animate-spin mx-auto mb-6" />
              <h4 className="text-xl font-bold text-white mb-2">Sending...</h4>
              <p className="text-gray-400">Transferring ${amount} to {recipient}</p>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Transfer Complete!</h4>
              <p className="text-gray-400 mb-6">${amount} sent to {recipient}</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Payment Options Hub
export const PaymentOptionsHub = ({ amount = 199.99 }) => {
  const [activePayment, setActivePayment] = useState(null);

  const paymentOptions = [
    {
      id: 'crypto',
      title: 'Cryptocurrency',
      description: 'Pay with Bitcoin, Ethereum & more',
      icon: CurrencyDollarIcon,
      color: 'from-orange-500 to-yellow-500',
      badge: 'Web3'
    },
    {
      id: 'qr',
      title: 'QR Code Payment',
      description: 'Scan and pay instantly',
      icon: QrCodeIcon,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'split',
      title: 'Split with Friends',
      description: 'Share the cost with others',
      icon: UserGroupIcon,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'wallet',
      title: 'Wallet Transfer',
      description: 'Use your NexusMart balance',
      icon: WalletIcon,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <>
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6">Payment Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentOptions.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePayment(option.id)}
              className="p-4 bg-gray-800/50 rounded-xl text-left hover:bg-gray-800 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center flex-shrink-0`}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                      {option.title}
                    </h4>
                    {option.badge && (
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{option.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Payment Modals */}
      <AnimatePresence>
        {activePayment === 'crypto' && (
          <CryptoPayment
            amount={amount}
            isOpen={true}
            onClose={() => setActivePayment(null)}
            onComplete={() => toast.success('Crypto payment successful!')}
          />
        )}
        {activePayment === 'qr' && (
          <QRCodePayment
            amount={amount}
            isOpen={true}
            onClose={() => setActivePayment(null)}
            onComplete={() => toast.success('QR payment successful!')}
          />
        )}
        {activePayment === 'split' && (
          <SplitPayment
            totalAmount={amount}
            isOpen={true}
            onClose={() => setActivePayment(null)}
            onComplete={() => toast.success('Split payment initiated!')}
          />
        )}
        {activePayment === 'wallet' && (
          <WalletTransfer
            isOpen={true}
            onClose={() => setActivePayment(null)}
            onComplete={() => toast.success('Transfer successful!')}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default {
  CryptoPayment,
  QRCodePayment,
  SplitPayment,
  WalletTransfer,
  PaymentOptionsHub
};
