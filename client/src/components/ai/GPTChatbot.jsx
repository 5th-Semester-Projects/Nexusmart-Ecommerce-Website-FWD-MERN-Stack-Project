import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageSquare, FiX, FiSend, FiMic, FiMicOff,
  FiShoppingCart, FiPackage, FiHelpCircle, FiUser,
  FiMinimize2, FiMaximize2, FiRefreshCw
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import axios from 'axios';

const GPTChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your AI shopping assistant powered by advanced language models. I can help you with:\n\n• Finding products\n• Order tracking\n• Product recommendations\n• Answering questions\n\nHow can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [context, setContext] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await axios.post('/api/ai/gpt-chat', {
        message: userMessage,
        context: context.slice(-10), // Last 10 messages for context
        userId: localStorage.getItem('userId')
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        products: response.data.products,
        actions: response.data.actions
      };

      setMessages(prev => [...prev, assistantMessage]);
      setContext(prev => [...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response.data.response }
      ]);
    } catch (error) {
      // Fallback to demo response
      const demoResponse = getDemoResponse(userMessage);
      setMessages(prev => [...prev, demoResponse]);
    } finally {
      setLoading(false);
    }
  };

  const getDemoResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    let response = '';
    let products = null;
    let actions = null;

    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      response = "Based on your preferences, I'd recommend checking out our top-rated products:\n\n🌟 **Premium Wireless Headphones** - $149.99\n🌟 **Smart Watch Pro** - $299.99\n🌟 **Portable Speaker** - $79.99\n\nWould you like me to add any of these to your cart?";
      actions = [
        { label: 'View Headphones', action: 'navigate', path: '/products/headphones' },
        { label: 'View Smart Watch', action: 'navigate', path: '/products/smartwatch' }
      ];
    } else if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
      response = "I can help you track your order! Please provide your order number, or I can look up your recent orders.\n\n📦 Your recent orders:\n• Order #12345 - Shipped (Arriving Dec 5)\n• Order #12340 - Delivered (Nov 28)";
      actions = [
        { label: 'View All Orders', action: 'navigate', path: '/orders' }
      ];
    } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      response = "I understand you'd like to initiate a return. Our return policy allows returns within 30 days of purchase.\n\n📋 Return Process:\n1. Select the order\n2. Choose items to return\n3. Print shipping label\n4. Drop off at carrier\n\nWould you like me to start a return for you?";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('discount')) {
      response = "🎉 Great news! We have several active promotions:\n\n• **SAVE20** - 20% off orders over $100\n• **FREESHIP** - Free shipping on all orders\n• **NEWUSER** - 15% off for new customers\n\nWould you like me to apply any of these to your cart?";
    } else {
      response = "I'm here to help! I can assist you with:\n\n🛒 **Shopping** - Find products, recommendations\n📦 **Orders** - Track, returns, refunds\n💳 **Payments** - Payment methods, issues\n❓ **Support** - General questions\n\nWhat would you like help with?";
    }

    return {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      products,
      actions
    };
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleQuickAction = (action) => {
    if (action.action === 'navigate') {
      window.location.href = action.path;
    } else if (action.action === 'addToCart') {
      // Add to cart logic
    }
  };

  const quickPrompts = [
    { icon: FiShoppingCart, text: 'Recommend products' },
    { icon: FiPackage, text: 'Track my order' },
    { icon: FiHelpCircle, text: 'Return policy' }
  ];

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-white z-50 ${isOpen ? 'hidden' : ''}`}
      >
        <FaRobot className="text-2xl" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? 60 : 'auto'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FaRobot className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">NexusMart AI</h3>
                  <p className="text-white/70 text-xs">Powered by GPT</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? <FiMaximize2 className="text-white" /> : <FiMinimize2 className="text-white" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX className="text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${
                        msg.role === 'user' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
                      } rounded-2xl px-4 py-3`}>
                        <div className="flex items-start gap-2">
                          {msg.role === 'assistant' && (
                            <FaRobot className="text-purple-500 mt-1 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm whitespace-pre-line">{msg.content}</p>
                            
                            {/* Action Buttons */}
                            {msg.actions && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {msg.actions.map((action, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleQuickAction(action)}
                                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-full text-xs font-medium hover:bg-purple-200"
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs opacity-50 mt-1 text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaRobot className="text-purple-500" />
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-2">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {quickPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setInput(prompt.text);
                            inputRef.current?.focus();
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <prompt.icon className="text-purple-500" />
                          <span className="dark:text-white">{prompt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything..."
                      className="flex-1 p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={toggleVoice}
                      className={`p-3 rounded-xl transition-colors ${
                        isListening 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {isListening ? <FiMicOff /> : <FiMic />}
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl disabled:opacity-50"
                    >
                      <FiSend />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GPTChatbot;
