import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiGlobe, 
  FiDollarSign, 
  FiRefreshCw,
  FiChevronDown,
  FiCheck
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrency } from '../../redux/slices/currencySlice';

/**
 * Currency Selector Component
 * Allows users to select their preferred currency
 */

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', flag: '🇵🇰' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
];

const CurrencySelector = ({ variant = 'dropdown', showLabel = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currencies, setCurrencies] = useState(POPULAR_CURRENCIES);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dispatch = useDispatch();
  const { selectedCurrency, exchangeRates } = useSelector(state => state.currency || { 
    selectedCurrency: 'USD',
    exchangeRates: {}
  });
  
  const currentCurrency = useMemo(() => 
    currencies.find(c => c.code === selectedCurrency) || currencies[0],
    [selectedCurrency, currencies]
  );
  
  useEffect(() => {
    fetchCurrencies();
    fetchExchangeRates();
  }, []);
  
  const fetchCurrencies = async () => {
    try {
      const response = await fetch('/api/v1/currency');
      const data = await response.json();
      
      if (data.success && data.currencies?.length > 0) {
        setCurrencies(data.currencies.map(c => ({
          code: c.code,
          name: c.name,
          symbol: c.symbol,
          flag: c.flag || getFlag(c.code)
        })));
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      // Keep using default currencies
    }
  };
  
  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('/api/v1/currency/rates');
      const data = await response.json();
      
      if (data.success) {
        setRates(data.rates);
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };
  
  const getFlag = (code) => {
    const curr = POPULAR_CURRENCIES.find(c => c.code === code);
    return curr?.flag || '🌍';
  };
  
  const handleSelectCurrency = async (currency) => {
    setLoading(true);
    try {
      dispatch(setCurrency({
        code: currency.code,
        symbol: currency.symbol,
        name: currency.name
      }));
      
      // Save preference to backend if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/v1/currency/preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ currency: currency.code })
        });
      }
      
      // Store in localStorage for non-logged in users
      localStorage.setItem('preferredCurrency', currency.code);
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving currency preference:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return currencies;
    const query = searchQuery.toLowerCase();
    return currencies.filter(c => 
      c.code.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query)
    );
  }, [currencies, searchQuery]);
  
  // Compact dropdown variant
  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span>{currentCurrency.flag}</span>
          <span>{currentCurrency.code}</span>
          <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50 max-h-64 overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {currencies.map(currency => (
              <button
                key={currency.code}
                onClick={() => handleSelectCurrency(currency)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  currency.code === selectedCurrency ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{currency.flag}</span>
                  <span>{currency.code}</span>
                </div>
                {currency.code === selectedCurrency && (
                  <FiCheck className="w-4 h-4 text-purple-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    );
  }
  
  // Full dropdown variant
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm hover:border-purple-500 transition-colors"
        disabled={loading}
      >
        <span className="text-xl">{currentCurrency.flag}</span>
        <div className="text-left">
          {showLabel && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Currency</p>
          )}
          <p className="font-medium text-gray-900 dark:text-white">
            {currentCurrency.code} ({currentCurrency.symbol})
          </p>
        </div>
        <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        {loading && (
          <FiRefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
        )}
      </button>
      
      {isOpen && (
        <motion.div
          className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-50 overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Search */}
          <div className="p-3 border-b dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search currency..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          {/* Currency List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCurrencies.map(currency => (
              <button
                key={currency.code}
                onClick={() => handleSelectCurrency(currency)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  currency.code === selectedCurrency 
                    ? 'bg-purple-50 dark:bg-purple-900/20' 
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currency.flag}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {currency.code}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currency.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    {currency.symbol}
                  </span>
                  {currency.code === selectedCurrency && (
                    <FiCheck className="w-5 h-5 text-purple-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {/* Exchange Rate Info */}
          {rates[selectedCurrency] && selectedCurrency !== 'USD' && (
            <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Exchange Rate
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  1 USD = {rates[selectedCurrency]} {selectedCurrency}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

/**
 * Price Display Component with Currency Conversion
 */
export const PriceDisplay = ({ amount, originalCurrency = 'USD', className = '' }) => {
  const { selectedCurrency, exchangeRates } = useSelector(state => state.currency || {
    selectedCurrency: 'USD',
    exchangeRates: {}
  });
  
  const currentCurrency = POPULAR_CURRENCIES.find(c => c.code === selectedCurrency) || POPULAR_CURRENCIES[0];
  
  const convertedAmount = useMemo(() => {
    if (selectedCurrency === originalCurrency) return amount;
    
    const rate = exchangeRates[selectedCurrency];
    if (!rate) return amount;
    
    // Convert to USD first if not already
    const usdAmount = originalCurrency === 'USD' 
      ? amount 
      : amount / (exchangeRates[originalCurrency] || 1);
    
    // Then convert to target currency
    return usdAmount * rate;
  }, [amount, selectedCurrency, originalCurrency, exchangeRates]);
  
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === 'JPY' ? 0 : 2,
      maximumFractionDigits: selectedCurrency === 'JPY' ? 0 : 2
    }).format(convertedAmount);
  }, [convertedAmount, selectedCurrency]);
  
  return (
    <span className={className}>
      {formattedPrice}
    </span>
  );
};

export default CurrencySelector;
