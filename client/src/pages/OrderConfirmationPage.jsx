import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiTruck, FiMail, FiDownload, FiHome } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import MagicalGenie from '../components/common/MagicalGenie';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData || {};

  // Generate order details
  const orderId = orderData.orderId || `NXS${Date.now().toString().slice(-8)}`;
  const orderDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const { shippingInfo = {}, items = [], total = 0, subtotal = 0, shipping = 0, tax = 0 } = orderData;

  useEffect(() => {
    // Send confirmation email (simulated)
    console.log('Sending confirmation email to:', shippingInfo.email);
  }, [shippingInfo.email]);

  return (
    <>
      <Helmet>
        <title>{`Order Confirmed #${orderId} - NexusMart`}</title>
      </Helmet>

      <div className="min-h-screen py-12 px-4 relative">
        {/* Background Effects */}
        <div className="circuit-bg"></div>

        {/* Magical Genie - Celebration Mode */}
        <MagicalGenie onOrderConfirm={true} />
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Success Header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 
                          rounded-full mb-6 shadow-lg shadow-green-500/50">
              <FiCheckCircle className="text-5xl text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4" style={{ fontFamily: 'Orbitron' }}>
              Order Confirmed! 🎉
            </h1>
            <p className="text-xl text-purple-300">
              Thank you for your order! We've sent a confirmation to <span className="text-cyan-400">{shippingInfo.email}</span>
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 rounded-2xl mb-8"
          >
            {/* Order Number & Date */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-purple-500/30">
              <div>
                <h2 className="text-2xl font-bold text-purple-300 mb-2">Order #{orderId}</h2>
                <p className="text-purple-300/70">Placed on {orderDate}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-2 text-green-400">
                  <FiPackage className="text-2xl" />
                  <span className="font-bold">Processing</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mb-8 p-6 bg-cyan-500/10 border-2 border-cyan-500/30 rounded-xl">
              <div className="flex items-start space-x-4">
                <FiTruck className="text-3xl text-cyan-400 mt-1" />
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">Estimated Delivery</h3>
                  <p className="text-2xl font-bold text-white mb-2">{deliveryDate}</p>
                  <p className="text-purple-300/70">Standard Shipping (5-7 business days)</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center">
                <FiHome className="mr-2" /> Shipping Address
              </h3>
              <div className="p-4 bg-purple-500/10 rounded-xl">
                <p className="text-white font-semibold">{shippingInfo.fullName}</p>
                <p className="text-purple-300/70">{shippingInfo.address}</p>
                <p className="text-purple-300/70">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                <p className="text-purple-300/70">{shippingInfo.country}</p>
                <p className="text-purple-300/70 mt-2">📞 {shippingInfo.phone}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-purple-300 mb-4">Order Items</h3>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-purple-500/10 rounded-xl">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <h4 className="text-white font-semibold">{item.name}</h4>
                      <p className="text-purple-300/70">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-xl font-bold gradient-text">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-purple-500/30 pt-6">
              <div className="space-y-3">
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
                <div className="flex justify-between items-center pt-4 border-t border-purple-500/30">
                  <span className="text-2xl font-bold text-white">Total</span>
                  <span className="text-3xl font-bold gradient-text">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Email Notification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 rounded-2xl mb-8 flex items-start space-x-4"
          >
            <FiMail className="text-3xl text-cyan-400 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-cyan-400 mb-2">Confirmation Email Sent</h3>
              <p className="text-purple-300/70">
                We've sent a detailed order confirmation and receipt to <span className="text-white font-semibold">{shippingInfo.email}</span>.
                You'll receive shipping updates and tracking information via email.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              variant="3d"
              fullWidth
              onClick={() => navigate('/user/orders')}
              icon={FiPackage}
            >
              Track Order
            </Button>
            <Button
              variant="neon"
              fullWidth
              onClick={() => navigate('/products')}
              icon={FiHome}
            >
              Continue Shopping
            </Button>
            <Button
              variant="glass"
              onClick={() => window.print()}
              icon={FiDownload}
            >
              Print Receipt
            </Button>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            <div className="glass-card p-6 text-center rounded-2xl">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="font-bold text-purple-300 mb-2">Order Processing</h3>
              <p className="text-sm text-purple-300/70">We're preparing your items</p>
            </div>
            <div className="glass-card p-6 text-center rounded-2xl">
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="font-bold text-purple-300 mb-2">Shipping Soon</h3>
              <p className="text-sm text-purple-300/70">You'll get tracking details</p>
            </div>
            <div className="glass-card p-6 text-center rounded-2xl">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-bold text-purple-300 mb-2">Delivery</h3>
              <p className="text-sm text-purple-300/70">Expected by {deliveryDate}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;
