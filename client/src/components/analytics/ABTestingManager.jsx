import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, FiTarget, FiTrendingUp, FiPercent, FiUsers,
  FiPlay, FiPause, FiTrash2, FiPlus, FiEdit2, FiCheck, FiX
} from 'react-icons/fi';
import axios from 'axios';

// A/B Testing Context
const ABTestContext = createContext(null);

export const useABTest = (testName) => {
  const context = useContext(ABTestContext);
  if (!context) {
    console.warn('useABTest must be used within ABTestProvider');
    return { variant: 'control', trackConversion: () => {} };
  }
  
  return context.getVariant(testName);
};

// A/B Testing Provider
export const ABTestProvider = ({ children }) => {
  const [tests, setTests] = useState({});
  const [userVariants, setUserVariants] = useState({});

  useEffect(() => {
    // Load active tests
    loadTests();
    
    // Load user's assigned variants from localStorage
    const stored = localStorage.getItem('ab_variants');
    if (stored) {
      setUserVariants(JSON.parse(stored));
    }
  }, []);

  const loadTests = async () => {
    try {
      const response = await axios.get('/api/analytics/ab-tests/active');
      setTests(response.data);
    } catch (error) {
      // Demo tests
      setTests({
        'button_color': {
          id: 'button_color',
          name: 'CTA Button Color',
          variants: ['control', 'variant_a', 'variant_b'],
          weights: [34, 33, 33],
          status: 'running'
        },
        'checkout_layout': {
          id: 'checkout_layout',
          name: 'Checkout Layout',
          variants: ['control', 'variant_a'],
          weights: [50, 50],
          status: 'running'
        },
        'product_recommendations': {
          id: 'product_recommendations',
          name: 'Product Recommendations',
          variants: ['control', 'ai_powered'],
          weights: [50, 50],
          status: 'running'
        }
      });
    }
  };

  const getVariant = useCallback((testName) => {
    // Check if user already has a variant assigned
    if (userVariants[testName]) {
      return {
        variant: userVariants[testName],
        trackConversion: () => trackConversion(testName, userVariants[testName])
      };
    }

    const test = tests[testName];
    if (!test || test.status !== 'running') {
      return { variant: 'control', trackConversion: () => {} };
    }

    // Assign variant based on weights
    const random = Math.random() * 100;
    let cumulative = 0;
    let assignedVariant = test.variants[0];

    for (let i = 0; i < test.variants.length; i++) {
      cumulative += test.weights[i];
      if (random <= cumulative) {
        assignedVariant = test.variants[i];
        break;
      }
    }

    // Save assignment
    const newVariants = { ...userVariants, [testName]: assignedVariant };
    setUserVariants(newVariants);
    localStorage.setItem('ab_variants', JSON.stringify(newVariants));

    // Track impression
    trackImpression(testName, assignedVariant);

    return {
      variant: assignedVariant,
      trackConversion: () => trackConversion(testName, assignedVariant)
    };
  }, [tests, userVariants]);

  const trackImpression = async (testName, variant) => {
    try {
      await axios.post('/api/analytics/ab-tests/impression', {
        testName,
        variant,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.log('Tracking error:', error);
    }
  };

  const trackConversion = async (testName, variant) => {
    try {
      await axios.post('/api/analytics/ab-tests/conversion', {
        testName,
        variant,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.log('Tracking error:', error);
    }
  };

  return (
    <ABTestContext.Provider value={{ tests, getVariant }}>
      {children}
    </ABTestContext.Provider>
  );
};

// A/B Testing Dashboard Component
const ABTestingManager = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/analytics/ab-tests');
      setTests(response.data);
    } catch (error) {
      // Demo data
      setTests([
        {
          id: 'btn_color_001',
          name: 'CTA Button Color Test',
          description: 'Testing different button colors for Add to Cart',
          status: 'running',
          startDate: '2024-01-15',
          endDate: null,
          goal: 'Increase click-through rate',
          variants: [
            { 
              name: 'control', 
              description: 'Green Button',
              impressions: 12500,
              conversions: 875,
              conversionRate: 7.0,
              confidence: 0
            },
            { 
              name: 'variant_a', 
              description: 'Orange Button',
              impressions: 12300,
              conversions: 984,
              conversionRate: 8.0,
              confidence: 92.5
            },
            { 
              name: 'variant_b', 
              description: 'Blue Button',
              impressions: 12400,
              conversions: 806,
              conversionRate: 6.5,
              confidence: 78.3
            }
          ],
          winner: null
        },
        {
          id: 'checkout_002',
          name: 'Checkout Flow Optimization',
          description: 'Single page vs multi-step checkout',
          status: 'completed',
          startDate: '2024-01-01',
          endDate: '2024-01-14',
          goal: 'Increase checkout completion rate',
          variants: [
            { 
              name: 'control', 
              description: 'Multi-step Checkout',
              impressions: 8000,
              conversions: 2400,
              conversionRate: 30.0,
              confidence: 0
            },
            { 
              name: 'variant_a', 
              description: 'Single Page Checkout',
              impressions: 8200,
              conversions: 2952,
              conversionRate: 36.0,
              confidence: 99.2
            }
          ],
          winner: 'variant_a'
        },
        {
          id: 'pricing_003',
          name: 'Price Display Format',
          description: 'Testing price formatting with/without decimals',
          status: 'paused',
          startDate: '2024-01-10',
          endDate: null,
          goal: 'Increase add to cart rate',
          variants: [
            { 
              name: 'control', 
              description: '$99.99',
              impressions: 5000,
              conversions: 350,
              conversionRate: 7.0,
              confidence: 0
            },
            { 
              name: 'variant_a', 
              description: '$99',
              impressions: 4800,
              conversions: 384,
              conversionRate: 8.0,
              confidence: 85.6
            }
          ],
          winner: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTestStatus = async (testId, currentStatus) => {
    const newStatus = currentStatus === 'running' ? 'paused' : 'running';
    try {
      await axios.patch(`/api/analytics/ab-tests/${testId}`, { status: newStatus });
      setTests(tests.map(t => t.id === testId ? { ...t, status: newStatus } : t));
    } catch (error) {
      // Demo update
      setTests(tests.map(t => t.id === testId ? { ...t, status: newStatus } : t));
    }
  };

  const declareWinner = async (testId, variantName) => {
    try {
      await axios.post(`/api/analytics/ab-tests/${testId}/winner`, { winner: variantName });
      setTests(tests.map(t => t.id === testId ? { ...t, status: 'completed', winner: variantName } : t));
    } catch (error) {
      setTests(tests.map(t => t.id === testId ? { ...t, status: 'completed', winner: variantName } : t));
    }
  };

  const calculateSignificance = (control, variant) => {
    // Simple z-test for proportions
    const n1 = control.impressions;
    const n2 = variant.impressions;
    const p1 = control.conversions / n1;
    const p2 = variant.conversions / n2;
    const p = (control.conversions + variant.conversions) / (n1 + n2);
    
    const se = Math.sqrt(p * (1 - p) * (1/n1 + 1/n2));
    const z = (p2 - p1) / se;
    
    // Convert z-score to confidence level (simplified)
    return Math.min(99.9, Math.abs(z) * 25);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-600';
      case 'paused': return 'bg-yellow-100 text-yellow-600';
      case 'completed': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <FiTarget className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold dark:text-white">A/B Testing Manager</h2>
            <p className="text-gray-500">Create and manage experiments</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-shadow"
        >
          <FiPlus />
          Create Test
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiActivity />
            <span className="text-sm">Active Tests</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {tests.filter(t => t.status === 'running').length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiUsers />
            <span className="text-sm">Total Participants</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {tests.reduce((acc, t) => 
              acc + t.variants.reduce((a, v) => a + v.impressions, 0), 0
            ).toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiCheck />
            <span className="text-sm">Completed</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {tests.filter(t => t.status === 'completed').length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiTrendingUp />
            <span className="text-sm">Avg Lift</span>
          </div>
          <p className="text-2xl font-bold text-green-500">+12.5%</p>
        </div>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {tests.map((test) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
          >
            {/* Test Header */}
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold dark:text-white">{test.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                    {test.winner && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                        Winner: {test.variants.find(v => v.name === test.winner)?.description}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{test.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {test.status !== 'completed' && (
                    <>
                      <button
                        onClick={() => toggleTestStatus(test.id, test.status)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={test.status === 'running' ? 'Pause' : 'Resume'}
                      >
                        {test.status === 'running' ? <FiPause /> : <FiPlay />}
                      </button>
                      <button
                        onClick={() => setSelectedTest(test)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-6 mt-3 text-sm text-gray-500">
                <span>Started: {test.startDate}</span>
                {test.endDate && <span>Ended: {test.endDate}</span>}
                <span>Goal: {test.goal}</span>
              </div>
            </div>

            {/* Variants Comparison */}
            <div className="p-4">
              <div className="grid gap-4">
                {test.variants.map((variant, index) => (
                  <div 
                    key={variant.name}
                    className={`p-4 rounded-lg border-2 ${
                      test.winner === variant.name 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium dark:text-white">
                            {variant.description}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded">
                              Control
                            </span>
                          )}
                          {test.winner === variant.name && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded">
                              Winner
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-gray-500">Impressions</p>
                          <p className="font-semibold dark:text-white">
                            {variant.impressions.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Conversions</p>
                          <p className="font-semibold dark:text-white">
                            {variant.conversions.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Rate</p>
                          <p className={`font-semibold ${
                            index > 0 && variant.conversionRate > test.variants[0].conversionRate
                              ? 'text-green-500'
                              : 'dark:text-white'
                          }`}>
                            {variant.conversionRate.toFixed(1)}%
                          </p>
                        </div>
                        {index > 0 && (
                          <div className="text-center">
                            <p className="text-gray-500">Confidence</p>
                            <p className={`font-semibold ${
                              variant.confidence >= 95 
                                ? 'text-green-500' 
                                : variant.confidence >= 80 
                                  ? 'text-yellow-500'
                                  : 'text-gray-500'
                            }`}>
                              {variant.confidence.toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>

                      {test.status === 'running' && index > 0 && variant.confidence >= 95 && !test.winner && (
                        <button
                          onClick={() => declareWinner(test.id, variant.name)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                        >
                          Declare Winner
                        </button>
                      )}
                    </div>

                    {/* Conversion Bar */}
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${variant.conversionRate * 5}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full ${
                            test.winner === variant.name
                              ? 'bg-green-500'
                              : index === 0 
                                ? 'bg-gray-400' 
                                : 'bg-purple-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Lift Indicator */}
                    {index > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <FiTrendingUp className={
                          variant.conversionRate > test.variants[0].conversionRate
                            ? 'text-green-500'
                            : 'text-red-500'
                        } />
                        <span className={`text-sm ${
                          variant.conversionRate > test.variants[0].conversionRate
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}>
                          {((variant.conversionRate - test.variants[0].conversionRate) / 
                            test.variants[0].conversionRate * 100).toFixed(1)}% vs control
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Test Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTestModal onClose={() => setShowCreateModal(false)} onCreated={fetchTests} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Create Test Modal
const CreateTestModal = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    variants: [
      { name: 'control', description: '', weight: 50 },
      { name: 'variant_a', description: '', weight: 50 }
    ]
  });

  const addVariant = () => {
    const variantName = `variant_${String.fromCharCode(97 + formData.variants.length - 1)}`;
    const newWeight = Math.floor(100 / (formData.variants.length + 1));
    
    setFormData({
      ...formData,
      variants: [
        ...formData.variants.map(v => ({ ...v, weight: newWeight })),
        { name: variantName, description: '', weight: newWeight }
      ]
    });
  };

  const removeVariant = (index) => {
    if (formData.variants.length <= 2) return;
    const newVariants = formData.variants.filter((_, i) => i !== index);
    const newWeight = Math.floor(100 / newVariants.length);
    setFormData({
      ...formData,
      variants: newVariants.map(v => ({ ...v, weight: newWeight }))
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/analytics/ab-tests', formData);
      onCreated();
      onClose();
    } catch (error) {
      // Demo - just close
      onCreated();
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">Create A/B Test</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium dark:text-white mb-2">Test Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., Checkout Button Color Test"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              placeholder="Describe what you're testing..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-white mb-2">Goal</label>
            <input
              type="text"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., Increase click-through rate"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium dark:text-white">Variants</label>
              <button
                type="button"
                onClick={addVariant}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {formData.variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={variant.description}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index].description = e.target.value;
                        setFormData({ ...formData, variants: newVariants });
                      }}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={index === 0 ? 'Control description' : `Variant ${String.fromCharCode(64 + index)} description`}
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={variant.weight}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index].weight = parseInt(e.target.value);
                        setFormData({ ...formData, variants: newVariants });
                      }}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center"
                      min={1}
                      max={100}
                    />
                  </div>
                  <span className="text-gray-500">%</span>
                  {index > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Create Test
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ABTestingManager;
