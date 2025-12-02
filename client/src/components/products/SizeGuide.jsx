import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiInfo, FiCheck } from 'react-icons/fi';

// Size Chart Data for different product categories
const sizeCharts = {
  clothing: {
    title: 'Clothing Size Guide',
    unit: 'inches',
    headers: ['Size', 'Chest', 'Waist', 'Hip', 'Length'],
    rows: [
      ['XS', '32-34', '26-28', '34-36', '26'],
      ['S', '34-36', '28-30', '36-38', '27'],
      ['M', '38-40', '30-32', '38-40', '28'],
      ['L', '40-42', '32-34', '40-42', '29'],
      ['XL', '44-46', '36-38', '44-46', '30'],
      ['XXL', '48-50', '40-42', '48-50', '31'],
    ],
    tips: [
      'Measure your body, not your clothes',
      'Use a soft measuring tape',
      'Stand straight with arms at sides',
      'For between sizes, choose larger size',
    ],
  },
  shoes: {
    title: 'Shoe Size Guide',
    unit: 'cm / US',
    headers: ['PK/US', 'UK', 'EU', 'Foot Length (cm)'],
    rows: [
      ['6', '5.5', '38', '24.0'],
      ['7', '6.5', '39', '24.5'],
      ['8', '7.5', '41', '25.5'],
      ['9', '8.5', '42', '26.0'],
      ['10', '9.5', '43', '27.0'],
      ['11', '10.5', '45', '28.0'],
      ['12', '11.5', '46', '29.0'],
    ],
    tips: [
      'Measure feet in the evening when they are largest',
      'Stand when measuring',
      'Measure both feet and use the larger measurement',
      'Leave 1cm space from toe to shoe end',
    ],
  },
  kids: {
    title: 'Kids Size Guide',
    unit: 'inches',
    headers: ['Age', 'Size', 'Height (cm)', 'Chest', 'Waist'],
    rows: [
      ['2-3Y', '2T', '92-98', '21', '20'],
      ['3-4Y', '3T', '98-104', '22', '21'],
      ['4-5Y', '4', '104-110', '23', '21.5'],
      ['5-6Y', '5', '110-116', '24', '22'],
      ['6-7Y', '6', '116-122', '25', '22.5'],
      ['8-9Y', '8', '128-134', '27', '24'],
      ['10-11Y', '10', '140-146', '29', '25'],
    ],
    tips: [
      'Kids grow quickly - consider sizing up',
      'Check sleeve and pant lengths',
      'Look for adjustable waistbands',
    ],
  },
  accessories: {
    title: 'Accessories Size Guide',
    unit: 'inches',
    headers: ['Item', 'Small', 'Medium', 'Large', 'XL'],
    rows: [
      ['Belt Length', '32"', '36"', '40"', '44"'],
      ['Watch Band', '6.5"', '7"', '7.5"', '8"'],
      ['Ring (US)', '5-6', '7-8', '9-10', '11-12'],
      ['Hat Circum.', '21.5"', '22"', '22.5"', '23"'],
      ['Glove Palm', '7.5"', '8"', '8.5"', '9"'],
    ],
    tips: [
      'For belts, order 2" larger than waist size',
      'For rings, measure at end of day',
      'For watches, fit 2 fingers under band',
    ],
  },
};

