import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiMapPin, FiTruck, FiCheck, FiLock, FiChevronRight, FiDollarSign, FiAlertCircle, FiClock, FiCalendar } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { PageLoader } from '../components/common/Loader';
import toast from 'react-hot-toast';
import { createOrder } from '../redux/slices/orderSlice';
import { clearCart } from '../redux/slices/cartSlice';
// Removed RoboticBackground for performance
import MagicalGenie from '../components/common/MagicalGenie';
import { AddressManager, ShippingCalculator } from '../components/shipping';
import { CouponSystem } from '../components/checkout';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'cod'
  const [errors, setErrors] = useState({});
  
  // Shipping options state
  const [shippingOptions, setShippingOptions] = useState({
    method: 'standard',
    methodName: 'Standard Delivery',
    timeSlot: 'any',
    slotLabel: 'Any Time',
    date: null,
    cost: 0,
    zone: 'national',
    freeShipping: false,
  });
  
  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  
  // Use saved address state
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });

  // Validation patterns
  const patterns = {
    fullName: /^[a-zA-Z\s]{3,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+92|0)?[0-9]{10}$/,
    address: /^.{10,100}$/,
    city: /^[a-zA-Z\s]{2,30}$/,
    state: /^[a-zA-Z\s]{2,30}$/,
    zipCode: /^[0-9]{5}$/,
    cardNumber: /^[0-9]{16}$/,
    cardName: /^[a-zA-Z\s]{3,50}$/,
    expiryDate: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
    cvv: /^[0-9]{3,4}$/,
  };

  // Format phone number
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 11)}`;
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    }
    return numbers;
  };

  // Validate single field
  const validateField = (name, value) => {
    let cleanValue = value;
    
    // Clean values for validation
    if (name === 'phone') cleanValue = value.replace(/[-\s]/g, '');
    if (name === 'cardNumber') cleanValue = value.replace(/\s/g, '');
    
    if (!cleanValue || cleanValue.trim() === '') {
      return 'This field is required';
    }
    
    if (patterns[name] && !patterns[name].test(cleanValue)) {
      switch (name) {
        case 'fullName': return 'Enter valid name (3-50 letters only)';
        case 'email': return 'Enter valid email (e.g., name@example.com)';
        case 'phone': return 'Enter valid Pakistani phone (e.g., 0300-1234567)';
        case 'address': return 'Address must be 10-100 characters';
        case 'city': return 'Enter valid city name';
        case 'state': return 'Enter valid state/province name';
        case 'zipCode': return 'Enter 5-digit ZIP code (e.g., 54000)';
        case 'cardNumber': return 'Enter 16-digit card number';
        case 'cardName': return 'Enter cardholder name as on card';
        case 'expiryDate': return 'Enter valid date (MM/YY)';
        case 'cvv': return 'Enter 3 or 4 digit CVV';
        default: return 'Invalid format';
      }
    }
    
    // Additional validation for expiry date
    if (name === 'expiryDate' && patterns[name].test(cleanValue)) {
      const [month, year] = cleanValue.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        return 'Card has expired';
      }
    }
    
    return '';
  };

  // Handle shipping input change with formatting
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }
    if (name === 'zipCode') {
      formattedValue = value.replace(/\D/g, '').slice(0, 5);
    }
    if (name === 'fullName' || name === 'city' || name === 'state') {
      formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    setShippingInfo({ ...shippingInfo, [name]: formattedValue });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle payment input change with formatting
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 16) return;
    }
    if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
      if (formattedValue.length > 5) return;
    }
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    if (name === 'cardName') {
      formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    setPaymentInfo({ ...paymentInfo, [name]: formattedValue });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
    if (!items || items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, items, navigate]);

  const subtotal = items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shipping = shippingOptions.cost || (subtotal > 100 ? 0 : 15);
  const tax = (subtotal - discount) * 0.1;
  const total = subtotal - discount + shipping + tax;

  // Handle coupon applied
  const handleCouponApplied = (couponData) => {
    setAppliedCoupon(couponData);
    setDiscount(couponData.discount);
    toast.success(`🎉 Coupon applied! You save $${couponData.discount.toFixed(2)}`, {
      style: { background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(21, 128, 61))', color: '#fff', borderRadius: '12px' }
    });
  };

  // Handle coupon removed
  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    setDiscount(0);
  };

  // Handle saved address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShippingInfo({
      ...shippingInfo,
      address: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'Pakistan',
    });
  };

  // Handle shipping options change from ShippingCalculator
  const handleShippingOptionsChange = (options) => {
    setShippingOptions(options);
  };

  const steps = [
    { id: 1, name: 'Shipping', icon: FiMapPin },
    { id: 2, name: 'Delivery', icon: FiTruck },
    { id: 3, name: 'Payment', icon: FiCreditCard },
    { id: 4, name: 'Review', icon: FiCheck },
  ];

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    
    // Validate all shipping fields
    const newErrors = {};
    const shippingFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    
    shippingFields.forEach(field => {
      const error = validateField(field, shippingInfo[field]);
      if (error) newErrors[field] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setCurrentStep(2); // Go to Delivery step
  };

  const handleDeliverySubmit = (e) => {
    e.preventDefault();
    setCurrentStep(3); // Go to Payment step
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    // If COD, skip card validation
    if (paymentMethod === 'cod') {
      setCurrentStep(4); // Go to Review step
      return;
    }
    
    // Validate card fields
    const newErrors = {};
    const paymentFields = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];
    
    paymentFields.forEach(field => {
      const error = validateField(field, paymentInfo[field]);
      if (error) newErrors[field] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setCurrentStep(4); // Go to Review step
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // Prepare order data for API matching server Order model
      const orderData = {
        orderNumber: `NXS${Date.now().toString().slice(-8)}`,
        orderItems: items.map(item => {
          // Get product ID - handle nested product object or direct properties
          let productId = null;
          if (item.product && typeof item.product === 'object') {
            productId = item.product._id;
          } else if (item.product && typeof item.product === 'string') {
            productId = item.product;
          } else if (item._id) {
            productId = item._id;
          }
          
          const itemPrice = item.price || 0;
          const itemQty = item.quantity || 1;
          
          return {
            product: productId,
            name: item.product?.name || item.name || 'Product',
            price: itemPrice,
            quantity: itemQty,
            image: item.product?.images?.[0] || item.image || '',
            finalPrice: itemPrice * itemQty
          };
        }),
        shippingInfo: {
          firstName: shippingInfo.fullName.split(' ')[0] || 'Customer',
          lastName: shippingInfo.fullName.split(' ').slice(1).join(' ') || 'User',
          email: shippingInfo.email,
          phone: shippingInfo.phone.replace(/-/g, '') || '0000000000',
          address: {
            street: shippingInfo.address || 'N/A',
            city: shippingInfo.city || 'N/A',
            state: shippingInfo.state || 'N/A',
            country: shippingInfo.country || 'Pakistan',
            zipCode: shippingInfo.zipCode || '00000'
          },
          savedAddressId: selectedAddress?._id || null,
        },
        deliveryTimeSlot: {
          date: shippingOptions.date,
          slot: shippingOptions.timeSlot,
          slotLabel: shippingOptions.slotLabel,
        },
        shippingMethod: {
          type: shippingOptions.method,
          name: shippingOptions.methodName,
          cost: shippingOptions.cost,
        },
        shippingZone: {
          zone: shippingOptions.zone,
          city: shippingInfo.city,
        },
        paymentInfo: {
          method: paymentMethod === 'cod' ? 'cod' : 'card',
          provider: paymentMethod === 'cod' ? 'cod' : 'stripe',
          transactionId: paymentMethod === 'cod' ? `cod_${Date.now()}` : `txn_${Date.now()}`,
          status: paymentMethod === 'cod' ? 'pending' : 'completed'
        },
        pricing: {
          itemsPrice: subtotal,
          taxPrice: tax,
          shippingPrice: shipping,
          discountPrice: discount,
          couponCode: appliedCoupon?.code || null,
          totalPrice: total
        }
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
                            name="fullName"
                            value={shippingInfo.fullName}
                            onChange={handleShippingChange}
                            className={`w-full px-4 py-3 bg-gray-900/50 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 relative z-10 cursor-text ${errors.fullName ? 'border-red-500' : 'border-purple-500/30 focus:border-cyan-500'}`}
                            style={{ pointerEvents: 'auto' }}
                            placeholder="e.g., Ahmed Khan"
                          />
                          {errors.fullName && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.fullName}</p>}
                          <p className="text-purple-400/50 text-xs mt-1">Only letters and spaces allowed</p>
                        </div>
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={shippingInfo.email}
                            onChange={handleShippingChange}
                            className={`w-full px-4 py-3 bg-gray-900/50 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 relative z-10 cursor-text ${errors.email ? 'border-red-500' : 'border-purple-500/30 focus:border-cyan-500'}`}
                            style={{ pointerEvents: 'auto' }}
                            placeholder="e.g., ahmed@email.com"
                          />
                          {errors.email && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.email}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-purple-300 font-semibold mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={shippingInfo.phone}
                          onChange={handleShippingChange}
                          className={`w-full px-4 py-3 bg-gray-900/50 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 relative z-10 cursor-text ${errors.phone ? 'border-red-500' : 'border-purple-500/30 focus:border-cyan-500'}`}
                          style={{ pointerEvents: 'auto' }}
                          placeholder="e.g., 0300-1234567"
                          maxLength="12"
                        />
                        {errors.phone && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.phone}</p>}
                        <p className="text-purple-400/50 text-xs mt-1">Pakistani format: 0300-1234567 or +923001234567</p>
                      </div>

                      <div>
                        <label className="block text-purple-300 font-semibold mb-2">Street Address *</label>
                        <input
                          type="text"
                          name="address"
                          value={shippingInfo.address}
                          onChange={handleShippingChange}
                          className={`w-full px-4 py-3 bg-gray-900/50 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 relative z-10 cursor-text ${errors.address ? 'border-red-500' : 'border-purple-500/30 focus:border-cyan-500'}`}
                          style={{ pointerEvents: 'auto' }}
                          placeholder="e.g., House 123, Street 45, Block A, DHA Phase 5"
                        />
                        {errors.address && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.address}</p>}
                        <p className="text-purple-400/50 text-xs mt-1">Complete address with house/flat number, street, block/sector</p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={shippingInfo.city}
                            onChange={handleShippingChange}
                            className={`w-full px-4 py-3 bg-gray-900/50 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 relative z-10 cursor-text ${errors.city ? 'border-red-500' : 'border-purple-500/30 focus:border-cyan-500'}`}
                            style={{ pointerEvents: 'auto' }}
                            placeholder="e.g., Lahore"
                          />
                          {errors.city && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.city}</p>}
                        </div>
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2">Province *</label>
                          <input
                            type="text"
                            name="state"
                            value={shippingInfo.state}
                            onChange={handleShippingChange}
                            className={`w-full px-4 py-3 bg-gray-900/50 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 relative z-10 cursor-text ${errors.state ? 'border-red-500' : 'border-purple-500/30 focus:border-cyan-500'}`}
                            style={{ pointerEvents: 'auto' }}
                            placeholder="e.g., Punjab"
                          />
                          {errors.state && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.state}</p>}
                        </div>
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2">ZIP Code *</label>
                          <input
                            type="text"
                            name="zipCode"
                            value={shippingInfo.zipCode}
                            onChange={handleShippingChange}
                            className={`w-full px-4 py-3 bg-gray-900/50 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 relative z-10 cursor-text ${errors.zipCode ? 'border-red-500' : 'border-purple-500/30 focus:border-cyan-500'}`}
                            style={{ pointerEvents: 'auto' }}
                            placeholder="e.g., 54000"
                            maxLength="5"
                          />
                          {errors.zipCode && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.zipCode}</p>}
                          <p className="text-purple-400/50 text-xs mt-1">5-digit postal code</p>
                        </div>
                      </div>

                      <Button type="submit" variant="3d" fullWidth icon={FiChevronRight}>
                        Continue to Delivery Options
                      </Button>
                    </form>
                  </motion.div>
                )}

                {/* Step 2: Delivery Options */}
                {currentStep === 2 && (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-card p-8 rounded-2xl"
                  >
                    <h2 className="text-3xl font-bold gradient-text mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      <FiTruck className="inline mr-3" />
                      Delivery Options
                    </h2>
                    
                    <form onSubmit={handleDeliverySubmit} className="space-y-6">
                      {/* Shipping Calculator */}
                      <ShippingCalculator
                        city={shippingInfo.city}
                        country={shippingInfo.country}
                        cartTotal={subtotal}
                        onShippingChange={handleShippingOptionsChange}
                        selectedMethod={shippingOptions.method}
                        selectedSlot={shippingOptions.timeSlot}
                        selectedDate={shippingOptions.date}
                      />
                      
                      <div className="flex gap-4 pt-4">
                        <Button variant="glass" onClick={() => setCurrentStep(1)}>
                          Back
                        </Button>
                        <Button type="submit" variant="3d" fullWidth icon={FiChevronRight}>
                          Continue to Payment
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Step 3: Payment Information */}
                {currentStep === 3 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-card p-8 rounded-2xl"
                  >
                    <h2 className="text-3xl font-bold gradient-text mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      Payment Method
                    </h2>
                    
                    {/* Payment Method Selection */}
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                      <div
                        onClick={() => setPaymentMethod('card')}
                        className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                          paymentMethod === 'card'
                            ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-cyan-500 shadow-lg shadow-cyan-500/20'
                            : 'bg-gray-900/30 border-purple-500/30 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            paymentMethod === 'card' ? 'bg-cyan-500' : 'bg-purple-500/30'
                          }`}>
                            <FiCreditCard className="text-2xl text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold">Credit/Debit Card</h3>
                            <p className="text-purple-300/70 text-sm">Pay securely with card</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                          paymentMethod === 'cod'
                            ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-green-500 shadow-lg shadow-green-500/20'
                            : 'bg-gray-900/30 border-purple-500/30 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            paymentMethod === 'cod' ? 'bg-green-500' : 'bg-purple-500/30'
                          }`}>
                            <FiDollarSign className="text-2xl text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold">Cash on Delivery</h3>
                            <p className="text-purple-300/70 text-sm">Pay when you receive</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      {/* Card Form - Only show when card payment selected */}
                      {paymentMethod === 'card' ? (
                        <>
                          <div>
                            <label className="block text-purple-300 font-semibold mb-2">Card Number *</label>
                            <input
                              type="text"
                              name="cardNumber"
                              value={paymentInfo.cardNumber}
                              onChange={handlePaymentChange}
                              maxLength="19"
                              className={`w-full px-4 py-3 bg-gray-900/50 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 relative z-10 cursor-text ${errors.cardNumber ? 'border-red-500' : 'border-purple-500/30 focus:border-cyan-500'}`}
                              style={{ pointerEvents: 'auto' }}
                              placeholder="e.g., 4111 1111 1111 1111"
                            />
                            {errors.cardNumber && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.cardNumber}</p>}
                            <p className="text-purple-400/50 text-xs mt-1">16 digits, spaces auto-added</p>
                          </div>

                          <div>
                            <label className="block text-purple-300 font-semibold mb-2">Cardholder Name *</label>
                            <input
                              type="text"
                              name="cardName"
                              value={paymentInfo.cardName}
                              onChange={handlePaymentChange}
                              className={`w-full px-4 py-3 bg-gray-900/50 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 relative z-10 cursor-text ${errors.cardName ? 'border-red-500' : 'border-purple-500/30 focus:border-cyan-500'}`}
                              style={{ pointerEvents: 'auto' }}
                              placeholder="e.g., AHMED KHAN (as printed on card)"
                            />
                            {errors.cardName && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.cardName}</p>}
                            <p className="text-purple-400/50 text-xs mt-1">Name exactly as on the card</p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-purple-300 font-semibold mb-2">Expiry Date *</label>
                              <input
                                type="text"
                                name="expiryDate"
                                value={paymentInfo.expiryDate}
                                onChange={handlePaymentChange}
                                maxLength="5"
                                className={`w-full px-4 py-3 bg-gray-900/50 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 relative z-10 cursor-text ${errors.expiryDate ? 'border-red-500' : 'border-purple-500/30 focus:border-cyan-500'}`}
                                style={{ pointerEvents: 'auto' }}
                                placeholder="e.g., 12/25"
                              />
                              {errors.expiryDate && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.expiryDate}</p>}
                              <p className="text-purple-400/50 text-xs mt-1">Month/Year format</p>
                            </div>
                            <div>
                              <label className="block text-purple-300 font-semibold mb-2">CVV *</label>
                              <input
                                type="password"
                                name="cvv"
                                value={paymentInfo.cvv}
                                onChange={handlePaymentChange}
                                maxLength="4"
                                className={`w-full px-4 py-3 bg-gray-900/50 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 relative z-10 cursor-text ${errors.cvv ? 'border-red-500' : 'border-purple-500/30 focus:border-cyan-500'}`}
                                style={{ pointerEvents: 'auto' }}
                                placeholder="e.g., 123"
                              />
                              {errors.cvv && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.cvv}</p>}
                              <p className="text-purple-400/50 text-xs mt-1">3-4 digits on back of card</p>
                            </div>
                          </div>

                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={paymentInfo.saveCard}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, saveCard: e.target.checked })}
                              className="w-5 h-5 rounded border-2 border-purple-500/30 bg-gray-900/50 text-purple-600 focus:ring-2 focus:ring-purple-500/50"
                            />
                            <span className="text-purple-300">Save card for future purchases</span>
                          </label>
                        </>
                      ) : (
                        <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                              <FiCheck className="text-2xl text-green-400" />
                            </div>
                            <div>
                              <h3 className="text-green-400 font-bold text-lg mb-2">Cash on Delivery Selected</h3>
                              <p className="text-green-300/70">
                                You will pay <span className="font-bold text-white">${total.toFixed(2)}</span> in cash when your order is delivered.
                              </p>
                              <ul className="mt-3 space-y-1 text-green-300/70 text-sm">
                                <li>✓ No advance payment required</li>
                                <li>✓ Pay only when you receive the order</li>
                                <li>✓ Inspect items before paying</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-4">
                        <Button variant="glass" onClick={() => setCurrentStep(2)}>
                          Back
                        </Button>
                        <Button type="submit" variant="3d" fullWidth icon={FiChevronRight}>
                          Review Order
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Step 4: Review & Place Order */}
                {currentStep === 4 && (
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

                    {/* Delivery Options Review */}
                    <div className="glass-card p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          <FiTruck className="inline mr-2" />
                          Delivery Options
                        </h3>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-purple-300 space-y-2">
                        <div className="flex items-center gap-3">
                          <FiTruck className="text-cyan-400" />
                          <span>{shippingOptions.methodName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            shippingOptions.freeShipping ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {shippingOptions.freeShipping ? 'FREE' : `Rs. ${shippingOptions.cost}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <FiClock className="text-cyan-400" />
                          <span>{shippingOptions.slotLabel}</span>
                        </div>
                        {shippingOptions.date && (
                          <div className="flex items-center gap-3">
                            <FiCalendar className="text-cyan-400" />
                            <span>
                              {new Date(shippingOptions.date).toLocaleDateString('en-PK', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Info Review */}
                    <div className="glass-card p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          Payment Method
                        </h3>
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                      {paymentMethod === 'card' ? (
                        <div className="flex items-center space-x-3">
                          <FiCreditCard className="text-3xl text-purple-400" />
                          <div className="text-purple-300">
                            <p className="font-semibold">**** **** **** {paymentInfo.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                            <p className="text-sm">Expires {paymentInfo.expiryDate}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <FiDollarSign className="text-2xl text-green-400" />
                          </div>
                          <div className="text-purple-300">
                            <p className="font-semibold text-green-400">Cash on Delivery</p>
                            <p className="text-sm">Pay ${total.toFixed(2)} when delivered</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <Button variant="glass" onClick={() => setCurrentStep(3)}>
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
                  
                  {/* Coupon System */}
                  <CouponSystem 
                    cartTotal={subtotal}
                    onCouponApplied={handleCouponApplied}
                    onCouponRemoved={handleCouponRemoved}
                  />
                  
                  {/* Discount Display */}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span className="flex items-center gap-2">
                        Discount
                        {appliedCoupon && (
                          <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded">
                            {appliedCoupon.code}
                          </span>
                        )}
                      </span>
                      <span className="font-semibold">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  
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
                    {discount > 0 && (
                      <p className="text-green-400 text-sm mt-1 text-right">
                        You're saving ${discount.toFixed(2)}! 🎉
                      </p>
                    )}
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
