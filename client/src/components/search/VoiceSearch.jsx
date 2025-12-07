import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiX, FiSearch, FiLoader, FiVolume2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Voice Search Component
 * "Hey NexusMart, find me shoes"
 * Supports natural language queries with intelligent parsing
 */
const VoiceSearch = ({ onSearch, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Wake words for activation
  const wakeWords = ['hey nexusmart', 'nexusmart', 'hey nexus'];

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Voice search is not supported in your browser');
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    recognitionInstance.maxAlternatives = 3;

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionInstance.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setTranscript(prev => prev + final);
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript('');
      setInterimTranscript('');
      recognition.start();
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      if (transcript) {
        processVoiceQuery(transcript);
      }
    }
  }, [recognition, isListening, transcript]);

  const processVoiceQuery = async (query) => {
    setProcessing(true);
    
    try {
      let processedQuery = query.toLowerCase().trim();

      // Remove wake words
      for (const wake of wakeWords) {
        if (processedQuery.startsWith(wake)) {
          processedQuery = processedQuery.replace(wake, '').trim();
          break;
        }
      }

      // Remove common voice search prefixes
      const prefixes = [
        'find me', 'search for', 'show me', 'i want', 'i need',
        "i'm looking for", 'can you find', 'please find', 'look for'
      ];

      for (const prefix of prefixes) {
        if (processedQuery.startsWith(prefix)) {
          processedQuery = processedQuery.replace(prefix, '').trim();
          break;
        }
      }

      // Extract filters from natural language
      const filters = extractFilters(processedQuery);
      
      // Build search URL
      const searchParams = new URLSearchParams();
      searchParams.set('q', filters.query);
      
      if (filters.priceMax) searchParams.set('priceMax', filters.priceMax);
      if (filters.priceMin) searchParams.set('priceMin', filters.priceMin);
      if (filters.category) searchParams.set('category', filters.category);
      if (filters.rating) searchParams.set('rating', filters.rating);
      if (filters.color) searchParams.set('color', filters.color);
      if (filters.size) searchParams.set('size', filters.size);

      // Speak confirmation
      speakResponse(`Searching for ${filters.query}`);

      // Navigate to search results
      if (onSearch) {
        onSearch(filters);
      } else {
        navigate(`/products?${searchParams.toString()}`);
      }

      if (onClose) onClose();

    } catch (error) {
      console.error('Voice query processing error:', error);
      toast.error('Failed to process voice command');
    } finally {
      setProcessing(false);
    }
  };

  const extractFilters = (query) => {
    const filters = { query };

    // Price extraction
    const underMatch = query.match(/under ?\$?(\d+)/i);
    if (underMatch) {
      filters.priceMax = parseInt(underMatch[1]);
      filters.query = filters.query.replace(underMatch[0], '').trim();
    }

    const overMatch = query.match(/over ?\$?(\d+)/i);
    if (overMatch) {
      filters.priceMin = parseInt(overMatch[1]);
      filters.query = filters.query.replace(overMatch[0], '').trim();
    }

    const betweenMatch = query.match(/between ?\$?(\d+) ?and ?\$?(\d+)/i);
    if (betweenMatch) {
      filters.priceMin = parseInt(betweenMatch[1]);
      filters.priceMax = parseInt(betweenMatch[2]);
      filters.query = filters.query.replace(betweenMatch[0], '').trim();
    }

    // Rating extraction
    const ratingMatch = query.match(/(\d+) ?star/i);
    if (ratingMatch) {
      filters.rating = parseInt(ratingMatch[1]);
      filters.query = filters.query.replace(ratingMatch[0], '').trim();
    }

    // Color extraction
    const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey'];
    for (const color of colors) {
      if (query.includes(color)) {
        filters.color = color;
        break;
      }
    }

    // Size extraction
    const sizeMatch = query.match(/size ?(xs|s|m|l|xl|xxl|\d+)/i);
    if (sizeMatch) {
      filters.size = sizeMatch[1].toUpperCase();
      filters.query = filters.query.replace(sizeMatch[0], '').trim();
    }

    // Category extraction
    const categories = {
      'electronics': ['phone', 'laptop', 'computer', 'tablet', 'headphone', 'earbuds', 'speaker', 'tv', 'television', 'camera', 'watch'],
      'fashion': ['shirt', 'dress', 'pants', 'jeans', 'shoes', 'sneakers', 'jacket', 'coat', 'hat', 'sunglasses', 'bag', 'purse'],
      'home': ['furniture', 'sofa', 'chair', 'table', 'bed', 'lamp', 'rug', 'curtain', 'kitchen', 'decor'],
      'beauty': ['makeup', 'skincare', 'perfume', 'lipstick', 'foundation', 'cream', 'lotion', 'shampoo'],
      'sports': ['gym', 'fitness', 'yoga', 'running', 'football', 'basketball', 'tennis', 'golf', 'bicycle']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (query.includes(keyword)) {
          filters.category = category;
          break;
        }
      }
      if (filters.category) break;
    }

    // Clean up query
    filters.query = filters.query
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .replace(/^(a|an|the|some|any)\s+/i, '');

    return filters;
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const exampleQueries = [
    "Find me wireless headphones under $100",
    "Show me blue running shoes",
    "I want a 4 star laptop",
    "Search for summer dresses",
    "Find black leather jacket size M"
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <FiVolume2 className="text-primary-600" />
            Voice Search
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="text-xl text-gray-500" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Microphone button */}
        <div className="flex justify-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stopListening : startListening}
            disabled={processing}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-xl'
            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {processing ? (
              <FiLoader className="text-3xl animate-spin" />
            ) : isListening ? (
              <FiMicOff className="text-3xl" />
            ) : (
              <FiMic className="text-3xl" />
            )}
          </motion.button>
        </div>

        {/* Status text */}
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
          {isListening
            ? 'Listening... Tap to stop'
            : processing
            ? 'Processing your request...'
            : 'Tap microphone to start speaking'}
        </p>

        {/* Transcript display */}
        <AnimatePresence>
          {(transcript || interimTranscript) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl"
            >
              <p className="text-gray-900 dark:text-white font-medium">
                {transcript}
                <span className="text-gray-400">{interimTranscript}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example queries */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Try saying:
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => {
                  setTranscript(query);
                  processVoiceQuery(query);
                }}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-400 transition-colors"
              >
                "{query}"
              </button>
            ))}
          </div>
        </div>

        {/* Waveform visualization when listening */}
        {isListening && (
          <div className="mt-6 flex justify-center items-center gap-1 h-12">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-primary-500 rounded-full"
                animate={{
                  height: [8, Math.random() * 40 + 8, 8],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default VoiceSearch;
