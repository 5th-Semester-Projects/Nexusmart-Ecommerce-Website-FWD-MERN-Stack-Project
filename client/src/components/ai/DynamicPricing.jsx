import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity,
  FiClock, FiAlertCircle, FiCheck, FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

const DynamicPricing = ({ product, onPriceUpdate }) => {
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState([]);
  const [demandLevel, setDemandLevel] = useState('normal');
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [autoAdjust, setAutoAdjust] = useState(false);

  useEffect(() => {
    fetchPricingData();
    const interval = setInterval(fetchPricingData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [product?._id]);

  const fetchPricingData = async () => {
    try {
      const response = await axios.get(`/api/ai/dynamic-pricing/${product?._id}`);
      setPricingData(response.data);
      setPriceHistory(response.data.priceHistory || []);
      setDemandLevel(response.data.demandLevel || 'normal');
      setSuggestedPrice(response.data.suggestedPrice);
    } catch (error) {
      // Generate demo data
      generateDemoData();
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = () => {
    const basePrice = product?.price || 100;
    const history = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.2;
      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(basePrice * (1 + variation) * 100) / 100,
        demand: Math.floor(Math.random() * 100)
      });
    }
    
    setPriceHistory(history);
    
    const currentDemand = Math.random();
    setDemandLevel(currentDemand > 0.7 ? 'high' : currentDemand < 0.3 ? 'low' : 'normal');
    
    const adjustment = demandLevel === 'high' ? 1.15 : demandLevel === 'low' ? 0.9 : 1;
    setSuggestedPrice(Math.round(basePrice * adjustment * 100) / 100);
    
    setPricingData({
      currentPrice: basePrice,
      minPrice: basePrice * 0.7,
      maxPrice: basePrice * 1.5,
      competitors: [
        { name: 'Amazon', price: basePrice * 1.05 },
        { name: 'eBay', price: basePrice * 0.95 },
        { name: 'Walmart', price: basePrice * 1.02 }
      ],
      factors: {
        demand: currentDemand,
        inventory: Math.random(),
        competition: Math.random(),
        seasonality: Math.random()
      }
    });
  };

  const applyPrice = async (newPrice) => {
    try {
      await axios.put(`/api/ai/dynamic-pricing/${product?._id}`, { price: newPrice });
      if (onPriceUpdate) onPriceUpdate(newPrice);
    } catch (error) {
      console.error('Failed to update price:', error);
    }
  };

  const chartData = {
    labels: priceHistory.map(h => h.date.slice(5)),
    datasets: [
      {
        label: 'Price',
        data: priceHistory.map(h => h.price),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Demand',
        data: priceHistory.map(h => h.demand),
        borderColor: '#10B981',
        backgroundColor: 'transparent',
        tension: 0.4,
        yAxisID: 'demand'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.label === 'Price') return `$${ctx.parsed.y.toFixed(2)}`;
            return `${ctx.parsed.y}% demand`;
          }
        }
      }
    },
    scales: {
      y: { 
        type: 'linear', 
        position: 'left',
        ticks: { callback: (v) => `$${v}` }
      },
      demand: { 
        type: 'linear', 
        position: 'right',
        min: 0, max: 100,
        ticks: { callback: (v) => `${v}%` },
        grid: { drawOnChartArea: false }
      }
    }
  };

  const getDemandColor = () => {
    switch (demandLevel) {
      case 'high': return 'text-red-500 bg-red-100';
      case 'low': return 'text-blue-500 bg-blue-100';
      default: return 'text-green-500 bg-green-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiRefreshCw className="animate-spin text-3xl text-purple-500" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <FiActivity className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white">Dynamic Pricing</h2>
            <p className="text-sm text-gray-500">AI-powered price optimization</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoAdjust}
              onChange={(e) => setAutoAdjust(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="dark:text-gray-300">Auto-adjust</span>
          </label>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <p className="text-sm text-gray-500 mb-1">Current Price</p>
          <p className="text-2xl font-bold dark:text-white">
            ${pricingData?.currentPrice?.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <p className="text-sm text-gray-500 mb-1">Suggested Price</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-purple-500">
              ${suggestedPrice?.toFixed(2)}
            </p>
            {suggestedPrice > pricingData?.currentPrice ? (
              <FiTrendingUp className="text-green-500" />
            ) : (
              <FiTrendingDown className="text-red-500" />
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <p className="text-sm text-gray-500 mb-1">Demand Level</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDemandColor()}`}>
            {demandLevel.toUpperCase()}
          </span>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <p className="text-sm text-gray-500 mb-1">Price Range</p>
          <p className="text-lg font-semibold dark:text-white">
            ${pricingData?.minPrice?.toFixed(0)} - ${pricingData?.maxPrice?.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
        <h3 className="font-semibold mb-4 dark:text-white">Price & Demand History (30 Days)</h3>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Pricing Factors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {pricingData?.factors && Object.entries(pricingData.factors).map(([key, value]) => (
          <div key={key} className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32" cy="32" r="28"
                  stroke="currentColor"
                  className="text-gray-200 dark:text-gray-600"
                  strokeWidth="8" fill="none"
                />
                <circle
                  cx="32" cy="32" r="28"
                  stroke="currentColor"
                  className="text-purple-500"
                  strokeWidth="8" fill="none"
                  strokeDasharray={`${value * 176} 176`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold dark:text-white">
                {(value * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-sm text-gray-500 capitalize">{key}</p>
          </div>
        ))}
      </div>

      {/* Competitor Prices */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 dark:text-white">Competitor Prices</h3>
        <div className="space-y-2">
          {pricingData?.competitors?.map((comp, index) => (
            <div 
              key={index}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
            >
              <span className="dark:text-gray-300">{comp.name}</span>
              <span className={`font-semibold ${
                comp.price > pricingData.currentPrice ? 'text-green-500' : 'text-red-500'
              }`}>
                ${comp.price.toFixed(2)}
                {comp.price > pricingData.currentPrice ? (
                  <span className="text-xs ml-1">+{((comp.price - pricingData.currentPrice) / pricingData.currentPrice * 100).toFixed(0)}%</span>
                ) : (
                  <span className="text-xs ml-1">{((comp.price - pricingData.currentPrice) / pricingData.currentPrice * 100).toFixed(0)}%</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => applyPrice(suggestedPrice)}
          className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <FiCheck /> Apply Suggested Price
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchPricingData}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl"
        >
          <FiRefreshCw />
        </motion.button>
      </div>
    </div>
  );
};

export default DynamicPricing;
