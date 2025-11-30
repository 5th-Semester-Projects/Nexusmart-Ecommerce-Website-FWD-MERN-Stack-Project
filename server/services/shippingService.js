/**
 * Shipping Calculator Service
 * Handles area-wise delivery charges, time slots, and shipping rates
 */

// Pakistan major cities for local/regional calculation
const MAJOR_CITIES = {
  // Punjab
  lahore: { zone: 'local', baseRate: 0 },
  faisalabad: { zone: 'regional', baseRate: 100 },
  rawalpindi: { zone: 'regional', baseRate: 120 },
  multan: { zone: 'regional', baseRate: 150 },
  gujranwala: { zone: 'regional', baseRate: 100 },
  sialkot: { zone: 'regional', baseRate: 120 },

  // Sindh
  karachi: { zone: 'regional', baseRate: 200 },
  hyderabad: { zone: 'regional', baseRate: 180 },
  sukkur: { zone: 'national', baseRate: 250 },

  // KPK
  peshawar: { zone: 'regional', baseRate: 180 },
  abbottabad: { zone: 'regional', baseRate: 200 },
  mardan: { zone: 'national', baseRate: 220 },

  // Balochistan
  quetta: { zone: 'national', baseRate: 300 },
  gwadar: { zone: 'national', baseRate: 400 },

  // Islamabad
  islamabad: { zone: 'regional', baseRate: 100 },

  // AJK
  muzaffarabad: { zone: 'national', baseRate: 250 },
  mirpur: { zone: 'national', baseRate: 220 },
};

// Shipping zone rates (PKR)
const ZONE_RATES = {
  local: {
    baseRate: 0, // Free for local (same city)
    perKg: 0,
    minDays: 1,
    maxDays: 2,
  },
  regional: {
    baseRate: 100,
    perKg: 20,
    minDays: 2,
    maxDays: 4,
  },
  national: {
    baseRate: 200,
    perKg: 30,
    minDays: 3,
    maxDays: 7,
  },
  international: {
    baseRate: 1500,
    perKg: 500,
    minDays: 7,
    maxDays: 21,
  },
};

// Shipping method multipliers
const SHIPPING_METHODS = {
  standard: {
    name: 'Standard Delivery',
    multiplier: 1,
    icon: '📦',
    description: 'Regular delivery',
  },
  express: {
    name: 'Express Delivery',
    multiplier: 1.5,
    icon: '🚚',
    description: '2x faster delivery',
  },
  'same-day': {
    name: 'Same Day Delivery',
    multiplier: 3,
    icon: '⚡',
    description: 'Get it today! (Local only)',
    localOnly: true,
  },
  pickup: {
    name: 'Store Pickup',
    multiplier: 0,
    icon: '🏪',
    description: 'Pick up from nearest store',
  },
};

// Delivery time slots
const TIME_SLOTS = [
  {
    id: 'morning',
    label: 'Morning (9AM - 12PM)',
    startTime: '09:00',
    endTime: '12:00',
    surcharge: 0,
    icon: '🌅',
  },
  {
    id: 'afternoon',
    label: 'Afternoon (12PM - 5PM)',
    startTime: '12:00',
    endTime: '17:00',
    surcharge: 0,
    icon: '☀️',
  },
  {
    id: 'evening',
    label: 'Evening (5PM - 9PM)',
    startTime: '17:00',
    endTime: '21:00',
    surcharge: 50, // PKR 50 extra for evening
    icon: '🌙',
  },
  {
    id: 'any',
    label: 'Any Time',
    startTime: '09:00',
    endTime: '21:00',
    surcharge: 0,
    icon: '⏰',
  },
];

// Free shipping threshold (PKR)
const FREE_SHIPPING_THRESHOLD = 5000;

/**
 * Determine shipping zone based on city
 * @param {string} city - Destination city
 * @param {string} country - Destination country
 * @returns {Object} Zone information
 */
export const getShippingZone = (city, country = 'Pakistan') => {
  if (country.toLowerCase() !== 'pakistan') {
    return {
      zone: 'international',
      ...ZONE_RATES.international,
    };
  }

  const normalizedCity = city.toLowerCase().trim();
  const cityInfo = MAJOR_CITIES[normalizedCity];

  if (cityInfo) {
    return {
      zone: cityInfo.zone,
      city: normalizedCity,
      ...ZONE_RATES[cityInfo.zone],
      customBaseRate: cityInfo.baseRate,
    };
  }

  // Default to national for unknown cities
  return {
    zone: 'national',
    city: normalizedCity,
    ...ZONE_RATES.national,
  };
};

/**
 * Calculate shipping cost
 * @param {Object} params - Calculation parameters
 * @returns {Object} Shipping calculation result
 */
