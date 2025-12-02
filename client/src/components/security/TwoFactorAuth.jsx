import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, FiSmartphone, FiMail, FiKey, FiCheck, FiX,
  FiAlertTriangle, FiCopy, FiRefreshCw, FiLock, FiUnlock
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

// OTP Input Component
const OTPInput = ({ length = 6, value, onChange }) => {
  const inputRefs = useRef([]);

  const handleChange = (index, digit) => {
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split('');
    newValue[index] = digit;
    onChange(newValue.join(''));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      onChange(pastedData.padEnd(length, ''));
      inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
        />
      ))}
    </div>
  );
};

// 2FA Setup Step Component
const Setup2FAStep = ({ step, currentStep, title, description, children }) => {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className={`relative pl-10 pb-8 ${step === 3 ? '' : 'border-l-2 border-white/10 ml-4'}`}>
      {/* Step Number */}
      <div className={`absolute -left-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        isCompleted 
          ? 'bg-green-600 text-white' 
          : isActive 
          ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white' 
          : 'bg-white/10 text-gray-400'
      }`}>
        {isCompleted ? <FiCheck /> : step}
      </div>

      {/* Content */}
      <div className={`${isActive ? 'opacity-100' : 'opacity-50'}`}>
        <h3 className="font-bold text-white text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        {isActive && children}
      </div>
    </div>
  );
};

// Main 2FA Setup Component
export const TwoFactorSetup = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('app'); // 'app' | 'sms' | 'email'
  const [secret, setSecret] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Initialize 2FA Setup
  const initSetup = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/2fa/setup', { method });
      setSecret(data.secret);
      setQrUrl(data.qrUrl);
      setStep(2);
    } catch (error) {
      toast.error('Failed to initialize 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  // Verify Code
  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/2fa/verify', {
        code: verificationCode,
        method,
      });
      setBackupCodes(data.backupCodes);
      setStep(3);
    } catch (error) {
      toast.error('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Copy Secret Key
  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopiedCode(true);
    toast.success('Secret key copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Complete Setup
  const completeSetup = () => {
    toast.success('Two-factor authentication enabled!');
    onComplete?.();
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center">
          <FiShield className="text-3xl text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Setup Two-Factor Authentication</h2>
        <p className="text-gray-400 mt-2">Add an extra layer of security to your account</p>
      </div>

      {/* Step 1: Choose Method */}
      <Setup2FAStep
        step={1}
        currentStep={step}
        title="Choose Verification Method"
        description="Select how you want to receive verification codes"
      >
        <div className="space-y-3 mb-4">
          {[
            { id: 'app', icon: FiSmartphone, label: 'Authenticator App', desc: 'Use Google Authenticator, Authy, or similar' },
            { id: 'sms', icon: FiSmartphone, label: 'SMS', desc: 'Receive codes via text message' },
            { id: 'email', icon: FiMail, label: 'Email', desc: 'Receive codes via email' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setMethod(option.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                method === option.id
                  ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-cyan-500'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                method === option.id ? 'bg-cyan-600' : 'bg-white/10'
              }`}>
                <option.icon className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">{option.label}</p>
                <p className="text-sm text-gray-400">{option.desc}</p>
              </div>
              {method === option.id && (
                <FiCheck className="ml-auto text-cyan-400" />
              )}
            </button>
          ))}
        </div>
        <button
          onClick={initSetup}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Continue'
          )}
        </button>
      </Setup2FAStep>

      {/* Step 2: Scan QR / Enter Code */}
      <Setup2FAStep
        step={2}
        currentStep={step}
        title={method === 'app' ? 'Scan QR Code' : 'Enter Verification Code'}
        description={method === 'app' 
          ? 'Scan this QR code with your authenticator app' 
          : 'Enter the code sent to your device'
        }
      >
        {method === 'app' && (
          <div className="mb-6">
            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl w-fit mx-auto mb-4">
              <QRCodeSVG 
                value={qrUrl || 'otpauth://totp/NexusMart:demo@example.com?secret=DEMO&issuer=NexusMart'} 
                size={180} 
              />
            </div>

            {/* Manual Entry */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Can't scan? Enter this code manually:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-black/30 rounded-lg font-mono text-cyan-400 text-sm">
                  {secret || 'DEMO-SECRET-KEY'}
                </code>
                <button
                  onClick={copySecret}
                  className={`p-2 rounded-lg transition-colors ${
                    copiedCode ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {copiedCode ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Enter 6-digit verification code
          </label>
          <OTPInput
            length={6}
            value={verificationCode}
            onChange={setVerificationCode}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium"
          >
            Back
          </button>
          <button
            onClick={verifyCode}
            disabled={loading || verificationCode.length !== 6}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Verify'
            )}
          </button>
        </div>
      </Setup2FAStep>

      {/* Step 3: Backup Codes */}
      <Setup2FAStep
        step={3}
        currentStep={step}
        title="Save Backup Codes"
        description="Store these codes safely. You can use them if you lose access to your device."
      >
        <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="text-yellow-400 mt-1" />
            <div>
              <p className="font-medium text-yellow-400">Important!</p>
              <p className="text-sm text-gray-300">
                Each backup code can only be used once. Keep them in a secure place.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {(backupCodes.length > 0 ? backupCodes : [
            'ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456',
            'QRST-7890', 'UVWX-1234', 'YZAB-5678', 'CDEF-9012'
          ]).map((code, index) => (
            <div
              key={index}
              className="px-4 py-2 bg-white/5 rounded-lg font-mono text-white text-center"
            >
              {code}
            </div>
          ))}
        </div>

        <button
          onClick={completeSetup}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <FiCheck />
          I've Saved My Backup Codes
        </button>
      </Setup2FAStep>
    </div>
  );
};

// 2FA Status Card
export const TwoFactorStatus = ({ enabled = false, method = 'app', onEnable, onDisable }) => {
  return (
    <div className={`rounded-2xl p-6 border ${
      enabled 
        ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30'
        : 'bg-white/5 border-white/10'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            enabled ? 'bg-green-500/20' : 'bg-white/10'
          }`}>
            {enabled ? (
              <FiShield className="text-2xl text-green-400" />
            ) : (
              <FiUnlock className="text-2xl text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
            <p className={`text-sm ${enabled ? 'text-green-400' : 'text-gray-400'}`}>
              {enabled 
                ? `Enabled via ${method === 'app' ? 'Authenticator App' : method.toUpperCase()}` 
                : 'Not enabled'
              }
            </p>
          </div>
        </div>
        <button
          onClick={enabled ? onDisable : onEnable}
          className={`px-6 py-2 rounded-xl font-medium transition-colors ${
            enabled
              ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
              : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
          }`}
        >
          {enabled ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
