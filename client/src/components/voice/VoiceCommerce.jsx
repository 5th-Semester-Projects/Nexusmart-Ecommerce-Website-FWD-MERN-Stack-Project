import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MicrophoneIcon, 
  StopIcon, 
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  HomeIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Voice Search Component
export const VoiceSearch = ({ onSearch, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        setTranscript(result[0].transcript);
        setConfidence(result[0].confidence);

        if (result.isFinal) {
          onSearch?.(result[0].transcript);
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition error. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onSearch]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={toggleListening}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`p-3 rounded-full transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50' 
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
        }`}
        title={isListening ? 'Stop listening' : 'Voice search'}
      >
        {isListening ? (
          <StopIcon className="w-6 h-6" />
        ) : (
          <MicrophoneIcon className="w-6 h-6" />
        )}
      </motion.button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl min-w-[200px] z-50"
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [1, 2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className="w-1 h-4 bg-purple-500 rounded-full"
                  />
                ))}
              </div>
              <span className="text-sm">{transcript || 'Listening...'}</span>
            </div>
            {confidence > 0 && (
              <div className="mt-1 text-xs text-gray-400">
                Confidence: {(confidence * 100).toFixed(0)}%
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Voice Shopping Assistant
export const VoiceShoppingAssistant = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);
  const conversationEndRef = useRef(null);

  const commands = {
    'search': /search (?:for )?(.+)/i,
    'go to': /go to (.+)/i,
    'add to cart': /add (.+) to (?:my )?cart/i,
    'checkout': /checkout|buy now|purchase/i,
    'home': /go (?:to )?home|home page/i,
    'help': /help|what can you do/i,
  };

  const speak = useCallback((text) => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthesisRef.current.speak(utterance);
    }
  }, []);

  const processCommand = useCallback((transcript) => {
    const lowerTranscript = transcript.toLowerCase();
    let response = '';
    let action = null;

    // Check for commands
    for (const [command, pattern] of Object.entries(commands)) {
      const match = lowerTranscript.match(pattern);
      if (match) {
        switch (command) {
          case 'search':
            response = `Searching for ${match[1]}`;
            action = () => navigate(`/products?search=${encodeURIComponent(match[1])}`);
            break;
          case 'go to':
            response = `Navigating to ${match[1]}`;
            action = () => navigate(`/${match[1].replace(/\s+/g, '-')}`);
            break;
          case 'add to cart':
            response = `I'll help you add ${match[1]} to your cart`;
            action = () => navigate(`/products?search=${encodeURIComponent(match[1])}`);
            break;
          case 'checkout':
            response = 'Taking you to checkout';
            action = () => navigate('/checkout');
            break;
          case 'home':
            response = 'Going to the home page';
            action = () => navigate('/');
            break;
          case 'help':
            response = 'I can help you search for products, navigate to different pages, add items to your cart, and checkout. Just tell me what you want to do!';
            break;
        }
        break;
      }
    }

    if (!response) {
      response = `I heard "${transcript}". Would you like me to search for that?`;
    }

    setConversation(prev => [
      ...prev,
      { role: 'user', content: transcript },
      { role: 'assistant', content: response }
    ]);

    speak(response);

    if (action) {
      setTimeout(action, 1500);
    }
  }, [navigate, speak]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        setCurrentTranscript(result[0].transcript);

        if (result.isFinal) {
          processCommand(result[0].transcript);
          setCurrentTranscript('');
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [processCommand]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  useEffect(() => {
    if (isOpen && conversation.length === 0) {
      const greeting = "Hello! I'm your shopping assistant. How can I help you today?";
      setConversation([{ role: 'assistant', content: greeting }]);
      speak(greeting);
    }
  }, [isOpen, speak]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setCurrentTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const toggleMute = () => {
    if (isSpeaking) {
      synthesisRef.current?.cancel();
      setIsSpeaking(false);
    }
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
        className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-purple-500/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <MicrophoneIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Voice Assistant</h3>
              <p className="text-xs text-gray-400">AI-powered shopping helper</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Conversation */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {conversation.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-purple-500 text-white rounded-tr-none'
                    : 'bg-gray-800 text-gray-200 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {currentTranscript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end"
            >
              <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-purple-500/50 text-white rounded-tr-none">
                {currentTranscript}...
              </div>
            </motion.div>
          )}
          <div ref={conversationEndRef} />
        </div>

        {/* Quick Commands */}
        <div className="px-4 py-2 border-t border-purple-500/20">
          <p className="text-xs text-gray-500 mb-2">Quick commands:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: MagnifyingGlassIcon, label: 'Search' },
              { icon: ShoppingCartIcon, label: 'Cart' },
              { icon: HomeIcon, label: 'Home' },
              { icon: QuestionMarkCircleIcon, label: 'Help' },
            ].map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => processCommand(cmd.label.toLowerCase())}
                className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors"
              >
                <cmd.icon className="w-3 h-3" />
                {cmd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-purple-500/20 flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isSpeaking ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {isSpeaking ? (
              <SpeakerWaveIcon className="w-5 h-5" />
            ) : (
              <SpeakerXMarkIcon className="w-5 h-5" />
            )}
          </button>
          
          <motion.button
            onClick={toggleListening}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-5 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30'
            }`}
          >
            {isListening ? (
              <StopIcon className="w-6 h-6 text-white" />
            ) : (
              <MicrophoneIcon className="w-6 h-6 text-white" />
            )}
          </motion.button>

          <div className="w-12" /> {/* Spacer for balance */}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Text-to-Speech Accessibility Component
export const TextToSpeech = ({ text, className = '' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthesisRef = useRef(window.speechSynthesis);

  const speak = () => {
    if (synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthesisRef.current.speak(utterance);
  };

  useEffect(() => {
    return () => {
      synthesisRef.current?.cancel();
    };
  }, []);

  return (
    <button
      onClick={speak}
      className={`p-2 rounded-full transition-colors ${
        isSpeaking 
          ? 'bg-purple-500 text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
      } ${className}`}
      title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
      aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
    >
      {isSpeaking ? (
        <SpeakerWaveIcon className="w-5 h-5" />
      ) : (
        <SpeakerXMarkIcon className="w-5 h-5" />
      )}
    </button>
  );
};

// Voice Command Button (Floating)
export const VoiceCommandButton = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsAssistantOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-6 z-40 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-shadow"
        title="Voice Assistant"
      >
        <MicrophoneIcon className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isAssistantOpen && (
          <VoiceShoppingAssistant 
            isOpen={isAssistantOpen} 
            onClose={() => setIsAssistantOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default {
  VoiceSearch,
  VoiceShoppingAssistant,
  TextToSpeech,
  VoiceCommandButton
};