// Measurement Guide Component
const MeasurementGuide = ({ category }) => {
  const guides = {
    clothing: [
      { name: 'Chest', desc: 'Measure around the fullest part of your chest' },
      { name: 'Waist', desc: 'Measure around your natural waistline' },
      { name: 'Hip', desc: 'Measure around the fullest part of your hips' },
      { name: 'Length', desc: 'Measure from shoulder to desired hem' },
    ],
    shoes: [
      { name: 'Foot Length', desc: 'Stand on paper and mark heel to longest toe' },
      { name: 'Foot Width', desc: 'Measure the widest part of your foot' },
    ],
    kids: [
      { name: 'Height', desc: 'Stand against wall, measure floor to top of head' },
      { name: 'Chest', desc: 'Measure around the fullest part of chest' },
    ],
    accessories: [
      { name: 'Waist for Belt', desc: 'Measure where you wear your belt' },
      { name: 'Wrist', desc: 'Measure around your wrist bone' },
    ],
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-white flex items-center gap-2">
        <FiInfo className="text-cyan-400" />
        How to Measure
      </h4>
      <div className="grid gap-2">
        {guides[category]?.map((guide, index) => (
          <div key={index} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center text-xs font-bold">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-white">{guide.name}</p>
              <p className="text-sm text-gray-400">{guide.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Size Guide Modal
export const SizeGuideModal = ({ 
  isOpen, 
  onClose, 
  category = 'clothing',
  selectedSize = null,
  onSizeSelect = () => {},
}) => {
  const [activeTab, setActiveTab] = useState('chart');
  const chart = sizeCharts[category] || sizeCharts.clothing;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {chart.title}
                </h2>
                <p className="text-sm text-gray-400 mt-1">All measurements in {chart.unit}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <FiX className="text-xl text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-4 border-b border-white/10">
              <button
                onClick={() => setActiveTab('chart')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'chart'
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Size Chart
              </button>
              <button
                onClick={() => setActiveTab('measure')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'measure'
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                How to Measure
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {activeTab === 'chart' ? (
                <div className="space-y-6">
                  {/* Size Chart Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          {chart.headers.map((header, index) => (
                            <th
                              key={index}
                              className="px-4 py-3 text-left text-sm font-semibold text-cyan-400 bg-white/5 first:rounded-l-xl last:rounded-r-xl"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chart.rows.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            onClick={() => onSizeSelect(row[0])}
                            className={`cursor-pointer transition-colors ${
                              selectedSize === row[0]
                                ? 'bg-purple-600/20'
                                : 'hover:bg-white/5'
                            }`}
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className={`px-4 py-3 text-sm ${
                                  cellIndex === 0
                                    ? 'font-bold text-white'
                                    : 'text-gray-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {selectedSize === row[0] && cellIndex === 0 && (
                                    <FiCheck className="text-cyan-400" />
                                  )}
                                  {cell}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tips */}
                  <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl p-4 border border-purple-500/20">
                    <h4 className="font-medium text-white mb-3">💡 Pro Tips</h4>
                    <ul className="space-y-2">
                      {chart.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-cyan-400 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <MeasurementGuide category={category} />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <p className="text-center text-sm text-gray-400">
                Need help? Contact us at <span className="text-cyan-400">support@nexusmart.com</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Size Selector with Guide Button
export const SizeSelector = ({ 
  sizes = [], 
  selectedSize, 
  onSelect,
  category = 'clothing',
  outOfStockSizes = [],
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Select Size</label>
        <button
          onClick={() => setShowGuide(true)}
          className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
        >
          <FiInfo className="text-xs" />
          Size Guide
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isOutOfStock = outOfStockSizes.includes(size);
          return (
            <button
              key={size}
              onClick={() => !isOutOfStock && onSelect(size)}
              disabled={isOutOfStock}
              className={`min-w-[44px] h-11 px-4 rounded-xl font-medium transition-all ${
                selectedSize === size
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/30'
                  : isOutOfStock
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed line-through'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        category={category}
        selectedSize={selectedSize}
        onSizeSelect={(size) => {
          if (sizes.includes(size) && !outOfStockSizes.includes(size)) {
            onSelect(size);
          }
        }}
      />
    </div>
  );
};

// Quick Size Finder
export const QuickSizeFinder = ({ category = 'clothing', onSizeFound }) => {
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    height: '',
  });

  const findSize = () => {
    const { chest, waist, height } = measurements;
    const chart = sizeCharts[category];
    
    if (!chart || !chest) return null;

    // Simple size matching logic
    const chestNum = parseInt(chest);
    
    if (category === 'clothing') {
      if (chestNum <= 34) return 'XS';
      if (chestNum <= 36) return 'S';
      if (chestNum <= 40) return 'M';
      if (chestNum <= 42) return 'L';
      if (chestNum <= 46) return 'XL';
      return 'XXL';
    }
    
    return 'M'; // Default
  };

  const recommendedSize = findSize();

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4">🔍 Find Your Perfect Size</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Chest (inches)</label>
          <input
            type="number"
            value={measurements.chest}
            onChange={(e) => setMeasurements(prev => ({ ...prev, chest: e.target.value }))}
            placeholder="38"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Waist (inches)</label>
          <input
            type="number"
            value={measurements.waist}
            onChange={(e) => setMeasurements(prev => ({ ...prev, waist: e.target.value }))}
            placeholder="32"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Height (cm)</label>
          <input
            type="number"
            value={measurements.height}
            onChange={(e) => setMeasurements(prev => ({ ...prev, height: e.target.value }))}
            placeholder="175"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      {recommendedSize && measurements.chest && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30"
        >
          <div>
            <p className="text-sm text-gray-300">Recommended Size</p>
            <p className="text-2xl font-bold text-green-400">{recommendedSize}</p>
          </div>
          <button
            onClick={() => onSizeFound?.(recommendedSize)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors"
          >
            Select This Size
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SizeGuideModal;
