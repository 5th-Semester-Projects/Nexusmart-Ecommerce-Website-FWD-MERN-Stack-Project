import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiShield, FiCheckCircle } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { register } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import MagicalParticles, { FloatingOrbs, ShootingStars } from '../../components/common/MagicalParticles';
import Button from '../../components/common/Button';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Calculate password strength
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Comprehensive Validation
    if (!formData.firstName.trim()) {
      toast.error('Please enter your first name', {
        style: {
          background: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(190, 24, 93))',
          color: '#fff',
          borderRadius: '12px',
        },
      });
      return;
    }

    if (!formData.lastName.trim()) {
      toast.error('Please enter your last name', {
        style: {
          background: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(190, 24, 93))',
          color: '#fff',
          borderRadius: '12px',
        },
      });
      return;
    }

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

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters', {
        style: {
          background: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(190, 24, 93))',
          color: '#fff',
          borderRadius: '12px',
        },
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!', {
        style: {
          background: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(190, 24, 93))',
          color: '#fff',
          borderRadius: '12px',
        },
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to terms and conditions', {
        style: {
          background: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(190, 24, 93))',
          color: '#fff',
          borderRadius: '12px',
        },
      });
      return;
    }

    try {
      await dispatch(register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      })).unwrap();
      
      toast.success('🎉 Account created successfully!', {
        style: {
          background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(16, 185, 129))',
          color: '#fff',
          borderRadius: '12px',
        },
      });
      navigate('/');
    } catch (err) {
      toast.error(err || 'Registration failed', {
        style: {
          background: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(190, 24, 93))',
          color: '#fff',
          borderRadius: '12px',
        },
      });
    }
  };

  const handleSocialSignup = (provider) => {
    toast.error(`${provider} signup coming soon!`, {
      icon: '🚀',
      style: {
        background: 'linear-gradient(135deg, rgb(139, 92, 246), rgb(59, 130, 246))',
        color: '#fff',
        borderRadius: '12px',
      },
    });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'from-red-500 to-red-600';
    if (passwordStrength <= 50) return 'from-orange-500 to-orange-600';
    if (passwordStrength <= 75) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  return (
    <>
      <Helmet>
        <title>Register - NexusMart | Join the Future</title>
        <meta name="description" content="Create your NexusMart account and start your magical shopping journey." />
      </Helmet>

      {/* Background Effects */}
      <div className="fixed inset-0 bg-gray-950 overflow-hidden">
        <MagicalParticles density={40} />
        <FloatingOrbs />
        <ShootingStars />
        
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
          className="w-full max-w-2xl"
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
            <p className="text-purple-300/80 text-lg">Begin Your Journey</p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            className="neon-card relative"
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
                <FiUser className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span className="gradient-text">Create Account</span>
              </h2>
              <p className="text-purple-300/70">Join the digital revolution</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name & Last Name Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    First Name
                  </label>
                  <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 group-hover:text-cyan-400 transition-colors z-10" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                               text-white placeholder-purple-400/50
                               focus:border-cyan-500 focus:outline-none
                               transition-all duration-300
                               hover:border-purple-400/50
                               backdrop-blur-sm"
                      placeholder="John"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </motion.div>

                {/* Last Name Field */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Last Name
                  </label>
                  <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 group-hover:text-cyan-400 transition-colors z-10" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                               text-white placeholder-purple-400/50
                               focus:border-cyan-500 focus:outline-none
                               transition-all duration-300
                               hover:border-purple-400/50
                               backdrop-blur-sm"
                      placeholder="Doe"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </motion.div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
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
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                               text-white placeholder-purple-400/50
                               focus:border-cyan-500 focus:outline-none
                               transition-all duration-300
                               hover:border-purple-400/50
                               backdrop-blur-sm"
                      placeholder="your@email.com"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </motion.div>

                {/* Phone Field */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 group-hover:text-cyan-400 transition-colors z-10" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                               text-white placeholder-purple-400/50
                               focus:border-cyan-500 focus:outline-none
                               transition-all duration-300
                               hover:border-purple-400/50
                               backdrop-blur-sm"
                      placeholder="+1 234 567 8900"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </motion.div>
              </div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
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
                    className="w-full pl-12 pr-12 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                             text-white placeholder-purple-400/50
                             focus:border-cyan-500 focus:outline-none
                             transition-all duration-300
                             hover:border-purple-400/50
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-purple-300/70">Password Strength</span>
                      <span className={`font-semibold ${passwordStrength >= 75 ? 'text-green-400' : passwordStrength >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength}%` }}
                        className={`h-full bg-gradient-to-r ${getPasswordStrengthColor()}`}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 group-hover:text-cyan-400 transition-colors z-10" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                             text-white placeholder-purple-400/50
                             focus:border-cyan-500 focus:outline-none
                             transition-all duration-300
                             hover:border-purple-400/50
                             backdrop-blur-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-cyan-400 transition-colors z-10"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <FiCheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-400" />
                  )}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </motion.div>

              {/* Terms & Conditions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-purple-500/30 bg-gray-900/50 text-purple-600 
                             focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                  <span className="text-sm text-purple-300/70 group-hover:text-purple-300">
                    I agree to the{' '}
                    <Link to="/terms" className="text-cyan-400 hover:text-cyan-300">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  type="submit"
                  variant="3d"
                  fullWidth
                  loading={loading}
                  className="relative overflow-hidden"
                >
                  <span className="relative z-10">Create Account</span>
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="relative"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-500/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900/50 text-purple-300/70">Or sign up with</span>
                </div>
              </motion.div>

              {/* Social Signup */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="grid grid-cols-2 gap-4"
              >
                <button
                  type="button"
                  onClick={() => handleSocialSignup('Google')}
                  className="flex items-center justify-center space-x-2 px-4 py-3 
                           bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                           text-purple-300 hover:border-purple-400 hover:bg-gray-900/70
                           transition-all duration-300 group"
                >
                  <FaGoogle className="text-xl group-hover:scale-110 transition-transform" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialSignup('GitHub')}
                  className="flex items-center justify-center space-x-2 px-4 py-3 
                           bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                           text-purple-300 hover:border-purple-400 hover:bg-gray-900/70
                           transition-all duration-300 group"
                >
                  <FaGithub className="text-xl group-hover:scale-110 transition-transform" />
                  <span>GitHub</span>
                </button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-8 text-center"
            >
              <p className="text-purple-300/70">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center space-x-2 text-purple-300/50 text-sm">
              <FiShield className="text-lg" />
              <span>Your data is protected with enterprise-grade security</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;
