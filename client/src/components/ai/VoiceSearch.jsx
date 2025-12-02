import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaTimes, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const VoiceSearch = ({ onClose, onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      setError('Error occurred: ' + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening]);

  const handleSearch = () => {
    if (transcript.trim()) {
      onSearch?.(transcript);
      navigate(`/products?keyword=${encodeURIComponent(transcript)}`);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full"
      >
        <FaTimes size={24} />
      </button>

      <div className="text-center">
        {/* Microphone Animation */}
        <motion.div
          className="relative mx-auto mb-8"
          animate={isListening ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
            isListening 
              ? 'bg-gradient-to-r from-purple-600 to-blue-500' 
              : 'bg-gray-700'
          }`}>
            <FaMicrophone size={48} className="text-white" />
          </div>
          
          {/* Ripple Effect */}
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-purple-500"
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-blue-500"
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
              />
            </>
          )}
        </motion.div>

        {/* Status Text */}
        <p className="text-white text-xl mb-4">
          {error ? error : isListening ? 'Listening...' : 'Tap to speak'}
        </p>

        {/* Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mx-auto max-w-md mb-6"
          >
            <p className="text-white text-lg">"{transcript}"</p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {!isListening ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsListening(true)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full font-medium"
            >
              Start Listening
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsListening(false)}
              className="px-8 py-3 bg-red-500 text-white rounded-full font-medium"
            >
              Stop
            </motion.button>
          )}

          {transcript && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="px-8 py-3 bg-green-500 text-white rounded-full font-medium flex items-center gap-2"
            >
              <FaSearch />
              Search
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceSearch;
