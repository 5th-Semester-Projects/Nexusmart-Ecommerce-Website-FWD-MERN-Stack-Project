import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiClock, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const IntelligentSearch = ({ isMobile = false }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [extractedFilters, setExtractedFilters] = useState(null);
  const [spellingSuggestion, setSpellingSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    loadTrendingSearches();
  }, []);

  // Load trending searches
  const loadTrendingSearches = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.get(`${API_URL}/api/ai/search-trends`).catch(() => ({ data: { trends: [] } }));
      setTrendingSearches((data.trends || []).slice(0, 5));
    } catch (error) {
      console.error('Failed to load trending searches:', error);
      setTrendingSearches([]);
    }
  };

  // Get suggestions with debounce
  useEffect(() => {
    if (query.length >= 2) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      
      debounceTimer.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          // Get autocomplete suggestions
          const { data } = await axios.get(`${API_URL}/api/products/suggestions?query=${query}`).catch(() => ({ data: { suggestions: [] } }));
          setSuggestions(data.suggestions || []);

          // Check for spelling errors (optional, don't break if it fails)
          try {
            const spellCheck = await axios.post(`${API_URL}/ai/spell-check`, { query });
            if (spellCheck.data.hasSuggestions) {
              setSpellingSuggestion(spellCheck.data.suggestion);
            } else {
              setSpellingSuggestion(null);
            }
          } catch (spellError) {
            // Ignore spell check errors
            setSpellingSuggestion(null);
          }

          // Extract filters from query
          const filters = extractFiltersFromQuery(query);
          setExtractedFilters(filters);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setSpellingSuggestion(null);
      setExtractedFilters(null);
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // Extract filters from natural language query
  const extractFiltersFromQuery = (query) => {
    const filters = {};
    const lowerQuery = query.toLowerCase();

    // Price extraction
    const priceMatch = lowerQuery.match(/under\s*(\d+)|less\s*than\s*(\d+)|below\s*(\d+)/);
    if (priceMatch) {
      filters.maxPrice = priceMatch[1] || priceMatch[2] || priceMatch[3];
    }

    // Color extraction
    const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'pink', 'orange', 'brown', 'gray'];
    const foundColor = colors.find(color => lowerQuery.includes(color));
    if (foundColor) filters.color = foundColor;

    // Size extraction
    const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'small', 'medium', 'large'];
    const foundSize = sizes.find(size => lowerQuery.includes(size));
    if (foundSize) filters.size = foundSize.toUpperCase();

    // Rating extraction
    const ratingMatch = lowerQuery.match(/(\d+)\s*star/);
    if (ratingMatch) filters.rating = ratingMatch[1];

    // Keywords
    if (lowerQuery.includes('sale') || lowerQuery.includes('discount') || lowerQuery.includes('offer')) {
      filters.onSale = true;
    }

    if (lowerQuery.includes('in stock') || lowerQuery.includes('available')) {
      filters.inStock = true;
    }

    return Object.keys(filters).length > 0 ? filters : null;
  };

  // Handle search submission
  const handleSearch = (searchTerm = query) => {
    if (!searchTerm.trim()) return;

    // Save to recent searches
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Build search URL with extracted filters
    let searchUrl = `/products?search=${encodeURIComponent(searchTerm)}`;
    
    if (extractedFilters) {
      if (extractedFilters.maxPrice) searchUrl += `&maxPrice=${extractedFilters.maxPrice}`;
      if (extractedFilters.color) searchUrl += `&color=${extractedFilters.color}`;
      if (extractedFilters.size) searchUrl += `&size=${extractedFilters.size}`;
      if (extractedFilters.rating) searchUrl += `&rating=${extractedFilters.rating}`;
      if (extractedFilters.onSale) searchUrl += `&onSale=true`;
      if (extractedFilters.inStock) searchUrl += `&inStock=true`;
    }

    navigate(searchUrl);
    setQuery('');
    setShowDropdown(false);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setExtractedFilters(null);
    setSpellingSuggestion(null);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-lg'}`}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search products... (e.g., 'red shoes under $50')"
            className={`w-full pl-10 pr-10 py-2 ${isMobile ? 'rounded-lg' : 'rounded-full'} border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all`}
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {/* Spelling Suggestion */}
            {spellingSuggestion && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 text-sm">
                  <FiAlertCircle className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-gray-600 dark:text-gray-400">Did you mean:</span>
                  <button
                    onClick={() => {
                      setQuery(spellingSuggestion);
                      handleSearch(spellingSuggestion);
                    }}
                    className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                  >
                    {spellingSuggestion}
                  </button>
                </div>
              </div>
            )}

            {/* Extracted Filters */}
            {extractedFilters && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Detected Filters:</p>
                <div className="flex flex-wrap gap-2">
                  {extractedFilters.maxPrice && (
                    <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs border border-gray-300 dark:border-gray-600">
                      Price: Under ${extractedFilters.maxPrice}
                    </span>
                  )}
                  {extractedFilters.color && (
                    <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs border border-gray-300 dark:border-gray-600 capitalize">
                      Color: {extractedFilters.color}
                    </span>
                  )}
                  {extractedFilters.size && (
                    <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs border border-gray-300 dark:border-gray-600">
                      Size: {extractedFilters.size}
                    </span>
                  )}
                  {extractedFilters.rating && (
                    <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs border border-gray-300 dark:border-gray-600">
                      {extractedFilters.rating}★ & Up
                    </span>
                  )}
                  {extractedFilters.onSale && (
                    <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs border border-gray-300 dark:border-gray-600">
                      On Sale
                    </span>
                  )}
                  {extractedFilters.inStock && (
                    <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs border border-gray-300 dark:border-gray-600">
                      In Stock
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Suggestions</p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <FiSearch className="text-gray-400" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Recent</p>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <FiClock className="text-gray-400" />
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Trending Searches */}
            {!query && trendingSearches.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Trending</p>
                {trendingSearches.map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(trend.keyword)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FiTrendingUp className="text-primary-600 dark:text-primary-400" />
                      <span>{trend.keyword}</span>
                    </div>
                    <span className="text-xs text-gray-500">{trend.count} searches</span>
                  </button>
                ))}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                Searching...
              </div>
            )}

            {/* No Results */}
            {query && !isLoading && suggestions.length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                No suggestions found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntelligentSearch;
