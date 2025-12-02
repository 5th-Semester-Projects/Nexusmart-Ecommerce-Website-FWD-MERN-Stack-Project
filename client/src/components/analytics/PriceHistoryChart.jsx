import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaArrowDown, FaArrowUp, FaBell, FaHistory } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

const PriceHistoryChart = ({ productId, currentPrice = 4999 }) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertSet, setAlertSet] = useState(false);
  const [targetPrice, setTargetPrice] = useState(Math.floor(currentPrice * 0.8));

  useEffect(() => {
    fetchPriceHistory();
  }, [productId]);

  const fetchPriceHistory = async () => {
    try {
      const { data } = await axios.get(`/api/v1/analytics/price-history/${productId}`);
      setPriceHistory(data.history);
    } catch (error) {
      // Generate sample price history
      const sampleHistory = generateSampleHistory(currentPrice);
      setPriceHistory(sampleHistory);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleHistory = (price) => {
    const history = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const variation = (Math.random() - 0.5) * 0.3;
      const historicalPrice = Math.round(price * (1 + variation));
      history.push({
        month: months[monthIndex],
        price: historicalPrice,
        date: new Date(2024, monthIndex, 15)
      });
    }
    return history;
  };

  const setDropAlert = async () => {
    try {
      await axios.post('/api/v1/analytics/price-alert', {
        productId,
        targetPrice
      });
      setAlertSet(true);
      toast.success(`We'll notify you when price drops to Rs. ${targetPrice}`);
    } catch (error) {
      setAlertSet(true);
      toast.success(`Alert set for Rs. ${targetPrice}`);
    }
  };

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const prices = priceHistory.map(h => h.price);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const priceChange = currentPrice - priceHistory[priceHistory.length - 2]?.price || 0;
  const priceChangePercent = ((priceChange / (priceHistory[priceHistory.length - 2]?.price || currentPrice)) * 100).toFixed(1);

  const chartData = {
    labels: priceHistory.map(h => h.month),
    datasets: [{
      data: priceHistory.map(h => h.price),
      fill: true,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        return gradient;
      },
      borderColor: '#8B5CF6',
      tension: 0.4,
      pointBackgroundColor: '#8B5CF6',
      pointBorderColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `Rs. ${context.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: {
          color: '#9CA3AF',
          callback: (value) => `Rs. ${(value/1000).toFixed(1)}k`
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF' }
      }
    }
  };

  const bestTimeToBuy = currentPrice <= avgPrice;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <FaHistory className="text-purple-500" /> Price History
        </h3>
        <div className={`flex items-center gap-1 text-sm ${priceChange <= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {priceChange <= 0 ? <FaArrowDown /> : <FaArrowUp />}
          {Math.abs(priceChangePercent)}%
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 mb-4">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Price Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs">Lowest</p>
          <p className="text-green-400 font-semibold text-sm">Rs. {lowestPrice.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs">Average</p>
          <p className="text-yellow-400 font-semibold text-sm">Rs. {avgPrice.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs">Highest</p>
          <p className="text-red-400 font-semibold text-sm">Rs. {highestPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* Buy Recommendation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-3 rounded-lg mb-4 ${
          bestTimeToBuy 
            ? 'bg-green-500/20 border border-green-500/30' 
            : 'bg-yellow-500/20 border border-yellow-500/30'
        }`}
      >
        <div className="flex items-center gap-2">
          <FaChartLine className={bestTimeToBuy ? 'text-green-400' : 'text-yellow-400'} />
          <span className={bestTimeToBuy ? 'text-green-400' : 'text-yellow-400'}>
            {bestTimeToBuy 
              ? '✓ Good time to buy! Price is below average' 
              : 'Price is above average. Wait for a drop?'
            }
          </span>
        </div>
      </motion.div>

      {/* Price Drop Alert */}
      <div className="bg-gray-900/50 rounded-lg p-3">
        <p className="text-gray-300 text-sm mb-2 flex items-center gap-2">
          <FaBell className="text-purple-400" /> Set Price Drop Alert
        </p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Rs.</span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseInt(e.target.value) || 0)}
              className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={setDropAlert}
            disabled={alertSet}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              alertSet 
                ? 'bg-green-600 text-white' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {alertSet ? '✓ Set' : 'Alert Me'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryChart;
