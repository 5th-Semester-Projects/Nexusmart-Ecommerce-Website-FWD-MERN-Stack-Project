import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon,
  CalendarIcon,
  BellIcon,
  PhotoIcon,
  XMarkIcon,
  ChevronRightIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Live Tracking Map Component
export const LiveTrackingMap = ({ order }) => {
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lng: -74.006 });
  const [estimatedArrival, setEstimatedArrival] = useState('Today, 3:00 PM');

  const trackingSteps = [
    { id: 1, status: 'completed', title: 'Order Placed', time: 'Dec 3, 10:00 AM', icon: CubeIcon },
    { id: 2, status: 'completed', title: 'Processing', time: 'Dec 3, 11:30 AM', icon: BuildingStorefrontIcon },
    { id: 3, status: 'completed', title: 'Shipped', time: 'Dec 4, 2:00 PM', icon: TruckIcon },
    { id: 4, status: 'current', title: 'Out for Delivery', time: 'Today, 9:00 AM', icon: TruckIcon },
    { id: 5, status: 'pending', title: 'Delivered', time: 'Est. Today, 3:00 PM', icon: MapPinIcon },
  ];

  useEffect(() => {
    // Simulate driver movement
    const interval = setInterval(() => {
      setCurrentLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800">
      {/* Map Placeholder */}
      <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <MapIcon className="w-20 h-20 text-gray-700" />
        </div>
        
        {/* Driver Marker */}
        <motion.div
          animate={{
            x: [0, 10, -5, 0],
            y: [0, -5, 5, 0]
          }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-500 rotate-45" />
          </div>
        </motion.div>

        {/* Destination Marker */}
        <div className="absolute bottom-8 right-8">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <MapPinIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* ETA Badge */}
        <div className="absolute top-4 left-4 px-4 py-2 bg-black/60 backdrop-blur rounded-full">
          <div className="flex items-center gap-2 text-white text-sm">
            <ClockIcon className="w-4 h-4 text-green-400" />
            <span>Arriving by {estimatedArrival}</span>
          </div>
        </div>
      </div>

      {/* Driver Info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
            JD
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium">John Driver</h4>
            <p className="text-gray-400 text-sm">White Toyota Camry • ABC 1234</p>
          </div>
          <div className="flex gap-2">
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button className="p-3 bg-purple-500 hover:bg-purple-600 rounded-full transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tracking Steps */}
      <div className="p-4">
        <h4 className="text-white font-medium mb-4">Delivery Progress</h4>
        <div className="space-y-4">
          {trackingSteps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'current' ? 'bg-purple-500 animate-pulse' :
                  'bg-gray-700'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircleIcon className="w-5 h-5 text-white" />
                  ) : (
                    <step.icon className="w-5 h-5 text-white" />
                  )}
                </div>
                {index < trackingSteps.length - 1 && (
                  <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8 ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className={`font-medium ${
                  step.status === 'pending' ? 'text-gray-500' : 'text-white'
                }`}>
                  {step.title}
                </p>
                <p className={`text-sm ${
                  step.status === 'current' ? 'text-purple-400' : 'text-gray-500'
                }`}>
                  {step.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Delivery Scheduling Component
export const DeliveryScheduler = ({ onSchedule, isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isExpress, setIsExpress] = useState(false);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toISOString().split('T')[0],
      isToday: i === 0
    });
  }

  const slots = [
    { id: 'morning', label: 'Morning', time: '9:00 AM - 12:00 PM', available: true },
    { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 4:00 PM', available: true },
    { id: 'evening', label: 'Evening', time: '4:00 PM - 8:00 PM', available: true },
    { id: 'night', label: 'Night', time: '8:00 PM - 10:00 PM', available: false },
  ];

  const handleSchedule = () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot');
      return;
    }
    onSchedule?.({ date: selectedDate, slot: selectedSlot, isExpress });
    toast.success('Delivery scheduled successfully!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-800"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Schedule Delivery</h3>
                <p className="text-gray-400 text-sm">Choose when you want it</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Express Delivery Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl mb-6 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <TruckIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Express Delivery</p>
                <p className="text-purple-300 text-sm">2-hour delivery (+$9.99)</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpress(!isExpress)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isExpress ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: isExpress ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
              />
            </button>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-3">Select Date</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => (
                <button
                  key={d.full}
                  onClick={() => setSelectedDate(d.full)}
                  className={`flex-shrink-0 w-16 p-3 rounded-xl text-center transition-all ${
                    selectedDate === d.full
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <p className="text-xs opacity-70">{d.day}</p>
                  <p className="text-lg font-bold">{d.date}</p>
                  <p className="text-xs opacity-70">{d.month}</p>
                  {d.isToday && (
                    <p className="text-xs mt-1 text-blue-300">Today</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-3">Select Time Slot</label>
            <div className="grid grid-cols-2 gap-3">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && setSelectedSlot(slot.id)}
                  disabled={!slot.available}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedSlot === slot.id
                      ? 'bg-blue-500 text-white'
                      : slot.available
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <p className="font-medium">{slot.label}</p>
                  <p className="text-sm opacity-70">{slot.time}</p>
                  {!slot.available && (
                    <p className="text-xs text-red-400 mt-1">Unavailable</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSchedule}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            Confirm Schedule
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Pickup Points Map Component
export const PickupPointsSelector = ({ onSelect }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [filter, setFilter] = useState('all');

  const pickupPoints = [
    { id: 1, name: 'Amazon Locker - Downtown', type: 'locker', distance: '0.3 mi', hours: '24/7', address: '123 Main St' },
    { id: 2, name: 'CVS Pharmacy', type: 'store', distance: '0.5 mi', hours: '7 AM - 10 PM', address: '456 Oak Ave' },
    { id: 3, name: 'UPS Store', type: 'store', distance: '0.8 mi', hours: '9 AM - 7 PM', address: '789 Pine Rd' },
    { id: 4, name: 'USPS Office', type: 'post', distance: '1.2 mi', hours: '9 AM - 5 PM', address: '321 Elm St' },
    { id: 5, name: 'Smart Locker - Mall', type: 'locker', distance: '1.5 mi', hours: '24/7', address: 'Shopping Mall' },
  ];

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'locker', label: 'Lockers' },
    { key: 'store', label: 'Stores' },
    { key: 'post', label: 'Post Office' },
  ];

  const filteredPoints = pickupPoints.filter(
    p => filter === 'all' || p.type === filter
  );

  const handleSelect = (point) => {
    setSelectedPoint(point.id);
    onSelect?.(point);
    toast.success(`Selected: ${point.name}`);
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800">
      {/* Map Area */}
      <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center">
        <MapIcon className="w-16 h-16 text-gray-700" />
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-white text-sm">
          {pickupPoints.length} locations nearby
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-4">Choose Pickup Point</h3>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Pickup Points List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {filteredPoints.map((point) => (
            <motion.button
              key={point.id}
              whileHover={{ x: 5 }}
              onClick={() => handleSelect(point)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                selectedPoint === point.id
                  ? 'bg-blue-500/20 border-2 border-blue-500'
                  : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{point.name}</p>
                  <p className="text-gray-400 text-sm">{point.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-blue-400">{point.distance}</span>
                    <span className="text-gray-500">{point.hours}</span>
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Delivery Instructions Component
export const DeliveryInstructions = ({ onSave }) => {
  const [instructions, setInstructions] = useState('');
  const [safePlace, setSafePlace] = useState('');
  const [requireSignature, setRequireSignature] = useState(false);
  const [photoProof, setPhotoProof] = useState(true);

  const safePlaces = [
    { id: 'door', label: 'Leave at door' },
    { id: 'neighbor', label: 'Leave with neighbor' },
    { id: 'garage', label: 'Leave in garage' },
    { id: 'mailbox', label: 'Leave in mailbox' },
    { id: 'none', label: 'Hand to me directly' },
  ];

  const handleSave = () => {
    onSave?.({
      instructions,
      safePlace,
      requireSignature,
      photoProof
    });
    toast.success('Delivery preferences saved!');
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <MapPinIcon className="w-5 h-5 text-blue-500" />
        Delivery Instructions
      </h3>

      {/* Safe Place Selection */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-3">If I'm not home...</label>
        <div className="grid grid-cols-2 gap-2">
          {safePlaces.map((place) => (
            <button
              key={place.id}
              onClick={() => setSafePlace(place.id)}
              className={`p-3 rounded-lg text-sm text-left transition-all ${
                safePlace === place.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {place.label}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Instructions */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Special Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., Ring doorbell twice, call upon arrival, gate code: 1234..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none resize-none"
        />
      </div>

      {/* Options */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
          <div className="flex items-center gap-3">
            <PhotoIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-white font-medium">Photo Proof of Delivery</p>
              <p className="text-gray-500 text-sm">Get a photo when delivered</p>
            </div>
          </div>
          <button
            onClick={() => setPhotoProof(!photoProof)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              photoProof ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: photoProof ? 24 : 2 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-white font-medium">Require Signature</p>
              <p className="text-gray-500 text-sm">Must sign upon delivery</p>
            </div>
          </div>
          <button
            onClick={() => setRequireSignature(!requireSignature)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              requireSignature ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: requireSignature ? 24 : 2 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
            />
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
      >
        Save Preferences
      </button>
    </div>
  );
};

export default {
  LiveTrackingMap,
  DeliveryScheduler,
  PickupPointsSelector,
  DeliveryInstructions
};
