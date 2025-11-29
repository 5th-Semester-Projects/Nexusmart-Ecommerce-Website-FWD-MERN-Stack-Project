import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiArrowRight, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeItemFromCart, updateItemQuantity } from '../redux/slices/cartSlice';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
// Removed RoboticBackground for performance
import MagicalGenie from '../components/common/MagicalGenie';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const cartItems = items || [];

  const handleRemoveItem = (productId) => {
    dispatch(removeItemFromCart(productId));
    toast.success('✨ Item removed from cart', {
      style: { background: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(190, 24, 93))', color: '#fff', borderRadius: '12px' }
    });
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateItemQuantity({ itemId: productId, quantity }));
    toast.success('📦 Quantity updated!', {
      style: { background: 'linear-gradient(135deg, rgb(139, 92, 246), rgb(59, 130, 246))', color: '#fff', borderRadius: '12px' }
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - NexusMart</title>
        </Helmet>
        <div className="min-h-screen py-20">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-12 text-center rounded-3xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-8xl mb-6"
              >
                🛒
              </motion.div>
              <h2 className="text-4xl font-bold gradient-text mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Your Cart is Empty
              </h2>
              <p className="text-purple-300/70 mb-8 text-lg">
                Looks like you haven't added anything to your magical cart yet.
              </p>
              <Button variant="3d" size="lg" icon={FiShoppingBag} onClick={() => navigate('/products')}>
                Start Shopping
              </Button>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${cartItems?.length || 0}) - NexusMart`}</title>
      </Helmet>
      
      {/* Lightweight CSS Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-cyan-950/10 to-gray-950"></div>

      {/* Magical Genie */}
      <MagicalGenie />
      
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="gradient-text">Shopping Cart</span>
            </h1>
            <p className="text-purple-300/70 text-lg">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your magical cart
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item, index) => {
                  const productId = item._id || item.product?._id || item.product;
                  const itemImage = item.image || item.images?.[0]?.url || '/placeholder.jpg';
                  const itemName = item.name || 'Product';
                  const itemPrice = item.price || 0;
                  const itemQuantity = item.quantity || 1;
                  
                  return (
                  <motion.div
                    key={productId || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 rounded-2xl"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 h-32 flex-shrink-0">
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-purple-300 mb-2">
                          {itemName}
                        </h3>
                        <p className="text-2xl font-bold gradient-text mb-4">
                          ${itemPrice.toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-4 relative z-10">
                          <div className="flex items-center space-x-3 bg-purple-500/10 border border-purple-500/30 rounded-xl p-2">
                            <button
                              onClick={() => handleUpdateQuantity(productId, itemQuantity - 1)}
                              className="w-8 h-8 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg
                                       text-purple-300 hover:text-cyan-400 transition-all duration-300
                                       flex items-center justify-center cursor-pointer relative z-20"
                              style={{ pointerEvents: 'auto' }}
                            >
                              <FiMinus />
                            </button>
                            <span className="text-lg font-bold text-purple-300 w-8 text-center">
                              {itemQuantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(productId, itemQuantity + 1)}
                              className="w-8 h-8 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg
                                       text-purple-300 hover:text-cyan-400 transition-all duration-300
                                       flex items-center justify-center cursor-pointer relative z-20"
                              style={{ pointerEvents: 'auto' }}
                            >
                              <FiPlus />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(productId)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg
                                     transition-all duration-300 cursor-pointer relative z-20"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <FiTrash2 className="text-xl" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-purple-300/50 text-sm mb-1">Item Total</p>
                        <p className="text-2xl font-bold gradient-text">
                          ${(itemPrice * itemQuantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Continue Shopping */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Button variant="glass" onClick={() => navigate('/products')} icon={FiShoppingBag}>
                  Continue Shopping
                </Button>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 rounded-2xl sticky top-24"
              >
                <h3 className="text-2xl font-bold gradient-text mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-purple-300">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-400">FREE</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Tax (10%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-purple-500/30 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-purple-300">Total</span>
                      <span className="text-3xl font-bold gradient-text">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <p className="text-sm text-purple-300">
                      💡 Add <span className="font-bold text-cyan-400">${(100 - subtotal).toFixed(2)}</span> more for FREE shipping!
                    </p>
                  </div>
                )}

                <Button
                  variant="3d"
                  fullWidth
                  onClick={handleCheckout}
                  icon={FiArrowRight}
                  className="mb-4"
                >
                  Proceed to Checkout
                </Button>

                {!isAuthenticated && (
                  <p className="text-sm text-purple-300/70 text-center">
                    Please <span className="text-cyan-400 cursor-pointer hover:underline" onClick={() => navigate('/login')}>login</span> to checkout
                  </p>
                )}
              </motion.div>
            </div>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="glass-card p-6 text-center rounded-2xl">
              <div className="text-5xl mb-3">🚚</div>
              <h3 className="font-bold text-purple-300 mb-2">Free Shipping</h3>
              <p className="text-sm text-purple-300/70">On orders over $100</p>
            </div>
            <div className="glass-card p-6 text-center rounded-2xl">
              <div className="text-5xl mb-3">🔒</div>
              <h3 className="font-bold text-purple-300 mb-2">Secure Payment</h3>
              <p className="text-sm text-purple-300/70">100% secure transactions</p>
            </div>
            <div className="glass-card p-6 text-center rounded-2xl">
              <div className="text-5xl mb-3">↩️</div>
              <h3 className="font-bold text-purple-300 mb-2">Easy Returns</h3>
              <p className="text-sm text-purple-300/70">30-day return policy</p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
