import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { Currency, ExchangeRateHistory, UserCurrencyPreference } from '../models/Currency.js';

const router = express.Router();

// Get all active currencies
router.get('/currencies', async (req, res, next) => {
  try {
    const currencies = await Currency.find({ isActive: true })
      .select('code name symbol exchangeRate decimalPlaces symbolPosition')
      .sort({ code: 1 });

    res.status(200).json({ success: true, currencies });
  } catch (error) {
    next(error);
  }
});

// Get user's currency preference
router.get('/preference', isAuthenticatedUser, async (req, res, next) => {
  try {
    let preference = await UserCurrencyPreference.findOne({ user: req.user._id });

    if (!preference) {
      preference = { preferredCurrency: 'USD', autoDetect: true };
    }

    res.status(200).json({ success: true, preference });
  } catch (error) {
    next(error);
  }
});

// Update user's currency preference
router.put('/preference', isAuthenticatedUser, async (req, res, next) => {
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

    res.status(200).json({ success: true, preference });
  } catch (error) {
    next(error);
  }
});

// Convert price
router.post('/convert', async (req, res, next) => {
  try {
    const { amount, from, to } = req.body;

    const converted = await Currency.convert(amount, from || 'USD', to);
    const toCurrency = await Currency.findOne({ code: to });

    res.status(200).json({
      success: true,
      originalAmount: amount,
      convertedAmount: converted,
      from: from || 'USD',
      to,
      formattedAmount: toCurrency ? toCurrency.formatPrice(amount) : converted
    });
  } catch (error) {
    next(error);
  }
});

// Auto-detect currency by IP/country
router.get('/detect', async (req, res, next) => {
  try {
    // Get country from request headers or IP geolocation
    const country = req.headers['cf-ipcountry'] ||
      req.headers['x-vercel-ip-country'] ||
      'US';

    // Country to currency mapping
    const countryToCurrency = {
      'US': 'USD',
      'GB': 'GBP',
      'EU': 'EUR',
      'DE': 'EUR',
      'FR': 'EUR',
      'PK': 'PKR',
      'IN': 'INR',
      'AE': 'AED',
      'SA': 'SAR',
      'CA': 'CAD',
      'AU': 'AUD',
      'JP': 'JPY',
      'CN': 'CNY',
      'BD': 'BDT',
      'MY': 'MYR',
      'SG': 'SGD',
      'TR': 'TRY',
      'QA': 'QAR',
      'KW': 'KWD',
      'BH': 'BHD',
      'OM': 'OMR',
      'EG': 'EGP'
    };

    const detectedCurrency = countryToCurrency[country] || 'USD';

    res.status(200).json({
      success: true,
      country,
      currency: detectedCurrency
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Add/update currency
router.post('/admin/currency',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const currency = await Currency.findOneAndUpdate(
        { code: req.body.code },
        req.body,
        { new: true, upsert: true }
      );

      res.status(200).json({ success: true, currency });
    } catch (error) {
      next(error);
    }
  }
);

// Admin: Update exchange rates
router.post('/admin/update-rates',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const { rates } = req.body;

      for (const [code, rate] of Object.entries(rates)) {
        await Currency.findOneAndUpdate(
          { code },
          { exchangeRate: rate, lastUpdated: new Date() }
        );

        // Save to history
        await ExchangeRateHistory.create({
          currency: code,
          rate,
          source: 'manual'
        });
      }

      res.status(200).json({ success: true, message: 'Rates updated' });
    } catch (error) {
      next(error);
    }
  }
);

// Admin: Fetch rates from external API
router.post('/admin/fetch-rates',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      // In production, use a real exchange rate API like:
      // - Open Exchange Rates
      // - Currency Layer
      // - XE

      // Simulated API response
      const currencies = await Currency.find({ isActive: true, autoUpdate: true });

      for (const currency of currencies) {
        // Update with simulated rate (in production, fetch from API)
        currency.lastUpdated = new Date();
        currency.updateSource = 'api';
        await currency.save();

        await ExchangeRateHistory.create({
          currency: currency.code,
          rate: currency.exchangeRate,
          source: 'api'
        });
      }

      res.status(200).json({
        success: true,
        message: `Updated ${currencies.length} currencies`
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
