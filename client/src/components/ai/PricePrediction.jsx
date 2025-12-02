import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaBell, FaArrowDown, FaArrowUp, FaClock } from 'react-icons/fa';
import axios from 'axios';

const PricePrediction = ({ productId, currentPrice }) => {
  const [prediction, setPrediction] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertSet, setAlertSet] = useState(false);

  useEffect(() => {
    fetchPrediction();
    fetchPriceHistory();
  }, [productId]);

  const fetchPrediction = async () => {
    try {
      const { data } = await axios.get(`/api/v1/ai/price-prediction/${productId}`);
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Failed to fetch prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const { data } = await axios.get(`/api/v1/analytics/price-history/${productId}`);
      setPriceHistory(data.history);
    } catch (error) {
      console.error('Failed to fetch price history:', error);
    }
  };

  const setPriceAlert = async () => {
    try {
      await axios.post('/api/v1/stock-alert/create', {
        productId,
        type: 'price_drop',
        targetPrice: prediction?.predictedLow || currentPrice * 0.9
      });
      setAlertSet(true);
    } catch (error) {
      console.error('Failed to set alert:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl p-4 h-32" />
    );
  }

  const getPredictionColor = () => {
    if (!prediction) return 'gray';
    if (prediction.trend === 'down') return 'green';
    if (prediction.trend === 'up') return 'red';
    return 'yellow';
  };

  const getPredictionIcon = () => {
    if (!prediction) return null;
    if (prediction.trend === 'down') return <FaArrowDown className="text-green-500" />;
    if (prediction.trend === 'up') return <FaArrowUp className="text-red-500" />;
    return <FaClock className="text-yellow-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-purple-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <FaChartLine className="text-purple-600" />
          Price Prediction
        </h3>
        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">
          AI Powered
        </span>
      </div>

      {prediction ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-full bg-${getPredictionColor()}-100 dark:bg-${getPredictionColor()}-900/30`}>
              {getPredictionIcon()}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {prediction.trend === 'down' 
                  ? 'Price expected to drop!' 
                  : prediction.trend === 'up'
                  ? 'Price may increase soon'
                  : 'Price is stable'}
              </p>
              <p className="font-bold text-lg">
                {prediction.trend === 'down' ? (
                  <span className="text-green-600">Wait for better price</span>
                ) : (
                  <span className="text-red-600">Buy now!</span>
                )}
              </p>
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
              <p className="text-xs text-gray-500">Lowest (30d)</p>
              <p className="font-bold text-green-600">${prediction.predictedLow?.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
              <p className="text-xs text-gray-500">Current</p>
              <p className="font-bold">${currentPrice?.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
              <p className="text-xs text-gray-500">Highest (30d)</p>
              <p className="font-bold text-red-600">${prediction.predictedHigh?.toFixed(2)}</p>
            </div>
          </div>

          {/* Best Time to Buy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <FaClock className="inline mr-2 text-purple-600" />
              Best time to buy: <span className="font-bold">{prediction.bestTimeToBuy || 'Now'}</span>
            </p>
          </div>

          {/* Price Alert Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={setPriceAlert}
            disabled={alertSet}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 ${
              alertSet
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
            }`}
          >
            <FaBell />
            {alertSet ? 'Alert Set!' : 'Set Price Drop Alert'}
          </motion.button>
        </>
      ) : (
        <p className="text-gray-500 text-center py-4">
          Unable to predict price for this product
        </p>
      )}

      {/* Mini Price Chart */}
      {priceHistory.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Price History (Last 30 days)</p>
          <div className="flex items-end h-16 gap-1">
            {priceHistory.slice(-14).map((point, idx) => (
              <div
                key={idx}
                className="flex-1 bg-purple-400 dark:bg-purple-600 rounded-t"
                style={{
                  height: `${(point.price / Math.max(...priceHistory.map(p => p.price))) * 100}%`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PricePrediction;
