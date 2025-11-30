import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTruck, FiPackage, FiZap, FiHome, FiClock, 
  FiCalendar, FiCheck, FiInfo, FiDollarSign
} from 'react-icons/fi';

// Shipping configuration - mirrors server-side but for frontend display
const ZONE_RATES = {
  local: { baseRate: 0, minDays: 1, maxDays: 2 },
  regional: { baseRate: 100, minDays: 2, maxDays: 4 },
  national: { baseRate: 200, minDays: 3, maxDays: 7 },
  international: { baseRate: 1500, minDays: 7, maxDays: 21 },
};

const SHIPPING_METHODS = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    multiplier: 1,
    icon: FiPackage,
    description: 'Regular delivery',
    color: 'purple',
  },
  {
    id: 'express',
    name: 'Express Delivery',
    multiplier: 1.5,
    icon: FiTruck,
    description: '2x faster delivery',
    color: 'cyan',
  },
  {
    id: 'same-day',
    name: 'Same Day Delivery',
    multiplier: 3,
    icon: FiZap,
    description: 'Get it today!',
    localOnly: true,
    color: 'yellow',
  },
  {
    id: 'pickup',
    name: 'Store Pickup',
    multiplier: 0,
    icon: FiHome,
    description: 'Pick up from nearest store',
    color: 'green',
  },
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (9AM - 12PM)', icon: '🌅', surcharge: 0 },
  { id: 'afternoon', label: 'Afternoon (12PM - 5PM)', icon: '☀️', surcharge: 0 },
  { id: 'evening', label: 'Evening (5PM - 9PM)', icon: '🌙', surcharge: 50 },
  { id: 'any', label: 'Any Time', icon: '⏰', surcharge: 0 },
];

const MAJOR_CITIES = {
  lahore: 'local',
  faisalabad: 'regional',
  rawalpindi: 'regional',
  multan: 'regional',
  karachi: 'regional',
  islamabad: 'regional',
  peshawar: 'regional',
  quetta: 'national',
};

const FREE_SHIPPING_THRESHOLD = 5000;

