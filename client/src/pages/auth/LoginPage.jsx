import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap, FiShield, FiUser } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { login } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email.trim() || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      toast.error('Please enter a valid email address', {
        style: {
          background: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(190, 24, 93))',
          color: '#fff',
          borderRadius: '12px',
        },
      });
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error('Please enter a valid password', {
        style: {
          background: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(190, 24, 93))',
          color: '#fff',
          borderRadius: '12px',
        },
      });
      return;
    }

    try {
      const result = await dispatch(login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })).unwrap();
      
      // Only show success and navigate if login was actually successful
      if (result && result.user) {
        toast.success('🎉 Welcome back to NexusMart!', {
          style: {
            background: 'linear-gradient(135deg, rgb(139, 92, 246), rgb(59, 130, 246))',
            color: '#fff',
            borderRadius: '12px',
          },
        });
        navigate('/');
      }
    } catch (err) {
      // Clear password on failed login to prevent browser from saving
      setFormData(prev => ({ ...prev, password: '' }));
      
      toast.error(err || 'Invalid email or password', {
        style: {
          background: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(190, 24, 93))',
          color: '#fff',
          borderRadius: '12px',
        },
      });
    }
  };

  const handleSocialLogin = (provider) => {
    toast.error(`${provider} login coming soon!`, {
      icon: '🚀',
      style: {
        background: 'linear-gradient(135deg, rgb(139, 92, 246), rgb(59, 130, 246))',
        color: '#fff',
        borderRadius: '12px',
      },
    });
  };

  return (
    <>
      <Helmet>
        <title>Login - NexusMart | Magical Shopping Experience</title>
        <meta name="description" content="Sign in to access your NexusMart account and continue your magical shopping journey." />
      </Helmet>

      {/* Background Effects - Pure CSS */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 overflow-hidden">
        {/* Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-30" />
        
        {/* Scan Lines */}
        <div className="absolute inset-0 scan-lines opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="w-full max-w-md"
        >
          {/* Logo / Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{
                textShadow: [
                  '0 0 20px rgba(139, 92, 246, 0.5)',
                  '0 0 40px rgba(59, 130, 246, 0.8)',
                  '0 0 20px rgba(139, 92, 246, 0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl font-bold mb-2"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <span className="gradient-text">NexusMart</span>
            </motion.div>
            <p className="text-purple-300/80 text-lg">Enter the Digital Dimension</p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            className="neon-card relative"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ y: -5 }}
          >
            {/* Corner Ornaments */}
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-purple-500"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-purple-500"></div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mb-4 shadow-lg">
                <FiZap className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span className="gradient-text">Welcome Back</span>
              </h2>
              <p className="text-purple-300/70">Access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off" data-form-type="other">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 group-hover:text-cyan-400 transition-colors z-10" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-900/60 border-2 border-purple-500/30 rounded-xl
                             text-white placeholder-purple-400/50
                             focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20
                             focus:shadow-[0_0_20px_rgba(6,182,212,0.3)]
                             transition-all duration-300
                             hover:border-purple-400/60 hover:bg-gray-900/70
                             backdrop-blur-sm"
                    placeholder="your@email.com"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 group-hover:text-cyan-400 transition-colors z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-900/60 border-2 border-purple-500/30 rounded-xl
                             text-white placeholder-purple-400/50
                             focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20
                             focus:shadow-[0_0_20px_rgba(6,182,212,0.3)]
                             transition-all duration-300
                             hover:border-purple-400/60 hover:bg-gray-900/70
                             backdrop-blur-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-cyan-400 transition-colors z-10"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-purple-500/30 bg-gray-900/50 text-purple-600 
                             focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                  <span className="text-sm text-purple-300/70 group-hover:text-purple-300">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  variant="3d"
                  fullWidth
                  loading={loading}
                  className="relative overflow-hidden"
                >
                  <span className="relative z-10">Sign In</span>
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="relative"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-500/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900/50 text-purple-300/70">Or continue with</span>
                </div>
              </motion.div>

              {/* Social Login */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-2 gap-4"
              >
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center space-x-2 px-4 py-3.5 
                           bg-gray-900/60 border-2 border-purple-500/30 rounded-xl
                           text-purple-300 
                           hover:border-cyan-400/60 hover:bg-purple-900/40 hover:text-cyan-300
                           hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]
                           active:scale-95
                           transition-all duration-300 group"
                >
                  <FaGoogle className="text-xl group-hover:scale-110 group-hover:text-red-400 transition-all" />
                  <span className="font-semibold">Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('GitHub')}
                  className="flex items-center justify-center space-x-2 px-4 py-3.5 
                           bg-gray-900/60 border-2 border-purple-500/30 rounded-xl
                           text-purple-300 
                           hover:border-cyan-400/60 hover:bg-purple-900/40 hover:text-cyan-300
                           hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]
                           active:scale-95
                           transition-all duration-300 group"
                >
                  <FaGithub className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all" />
                  <span className="font-semibold">GitHub</span>
                </button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 text-center"
            >
              <p className="text-purple-300/70">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-all
                           hover:underline hover:underline-offset-4
                           hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                >
                  Create one now
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center space-x-2 text-purple-300/50 text-sm">
              <FiShield className="text-lg" />
              <span>Secured with 256-bit encryption</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