export const calculateShipping = ({
  city,
  country = 'Pakistan',
  cartTotal,
  cartWeight = 1, // kg
  shippingMethod = 'standard',
  timeSlot = 'any',
}) => {
  const zone = getShippingZone(city, country);
  const method = SHIPPING_METHODS[shippingMethod] || SHIPPING_METHODS.standard;
  const slot = TIME_SLOTS.find((s) => s.id === timeSlot) || TIME_SLOTS.find((s) => s.id === 'any');

  // Check if same-day is available
  if (shippingMethod === 'same-day' && zone.zone !== 'local') {
    return {
      success: false,
      error: 'Same-day delivery is only available for local deliveries',
    };
  }

  // Base shipping calculation
  let baseShipping = zone.customBaseRate || zone.baseRate;

  // Add weight-based cost
  const weightCost = cartWeight > 1 ? (cartWeight - 1) * zone.perKg : 0;

  // Apply method multiplier
  let shippingCost = (baseShipping + weightCost) * method.multiplier;

  // Add time slot surcharge
  shippingCost += slot.surcharge;

  // Apply free shipping if eligible
  const freeShippingEligible = cartTotal >= FREE_SHIPPING_THRESHOLD && zone.zone !== 'international';
  if (freeShippingEligible && shippingMethod === 'standard') {
    shippingCost = 0;
  }

  // Calculate estimated delivery dates
  let minDays = zone.minDays;
  let maxDays = zone.maxDays;

  if (shippingMethod === 'express') {
    minDays = Math.ceil(minDays / 2);
    maxDays = Math.ceil(maxDays / 2);
  } else if (shippingMethod === 'same-day') {
    minDays = 0;
    maxDays = 0;
  } else if (shippingMethod === 'pickup') {
    minDays = 1;
    maxDays = 1;
  }

  const today = new Date();
  const minDeliveryDate = new Date(today);
  minDeliveryDate.setDate(today.getDate() + minDays);
  const maxDeliveryDate = new Date(today);
  maxDeliveryDate.setDate(today.getDate() + maxDays);

  return {
    success: true,
    zone: zone.zone,
    city: zone.city,
    shippingCost: Math.round(shippingCost),
    originalCost: Math.round((baseShipping + weightCost) * method.multiplier),
    freeShippingEligible,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping: freeShippingEligible ? 0 : FREE_SHIPPING_THRESHOLD - cartTotal,
    method: {
      type: shippingMethod,
      name: method.name,
      icon: method.icon,
      description: method.description,
    },
    timeSlot: slot,
    estimatedDelivery: {
      minDays,
      maxDays,
      minDate: minDeliveryDate,
      maxDate: maxDeliveryDate,
      formatted:
        minDays === maxDays
          ? `${minDays} day${minDays !== 1 ? 's' : ''}`
          : `${minDays}-${maxDays} days`,
    },
    breakdown: {
      baseRate: zone.customBaseRate || zone.baseRate,
      weightCost,
      methodMultiplier: method.multiplier,
      timeSlotSurcharge: slot.surcharge,
    },
  };
};

/**
 * Get available shipping methods for a zone
 * @param {string} zone - Shipping zone
 * @returns {Array} Available shipping methods
 */
export const getAvailableShippingMethods = (zone) => {
  return Object.entries(SHIPPING_METHODS)
    .filter(([key, method]) => {
      if (method.localOnly && zone !== 'local') return false;
      return true;
    })
    .map(([key, method]) => ({
      id: key,
      ...method,
    }));
};

/**
 * Get available time slots
 * @returns {Array} Time slots
 */
export const getTimeSlots = () => TIME_SLOTS;

/**
 * Get available delivery dates for next 7 days
 * @param {string} zone - Shipping zone
 * @param {string} shippingMethod - Selected shipping method
 * @returns {Array} Available dates
 */
export const getAvailableDeliveryDates = (zone, shippingMethod = 'standard') => {
  const dates = [];
  const today = new Date();
  const zoneInfo = ZONE_RATES[zone] || ZONE_RATES.national;

  let startOffset = zoneInfo.minDays;
  if (shippingMethod === 'express') {
    startOffset = Math.ceil(startOffset / 2);
  } else if (shippingMethod === 'same-day' && zone === 'local') {
    startOffset = 0;
  }

  for (let i = startOffset; i < startOffset + 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip Sundays for regular delivery
    if (date.getDay() === 0 && shippingMethod !== 'same-day') continue;

    dates.push({
      date,
      formatted: date.toLocaleDateString('en-PK', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      dayName: date.toLocaleDateString('en-PK', { weekday: 'long' }),
      isToday: i === 0,
      isTomorrow: i === 1,
    });
  }

  return dates;
};

/**
 * Validate shipping address
 * @param {Object} address - Address to validate
 * @returns {Object} Validation result
 */
export const validateShippingAddress = (address) => {
  const errors = {};

  if (!address.street || address.street.length < 10) {
    errors.street = 'Please enter a complete street address (min 10 characters)';
  }
  if (!address.city || address.city.length < 2) {
    errors.city = 'Please enter a valid city';
  }
  if (!address.state || address.state.length < 2) {
    errors.state = 'Please enter a valid state/province';
  }
  if (!address.country) {
    errors.country = 'Please select a country';
  }
  if (!address.zipCode || !/^\d{5}$/.test(address.zipCode)) {
    errors.zipCode = 'Please enter a valid 5-digit ZIP code';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  calculateShipping,
  getShippingZone,
  getAvailableShippingMethods,
  getTimeSlots,
  getAvailableDeliveryDates,
  validateShippingAddress,
  ZONE_RATES,
  SHIPPING_METHODS,
  TIME_SLOTS,
  FREE_SHIPPING_THRESHOLD,
};
