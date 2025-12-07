import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  CreditCard, 
  Send, 
  Sparkles, 
  Copy,
  Check,
  ShoppingBag,
  Calendar,
  User,
  Mail,
  MessageSquare,
  X,
  Package
} from 'lucide-react';
import axios from 'axios';

const GiftCardShop = () => {
  const [step, setStep] = useState(1);
  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('email');
  const [recipientDetails, setRecipientDetails] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [purchasedCard, setPurchasedCard] = useState(null);
  const [copied, setCopied] = useState(false);

  const presetAmounts = [25, 50, 75, 100, 150, 200, 500];

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const response = await axios.get('/api/v1/giftcards/designs');
      setDesigns(response.data.designs);
      if (response.data.designs.length > 0) {
        setSelectedDesign(response.data.designs[0]);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
      // Fallback designs
      setDesigns([
        { _id: '1', name: 'Birthday', imageUrl: '/gift-cards/birthday.jpg', category: 'birthday' },
        { _id: '2', name: 'Thank You', imageUrl: '/gift-cards/thankyou.jpg', category: 'thankyou' },
        { _id: '3', name: 'Celebration', imageUrl: '/gift-cards/celebration.jpg', category: 'celebration' },
        { _id: '4', name: 'Holiday', imageUrl: '/gift-cards/holiday.jpg', category: 'holiday' }
      ]);
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      const amount = customAmount || selectedAmount;
      
      const response = await axios.post('/api/v1/giftcards/purchase', {
        amount,
        designId: selectedDesign._id,
        deliveryMethod,
        recipientName: recipientDetails.name,
        recipientEmail: recipientDetails.email,
        recipientPhone: recipientDetails.phone,
        message: recipientDetails.message
      });

      setPurchasedCard(response.data.giftCard);
      setStep(5);
    } catch (error) {
      console.error('Error purchasing gift card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (purchasedCard?.code) {
      navigator.clipboard.writeText(purchasedCard.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getAmount = () => {
    return customAmount ? parseFloat(customAmount) : selectedAmount;
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedDesign !== null;
      case 2: return getAmount() && getAmount() >= 10 && getAmount() <= 1000;
      case 3: return recipientDetails.name && 
              (deliveryMethod === 'email' ? recipientDetails.email : 
               deliveryMethod === 'sms' ? recipientDetails.phone : true);
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4"
          >
            <Gift className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gift Cards
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The perfect gift for everyone
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-12 h-1 rounded ${
                    step > s ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Choose a Design
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {designs.map((design) => (
                  <motion.button
                    key={design._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDesign(design)}
                    className={`relative aspect-[3/2] rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedDesign?._id === design._id
                        ? 'border-purple-500'
                        : 'border-transparent'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      design.category === 'birthday' ? 'from-pink-400 to-purple-500' :
                      design.category === 'thankyou' ? 'from-green-400 to-teal-500' :
                      design.category === 'celebration' ? 'from-yellow-400 to-orange-500' :
                      'from-blue-400 to-indigo-500'
                    } flex items-center justify-center`}>
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 p-2">
                      <p className="text-white text-xs font-medium">{design.name}</p>
                    </div>
                    {selectedDesign?._id === design._id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Select Amount
              </h2>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {presetAmounts.map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`py-4 rounded-xl font-semibold transition-colors ${
                      selectedAmount === amount && !customAmount
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    ${amount}
                  </motion.button>
                ))}
              </div>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  placeholder="Enter custom amount ($10 - $1000)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="10"
                  max="1000"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Delivery Method
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'email', icon: Mail, label: 'Email' },
                  { id: 'sms', icon: MessageSquare, label: 'SMS' },
                  { id: 'print', icon: Package, label: 'Print' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setDeliveryMethod(method.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
                      deliveryMethod === method.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <method.icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={recipientDetails.name}
                    onChange={(e) => setRecipientDetails({ ...recipientDetails, name: e.target.value })}
                    placeholder="Recipient's Name"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {deliveryMethod === 'email' && (
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={recipientDetails.email}
                      onChange={(e) => setRecipientDetails({ ...recipientDetails, email: e.target.value })}
                      placeholder="Recipient's Email"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {deliveryMethod === 'sms' && (
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={recipientDetails.phone}
                      onChange={(e) => setRecipientDetails({ ...recipientDetails, phone: e.target.value })}
                      placeholder="Recipient's Phone"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                <textarea
                  value={recipientDetails.message}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, message: e.target.value })}
                  placeholder="Add a personal message (optional)"
                  rows={3}
                  className="w-full p-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Review & Confirm
              </h2>
              
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 mb-6 text-white">
                <div className="flex justify-between items-start mb-8">
                  <Sparkles className="w-8 h-8" />
                  <span className="text-3xl font-bold">${getAmount()}</span>
                </div>
                <div className="text-sm opacity-90">
                  <p>To: {recipientDetails.name}</p>
                  <p>{deliveryMethod === 'email' ? recipientDetails.email : 
                      deliveryMethod === 'sms' ? recipientDetails.phone : 'Print at home'}</p>
                </div>
              </div>

              {recipientDetails.message && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your message:</p>
                  <p className="text-gray-800 dark:text-white italic">"{recipientDetails.message}"</p>
                </div>
              )}

              <div className="flex justify-between items-center py-4 border-t dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">${getAmount()}</span>
              </div>
            </motion.div>
          )}

          {step === 5 && purchasedCard && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-green-600" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Gift Card Purchased!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {deliveryMethod === 'email' 
                  ? 'The gift card has been sent to the recipient\'s email.'
                  : deliveryMethod === 'sms'
                  ? 'The gift card has been sent via SMS.'
                  : 'Your gift card is ready to print.'}
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Gift Card Code</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-xl font-mono font-bold text-purple-600 dark:text-purple-400">
                    {purchasedCard.code}
                  </code>
                  <button 
                    onClick={copyCode}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => {
                  setStep(1);
                  setSelectedDesign(designs[0]);
                  setSelectedAmount(null);
                  setCustomAmount('');
                  setRecipientDetails({ name: '', email: '', phone: '', message: '' });
                  setPurchasedCard(null);
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                Purchase Another Gift Card
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < 5 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => step < 4 ? setStep(step + 1) : handlePurchase()}
              disabled={!canProceed() || isLoading}
              className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : step < 4 ? (
                <>
                  Continue
                  <Send className="w-4 h-4" />
                </>
              ) : (
                <>
                  Purchase ${getAmount()}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardShop;
