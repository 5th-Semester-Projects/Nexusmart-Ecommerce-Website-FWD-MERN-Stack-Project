import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOffice2Icon,
  UserGroupIcon,
  DocumentTextIcon,
  CalculatorIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  ShoppingCartIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Bulk Order Form Component
export const BulkOrderForm = ({ product, onSubmit }) => {
  const [quantity, setQuantity] = useState(100);
  const [customization, setCustomization] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [showQuote, setShowQuote] = useState(false);

  const tiers = [
    { min: 50, discount: 5 },
    { min: 100, discount: 10 },
    { min: 500, discount: 15 },
    { min: 1000, discount: 20 },
    { min: 5000, discount: 25 },
  ];

  const getDiscount = (qty) => {
    const tier = [...tiers].reverse().find(t => qty >= t.min);
    return tier?.discount || 0;
  };

  const basePrice = product?.price || 49.99;
  const discount = getDiscount(quantity);
  const discountedPrice = basePrice * (1 - discount / 100);
  const totalPrice = discountedPrice * quantity;

  const handleSubmit = () => {
    if (quantity < 50) {
      toast.error('Minimum order quantity is 50 units');
      return;
    }
    setShowQuote(true);
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
          <CubeIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Bulk Order</h3>
          <p className="text-gray-400 text-sm">Get volume discounts</p>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Order Quantity</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(Math.max(50, quantity - 50))}
            className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <MinusIcon className="w-5 h-5 text-white" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(50, parseInt(e.target.value) || 50))}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-xl font-bold focus:border-blue-500 outline-none"
          />
          <button
            onClick={() => setQuantity(quantity + 50)}
            className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Volume Discount Tiers */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Volume Discounts</label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tiers.map((tier) => (
            <div
              key={tier.min}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-center ${
                quantity >= tier.min
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              <p className="font-bold">{tier.discount}% off</p>
              <p className="text-xs">{tier.min}+ units</p>
            </div>
          ))}
        </div>
      </div>

      {/* Customization */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Customization Notes (Optional)</label>
        <textarea
          value={customization}
          onChange={(e) => setCustomization(e.target.value)}
          placeholder="Logo placement, custom colors, packaging requirements..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none resize-none"
        />
      </div>

      {/* Delivery Date */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Required Delivery Date</label>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
        />
      </div>

      {/* Pricing Summary */}
      <div className="p-4 bg-gray-800 rounded-xl mb-6">
        <div className="flex justify-between text-gray-400 mb-2">
          <span>Unit Price</span>
          <span className="line-through">${basePrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-green-400 mb-2">
          <span>Discounted Price ({discount}% off)</span>
          <span>${discountedPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-gray-700">
          <span>Total ({quantity} units)</span>
          <span>${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
      >
        Request Quote
      </button>

      {/* Quote Modal */}
      <AnimatePresence>
        {showQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-800"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Quote Requested!</h3>
                <p className="text-gray-400 mb-6">
                  Our sales team will contact you within 24 hours with a detailed quote.
                </p>
                <button
                  onClick={() => {
                    setShowQuote(false);
                    onSubmit?.({ quantity, customization, deliveryDate, totalPrice });
                    toast.success('Quote request submitted!');
                  }}
                  className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Company Account Management
export const CompanyAccountManager = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const companyData = {
    name: 'Acme Corporation',
    accountNumber: 'B2B-2024-0001',
    creditLimit: 50000,
    usedCredit: 12500,
    paymentTerms: 'Net 30',
    status: 'Active',
    users: [
      { id: 1, name: 'John Admin', role: 'Admin', email: 'john@acme.com' },
      { id: 2, name: 'Sarah Buyer', role: 'Buyer', email: 'sarah@acme.com' },
      { id: 3, name: 'Mike Finance', role: 'Finance', email: 'mike@acme.com' },
    ],
    recentOrders: [
      { id: 'ORD-001', date: '2024-01-15', amount: 5250, status: 'Delivered' },
      { id: 'ORD-002', date: '2024-01-10', amount: 3780, status: 'Shipped' },
      { id: 'ORD-003', date: '2024-01-05', amount: 3470, status: 'Processing' },
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'users', label: 'Team', icon: UserGroupIcon },
    { id: 'orders', label: 'Orders', icon: ClipboardDocumentListIcon },
    { id: 'billing', label: 'Billing', icon: CreditCardIcon },
  ];

  return (
    <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white">
            AC
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{companyData.name}</h2>
            <p className="text-gray-400">Account: {companyData.accountNumber}</p>
            <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full mt-1">
              {companyData.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Credit Usage */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Credit Used</span>
                <span className="text-white">
                  ${companyData.usedCredit.toLocaleString()} / ${companyData.creditLimit.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(companyData.usedCredit / companyData.creditLimit) * 100}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-xl">
                <p className="text-gray-400 text-sm">Payment Terms</p>
                <p className="text-white text-lg font-bold">{companyData.paymentTerms}</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-xl">
                <p className="text-gray-400 text-sm">Available Credit</p>
                <p className="text-green-400 text-lg font-bold">
                  ${(companyData.creditLimit - companyData.usedCredit).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-3">
            {companyData.users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                  {user.role}
                </span>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Add Team Member
            </button>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {companyData.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                <div>
                  <p className="text-white font-medium">{order.id}</p>
                  <p className="text-gray-400 text-sm">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">${order.amount.toLocaleString()}</p>
                  <span className={`text-sm ${
                    order.status === 'Delivered' ? 'text-green-400' :
                    order.status === 'Shipped' ? 'text-blue-400' : 'text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-medium">Outstanding Balance</p>
                  <p className="text-gray-400 text-sm">Due within 30 days</p>
                </div>
                <p className="text-2xl font-bold text-white">${companyData.usedCredit.toLocaleString()}</p>
              </div>
              <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Pay Now
              </button>
            </div>
            <button className="w-full py-3 bg-gray-800 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors">
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download Invoices
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Request for Quote (RFQ) System
export const QuoteRequestForm = ({ onSubmit }) => {
  const [items, setItems] = useState([
    { id: 1, product: '', quantity: '', specs: '' }
  ]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  const addItem = () => {
    setItems([...items, { id: Date.now(), product: '', quantity: '', specs: '' }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = () => {
    const validItems = items.filter(item => item.product && item.quantity);
    if (validItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    onSubmit?.({ items: validItems, deliveryDate, notes });
    toast.success('Quote request submitted! We\'ll respond within 24 hours.');
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <DocumentTextIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Request for Quote</h3>
          <p className="text-gray-400 text-sm">Get custom pricing for your needs</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-800 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">Item {index + 1}</span>
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Product name or SKU"
                value={item.product}
                onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
              />
              <input
                type="text"
                placeholder="Specifications (optional)"
                value={item.specs}
                onChange={(e) => updateItem(item.id, 'specs', e.target.value)}
                className="w-full md:col-span-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
              />
            </div>
          </motion.div>
        ))}

        <button
          onClick={addItem}
          className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Another Item
        </button>
      </div>

      {/* Delivery Date */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Required By Date</label>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
        />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Additional Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requirements or questions..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
      >
        Submit Quote Request
      </button>
    </div>
  );
};

// Net Terms Payment Widget
export const NetTermsPayment = ({ order, terms = 30 }) => {
  const [selectedTerm, setSelectedTerm] = useState(terms);

  const termOptions = [
    { days: 15, discount: 2 },
    { days: 30, discount: 0 },
    { days: 45, discount: -1 },
    { days: 60, discount: -2 },
  ];

  const orderTotal = order?.total || 5000;

  const calculateTotal = (term) => {
    const discount = termOptions.find(t => t.days === term)?.discount || 0;
    return orderTotal * (1 - discount / 100);
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
          <ClockIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Payment Terms</h3>
          <p className="text-gray-400 text-sm">Choose when to pay</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {termOptions.map((term) => (
          <button
            key={term.days}
            onClick={() => setSelectedTerm(term.days)}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              selectedTerm === term.days
                ? 'bg-amber-500/20 border-2 border-amber-500/50'
                : 'bg-gray-800 border-2 border-transparent hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Net {term.days}</p>
                <p className="text-gray-400 text-sm">Pay within {term.days} days</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">${calculateTotal(term.days).toLocaleString()}</p>
                {term.discount !== 0 && (
                  <p className={`text-sm ${term.discount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {term.discount > 0 ? `${term.discount}% discount` : `${Math.abs(term.discount)}% fee`}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 bg-gray-800 rounded-xl mb-4">
        <div className="flex justify-between text-gray-400 mb-2">
          <span>Order Total</span>
          <span>${orderTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-white text-lg font-bold">
          <span>Amount Due (Net {selectedTerm})</span>
          <span>${calculateTotal(selectedTerm).toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={() => toast.success(`Order confirmed with Net ${selectedTerm} terms!`)}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all"
      >
        Confirm Payment Terms
      </button>
    </div>
  );
};

export default {
  BulkOrderForm,
  CompanyAccountManager,
  QuoteRequestForm,
  NetTermsPayment
};
