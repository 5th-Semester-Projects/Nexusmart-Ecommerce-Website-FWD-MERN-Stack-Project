import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiActivity, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const SizeRecommender = ({ isOpen, onClose, productId, availableSizes, onSizeSelect }) => {
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    chest: '',
    waist: '',
  });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeasurements((prev) => ({ ...prev, [name]: value }));
  };

  const getRecommendation = async () => {
    if (!measurements.height || !measurements.weight) {
      toast.error('Please provide at least height and weight');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/recommendations/size', {
        productId,
        height: parseFloat(measurements.height),
        weight: parseFloat(measurements.weight),
        chest: measurements.chest ? parseFloat(measurements.chest) : undefined,
        waist: measurements.waist ? parseFloat(measurements.waist) : undefined,
      });

      setRecommendation(data);
      
      if (data.recommendedSize) {
        toast.success(`Recommended size: ${data.recommendedSize}`);
      }
    } catch (error) {
      console.error('Size recommendation error:', error);
      toast.error('Failed to get size recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSize = () => {
    if (recommendation?.recommendedSize) {
      onSizeSelect(recommendation.recommendedSize);
      onClose();
      setMeasurements({ height: '', weight: '', chest: '', waist: '' });
      setRecommendation(null);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Size Recommender" size="lg">
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Get Your Perfect Fit</p>
              <p>Provide your measurements to get an AI-powered size recommendation based on your body type.</p>
            </div>
          </div>
        </div>

        {/* Measurements Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Height (cm)"
              name="height"
              type="number"
              value={measurements.height}
              onChange={handleInputChange}
              placeholder="170"
              icon={FiUser}
              required
            />
            <Input
              label="Weight (kg)"
              name="weight"
              type="number"
              value={measurements.weight}
              onChange={handleInputChange}
              placeholder="65"
              icon={FiActivity}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Chest (cm)"
              name="chest"
              type="number"
              value={measurements.chest}
              onChange={handleInputChange}
              placeholder="90 (optional)"
            />
            <Input
              label="Waist (cm)"
              name="waist"
              type="number"
              value={measurements.waist}
              onChange={handleInputChange}
              placeholder="75 (optional)"
            />
          </div>
        </div>

        {/* Get Recommendation Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={getRecommendation}
          loading={loading}
          disabled={!measurements.height || !measurements.weight}
        >
          Get Size Recommendation
        </Button>

        {/* Recommendation Result */}
        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border border-primary-200 dark:border-primary-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recommended Size</p>
                  <p className="text-3xl font-bold gradient-text">{recommendation.recommendedSize}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${getConfidenceColor(recommendation.confidence)}`}>
                  {getConfidenceLabel(recommendation.confidence)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(recommendation.confidence * 100)}% match
                </p>
              </div>
            </div>

            {/* Reasoning */}
            {recommendation.reasoning && (
              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation.reasoning}</p>
              </div>
            )}

            {/* Alternative Sizes */}
            {recommendation.alternatives && recommendation.alternatives.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Alternative Sizes:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {recommendation.alternatives.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-sm border border-gray-300 dark:border-gray-600"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <Button variant="primary" fullWidth onClick={handleSelectSize}>
                Select This Size
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setRecommendation(null);
                  setMeasurements({ height: '', weight: '', chest: '', waist: '' });
                }}
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}

        {/* Size Chart Reference */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Size Chart Reference:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
            {availableSizes?.map((size) => (
              <div key={size} className="p-2 bg-white dark:bg-gray-700 rounded text-center font-semibold">
                {size}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SizeRecommender;
