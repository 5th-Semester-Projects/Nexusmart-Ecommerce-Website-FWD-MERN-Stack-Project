import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  ChevronDown, 
  Check,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

const CurrencySelector = () => {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCurrencies();
    detectCurrency();
    loadSavedPreference();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get('/api/v1/currency/currencies');
      setCurrencies(response.data.currencies);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      // Fallback currencies
      setCurrencies([
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs' }
      ]);
    }
  };

  const detectCurrency = async () => {
    try {
      const response = await axios.get('/api/v1/currency/detect');
      const detectedCurrency = response.data.currency;
      
      // Only auto-set if no preference saved
      if (!localStorage.getItem('preferredCurrency')) {
        setSelectedCurrency(detectedCurrency);
        localStorage.setItem('preferredCurrency', detectedCurrency);
      }
    } catch (error) {
      console.error('Error detecting currency:', error);
    }
  };

  const loadSavedPreference = () => {
    const saved = localStorage.getItem('preferredCurrency');
    if (saved) {
      setSelectedCurrency(saved);
    }
  };

  const handleCurrencyChange = async (currencyCode) => {
    setSelectedCurrency(currencyCode);
    setIsOpen(false);
    localStorage.setItem('preferredCurrency', currencyCode);

    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('currencyChange', { 
      detail: { currency: currencyCode } 
    }));

    // Save preference to server if logged in
    try {
      await axios.put('/api/v1/currency/preference', {
        preferredCurrency: currencyCode
      });
    } catch (error) {
      // User might not be logged in
    }
  };

  const getCurrentCurrency = () => {
    return currencies.find(c => c.code === selectedCurrency) || { code: 'USD', symbol: '$' };
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getCurrentCurrency().symbol} {selectedCurrency}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-50 overflow-hidden"
          >
            <div className="p-3 border-b dark:border-gray-700">
              <h3 className="font-medium text-gray-800 dark:text-white text-sm">Select Currency</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedCurrency === currency.code ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {currency.symbol}
                    </span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {currency.code}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currency.name}
                      </p>
                    </div>
                  </div>
                  {selectedCurrency === currency.code && (
                    <Check className="w-4 h-4 text-purple-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

// Price Display Component with Currency Conversion
export const PriceDisplay = ({ amount, originalCurrency = 'USD', className = '' }) => {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const [displaySymbol, setDisplaySymbol] = useState('$');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  useEffect(() => {
    const handleCurrencyChange = (e) => {
      convertPrice(e.detail.currency);
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    
    // Initial conversion
    const saved = localStorage.getItem('preferredCurrency');
    if (saved && saved !== originalCurrency) {
      convertPrice(saved);
    }

    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange);
    };
  }, [amount, originalCurrency]);

  const convertPrice = async (toCurrency) => {
    if (toCurrency === originalCurrency) {
      setDisplayAmount(amount);
      setDisplaySymbol(getCurrencySymbol(originalCurrency));
      return;
    }

    try {
      const response = await axios.post('/api/v1/currency/convert', {
        amount,
        from: originalCurrency,
        to: toCurrency
      });
      setDisplayAmount(response.data.convertedAmount);
      setDisplaySymbol(getCurrencySymbol(toCurrency));
      setSelectedCurrency(toCurrency);
    } catch (error) {
      console.error('Conversion error:', error);
    }
  };

  const getCurrencySymbol = (code) => {
    const symbols = {
      USD: '$', EUR: '€', GBP: '£', PKR: 'Rs', INR: '₹',
      AED: 'د.إ', SAR: 'ر.س', JPY: '¥', CNY: '¥'
    };
    return symbols[code] || code;
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <span className={className}>
      {displaySymbol}{formatPrice(displayAmount)}
    </span>
  );
};

export default CurrencySelector;