const ShippingCalculator = ({
  city,
  country = 'Pakistan',
  cartTotal,
  onShippingChange,
  selectedMethod: initialMethod = 'standard',
  selectedSlot: initialSlot = 'any',
  selectedDate: initialDate = null,
}) => {
  const [selectedMethod, setSelectedMethod] = useState(initialMethod);
  const [selectedSlot, setSelectedSlot] = useState(initialSlot);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [shippingCost, setShippingCost] = useState(0);

  // Determine zone based on city
  const getZone = () => {
    if (country.toLowerCase() !== 'pakistan') return 'international';
    const normalizedCity = city?.toLowerCase().trim() || '';
    return MAJOR_CITIES[normalizedCity] || 'national';
  };

  const zone = getZone();
  const zoneRates = ZONE_RATES[zone];

  // Filter available methods
  const availableMethods = SHIPPING_METHODS.filter(method => {
    if (method.localOnly && zone !== 'local') return false;
    return true;
  });

  // Calculate shipping cost
  useEffect(() => {
    if (!city) return;

    const method = SHIPPING_METHODS.find(m => m.id === selectedMethod) || SHIPPING_METHODS[0];
    const slot = TIME_SLOTS.find(s => s.id === selectedSlot) || TIME_SLOTS[3];
    
    let cost = zoneRates.baseRate * method.multiplier;
    cost += slot.surcharge;

    // Free shipping for orders above threshold (standard only)
    const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD && 
                           zone !== 'international' && 
                           selectedMethod === 'standard';
    
    if (isFreeShipping) {
      cost = 0;
    }

    setShippingCost(Math.round(cost));

    // Calculate estimated delivery
    let minDays = zoneRates.minDays;
    let maxDays = zoneRates.maxDays;
    
    if (selectedMethod === 'express') {
      minDays = Math.ceil(minDays / 2);
      maxDays = Math.ceil(maxDays / 2);
    } else if (selectedMethod === 'same-day') {
      minDays = 0;
      maxDays = 0;
    } else if (selectedMethod === 'pickup') {
      minDays = 1;
      maxDays = 1;
    }

    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    // Notify parent component
    if (onShippingChange) {
      onShippingChange({
        method: selectedMethod,
        methodName: method.name,
        timeSlot: selectedSlot,
        slotLabel: slot.label,
        date: selectedDate,
        cost: isFreeShipping ? 0 : Math.round(cost),
        zone,
        estimatedDelivery: {
          minDays,
          maxDays,
          minDate,
          maxDate,
        },
        freeShipping: isFreeShipping,
      });
    }
  }, [city, selectedMethod, selectedSlot, selectedDate, cartTotal, zone]);

  // Generate available dates
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    let startOffset = zoneRates.minDays;
    
    if (selectedMethod === 'express') {
      startOffset = Math.ceil(startOffset / 2);
    } else if (selectedMethod === 'same-day') {
      startOffset = 0;
    }

    for (let i = startOffset; i < startOffset + 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays for non-same-day
      if (date.getDay() === 0 && selectedMethod !== 'same-day') continue;

      dates.push({
        date,
        formatted: date.toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' }),
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }

    return dates;
  };

  const availableDates = getAvailableDates();
  const freeShippingEligible = cartTotal >= FREE_SHIPPING_THRESHOLD && zone !== 'international';
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;

  return (
    <div className="space-y-6">
      {/* Zone Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiTruck className="text-cyan-400" />
          <span className="text-white font-semibold">Shipping Options</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          zone === 'local' ? 'bg-green-500/20 text-green-400' :
          zone === 'regional' ? 'bg-cyan-500/20 text-cyan-400' :
          zone === 'national' ? 'bg-purple-500/20 text-purple-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {zone.charAt(0).toUpperCase() + zone.slice(1)} Delivery
        </span>
      </div>

      {/* Free Shipping Progress */}
      {!freeShippingEligible && zone !== 'international' && selectedMethod === 'standard' && (
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 text-sm">
              Add Rs. {amountToFreeShipping.toLocaleString()} more for FREE shipping!
            </span>
            <span className="text-cyan-400 text-sm font-medium">
              {Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
            />
          </div>
        </div>
      )}

      {freeShippingEligible && selectedMethod === 'standard' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 p-4 rounded-xl border border-green-500/30 flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <FiCheck className="text-green-400 text-xl" />
          </div>
          <div>
            <p className="text-green-400 font-semibold">🎉 You qualify for FREE shipping!</p>
            <p className="text-green-300/70 text-sm">Orders above Rs. {FREE_SHIPPING_THRESHOLD.toLocaleString()}</p>
          </div>
        </motion.div>
      )}

      {/* Shipping Methods */}
      <div>
        <label className="block text-purple-300 text-sm mb-3">Delivery Method</label>
        <div className="grid grid-cols-2 gap-3">
          {availableMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            const methodCost = method.multiplier === 0 ? 0 : Math.round(zoneRates.baseRate * method.multiplier);
            const isFree = (freeShippingEligible && method.id === 'standard') || method.multiplier === 0;

            return (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-xl text-left transition-all ${
                  isSelected 
                    ? 'bg-gradient-to-r from-purple-600/50 to-blue-600/50 border-2 border-cyan-500' 
                    : 'bg-purple-900/30 border-2 border-transparent hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-cyan-500/30' : 'bg-purple-500/20'
                  }`}>
                    <Icon className={isSelected ? 'text-cyan-400' : 'text-purple-400'} />
                  </div>
                  {isSelected && <FiCheck className="text-cyan-400" />}
                </div>
                <p className={`font-semibold mt-2 ${isSelected ? 'text-white' : 'text-purple-300'}`}>
                  {method.name}
                </p>
                <p className="text-purple-400/70 text-xs mt-1">{method.description}</p>
                <p className={`mt-2 font-bold ${isFree ? 'text-green-400' : 'text-cyan-400'}`}>
                  {isFree ? 'FREE' : `Rs. ${methodCost}`}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Delivery Date Selection */}
      {selectedMethod !== 'pickup' && (
        <div>
          <label className="block text-purple-300 text-sm mb-3">
            <FiCalendar className="inline mr-2" />
            Preferred Delivery Date
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {availableDates.map((dateInfo, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(dateInfo.date)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl text-center transition-all min-w-[100px] ${
                  selectedDate?.toDateString() === dateInfo.date.toDateString()
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
                }`}
              >
                <p className="text-xs opacity-70">
                  {dateInfo.isToday ? 'Today' : dateInfo.isTomorrow ? 'Tomorrow' : dateInfo.formatted.split(' ')[0]}
                </p>
                <p className="font-bold text-lg">
                  {dateInfo.formatted.split(' ').slice(1).join(' ')}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Time Slot Selection */}
      {selectedMethod !== 'pickup' && selectedMethod !== 'same-day' && (
        <div>
          <label className="block text-purple-300 text-sm mb-3">
            <FiClock className="inline mr-2" />
            Preferred Time Slot
          </label>
          <div className="grid grid-cols-2 gap-3">
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedSlot === slot.id;
              return (
                <motion.button
                  key={slot.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`p-3 rounded-xl flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600/50 to-blue-600/50 border-2 border-cyan-500'
                      : 'bg-purple-900/30 border-2 border-transparent hover:border-purple-500/50'
                  }`}
                >
                  <span className="text-2xl">{slot.icon}</span>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-purple-300'}`}>
                      {slot.label}
                    </p>
                    {slot.surcharge > 0 && (
                      <p className="text-xs text-yellow-400">+Rs. {slot.surcharge}</p>
                    )}
                  </div>
                  {isSelected && <FiCheck className="text-cyan-400" />}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Shipping Cost Summary */}
      <div className="bg-gradient-to-r from-gray-900/80 to-purple-900/30 p-4 rounded-xl border border-purple-500/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiDollarSign className="text-cyan-400" />
            <span className="text-purple-300">Shipping Cost</span>
          </div>
          <span className={`text-xl font-bold ${shippingCost === 0 ? 'text-green-400' : 'text-cyan-400'}`}>
            {shippingCost === 0 ? 'FREE' : `Rs. ${shippingCost}`}
          </span>
        </div>
        {selectedDate && (
          <p className="text-purple-400/70 text-sm mt-2">
            Estimated delivery: {selectedDate.toLocaleDateString('en-PK', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ShippingCalculator;
