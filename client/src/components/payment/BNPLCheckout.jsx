import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, 
  FiCheck, 
  FiX,
  FiCreditCard,
  FiClock,
  FiAlertCircle,
  FiDollarSign,
  FiShield
} from 'react-icons/fi';

/**
 * BNPL (Buy Now Pay Later) Checkout Component
 */
const BNPLCheckout = ({ amount, onSelect, onClose }) => {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    checkEligibility();
  }, [amount]);
  
  const checkEligibility = async () => {
    try {
      const response = await fetch('/api/v1/bnpl/eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount })
      });
      const data = await response.json();
      
      if (data.success) {
        setEligibility(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectPlan = async () => {
    if (!selectedPlan) return;
    
    setApplying(true);
    try {
      const response = await fetch('/api/v1/bnpl/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount,
          installments: selectedPlan.installments,
          planId: selectedPlan.id
        })
      });
      const data = await response.json();
      
      if (data.success) {
        onSelect?.(data.application);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to apply for BNPL');
    } finally {
      setApplying(false);
    }
  };
  
  const installmentPlans = [
    { id: 'bnpl_3', installments: 3, interestRate: 0, label: '3 payments' },
    { id: 'bnpl_6', installments: 6, interestRate: 5, label: '6 payments' },
    { id: 'bnpl_12', installments: 12, interestRate: 10, label: '12 payments' },
  ];
  
  const calculateInstallment = (plan) => {
    const interest = amount * (plan.interestRate / 100);
    return ((amount + interest) / plan.installments).toFixed(2);
  };
  
  const calculateTotal = (plan) => {
    const interest = amount * (plan.interestRate / 100);
    return (amount + interest).toFixed(2);
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Buy Now, Pay Later
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Split your payment into easy installments
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Order Amount */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Order Total</span>
              <span className="text-2xl font-bold text-purple-600">
                ${amount.toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Eligibility Status */}
          {eligibility && !eligibility.eligible && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6 flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  Not Eligible for BNPL
                </p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {eligibility.reason || 'Please try other payment methods.'}
                </p>
              </div>
            </div>
          )}
          
          {/* Credit Score */}
          {eligibility?.creditScore && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Your Credit Score
                </span>
                <span className={`font-bold ${
                  eligibility.creditScore >= 700 
                    ? 'text-green-600' 
                    : eligibility.creditScore >= 600 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                }`}>
                  {eligibility.creditScore}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    eligibility.creditScore >= 700 
                      ? 'bg-green-500' 
                      : eligibility.creditScore >= 600 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${(eligibility.creditScore / 850) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {/* Payment Plans */}
          {(!eligibility || eligibility.eligible) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Choose a Plan
              </h3>
              {installmentPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedPlan?.id === plan.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      }`}>
                        <FiCalendar className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {plan.label}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {plan.interestRate === 0 
                            ? 'Interest-free' 
                            : `${plan.interestRate}% interest`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        ${calculateInstallment(plan)}/mo
                      </p>
                      {plan.interestRate > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Total: ${calculateTotal(plan)}
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedPlan?.id === plan.id && (
                    <motion.div
                      className="mt-4 pt-4 border-t dark:border-gray-700"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: plan.installments }).map((_, i) => {
                          const date = new Date();
                          date.setMonth(date.getMonth() + i);
                          return (
                            <div key={i} className="text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                ${calculateInstallment(plan)}
                              </p>
                            </div>
                          );
                        }).slice(0, 6)}
                        {plan.installments > 6 && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              +{plan.installments - 6} more
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          {/* Security Badge */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <FiShield className="w-4 h-4 text-green-500" />
            <span>Your payment info is secured with bank-level encryption</span>
          </div>
          
          <button
            onClick={handleSelectPlan}
            disabled={!selectedPlan || applying || (eligibility && !eligibility.eligible)}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
              selectedPlan && (!eligibility || eligibility.eligible)
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {applying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FiCreditCard className="w-5 h-5" />
                {selectedPlan 
                  ? `Pay ${selectedPlan.label} • $${calculateInstallment(selectedPlan)}/mo`
                  : 'Select a Plan'
                }
              </>
            )}
          </button>
          
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
            By proceeding, you agree to our BNPL terms and conditions
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BNPLCheckout;
