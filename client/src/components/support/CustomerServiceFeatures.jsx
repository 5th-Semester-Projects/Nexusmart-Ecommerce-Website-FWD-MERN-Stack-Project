import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ComputerDesktopIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  ArrowPathIcon,
  UserCircleIcon,
  StarIcon,
  CheckCircleIcon,
  CalendarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Live Video Chat Support Component
export const LiveVideoChatSupport = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState('connecting'); // connecting, waiting, active, ended
  const [waitTime, setWaitTime] = useState(0);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (isOpen && status === 'connecting') {
      // Simulate connection
      setTimeout(() => setStatus('waiting'), 1500);
    }
  }, [isOpen, status]);

  useEffect(() => {
    if (status === 'waiting') {
      const interval = setInterval(() => {
        setWaitTime(prev => prev + 1);
      }, 1000);

      // Simulate agent connecting
      setTimeout(() => {
        setStatus('active');
        setMessages([{
          id: 1,
          sender: 'agent',
          name: 'Sarah',
          message: "Hi! I'm Sarah from customer support. How can I help you today?",
          timestamp: new Date()
        }]);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [status]);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      message: inputMessage.trim(),
      timestamp: new Date()
    }]);
    setInputMessage('');

    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'agent',
        name: 'Sarah',
        message: "I understand. Let me check that for you. Could you please provide your order number?",
        timestamp: new Date()
      }]);
    }, 2000);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      toast.success('Screen sharing started');
    } else {
      toast.success('Screen sharing stopped');
    }
    setIsScreenSharing(!isScreenSharing);
  };

  const endCall = () => {
    setStatus('ended');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90"
    >
      <div className="h-full flex flex-col md:flex-row">
        {/* Video Area */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
          {status === 'connecting' && (
            <div className="text-center">
              <ArrowPathIcon className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Connecting to support...</p>
            </div>
          )}

          {status === 'waiting' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-10 h-10 text-purple-500" />
              </div>
              <p className="text-white text-lg mb-2">Waiting for agent...</p>
              <p className="text-gray-400">
                Estimated wait: {Math.floor(waitTime / 60)}:{(waitTime % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-gray-500 text-sm mt-4">Position in queue: #2</p>
            </div>
          )}

          {status === 'active' && (
            <>
              {/* Remote Video (Agent) */}
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <UserCircleIcon className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-white font-medium">Sarah</p>
                  <p className="text-gray-300 text-sm">Customer Support</p>
                </div>
              </div>

              {/* Local Video (User) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700">
                {isVideoOn ? (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Your camera</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <VideoCameraIcon className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Screen Share Indicator */}
              {isScreenSharing && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2">
                  <ComputerDesktopIcon className="w-5 h-5" />
                  Screen sharing active
                </div>
              )}
            </>
          )}

          {status === 'ended' && (
            <div className="text-center">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">Call Ended</p>
              <p className="text-gray-400 mb-6">Thank you for contacting us!</p>
              
              <div className="mb-6">
                <p className="text-gray-400 mb-2">How was your experience?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="p-1 hover:scale-110 transition-transform">
                      <StarIcon className="w-8 h-8 text-yellow-400" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Controls */}
          {status === 'active' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-800/80 backdrop-blur px-6 py-3 rounded-full">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full transition-colors ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-colors ${
                  !isVideoOn ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <VideoCameraIcon className="w-5 h-5" />
              </button>
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full transition-colors ${
                  isScreenSharing ? 'bg-green-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <ComputerDesktopIcon className="w-5 h-5" />
              </button>
              <button
                onClick={endCall}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <PhoneIcon className="w-5 h-5 rotate-[135deg]" />
              </button>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-800/80 backdrop-blur rounded-full hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Chat Sidebar */}
        {status === 'active' && (
          <div className="w-full md:w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : ''}`}>
                    {msg.sender === 'agent' && (
                      <p className="text-xs text-purple-400 mb-1">{msg.name}</p>
                    )}
                    <div className={`px-4 py-2 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-purple-500 text-white rounded-tr-none'
                        : 'bg-gray-800 text-gray-200 rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white text-sm focus:border-purple-500 outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// AI FAQ Chatbot Component
export const AIFAQChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      message: "Hi! I'm your AI assistant. How can I help you today?",
      suggestions: ['Track my order', 'Return policy', 'Payment issues', 'Contact support']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const faqResponses = {
    'track my order': {
      message: "To track your order, go to 'My Orders' in your account dashboard. You'll see real-time tracking information for all your orders. Need help finding a specific order?",
      suggestions: ['Yes, help me find it', 'No, thanks', 'Talk to human']
    },
    'return policy': {
      message: "We offer a 30-day return policy for most items. Items must be unused and in original packaging. For Gold and Platinum members, we offer extended 60-day returns with free pickup!",
      suggestions: ['Start a return', 'Refund timeline', 'Talk to human']
    },
    'payment issues': {
      message: "I can help with payment issues. Common solutions include:\n\n• Verify card details\n• Check sufficient funds\n• Try a different payment method\n\nWhat specific issue are you facing?",
      suggestions: ['Payment declined', 'Double charged', 'Refund status', 'Talk to human']
    },
    'contact support': {
      message: "You can reach our support team through:\n\n📞 Phone: 1-800-NEXUS\n📧 Email: support@nexusmart.com\n💬 Live Chat: Available 24/7\n📹 Video Call: Premium members\n\nWould you like to connect now?",
      suggestions: ['Start live chat', 'Schedule callback', 'Video support']
    },
    default: {
      message: "I understand you need help with that. Let me connect you with more options.",
      suggestions: ['FAQ topics', 'Talk to human', 'Browse help center']
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processMessage = (text) => {
    const lowerText = text.toLowerCase();
    for (const [key, response] of Object.entries(faqResponses)) {
      if (key !== 'default' && lowerText.includes(key)) {
        return response;
      }
    }
    return faqResponses.default;
  };

  const sendMessage = (text = inputMessage) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      message: text.trim()
    }]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = processMessage(text);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        message: response.message,
        suggestions: response.suggestions
      }]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Assistant</h3>
            <p className="text-xs text-white/70">Always here to help</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <XMarkIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.sender === 'user' ? '' : ''}`}>
                <div className={`px-4 py-2 rounded-2xl whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-purple-500 text-white rounded-tr-none'
                    : 'bg-gray-800 text-gray-200 rounded-tl-none'
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
            {msg.suggestions && (
              <div className="flex flex-wrap gap-2 mt-2">
                {msg.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(suggestion)}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-1 px-4 py-3 bg-gray-800 rounded-2xl rounded-tl-none w-20">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                className="w-2 h-2 bg-gray-500 rounded-full"
              />
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your question..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white text-sm focus:border-purple-500 outline-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim()}
            className="p-2 bg-purple-500 rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Callback Scheduling Component
export const CallbackScheduler = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  const dates = [];
  for (let i = 1; i <= 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      full: date.toISOString().split('T')[0]
    });
  }

  const times = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const reasons = [
    'Order Issue',
    'Return/Refund',
    'Product Inquiry',
    'Technical Support',
    'Billing Question',
    'Other'
  ];

  const scheduleCallback = () => {
    if (!selectedDate || !selectedTime || !phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsScheduled(true);
    toast.success('Callback scheduled successfully!');
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
          {!isScheduled ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Schedule a Callback</h3>
                  <p className="text-gray-400 text-sm">We'll call you at your preferred time</p>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">Select Date</label>
                <div className="flex gap-2">
                  {dates.map((d) => (
                    <button
                      key={d.full}
                      onClick={() => setSelectedDate(d.full)}
                      className={`flex-1 p-3 rounded-xl text-center transition-all ${
                        selectedDate === d.full
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <p className="text-xs">{d.day}</p>
                      <p className="text-lg font-bold">{d.date}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">Select Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {times.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg text-sm transition-all ${
                        selectedTime === time
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none"
                />
              </div>

              {/* Reason */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Reason (Optional)</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none"
                >
                  <option value="">Select a reason...</option>
                  {reasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={scheduleCallback}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all"
                >
                  Schedule Call
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Callback Scheduled!</h3>
              <p className="text-gray-400 mb-6">
                We'll call you on {selectedDate} at {selectedTime}
              </p>
              <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-green-500" />
                  <div className="text-left">
                    <p className="text-white font-medium">{selectedDate}</p>
                    <p className="text-gray-400 text-sm">{selectedTime}</p>
                  </div>
                </div>
              </div>
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

// Customer Service Hub Component
export const CustomerServiceHub = () => {
  const [activeService, setActiveService] = useState(null);

  const services = [
    {
      id: 'video',
      title: 'Video Chat',
      description: 'Face-to-face support with our agents',
      icon: VideoCameraIcon,
      color: 'from-purple-500 to-pink-500',
      available: true,
      badge: 'Premium'
    },
    {
      id: 'chat',
      title: 'AI Assistant',
      description: 'Get instant answers 24/7',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-blue-500 to-cyan-500',
      available: true
    },
    {
      id: 'callback',
      title: 'Request Callback',
      description: 'We\'ll call you at your convenience',
      icon: PhoneIcon,
      color: 'from-green-500 to-emerald-500',
      available: true
    },
    {
      id: 'help',
      title: 'Help Center',
      description: 'Browse FAQs and guides',
      icon: QuestionMarkCircleIcon,
      color: 'from-orange-500 to-yellow-500',
      available: true
    }
  ];

  return (
    <>
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6">How can we help you?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <motion.button
              key={service.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveService(service.id)}
              className="p-4 bg-gray-800/50 rounded-xl text-left hover:bg-gray-800 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center flex-shrink-0`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                      {service.title}
                    </h4>
                    {service.badge && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                        {service.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{service.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeService === 'video' && (
          <LiveVideoChatSupport isOpen={true} onClose={() => setActiveService(null)} />
        )}
        {activeService === 'chat' && (
          <AIFAQChatbot isOpen={true} onClose={() => setActiveService(null)} />
        )}
        {activeService === 'callback' && (
          <CallbackScheduler isOpen={true} onClose={() => setActiveService(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default {
  LiveVideoChatSupport,
  AIFAQChatbot,
  CallbackScheduler,
  CustomerServiceHub
};
