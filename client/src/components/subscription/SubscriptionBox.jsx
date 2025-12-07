import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBox, 
  FiCalendar, 
  FiCheck,
  FiX,
  FiClock,
  FiPackage,
  FiShoppingBag,
  FiEdit,
  FiPause,
  FiPlay,
  FiTrash2,
  FiStar,
  FiGift
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

/**
 * Subscription Box Component
 * Manage subscription box services
 */
const SubscriptionBox = () => {
  const [plans, setPlans] = useState([]);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedFrequency, setSelectedFrequency] = useState('monthly');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  
  useEffect(() => {
    fetchPlans();
    fetchMySubscriptions();
  }, []);
  
  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/v1/subscriptions/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };
  
  const fetchMySubscriptions = async () => {
    try {
      const response = await fetch('/api/v1/subscriptions/my-subscriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMySubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    try {
      const response = await fetch('/api/v1/subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId: selectedPlan._id,
          frequency: selectedFrequency
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShowSubscribeModal(false);
        fetchMySubscriptions();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      alert('Failed to subscribe');
    }
  };
  
  const handlePauseResume = async (subscriptionId, currentStatus) => {
    try {
      const endpoint = currentStatus === 'active' ? 'pause' : 'resume';
      const response = await fetch(`/api/v1/subscriptions/${subscriptionId}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchMySubscriptions();
      }
    } catch (error) {
      console.error('Action error:', error);
    }
  };
  
  const handleCancel = async (subscriptionId) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    
    try {
      const response = await fetch(`/api/v1/subscriptions/${subscriptionId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchMySubscriptions();
      }
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };
  
  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly', discount: 0 },
    { value: 'biweekly', label: 'Bi-Weekly', discount: 5 },
    { value: 'monthly', label: 'Monthly', discount: 10 },
    { value: 'quarterly', label: 'Quarterly', discount: 15 },
  ];
  
  const getPrice = (basePrice, frequency) => {
    const option = frequencyOptions.find(f => f.value === frequency);
    const discount = option?.discount || 0;
    return (basePrice * (1 - discount / 100)).toFixed(2);
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Subscription Boxes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get curated products delivered to your door on your schedule. 
          Save money and never run out of your favorites!
        </p>
      </div>
      
      {/* My Active Subscriptions */}
      {mySubscriptions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiPackage className="w-6 h-6 text-purple-600" />
            My Subscriptions
          </h2>
          
          <div className="space-y-4">
            {mySubscriptions.map((sub) => (
              <motion.div
                key={sub._id}
                className={`p-4 rounded-xl border-2 ${
                  sub.status === 'active' 
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                    : sub.status === 'paused'
                      ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <FiBox className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {sub.plan?.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {sub.frequency} • ${sub.price}/box
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          sub.status === 'active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                            : sub.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                        {sub.nextDelivery && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            Next: {new Date(sub.nextDelivery).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {sub.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => handlePauseResume(sub._id, sub.status)}
                          className={`p-2 rounded-lg transition-colors ${
                            sub.status === 'active'
                              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50'
                              : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50'
                          }`}
                          title={sub.status === 'active' ? 'Pause' : 'Resume'}
                        >
                          {sub.status === 'active' ? (
                            <FiPause className="w-5 h-5" />
                          ) : (
                            <FiPlay className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCancel(sub._id)}
                          className="p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan._id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Plan Image/Banner */}
            <div className={`h-32 bg-gradient-to-r ${
              index === 0 ? 'from-pink-500 to-purple-600' :
              index === 1 ? 'from-blue-500 to-indigo-600' :
              'from-green-500 to-teal-600'
            } flex items-center justify-center`}>
              <FiGift className="w-16 h-16 text-white/80" />
            </div>
            
            {/* Plan Details */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                {plan.isPopular && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <FiStar className="w-3 h-3 fill-current" />
                    Popular
                  </span>
                )}
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {plan.description}
              </p>
              
              <div className="mb-4">
                <p className="text-3xl font-bold text-purple-600">
                  ${plan.price}
                  <span className="text-base font-normal text-gray-500">/box</span>
                </p>
              </div>
              
              {/* Features */}
              <ul className="space-y-2 mb-6">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FiCheck className="w-4 h-4 text-green-500" />
                  {plan.itemCount || 5}+ products per box
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FiCheck className="w-4 h-4 text-green-500" />
                  Free shipping included
                </li>
              </ul>
              
              <button
                onClick={() => {
                  setSelectedPlan(plan);
                  setShowSubscribeModal(true);
                }}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              >
                Subscribe Now
              </button>
            </div>
          </motion.div>
        ))}
        
        {/* Custom Plan Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: plans.length * 0.1 }}
        >
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FiEdit className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Build Your Own
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Create a custom subscription with your favorite products
            </p>
            <Link
              to="/products"
              className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Subscribe Modal */}
      <AnimatePresence>
        {showSubscribeModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Subscribe to {selectedPlan.name}
                  </h2>
                  <button
                    onClick={() => setShowSubscribeModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Frequency Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Delivery Frequency
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {frequencyOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedFrequency(option.value)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedFrequency === option.value
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </p>
                        {option.discount > 0 && (
                          <p className="text-sm text-green-600">
                            Save {option.discount}%
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Price Summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-300">Base Price</span>
                    <span className="text-gray-900 dark:text-white">${selectedPlan.price}</span>
                  </div>
                  {frequencyOptions.find(f => f.value === selectedFrequency)?.discount > 0 && (
                    <div className="flex items-center justify-between mb-2 text-green-600">
                      <span>Discount</span>
                      <span>-{frequencyOptions.find(f => f.value === selectedFrequency)?.discount}%</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t dark:border-gray-600">
                    <span className="font-semibold text-gray-900 dark:text-white">You Pay</span>
                    <span className="text-xl font-bold text-purple-600">
                      ${getPrice(selectedPlan.price, selectedFrequency)}/box
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={handleSubscribe}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiShoppingBag className="w-5 h-5" />
                  Start Subscription
                </button>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                  Cancel anytime. First box ships within 2-3 days.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionBox;
