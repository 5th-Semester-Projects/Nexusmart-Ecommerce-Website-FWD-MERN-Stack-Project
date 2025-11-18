import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight, FiShoppingBag, FiZap, FiStar, FiPackage, 
  FiCpu, FiActivity, FiBox, FiTrendingUp, FiGift, FiShield,
  FiTruck, FiAward, FiPercent, FiHeart
} from 'react-icons/fi';
import { fetchTrendingProducts, fetchNewArrivals } from '../redux/slices/productSlice';
import ProductGrid from '../components/products/ProductGrid';
import { PageLoader } from '../components/common/Loader';
import Button from '../components/common/Button';
import api from '../utils/api';
import UltimateHomeMagic from '../components/3d/UltimateHomeMagic';
import MagicalGenie from '../components/common/MagicalGenie';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trending = [], newArrivals = [], loading, products = [] } = useSelector((state) => state.products);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({
    Men: 0,
    Women: 0,
    Electronics: 0
  });

  const heroSlides = [
    {
      title: 'NEXUSMART',
      subtitle: 'FUTURE OF DIGITAL COMMERCE',
      description: 'Powered by AI • Blockchain Secured • AR Enhanced',
      cta: 'EXPLORE PRODUCTS',
      link: '/products',
      color: 'cyan'
    },
    {
      title: 'HOT DEALS',
      subtitle: 'UP TO 70% OFF',
      description: 'Limited Time Offers • Premium Quality • Best Prices',
      cta: 'VIEW DEALS',
      link: '/deals',
      color: 'red'
    },
    {
      title: 'NEW ARRIVALS',
      subtitle: 'LATEST COLLECTION',
      description: 'Fresh Styles • Trending Fashion • Tech Gadgets',
      cta: 'SHOP NOW',
      link: '/products?sort=newest',
      color: 'purple'
    }
  ];

  useEffect(() => {
    dispatch(fetchTrendingProducts());
    dispatch(fetchNewArrivals());
    fetchCategoryCounts();
    
    // Auto-slide carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  const fetchCategoryCounts = async () => {
    try {
      const response = await api.get('/products', { params: { limit: 1000 } });
      const allProducts = response.data?.products || [];
      
      const counts = {
        Men: 0,
        Women: 0,
        Electronics: 0
      };

      allProducts.forEach(product => {
        const categoryName = typeof product.category === 'object' 
          ? product.category.name 
          : product.category;
        
        if (categoryName) {
          const catUpper = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
          if (counts.hasOwnProperty(catUpper)) {
            counts[catUpper]++;
          }
        }
      });

      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  if (loading && trending.length === 0 && newArrivals.length === 0) {
    return <PageLoader />;
  }

  return (
    <>
      <Helmet>
        <title>NexusMart - Revolutionary Digital Commerce Platform</title>
        <meta name="description" content="Experience the future of shopping with AI-powered recommendations and cutting-edge technology." />
      </Helmet>

      <div className="min-h-screen relative">
        {/* Circuit Background - Reduced Opacity */}
        <div className="circuit-bg" style={{ opacity: 0.15 }}></div>

        {/* Ultimate Home Magic Background - Reduced Opacity */}
        <div className="fixed inset-0 -z-10 opacity-20">
          <UltimateHomeMagic intensity="high" />
        </div>

        {/* Magical Genie */}
        <MagicalGenie />

        {/* HERO SECTION - Robotic Design */}
        <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
          {/* Animated Tech Grid */}
          <div className="absolute inset-0 tech-grid opacity-10"></div>
          
          {/* Scan Lines Effect */}
          <div className="scan-lines"></div>

          {/* Energy Orbs - Reduced Opacity */}
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(136, 0, 255, 0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.1, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Hero Content with Carousel */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                {/* Glitch Logo */}
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 inline-flex items-center gap-3"
                >
                  <motion.div
                    className="energy-core w-20 h-20 flex items-center justify-center"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    {currentSlide === 0 && <FiCpu className="text-5xl text-cyan-400" />}
                    {currentSlide === 1 && <FiZap className="text-5xl text-red-400" />}
                    {currentSlide === 2 && <FiGift className="text-5xl text-purple-400" />}
                  </motion.div>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                  className="text-6xl md:text-8xl font-display mb-6 glitch"
                  style={{
                    fontFamily: 'Audiowide, Orbitron, sans-serif',
                    textShadow: `0 0 30px rgba(${heroSlides[currentSlide].color === 'cyan' ? '0, 212, 255' : heroSlides[currentSlide].color === 'red' ? '255, 0, 0' : '136, 0, 255'}, 0.8)`,
                  }}
                >
                  <span className="gradient-text-robotic">{heroSlides[currentSlide].title}</span>
                </motion.h1>

                <motion.p
                  className="text-xl md:text-3xl text-cyan-300 mb-4 font-body tracking-wide"
                >
                  {heroSlides[currentSlide].subtitle}
                </motion.p>

                <motion.p
                  className="text-base md:text-lg text-gray-400 mb-12 max-w-3xl mx-auto font-tech"
                >
                  {heroSlides[currentSlide].description}
                </motion.p>

                {/* CTA Button */}
                <Link to={heroSlides[currentSlide].link}>
                  <button className="btn-cyber group">
                    <span className="relative z-10">{heroSlides[currentSlide].cta}</span>
                    <FiArrowRight className="inline-block ml-2 group-hover:translate-x-2 transition-transform" />
                  </button>
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-3 mt-12">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === index
                      ? 'bg-cyan-400 w-8'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            {/* Stats - Robotic Design */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {[
                { icon: FiBox, value: products.length + '+', label: 'Products', color: 'cyan' },
                { icon: FiActivity, value: '99.9%', label: 'Uptime', color: 'purple' },
                { icon: FiStar, value: '4.9', label: 'Rating', color: 'green' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="glass-robotic p-6 rounded-2xl relative overflow-hidden group"
                >
                  <div className="data-stream"></div>
                  <stat.icon className={`text-4xl mb-3 text-${stat.color}-400`} />
                  <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Russo One' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-tech">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex items-start justify-center p-2">
              <motion.div
                className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                animate={{
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>
        </section>

        {/* FEATURED CATEGORIES SECTION */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="circuit-bg"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Orbitron' }}>
                CATEGORIES
              </h2>
              <div className="h-1 w-32 mx-auto circuit-line"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'MEN', icon: '👔', count: categoryCounts.Men, color: 'cyan', link: '/products?category=Men' },
                { name: 'WOMEN', icon: '👗', count: categoryCounts.Women, color: 'purple', link: '/products?category=Women' },
                { name: 'ELECTRONICS', icon: '⚡', count: categoryCounts.Electronics, color: 'red', link: '/products?category=Electronics' },
              ].map((category, index) => (
                <Link key={index} to={category.link}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="glass-robotic p-8 rounded-2xl text-center cursor-pointer holographic
                             group relative overflow-hidden"
                  >
                    <div className="text-6xl mb-4 filter drop-shadow-lg">{category.icon}</div>
                    <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Russo One' }}>
                      {category.name}
                    </h3>
                    <p className="text-gray-400 font-tech">{category.count} ITEMS</p>
                    <motion.div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r 
                        from-transparent via-${category.color}-400 to-transparent`}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* TRENDING PRODUCTS */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-12"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'Orbitron' }}>
                  TRENDING NOW
                </h2>
                <div className="h-1 w-32 circuit-line"></div>
              </div>
              <Link to="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-3 rounded-xl border-2 border-cyan-400/30 text-cyan-400
                           hover:border-cyan-400 hover:bg-cyan-400/10 transition-all
                           font-bold text-sm uppercase tracking-wider"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  VIEW ALL
                  <FiArrowRight className="inline-block ml-2" />
                </motion.button>
              </Link>
            </motion.div>
            
            <ProductGrid products={trending} loading={loading && trending.length === 0} />
          </div>
        </section>

        {/* FEATURES SECTION - Enhanced with More Icons */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="circuit-bg"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Orbitron' }}>
                WHY CHOOSE US
              </h2>
              <div className="h-1 w-32 mx-auto circuit-line"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: FiTruck,
                  title: 'FREE SHIPPING',
                  description: 'On all orders over $50. Fast and reliable delivery.',
                  color: 'cyan',
                },
                {
                  icon: FiShield,
                  title: 'SECURE PAYMENT',
                  description: 'Military-grade encryption for all transactions.',
                  color: 'purple',
                },
                {
                  icon: FiAward,
                  title: 'TOP QUALITY',
                  description: '100% authentic products with quality guarantee.',
                  color: 'green',
                },
                {
                  icon: FiPercent,
                  title: 'BEST DEALS',
                  description: 'Daily discounts up to 70% off on selected items.',
                  color: 'red',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="glass-robotic p-6 rounded-2xl text-center relative overflow-hidden group"
                >
                  <div className="holographic"></div>
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
                               bg-gradient-to-br from-${feature.color}-400/20 to-${feature.color}-600/20
                               border-2 border-${feature.color}-400/30 pulse-cyber`}
                  >
                    <feature.icon className={`text-3xl text-${feature.color}-400`} />
                  </motion.div>
                  <h3 className="text-lg font-bold mb-2 uppercase tracking-wider" 
                      style={{ fontFamily: 'Russo One' }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm font-body">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS / SOCIAL PROOF */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-gray-900/50 to-transparent">
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Orbitron' }}>
                TRUSTED BY THOUSANDS
              </h2>
              <div className="h-1 w-32 mx-auto circuit-line"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  rating: 5,
                  text: "Best online shopping experience! Fast delivery and amazing products.",
                  author: "Sarah Johnson",
                  role: "Verified Buyer"
                },
                {
                  rating: 5,
                  text: "Great quality and prices. The customer service is exceptional!",
                  author: "Michael Chen",
                  role: "Premium Member"
                },
                {
                  rating: 5,
                  text: "Love the variety and the seamless checkout process. Highly recommend!",
                  author: "Emma Wilson",
                  role: "Loyal Customer"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-robotic p-6 rounded-2xl relative overflow-hidden"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="text-cyan-400 font-bold">{testimonial.author}</p>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-red-900/20"></div>
          <div className="scan-lines"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-robotic p-12 rounded-3xl holographic"
            >
              <motion.div
                className="energy-core w-16 h-16 mx-auto mb-6"
              >
                <FiZap className="text-5xl text-cyan-400" />
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Audiowide' }}>
                READY TO EXPERIENCE THE FUTURE?
              </h2>
              
              <p className="text-xl text-gray-300 mb-10 font-body">
                Join thousands of satisfied customers and revolutionize your shopping experience.
              </p>
              
              <Link to="/products">
                <button className="btn-cyber text-lg px-12 py-5">
                  START SHOPPING NOW
                  <FiArrowRight className="inline-block ml-3 text-2xl" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
