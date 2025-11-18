import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiGithub,
  FiMail, FiPhone, FiMapPin, FiZap, FiHeart, FiSend
} from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FiFacebook, href: '#', label: 'Facebook', color: 'hover:text-blue-400' },
    { icon: FiTwitter, href: '#', label: 'Twitter', color: 'hover:text-cyan-400' },
    { icon: FiInstagram, href: '#', label: 'Instagram', color: 'hover:text-pink-400' },
    { icon: FiLinkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-500' },
    { icon: FiGithub, href: '#', label: 'GitHub', color: 'hover:text-purple-400' },
  ];

  const quickLinks = [
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'Deals', path: '/deals' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Best Sellers', path: '/best-sellers' },
  ];

  const customerService = [
    { name: 'Help Center', path: '/help' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'Returns & Refunds', path: '/returns' },
    { name: 'Shipping Info', path: '/shipping' },
    { name: 'FAQ', path: '/faq' },
  ];

  const company = [
    { name: 'About Us', path: '/about' },
    { name: 'Careers', path: '/careers' },
    { name: 'Blog', path: '/blog' },
    { name: 'Press', path: '/press' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top Section - Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden">
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-border opacity-20"></div>
            
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <span className="gradient-text">Stay in the Loop</span>
                </h3>
                <p className="text-purple-300/70">
                  Get exclusive deals, early access to new products, and magical shopping tips!
                </p>
              </div>
              
              <form className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                             text-white placeholder-purple-400/50
                             focus:border-cyan-500 focus:outline-none
                             transition-all duration-300"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 
                           hover:from-purple-500 hover:to-blue-500
                           text-white font-bold rounded-xl
                           shadow-lg shadow-purple-500/30
                           transition-all duration-300
                           flex items-center justify-center space-x-2"
                >
                  <span>Subscribe</span>
                  <FiSend />
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative w-12 h-12"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <FiZap className="text-white text-2xl" />
                </div>
              </motion.div>
              <span className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                NexusMart
              </span>
            </Link>
            
            <p className="text-purple-300/70 mb-6 leading-relaxed">
              Experience the future of shopping with our magical AI-powered platform. 
              Where technology meets elegance in every transaction.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 
                           border border-purple-500/30 flex items-center justify-center
                           text-purple-300 ${social.color} transition-all duration-300`}
                  aria-label={social.label}
                >
                  <social.icon className="text-lg" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    to={link.path}
                    className="text-purple-300/70 hover:text-cyan-400 transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full group-hover:bg-cyan-400 transition-colors"></span>
                    <span>{link.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Customer Service</h3>
            <ul className="space-y-3">
              {customerService.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    to={link.path}
                    className="text-purple-300/70 hover:text-cyan-400 transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full group-hover:bg-cyan-400 transition-colors"></span>
                    <span>{link.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Company</h3>
            <ul className="space-y-3">
              {company.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    to={link.path}
                    className="text-purple-300/70 hover:text-cyan-400 transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full group-hover:bg-cyan-400 transition-colors"></span>
                    <span>{link.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <FiMapPin className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-purple-300/50">Address</p>
                <p className="text-purple-300">123 Tech Street, Cyber City</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <FiPhone className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-purple-300/50">Phone</p>
                <p className="text-purple-300">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <FiMail className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-purple-300/50">Email</p>
                <p className="text-purple-300">support@nexusmart.com</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-purple-300/50 text-sm text-center md:text-left">
              © {currentYear} NexusMart. All rights reserved. Crafted with <FiHeart className="inline text-red-400 mx-1" /> by the future.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/privacy" className="text-purple-300/50 hover:text-cyan-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-purple-300/50 hover:text-cyan-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-purple-300/50 hover:text-cyan-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Magical Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full
                          bg-gradient-to-r from-purple-500/10 to-blue-500/10
                          border border-purple-500/20">
              <FiZap className="text-cyan-400" />
              <span className="text-sm text-purple-300/70">
                Powered by Magical Technology
              </span>
              <FiZap className="text-cyan-400" />
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
