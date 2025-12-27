import mongoose from 'mongoose';

/**
 * Currency Model for Multi-Currency Support
 */

const currencySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    maxLength: 3
  },
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },

  // Exchange Rates
  exchangeRate: {
    type: Number,
    required: true,
    default: 1
  },
  baseCurrency: {
    type: String,
    default: 'USD'
  },

  // Display Settings
  decimalPlaces: {
    type: Number,
    default: 2
  },
  symbolPosition: {
    type: String,
    enum: ['before', 'after'],
    default: 'before'
  },
  thousandsSeparator: {
    type: String,
    default: ','
  },
  decimalSeparator: {
    type: String,
    default: '.'
  },

  // Status
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },

  // Auto-update settings
  autoUpdate: { type: Boolean, default: true },
  lastUpdated: Date,
  updateSource: String, // API source for rates

  // Countries using this currency
  countries: [String],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * Exchange Rate History
 */
const exchangeRateHistorySchema = new mongoose.Schema({
  currency: {
    type: String,
    required: true
  },
  baseCurrency: {
    type: String,
    default: 'USD'
  },
  rate: {
    type: Number,
    required: true
  },
  source: String,
  recordedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * User Currency Preference
 */
const userCurrencyPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  preferredCurrency: {
    type: String,
    default: 'USD'
  },
  autoDetect: {
    type: Boolean,
    default: true
  },
  detectedCurrency: String,
  detectedCountry: String,

  // Display Preferences
  showOriginalPrice: { type: Boolean, default: false },
  roundPrices: { type: Boolean, default: false },

  updatedAt: { type: Date, default: Date.now }
});

// Supported currencies with initial data
const defaultCurrencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79 },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', exchangeRate: 278.50, symbolPosition: 'before' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 83.12 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 3.67, symbolPosition: 'after' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', exchangeRate: 3.75, symbolPosition: 'after' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: 1.36 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: 1.53 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 149.50, decimalPlaces: 0 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', exchangeRate: 7.24 },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', exchangeRate: 109.75 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', exchangeRate: 4.72 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', exchangeRate: 1.34 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', exchangeRate: 32.15 },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', exchangeRate: 3.64, symbolPosition: 'after' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', exchangeRate: 0.31, decimalPlaces: 3, symbolPosition: 'after' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', exchangeRate: 0.38, decimalPlaces: 3, symbolPosition: 'after' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع', exchangeRate: 0.38, decimalPlaces: 3, symbolPosition: 'after' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', exchangeRate: 30.90 }
];

// Format price method
currencySchema.methods.formatPrice = function (amount) {
  const convertedAmount = amount * this.exchangeRate;
  const formatted = convertedAmount.toFixed(this.decimalPlaces);
  const parts = formatted.split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);

  const finalAmount = parts.join(this.decimalSeparator);

  return this.symbolPosition === 'before'
    ? `${this.symbol}${finalAmount}`
    : `${finalAmount} ${this.symbol}`;
};

// Convert amount between currencies
currencySchema.statics.convert = async function (amount, fromCurrency, toCurrency) {
  const from = await this.findOne({ code: fromCurrency });
  const to = await this.findOne({ code: toCurrency });

  if (!from || !to) {
    throw new Error('Currency not found');
  }

  // Convert to base currency (USD) first, then to target
  const inBase = amount / from.exchangeRate;
  const converted = inBase * to.exchangeRate;

  return Math.round(converted * Math.pow(10, to.decimalPlaces)) / Math.pow(10, to.decimalPlaces);
};

currencySchema.index({ isActive: 1, isDefault: 1 });

export const Currency = mongoose.model('Currency', currencySchema);
export const ExchangeRateHistory = mongoose.model('ExchangeRateHistory', exchangeRateHistorySchema);
export const UserCurrencyPreference = mongoose.model('UserCurrencyPreference', userCurrencyPreferenceSchema);
export { defaultCurrencies };
