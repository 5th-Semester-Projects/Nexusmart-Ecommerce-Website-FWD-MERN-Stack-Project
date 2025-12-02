import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaPaperPlane, FaTimes, FaUser, FaHeadset, FaCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const LiveChatSupport = () => {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'agent', text: 'Hello! Welcome to NexusMart support. How can I help you today?', time: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentOnline, setAgentOnline] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !socket) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        path: '/socket.io',
        transports: ['websocket', 'polling']
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        newSocket.emit('join-chat', { 
          userId: user?._id, 
          userName: user?.name || 'Guest',
          chatType: 'support'
        });
      });

      newSocket.on('receive-message', (message) => {
        setMessages(prev => [...prev, { ...message, time: new Date() }]);
        setIsTyping(false);
      });

      newSocket.on('agent-typing', () => {
        setIsTyping(true);
      });

      newSocket.on('agent-status', (status) => {
        setAgentOnline(status.online);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      time: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    
    if (socket) {
      socket.emit('send-message', {
        userId: user?._id,
        message: inputMessage,
        chatType: 'support'
      });
    }

    setInputMessage('');

    // Simulate agent response if no real socket
    if (!socket?.connected) {
      setIsTyping(true);
      setTimeout(() => {
        const responses = [
          "I understand your concern. Let me check that for you.",
          "Thank you for reaching out! I'll help you with that right away.",
          "Sure, I can assist you with that. Please give me a moment.",
          "That's a great question! Here's what I can tell you...",
          "I'm looking into this for you. One moment please."
        ];
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'agent',
          text: responses[Math.floor(Math.random() * responses.length)],
          time: new Date()
        }]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const quickReplies = [
    "Track my order",
    "Return policy",
    "Payment issue",
    "Product inquiry"
  ];

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center"
      >
        <FaComments className="text-white text-2xl" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-48px)] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FaHeadset className="text-white text-xl" />
                  </div>
                  <FaCircle className={`absolute -bottom-0.5 -right-0.5 text-xs ${agentOnline ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Live Support</h3>
                  <p className="text-white/70 text-sm">
                    {agentOnline ? 'Online' : 'Away'} • Usually replies instantly
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-900">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : ''}`}>
                    {message.sender === 'agent' && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <FaHeadset className="text-white text-xs" />
                        </div>
                        <span className="text-gray-400 text-xs">Support Agent</span>
                      </div>
                    )}
                    <div className={`px-4 py-2 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm' 
                        : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                    }`}>
                      {message.text}
                    </div>
                    <span className={`text-gray-500 text-xs mt-1 block ${message.sender === 'user' ? 'text-right' : ''}`}>
                      {formatTime(message.time)}
                    </span>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <FaHeadset className="text-white text-xs" />
                  </div>
                  <div className="bg-gray-800 px-4 py-2 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 border-t border-gray-800 flex gap-2 overflow-x-auto">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(reply)}
                  className="whitespace-nowrap px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center disabled:opacity-50"
                >
                  <FaPaperPlane className="text-white" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChatSupport;
