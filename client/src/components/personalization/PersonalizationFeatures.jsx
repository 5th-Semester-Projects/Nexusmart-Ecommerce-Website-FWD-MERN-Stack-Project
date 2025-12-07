import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  SwatchIcon,
  HeartIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  EyeIcon,
  ClockIcon,
  FireIcon,
  TagIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Style Quiz Component
export const StyleQuiz = ({ onComplete, isOpen, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const questions = [
    {
      id: 'style',
      question: 'What best describes your style?',
      type: 'image_select',
      options: [
        { value: 'classic', label: 'Classic & Timeless', image: '👔' },
        { value: 'casual', label: 'Casual & Comfortable', image: '👕' },
        { value: 'bohemian', label: 'Bohemian & Free-spirited', image: '🌸' },
        { value: 'minimalist', label: 'Minimalist & Clean', image: '⬜' },
        { value: 'sporty', label: 'Sporty & Active', image: '🏃' },
        { value: 'glamorous', label: 'Glamorous & Bold', image: '✨' },
      ],
    },
    {
      id: 'colors',
      question: 'Which colors do you love wearing?',
      type: 'multiple',
      options: [
        { value: 'neutrals', label: 'Neutrals (Black, White, Beige)', color: '#B5B5B5' },
        { value: 'earth', label: 'Earth Tones (Brown, Olive, Rust)', color: '#8B4513' },
        { value: 'pastels', label: 'Pastels (Pink, Lavender, Mint)', color: '#FFB6C1' },
        { value: 'bold', label: 'Bold (Red, Blue, Yellow)', color: '#FF4444' },
        { value: 'jewel', label: 'Jewel Tones (Emerald, Sapphire)', color: '#50C878' },
        { value: 'monochrome', label: 'Black & White Only', color: '#000000' },
      ],
    },
    {
      id: 'fit',
      question: 'How do you prefer your clothes to fit?',
      type: 'single',
      options: [
        { value: 'loose', label: 'Loose & Relaxed', icon: '📐' },
        { value: 'regular', label: 'Regular Fit', icon: '👍' },
        { value: 'fitted', label: 'Fitted & Tailored', icon: '✂️' },
        { value: 'tight', label: 'Form-fitting', icon: '💪' },
      ],
    },
    {
      id: 'occasions',
      question: 'What do you usually shop for?',
      type: 'multiple',
      options: [
        { value: 'work', label: 'Work/Office', icon: '💼' },
        { value: 'casual', label: 'Everyday Casual', icon: '☀️' },
        { value: 'date', label: 'Date Night', icon: '💕' },
        { value: 'party', label: 'Party & Events', icon: '🎉' },
        { value: 'workout', label: 'Workout & Sports', icon: '🏋️' },
        { value: 'vacation', label: 'Vacation & Travel', icon: '✈️' },
      ],
    },
    {
      id: 'budget',
      question: 'What\'s your typical budget for a single item?',
      type: 'scale',
      options: [
        { value: 'budget', label: 'Under $50', range: [0, 50] },
        { value: 'moderate', label: '$50 - $150', range: [50, 150] },
        { value: 'premium', label: '$150 - $300', range: [150, 300] },
        { value: 'luxury', label: '$300+', range: [300, 1000] },
      ],
    },
    {
      id: 'brands',
      question: 'Which brands resonate with you?',
      type: 'multiple',
      options: [
        { value: 'zara', label: 'Zara' },
        { value: 'hm', label: 'H&M' },
        { value: 'uniqlo', label: 'Uniqlo' },
        { value: 'nike', label: 'Nike' },
        { value: 'gucci', label: 'Gucci' },
        { value: 'other', label: 'Other/No Preference' },
      ],
    },
  ];

  const handleAnswer = (value) => {
    const question = questions[currentQuestion];
    
    if (question.type === 'multiple') {
      const current = answers[question.id] || [];
      if (current.includes(value)) {
        setAnswers({ ...answers, [question.id]: current.filter(v => v !== value) });
      } else {
        setAnswers({ ...answers, [question.id]: [...current, value] });
      }
    } else {
      setAnswers({ ...answers, [question.id]: value });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analyzeResults();
    }
  };

  const analyzeResults = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const styleResults = {
        primaryStyle: answers.style || 'casual',
        colorPalette: answers.colors || ['neutrals'],
        fitPreference: answers.fit || 'regular',
        occasions: answers.occasions || ['casual'],
        budget: answers.budget || 'moderate',
        brands: answers.brands || [],
      };
      setResults(styleResults);
      setIsAnalyzing(false);
    }, 2000);
  };

  const finishQuiz = () => {
    onComplete?.(results);
    toast.success('Style profile saved! Get ready for personalized recommendations.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-purple-500/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Style Quiz</h3>
              <p className="text-xs text-gray-400">Discover your perfect style</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {!isAnalyzing && !results ? (
            <>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h4 className="text-xl font-bold text-white mb-6">
                    {questions[currentQuestion].question}
                  </h4>

                  <div className={`grid gap-3 ${
                    questions[currentQuestion].type === 'image_select' 
                      ? 'grid-cols-2 md:grid-cols-3' 
                      : 'grid-cols-2'
                  }`}>
                    {questions[currentQuestion].options.map((option) => {
                      const isSelected = questions[currentQuestion].type === 'multiple'
                        ? (answers[questions[currentQuestion].id] || []).includes(option.value)
                        : answers[questions[currentQuestion].id] === option.value;

                      return (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(option.value)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {option.image && <span className="text-2xl">{option.image}</span>}
                            {option.icon && <span className="text-xl">{option.icon}</span>}
                            {option.color && (
                              <div
                                className="w-6 h-6 rounded-full border-2 border-white/20"
                                style={{ backgroundColor: option.color }}
                              />
                            )}
                            <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                              {option.label}
                            </span>
                            {isSelected && (
                              <CheckIcon className="w-5 h-5 text-purple-400 ml-auto" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={nextQuestion}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
                >
                  {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : isAnalyzing ? (
            <div className="py-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-6"
              >
                <SparklesIcon className="w-16 h-16 text-purple-500" />
              </motion.div>
              <h4 className="text-xl font-bold text-white mb-2">Analyzing Your Style...</h4>
              <p className="text-gray-400">Our AI is creating your personalized profile</p>
            </div>
          ) : (
            <div className="py-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <CheckIcon className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Your Style Profile</h4>
                <p className="text-gray-400">Here's what we learned about your style</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Primary Style</p>
                  <p className="text-white font-bold capitalize">{results.primaryStyle}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Fit Preference</p>
                  <p className="text-white font-bold capitalize">{results.fitPreference}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Budget Range</p>
                  <p className="text-white font-bold capitalize">{results.budget}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Top Occasions</p>
                  <p className="text-white font-bold capitalize">{results.occasions.slice(0, 2).join(', ')}</p>
                </div>
              </div>

              <button
                onClick={finishQuiz}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Save & See Personalized Picks
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Personalized Homepage Sections Component
export const PersonalizedSections = ({ user, products = [] }) => {
  const sections = [
    {
      id: 'recommended',
      title: 'Recommended for You',
      subtitle: 'Based on your style profile',
      icon: SparklesIcon,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'recently_viewed',
      title: 'Recently Viewed',
      subtitle: 'Pick up where you left off',
      icon: EyeIcon,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'trending',
      title: 'Trending in Your Size',
      subtitle: 'Popular items that fit you',
      icon: FireIcon,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      id: 'deals',
      title: 'Deals You\'ll Love',
      subtitle: 'Discounts on your favorites',
      icon: TagIcon,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const mockProducts = [
    { id: 1, name: 'Classic White Shirt', price: 49.99, rating: 4.5, image: null },
    { id: 2, name: 'Slim Fit Jeans', price: 79.99, rating: 4.8, image: null },
    { id: 3, name: 'Leather Jacket', price: 199.99, rating: 4.7, image: null },
    { id: 4, name: 'Casual Sneakers', price: 89.99, rating: 4.6, image: null },
  ];

  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <motion.section
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${section.gradient} flex items-center justify-center`}>
                <section.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
                <p className="text-gray-400 text-sm">{section.subtitle}</p>
              </div>
            </div>
            <button className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm">
              View All <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-gray-800/50 rounded-xl overflow-hidden group cursor-pointer"
              >
                <div className="aspect-square bg-gray-700 relative">
                  <button className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <HeartIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium text-sm truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-purple-400 font-bold">${product.price}</span>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                      {product.rating}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
};

// Smart Product Bundles Component
export const SmartBundles = ({ baseProduct }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const bundles = [
    {
      id: 1,
      name: 'Complete the Look',
      discount: 15,
      items: [
        { id: 'a', name: 'Matching Belt', price: 39.99, originalPrice: 49.99 },
        { id: 'b', name: 'Classic Watch', price: 129.99, originalPrice: 159.99 },
        { id: 'c', name: 'Leather Shoes', price: 149.99, originalPrice: 189.99 },
      ],
    },
    {
      id: 2,
      name: 'Frequently Bought Together',
      discount: 10,
      items: [
        { id: 'd', name: 'Undershirt Pack', price: 29.99, originalPrice: 34.99 },
        { id: 'e', name: 'Socks Set', price: 19.99, originalPrice: 24.99 },
      ],
    },
  ];

  const toggleItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const getTotalPrice = () => {
    let total = 0;
    bundles.forEach(bundle => {
      bundle.items.forEach(item => {
        if (selectedItems.includes(item.id)) {
          total += item.price;
        }
      });
    });
    return total;
  };

  const getTotalSavings = () => {
    let savings = 0;
    bundles.forEach(bundle => {
      bundle.items.forEach(item => {
        if (selectedItems.includes(item.id)) {
          savings += item.originalPrice - item.price;
        }
      });
    });
    return savings;
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <ShoppingBagIcon className="w-6 h-6 text-purple-500" />
        Complete Your Purchase
      </h3>

      <div className="space-y-6">
        {bundles.map((bundle) => (
          <div key={bundle.id} className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">{bundle.name}</h4>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Save {bundle.discount}%
              </span>
            </div>

            <div className="space-y-3">
              {bundle.items.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedItems.includes(item.id)
                      ? 'bg-purple-500/20 border border-purple-500'
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedItems.includes(item.id)
                      ? 'bg-purple-500 border-purple-500'
                      : 'border-gray-500'
                  }`}>
                    {selectedItems.includes(item.id) && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="w-12 h-12 bg-gray-600 rounded-lg" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">${item.price}</span>
                      <span className="text-gray-500 text-sm line-through">${item.originalPrice}</span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-white">
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-medium">{selectedItems.length} items selected</p>
              <p className="text-green-400 text-sm">You save ${getTotalSavings().toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Bundle Total</p>
              <p className="text-2xl font-bold text-white">${getTotalPrice().toFixed(2)}</p>
            </div>
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
            Add Bundle to Cart
          </button>
        </motion.div>
      )}
    </div>
  );
};

// Complete the Look Suggestions
export const CompleteTheLook = ({ product }) => {
  const suggestions = [
    { id: 1, name: 'Matching Shoes', price: 89.99, category: 'footwear', match: 95 },
    { id: 2, name: 'Designer Belt', price: 49.99, category: 'accessories', match: 92 },
    { id: 3, name: 'Slim Wallet', price: 39.99, category: 'accessories', match: 88 },
    { id: 4, name: 'Sunglasses', price: 129.99, category: 'accessories', match: 85 },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <SwatchIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Complete the Look</h3>
          <p className="text-gray-400 text-sm">AI-styled suggestions just for you</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {suggestions.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 rounded-xl overflow-hidden cursor-pointer group"
          >
            <div className="aspect-square bg-gray-700 relative">
              <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                {item.match}% Match
              </div>
            </div>
            <div className="p-3">
              <p className="text-white font-medium text-sm">{item.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-purple-400 font-bold">${item.price}</span>
                <button className="p-1.5 bg-purple-500/20 text-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/10 transition-colors">
        Add All to Cart - Save 20%
      </button>
    </div>
  );
};

export default {
  StyleQuiz,
  PersonalizedSections,
  SmartBundles,
  CompleteTheLook
};
