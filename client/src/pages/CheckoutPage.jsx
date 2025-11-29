import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiMapPin, FiTruck, FiCheck, FiLock, FiChevronRight } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { PageLoader } from '../components/common/Loader';
import toast from 'react-hot-toast';
import { createOrder } from '../redux/slices/orderSlice';
import { clearCart } from '../redux/slices/cartSlice';
// Removed RoboticBackground for performance
import MagicalGenie from '../components/common/MagicalGenie';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
    if (!items || items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, items, navigate]);

  const subtotal = items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const steps = [
    { id: 1, name: 'Shipping', icon: FiMapPin },
    { id: 2, name: 'Payment', icon: FiCreditCard },
    { id: 3, name: 'Review', icon: FiCheck },
  ];

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (Object.values(shippingInfo).every(val => val)) {
      setCurrentStep(2);
    } else {
      toast.error('Please fill all shipping details');
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (paymentInfo.cardNumber && paymentInfo.cardName && paymentInfo.expiryDate && paymentInfo.cvv) {
      setCurrentStep(3);
    } else {
      toast.error('Please fill all payment details');
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // Prepare order data for API
      const orderData = {
        orderItems: items.map(item => ({
          product: item.product?._id || item._id,
          name: item.product?.name || item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product?.images?.[0] || item.image
        })),
        shippingInfo: {
          firstName: shippingInfo.fullName.split(' ')[0] || '',
          lastName: shippingInfo.fullName.split(' ').slice(1).join(' ') || '',
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country
        },
        paymentInfo: {
          id: `pay_${Date.now()}`,
          status: 'paid',
          method: 'card'
        },
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total
      };

      // Create order via API
      const result = await dispatch(createOrder(orderData)).unwrap();
      
      // Clear cart after successful order
      dispatch(clearCart());
      
      toast.success('🎉 Order placed successfully!', {
        style: { background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(21, 128, 61))', color: '#fff', borderRadius: '12px' }
      });
      
      // Navigate to order confirmation with order data
      navigate('/order-confirmation', { 
        state: { 
          orderData: {
            orderId: result.order._id,
            ...result.order,
            shippingInfo,
            items,
            subtotal,
            shipping,
            tax,
            total
          } 
        } 
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error(error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return <PageLoader text="Loading checkout..." />;
  }

  return (
    <>
      <Helmet>
        <title>Checkout - NexusMart</title>
      </Helmet>

      {/* Lightweight CSS Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/10 to-gray-950"></div>

      {/* Magical Genie */}
      <MagicalGenie />

      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="gradient-text">Secure Checkout</span>
            </h1>
            <div className="flex items-center space-x-2 text-purple-300/70">
              <FiLock className="text-green-400" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center flex-1">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${
                          currentStep >= step.id
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50'
                            : 'bg-purple-500/10 border-2 border-purple-500/30'
                        }`}
                      >
                        <step.icon className={`text-2xl ${
                          currentStep >= step.id ? 'text-white' : 'text-purple-400'
                        }`} />
                      </motion.div>
                      <span className={`text-sm font-semibold ${
                        currentStep >= step.id ? 'text-cyan-400' : 'text-purple-300/50'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                        currentStep > step.id
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                          : 'bg-purple-500/20'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Forms Section */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-card p-8 rounded-2xl"
                  >
                    <h2 className="text-3xl font-bold gradient-text mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      Shipping Information
                    </h2>
                    <form onSubmit={handleShippingSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2">Full Name *</label>
                          <input
                            type="text"
                            value={shippingInfo.fullName}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                                     text-white focus:border-cyan-500 focus:outline-none transition-all duration-300
                                     relative z-10 cursor-text"
                            style={{ pointerEvents: 'auto' }}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2">Email *</label>
                          <input
                            type="email"
                            value={shippingInfo.email}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                                     text-white focus:border-cyan-500 focus:outline-none transition-all duration-300
                                     relative z-10 cursor-text"
                            style={{ pointerEvents: 'auto' }}
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-purple-300 font-semibold mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                                   text-white focus:border-cyan-500 focus:outline-none transition-all duration-300
                                   relative z-10 cursor-text"
                          style={{ pointerEvents: 'auto' }}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-purple-300 font-semibold mb-2">Street Address *</label>
                        <input
                          type="text"
                          value={shippingInfo.address}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                                   text-white focus:border-cyan-500 focus:outline-none transition-all duration-300
                                   relative z-10 cursor-text"
                          style={{ pointerEvents: 'auto' }}
                          placeholder="123 Main Street"
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2">City *</label>
                          <input
                            type="text"
                            value={shippingInfo.city}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                                     text-white focus:border-cyan-500 focus:outline-none transition-all duration-300
                                     relative z-10 cursor-text"
                            style={{ pointerEvents: 'auto' }}
                            placeholder="New York"
                          />
                        </div>
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2">State *</label>
                          <input
                            type="text"
                            value={shippingInfo.state}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                                     text-white focus:border-cyan-500 focus:outline-none transition-all duration-300
                                     relative z-10 cursor-text"
                            style={{ pointerEvents: 'auto' }}
                            placeholder="NY"
                          />
                        </div>
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2">ZIP Code *</label>
                          <input
                            type="text"
                            value={shippingInfo.zipCode}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                                     text-white focus:border-cyan-500 focus:outline-none transition-all duration-300
                                     relative z-10 cursor-text"
                            style={{ pointerEvents: 'auto' }}
                            placeholder="10001"
                          />
                        </div>
                      </div>

                      <Button type="submit" variant="3d" fullWidth icon={FiChevronRight}>
                        Continue to Payment
                      </Button>
                    </form>
                  </motion.div>
                )}

                {/* Step 2: Payment Information */}
                {currentStep === 2 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-card p-8 rounded-2xl"
                  >
                    <h2 className="text-3xl font-bold gradient-text mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      Payment Information
                    </h2>
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      <div>
                        <label className="block text-purple-300 font-semibold mb-2">Card Number *</label>
                        <input
                          type="text"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                          required
                          maxLength="19"
                          className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                                   text-white focus:border-cyan-500 focus:outline-none transition-all duration-300
                                   relative z-10 cursor-text"
                          style={{ pointerEvents: 'auto' }}
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>

                      <div>
                        <label className="block text-purple-300 font-semibold mb-2">Cardholder Name *</label>
                        <input
                          type="text"
                          value={paymentInfo.cardName}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                                   text-white focus:border-cyan-500 focus:outline-none transition-all duration-300
                                   relative z-10 cursor-text"
                          style={{ pointerEvents: 'auto' }}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2">Expiry Date *</label>
                          <input
                            type="text"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                            required
                            maxLength="5"
                            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                                     text-white focus:border-cyan-500 focus:outline-none transition-all duration-300
                                     relative z-10 cursor-text"
                            style={{ pointerEvents: 'auto' }}
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2">CVV *</label>
                          <input
                            type="text"
                            value={paymentInfo.cvv}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                            required
                            maxLength="4"
                            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                                     text-white focus:border-cyan-500 focus:outline-none transition-all duration-300
                                     relative z-10 cursor-text"
                            style={{ pointerEvents: 'auto' }}
                            placeholder="123"
                          />
                        </div>
                      </div>

                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentInfo.saveCard}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, saveCard: e.target.checked })}
                          className="w-5 h-5 rounded border-2 border-purple-500/30 bg-gray-900/50
                                   text-purple-600 focus:ring-2 focus:ring-purple-500/50"
                        />
                        <span className="text-purple-300">Save card for future purchases</span>
                      </label>

                      <div className="flex gap-4">
                        <Button variant="glass" onClick={() => setCurrentStep(1)}>
                          Back
                        </Button>
                        <Button type="submit" variant="3d" fullWidth icon={FiChevronRight}>
                          Review Order
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Step 3: Review & Place Order */}
                {currentStep === 3 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Shipping Info Review */}
                    <div className="glass-card p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          Shipping Address
                        </h3>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-purple-300 space-y-1">
                        <p className="font-semibold">{shippingInfo.fullName}</p>
                        <p>{shippingInfo.address}</p>
                        <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                        <p>{shippingInfo.email}</p>
                        <p>{shippingInfo.phone}</p>
                      </div>
                    </div>

                    {/* Payment Info Review */}
                    <div className="glass-card p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          Payment Method
                        </h3>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FiCreditCard className="text-3xl text-purple-400" />
                        <div className="text-purple-300">
                          <p className="font-semibold">**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                          <p className="text-sm">Expires {paymentInfo.expiryDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <Button variant="glass" onClick={() => setCurrentStep(2)}>
                        Back
                      </Button>
                      <Button
                        variant="3d"
                        fullWidth
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        icon={loading ? null : FiCheck}
                      >
                        {loading ? 'Processing...' : 'Place Order'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 rounded-2xl sticky top-24"
              >
                <h3 className="text-2xl font-bold gradient-text mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Order Summary
                </h3>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-purple-300 text-sm font-semibold line-clamp-2">{item.name}</p>
                        <p className="text-purple-300/70 text-sm">Qty: {item.quantity}</p>
                        <p className="text-cyan-400 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-purple-500/30 pt-4">
                  <div className="flex justify-between text-purple-300">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? <span className="text-green-400">FREE</span> : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Tax</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-purple-500/30 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-purple-300">Total</span>
                      <span className="text-3xl font-bold gradient-text">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
