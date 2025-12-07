import { Currency, ExchangeRateHistory, UserCurrencyPreference } from '../models/Currency.js';
import axios from 'axios';

/**
 * Currency Controller
 * Handles multi-currency operations, exchange rates, and user preferences
 */

// Get all active currencies
export const getAllCurrencies = async (req, res, next) => {
  try {
    const currencies = await Currency.find({ isActive: true })
      .select('code name symbol exchangeRate decimalPlaces symbolPosition flag')
      .sort({ code: 1 });

    res.status(200).json({
      success: true,
      count: currencies.length,
      currencies
    });
  } catch (error) {
    next(error);
  }
};

// Get single currency details
export const getCurrency = async (req, res, next) => {
  try {
    const currency = await Currency.findOne({ code: req.params.code.toUpperCase() });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    res.status(200).json({ success: true, currency });
  } catch (error) {
    next(error);
  }
};

// Convert amount between currencies
export const convertCurrency = async (req, res, next) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Amount, from currency, and to currency are required'
      });
    }

    const fromCurrency = await Currency.findOne({ code: from.toUpperCase() });
    const toCurrency = await Currency.findOne({ code: to.toUpperCase() });

    if (!fromCurrency || !toCurrency) {
      return res.status(404).json({
        success: false,
        message: 'One or both currencies not found'
      });
    }

    // Convert to USD first, then to target currency
    const amountInUSD = amount / fromCurrency.exchangeRate;
    const convertedAmount = amountInUSD * toCurrency.exchangeRate;

    res.status(200).json({
      success: true,
      originalAmount: amount,
      originalCurrency: from.toUpperCase(),
      convertedAmount: parseFloat(convertedAmount.toFixed(toCurrency.decimalPlaces)),
      targetCurrency: to.toUpperCase(),
      exchangeRate: toCurrency.exchangeRate / fromCurrency.exchangeRate,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
};

// Detect user's currency based on IP/location
export const detectCurrency = async (req, res, next) => {
  try {
    // Try to get user's country from IP
    const ip = req.ip || req.connection.remoteAddress;

    // Default currency mapping by country
    const currencyByCountry = {
      'US': 'USD', 'GB': 'GBP', 'DE': 'EUR', 'FR': 'EUR',
      'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR', 'PK': 'PKR',
      'AE': 'AED', 'SA': 'SAR', 'AU': 'AUD', 'CA': 'CAD'
    };

    // Try to detect from headers
    const acceptLanguage = req.headers['accept-language'];
    let detectedCountry = 'US'; // Default

    if (acceptLanguage) {
      const locale = acceptLanguage.split(',')[0];
      const country = locale.split('-')[1];
      if (country) {
        detectedCountry = country.toUpperCase();
      }
    }

    const detectedCurrency = currencyByCountry[detectedCountry] || 'USD';

    res.status(200).json({
      success: true,
      currency: detectedCurrency,
      country: detectedCountry,
      source: 'auto-detect'
    });
  } catch (error) {
    next(error);
  }
};

// Get user's currency preference
export const getUserPreference = async (req, res, next) => {
  try {
    const preference = await UserCurrencyPreference.findOne({ user: req.user._id })
      .populate('preferredCurrency', 'code name symbol');

    if (!preference) {
      return res.status(200).json({
        success: true,
        preference: {
          preferredCurrency: 'USD',
          autoDetect: true,
          showOriginalPrice: false,
          roundPrices: false
        }
      });
    }

    res.status(200).json({ success: true, preference });
  } catch (error) {
    next(error);
  }
};

// Update user's currency preference
export const updateUserPreference = async (req, res, next) => {
  try {
    const { preferredCurrency, autoDetect, showOriginalPrice, roundPrices } = req.body;

    const preference = await UserCurrencyPreference.findOneAndUpdate(
      { user: req.user._id },
      {
        preferredCurrency,
        autoDetect,
        showOriginalPrice,
        roundPrices,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Currency preference updated',
      preference
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update exchange rates
export const updateExchangeRates = async (req, res, next) => {
  try {
    // Fetch latest rates from external API (example using exchangerate-api)
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;

    if (!apiKey) {
      // Manual update from request body
      const { rates } = req.body;

      for (const [code, rate] of Object.entries(rates)) {
        const currency = await Currency.findOne({ code });
        if (currency) {
          // Store old rate in history
          await ExchangeRateHistory.create({
            currency: currency._id,
            rate: currency.exchangeRate,
            previousRate: currency.exchangeRate,
            source: 'manual'
          });

          currency.exchangeRate = rate;
          currency.lastUpdated = new Date();
          await currency.save();
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Exchange rates updated manually'
      });
    }

    // Fetch from API
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
    const { conversion_rates } = response.data;

    const currencies = await Currency.find({ isActive: true });

    for (const currency of currencies) {
      const newRate = conversion_rates[currency.code];
      if (newRate && newRate !== currency.exchangeRate) {
        // Store in history
        await ExchangeRateHistory.create({
          currency: currency._id,
          rate: newRate,
          previousRate: currency.exchangeRate,
          source: 'api'
        });

        currency.exchangeRate = newRate;
        currency.lastUpdated = new Date();
        await currency.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Exchange rates updated from API',
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Add new currency
export const addCurrency = async (req, res, next) => {
  try {
    const { code, name, symbol, exchangeRate, decimalPlaces, symbolPosition, flag } = req.body;

    const existingCurrency = await Currency.findOne({ code: code.toUpperCase() });
    if (existingCurrency) {
      return res.status(400).json({
        success: false,
        message: 'Currency already exists'
      });
    }

    const currency = await Currency.create({
      code: code.toUpperCase(),
      name,
      symbol,
      exchangeRate,
      decimalPlaces: decimalPlaces || 2,
      symbolPosition: symbolPosition || 'before',
      flag,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Currency added successfully',
      currency
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle currency status
export const toggleCurrencyStatus = async (req, res, next) => {
  try {
    const currency = await Currency.findOne({ code: req.params.code.toUpperCase() });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    currency.isActive = !currency.isActive;
    await currency.save();

    res.status(200).json({
      success: true,
      message: `Currency ${currency.isActive ? 'activated' : 'deactivated'}`,
      currency
    });
  } catch (error) {
    next(error);
  }
};

// Get exchange rate history
export const getExchangeRateHistory = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { days = 30 } = req.query;

    const currency = await Currency.findOne({ code: code.toUpperCase() });
    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const history = await ExchangeRateHistory.find({
      currency: currency._id,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      currency: code.toUpperCase(),
      history
    });
  } catch (error) {
    next(error);
  }
};

// Format price for display
export const formatPrice = async (req, res, next) => {
  try {
    const { amount, currencyCode } = req.body;

    const currency = await Currency.findOne({ code: currencyCode?.toUpperCase() || 'USD' });
    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    const formattedAmount = amount.toFixed(currency.decimalPlaces);
    const formatted = currency.symbolPosition === 'before'
      ? `${currency.symbol}${formattedAmount}`
      : `${formattedAmount} ${currency.symbol}`;

    res.status(200).json({
      success: true,
      formatted,
      amount: parseFloat(formattedAmount),
      currency: currency.code
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllCurrencies,
  getCurrency,
  convertCurrency,
  detectCurrency,
  getUserPreference,
  updateUserPreference,
  updateExchangeRates,
  addCurrency,
  toggleCurrencyStatus,
  getExchangeRateHistory,
  formatPrice
};
