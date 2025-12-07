import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiGift, 
  FiPlus, 
  FiMinus,
  FiShoppingBag,
  FiMail,
  FiCalendar,
  FiCopy,
  FiCheck,
  FiX,
  FiCreditCard,
  FiUser
} from 'react-icons/fi';

/**
 * Gift Card Manager Component
 * Purchase and manage gift cards
 */
const GiftCardManager = () => {
  const [activeTab, setActiveTab] = useState('purchase');
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [myGiftCards, setMyGiftCards] = useState([]);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemResult, setRedeemResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  
  const presetAmounts = [25, 50, 100, 150, 200, 500];
  
  const cardDesigns = [
    { id: 'birthday', name: 'Birthday', gradient: 'from-pink-500 to-purple-600', emoji: '🎂' },
    { id: 'christmas', name: 'Christmas', gradient: 'from-red-500 to-green-600', emoji: '🎄' },
    { id: 'love', name: 'Love', gradient: 'from-red-400 to-pink-500', emoji: '❤️' },
    { id: 'thankyou', name: 'Thank You', gradient: 'from-yellow-400 to-orange-500', emoji: '🙏' },
    { id: 'congrats', name: 'Congrats', gradient: 'from-blue-500 to-purple-600', emoji: '🎉' },
    { id: 'default', name: 'Classic', gradient: 'from-purple-600 to-indigo-600', emoji: '🎁' },
  ];
  const [selectedDesign, setSelectedDesign] = useState(cardDesigns[5]);
  
  useEffect(() => {
    fetchMyGiftCards();
  }, []);
  
  const fetchMyGiftCards = async () => {
    try {
      const response = await fetch('/api/v1/gift-cards/my-cards', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMyGiftCards(data.giftCards);
      }
    } catch (error) {
      console.error('Error fetching gift cards:', error);
    }
  };
  
  const handlePurchase = async () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    
    if (finalAmount < 10 || finalAmount > 1000) {
      alert('Amount must be between $10 and $1000');
      return;
    }
    
    if (!recipientEmail || !recipientName || !senderName) {
      alert('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/v1/gift-cards/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: finalAmount,
          recipientEmail,
          recipientName,
          senderName,
          message,
          deliveryDate: deliveryDate || undefined,
          design: selectedDesign.id
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Gift card purchased successfully!');
        setRecipientEmail('');
        setRecipientName('');
        setMessage('');
        setDeliveryDate('');
        fetchMyGiftCards();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to purchase gift card');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/v1/gift-cards/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code: redeemCode })
      });
      
      const data = await response.json();
      setRedeemResult(data);
      
      if (data.success) {
        setRedeemCode('');
        fetchMyGiftCards();
      }
    } catch (error) {
      setRedeemResult({ success: false, message: 'Failed to redeem gift card' });
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiGift className="w-8 h-8" />
          Gift Cards
        </h1>
        <p className="text-purple-200 mt-1">
          Share the joy of shopping with friends and family
        </p>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700">
        {['purchase', 'redeem', 'my-cards'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab === 'purchase' && 'Buy Gift Card'}
            {tab === 'redeem' && 'Redeem Code'}
            {tab === 'my-cards' && 'My Gift Cards'}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Purchase Tab */}
          {activeTab === 'purchase' && (
            <motion.div
              key="purchase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Card Preview */}
              <div className={`bg-gradient-to-r ${selectedDesign.gradient} rounded-2xl p-6 text-white shadow-lg`}>
                <div className="flex justify-between items-start mb-8">
                  <span className="text-4xl">{selectedDesign.emoji}</span>
                  <FiGift className="w-8 h-8 opacity-50" />
                </div>
                <div className="mb-4">
                  <p className="text-white/70 text-sm">Gift Card Value</p>
                  <p className="text-3xl font-bold">
                    ${customAmount || amount}
                  </p>
                </div>
                <p className="text-white/70 text-sm">ShopSmart Gift Card</p>
              </div>
              
              {/* Design Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Choose Design
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {cardDesigns.map((design) => (
                    <button
                      key={design.id}
                      onClick={() => setSelectedDesign(design)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedDesign.id === design.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{design.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Amount
                </label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount('');
                      }}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        amount === preset && !customAmount
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount (10-1000)"
                    min="10"
                    max="1000"
                    className="w-full pl-8 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              {/* Recipient Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient's Email *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="recipient@email.com"
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recipient's Name *
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Personal Message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a personal message..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Delivery Date (optional)
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to send immediately
                  </p>
                </div>
              </div>
              
              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiShoppingBag className="w-5 h-5" />
                    Purchase Gift Card - ${customAmount || amount}
                  </>
                )}
              </button>
            </motion.div>
          )}
          
          {/* Redeem Tab */}
          {activeTab === 'redeem' && (
            <motion.div
              key="redeem"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiGift className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Redeem Your Gift Card
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Enter your gift card code to add funds to your wallet
                </p>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full px-4 py-4 text-center text-xl tracking-widest font-mono bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {redeemResult && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                  redeemResult.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {redeemResult.success ? (
                    <FiCheck className="w-5 h-5" />
                  ) : (
                    <FiX className="w-5 h-5" />
                  )}
                  <span>{redeemResult.message}</span>
                </div>
              )}
              
              <button
                onClick={handleRedeem}
                disabled={loading || !redeemCode.trim()}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Redeeming...' : 'Redeem Gift Card'}
              </button>
            </motion.div>
          )}
          
          {/* My Cards Tab */}
          {activeTab === 'my-cards' && (
            <motion.div
              key="my-cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {myGiftCards.length === 0 ? (
                <div className="text-center py-12">
                  <FiCreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Gift Cards Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Purchase or redeem a gift card to see it here
                  </p>
                </div>
              ) : (
                myGiftCards.map((card) => {
                  const design = cardDesigns.find(d => d.id === card.design) || cardDesigns[5];
                  return (
                    <div
                      key={card._id}
                      className={`bg-gradient-to-r ${design.gradient} rounded-xl p-4 text-white`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-white/70 text-sm">Balance</p>
                          <p className="text-2xl font-bold">${card.balance}</p>
                        </div>
                        <span className="text-2xl">{design.emoji}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/70 text-xs">Card Code</p>
                          <p className="font-mono tracking-wide">{card.code}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(card.code)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          {copiedCode === card.code ? (
                            <FiCheck className="w-4 h-4" />
                          ) : (
                            <FiCopy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {card.expiresAt && (
                        <p className="text-white/60 text-xs mt-2">
                          Expires: {new Date(card.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GiftCardManager;
