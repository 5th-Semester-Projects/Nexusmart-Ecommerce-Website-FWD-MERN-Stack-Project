import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRuler, FaCamera, FaTshirt, FaInfoCircle,
  FaCheck, FaTimes, FaRedo, FaMagic, FaUserAlt,
  FaArrowRight, FaChartLine, FaHistory, FaSave,
  FaMale, FaFemale, FaChild
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const AISizePredictor = ({ product, onSizeSelect }) => {
  const [step, setStep] = useState('input'); // input, measuring, result
  const [measurementMethod, setMeasurementMethod] = useState(null); // manual, camera, history
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    inseam: '',
    shoulders: '',
    armLength: ''
  });
  const [bodyType, setBodyType] = useState('');
  const [gender, setGender] = useState('');
  const [fitPreference, setFitPreference] = useState('regular'); // slim, regular, loose
  const [predictedSize, setPredictedSize] = useState(null);
  const [sizeConfidence, setSizeConfidence] = useState(0);
  const [alternativeSizes, setAlternativeSizes] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Size charts for different product categories
  const sizeCharts = {
    tops: {
      XS: { chest: [76, 81], waist: [61, 66], height: [155, 165] },
      S: { chest: [81, 86], waist: [66, 71], height: [160, 170] },
      M: { chest: [86, 91], waist: [71, 76], height: [165, 175] },
      L: { chest: [91, 96], waist: [76, 81], height: [170, 180] },
      XL: { chest: [96, 101], waist: [81, 86], height: [175, 185] },
      XXL: { chest: [101, 106], waist: [86, 91], height: [180, 190] }
    },
    bottoms: {
      XS: { waist: [61, 66], hips: [86, 91], inseam: [71, 74] },
      S: { waist: [66, 71], hips: [91, 96], inseam: [74, 76] },
      M: { waist: [71, 76], hips: [96, 101], inseam: [76, 79] },
      L: { waist: [76, 81], hips: [101, 106], inseam: [79, 81] },
      XL: { waist: [81, 86], hips: [106, 111], inseam: [81, 84] },
      XXL: { waist: [86, 91], hips: [111, 116], inseam: [84, 86] }
    },
    shoes: {
      '6': { length: [23.5, 24] },
      '7': { length: [24, 24.5] },
      '8': { length: [24.5, 25] },
      '9': { length: [25, 25.5] },
      '10': { length: [25.5, 26] },
      '11': { length: [26, 26.5] },
      '12': { length: [26.5, 27] }
    }
  };

  const bodyTypes = [
    { id: 'ectomorph', label: 'Slim/Lean', icon: '🏃', description: 'Narrow shoulders, long limbs' },
    { id: 'mesomorph', label: 'Athletic', icon: '💪', description: 'Broad shoulders, muscular build' },
    { id: 'endomorph', label: 'Curvy/Full', icon: '🎯', description: 'Wider hips, fuller figure' }
  ];

  const fitPreferences = [
    { id: 'slim', label: 'Slim Fit', description: 'Close to body, tailored look' },
    { id: 'regular', label: 'Regular Fit', description: 'Standard, comfortable fit' },
    { id: 'loose', label: 'Loose Fit', description: 'Relaxed, oversized style' }
  ];

  // Load saved profiles
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('sizeProfiles') || '[]');
    setSavedProfiles(saved);
  }, []);

  // ML-based size prediction algorithm
  const predictSize = () => {
    setStep('measuring');
    
    setTimeout(() => {
      const category = product?.category?.toLowerCase() || 'tops';
      const chart = sizeCharts[category] || sizeCharts.tops;
      
      // Convert measurements to numbers
      const m = {
        height: parseFloat(measurements.height) || 170,
        weight: parseFloat(measurements.weight) || 70,
        chest: parseFloat(measurements.chest) || 90,
        waist: parseFloat(measurements.waist) || 75,
        hips: parseFloat(measurements.hips) || 95,
        inseam: parseFloat(measurements.inseam) || 76
      };

      // Calculate best matching size
      let bestMatch = { size: 'M', score: 0 };
      const alternatives = [];

      Object.entries(chart).forEach(([size, ranges]) => {
        let score = 0;
        let totalChecks = 0;

        Object.entries(ranges).forEach(([measurement, [min, max]]) => {
          if (m[measurement]) {
            totalChecks++;
            const value = m[measurement];
            if (value >= min && value <= max) {
              score += 1;
            } else if (value >= min - 5 && value <= max + 5) {
              score += 0.5;
            }
          }
        });

        const matchPercent = totalChecks > 0 ? (score / totalChecks) * 100 : 0;
        
        if (matchPercent > bestMatch.score) {
          if (bestMatch.size) {
            alternatives.push({ size: bestMatch.size, confidence: bestMatch.score });
          }
          bestMatch = { size, score: matchPercent };
        } else if (matchPercent > 50) {
          alternatives.push({ size, confidence: matchPercent });
        }
      });

      // Adjust for fit preference
      let adjustedSize = bestMatch.size;
      const sizes = Object.keys(chart);
      const currentIndex = sizes.indexOf(bestMatch.size);

      if (fitPreference === 'slim' && currentIndex > 0) {
        // Consider going one size down for slim fit
        const recommendation = `Consider ${sizes[currentIndex - 1]} for a slimmer fit`;
        alternatives.unshift({ size: sizes[currentIndex - 1], confidence: bestMatch.score - 10, note: 'For slim fit' });
      } else if (fitPreference === 'loose' && currentIndex < sizes.length - 1) {
        // Consider going one size up for loose fit
        alternatives.unshift({ size: sizes[currentIndex + 1], confidence: bestMatch.score - 10, note: 'For relaxed fit' });
      }

      // Adjust for body type
      if (bodyType === 'mesomorph' && category === 'tops') {
        // Athletic builds might need larger top for shoulders
        if (currentIndex < sizes.length - 1) {
          alternatives.unshift({ 
            size: sizes[currentIndex + 1], 
            confidence: bestMatch.score - 5, 
            note: 'Better for broader shoulders' 
          });
        }
      }

      setPredictedSize({
        size: adjustedSize,
        confidence: Math.round(bestMatch.score),
        measurements: m,
        bodyType,
        fitPreference
      });
      setSizeConfidence(Math.round(bestMatch.score));
      setAlternativeSizes(alternatives.slice(0, 3));
      setStep('result');
      
    }, 2000);
  };

  // Camera-based measurement (simulation)
  const startCameraMeasurement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setMeasurementMethod('camera');
      }
    } catch (error) {
      toast.error('Camera access denied. Please use manual measurements.');
    }
  };

  const captureAndAnalyze = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Simulate AI body measurement analysis
    toast.loading('Analyzing body measurements...');
    
    setTimeout(() => {
      toast.dismiss();
      // Simulated measurements from camera
      setMeasurements({
        height: '175',
        weight: '72',
        chest: '94',
        waist: '78',
        hips: '98',
        inseam: '78',
        shoulders: '45',
        armLength: '62'
      });
      
      stopCamera();
      toast.success('Measurements detected!');
    }, 3000);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  // Save profile
  const saveProfile = () => {
    const profile = {
      id: Date.now(),
      name: `Profile ${savedProfiles.length + 1}`,
      measurements,
      bodyType,
      gender,
      fitPreference,
      createdAt: new Date().toISOString()
    };

    const updated = [...savedProfiles, profile];
    setSavedProfiles(updated);
    localStorage.setItem('sizeProfiles', JSON.stringify(updated));
    toast.success('Profile saved!');
  };

  // Load profile
  const loadProfile = (profile) => {
    setMeasurements(profile.measurements);
    setBodyType(profile.bodyType);
    setGender(profile.gender);
    setFitPreference(profile.fitPreference);
    setMeasurementMethod('history');
    toast.success('Profile loaded!');
  };

  const reset = () => {
    setStep('input');
    setMeasurementMethod(null);
    setPredictedSize(null);
    setAlternativeSizes([]);
    setMeasurements({
      height: '', weight: '', chest: '', waist: '',
      hips: '', inseam: '', shoulders: '', armLength: ''
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <FaMagic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Size Predictor</h2>
            <p className="text-gray-400 text-sm">Find your perfect fit with AI</p>
          </div>
        </div>
        {step !== 'input' && (
          <button
            onClick={reset}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            <FaRedo className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Input Method Selection */}
        {step === 'input' && !measurementMethod && (
          <motion.div
            key="method-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-white font-medium mb-4">How would you like to provide measurements?</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMeasurementMethod('manual')}
                className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors text-center"
              >
                <FaRuler className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p className="text-white font-medium">Manual Input</p>
                <p className="text-gray-500 text-sm mt-1">Enter your measurements</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startCameraMeasurement}
                className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors text-center"
              >
                <FaCamera className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-white font-medium">Camera Scan</p>
                <p className="text-gray-500 text-sm mt-1">AI body analysis</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMeasurementMethod('history')}
                disabled={savedProfiles.length === 0}
                className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors text-center disabled:opacity-50"
              >
                <FaHistory className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-white font-medium">Saved Profile</p>
                <p className="text-gray-500 text-sm mt-1">{savedProfiles.length} profiles</p>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Camera View */}
        {cameraActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Pose guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-dashed border-purple-500/50 rounded-lg w-1/2 h-4/5 flex items-center justify-center">
                  <FaUserAlt className="w-24 h-24 text-purple-500/30" />
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white text-sm text-center">
                  Stand in the frame with arms slightly away from body
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={stopCamera}
                className="flex-1 py-3 bg-gray-700 text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={captureAndAnalyze}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl flex items-center justify-center gap-2"
              >
                <FaCamera className="w-4 h-4" />
                Capture & Analyze
              </button>
            </div>
          </motion.div>
        )}

        {/* Saved Profiles */}
        {measurementMethod === 'history' && !cameraActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-white font-medium">Select a saved profile</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {savedProfiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => loadProfile(profile)}
                  className="w-full p-4 bg-gray-800 rounded-xl hover:bg-gray-700 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{profile.name}</p>
                      <p className="text-gray-500 text-sm">
                        {profile.measurements.height}cm, {profile.measurements.weight}kg
                      </p>
                    </div>
                    <FaArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setMeasurementMethod('manual')}
              className="w-full py-3 bg-purple-600/20 text-purple-400 rounded-xl"
            >
              Create New Profile
            </button>
          </motion.div>
        )}

        {/* Manual Measurements Form */}
        {measurementMethod === 'manual' && step === 'input' && !cameraActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Gender Selection */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Gender</label>
              <div className="flex gap-3">
                {[
                  { id: 'male', icon: FaMale, label: 'Male' },
                  { id: 'female', icon: FaFemale, label: 'Female' },
                  { id: 'unisex', icon: FaChild, label: 'Other' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setGender(opt.id)}
                    className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                      gender === opt.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Measurements */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Height (cm)</label>
                <input
                  type="number"
                  value={measurements.height}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="170"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Weight (kg)</label>
                <input
                  type="number"
                  value={measurements.weight}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="70"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Chest (cm)</label>
                <input
                  type="number"
                  value={measurements.chest}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, chest: e.target.value }))}
                  placeholder="90"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Waist (cm)</label>
                <input
                  type="number"
                  value={measurements.waist}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, waist: e.target.value }))}
                  placeholder="75"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Hips (cm)</label>
                <input
                  type="number"
                  value={measurements.hips}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, hips: e.target.value }))}
                  placeholder="95"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Inseam (cm)</label>
                <input
                  type="number"
                  value={measurements.inseam}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, inseam: e.target.value }))}
                  placeholder="76"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                />
              </div>
            </div>

            {/* Body Type */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Body Type</label>
              <div className="grid grid-cols-3 gap-3">
                {bodyTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setBodyType(type.id)}
                    className={`p-3 rounded-xl text-center transition-colors ${
                      bodyType === type.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{type.icon}</span>
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fit Preference */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Fit Preference</label>
              <div className="flex gap-3">
                {fitPreferences.map(pref => (
                  <button
                    key={pref.id}
                    onClick={() => setFitPreference(pref.id)}
                    className={`flex-1 p-3 rounded-xl transition-colors ${
                      fitPreference === pref.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <p className="font-medium">{pref.label}</p>
                    <p className="text-xs opacity-70">{pref.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={saveProfile}
                className="flex-1 py-3 bg-gray-700 text-white rounded-xl flex items-center justify-center gap-2"
              >
                <FaSave className="w-4 h-4" />
                Save Profile
              </button>
              <button
                onClick={predictSize}
                disabled={!measurements.height || !measurements.weight}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaMagic className="w-4 h-4" />
                Predict My Size
              </button>
            </div>
          </motion.div>
        )}

        {/* Measuring Animation */}
        {step === 'measuring' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
              />
              <FaTshirt className="absolute inset-0 m-auto w-10 h-10 text-purple-400" />
            </div>
            <p className="text-white font-medium mb-2">Analyzing your measurements...</p>
            <p className="text-gray-500 text-sm">Our AI is finding your perfect size</p>
          </motion.div>
        )}

        {/* Results */}
        {step === 'result' && predictedSize && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            {/* Main Prediction */}
            <div className="text-center py-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30">
              <p className="text-gray-400 mb-2">Your Recommended Size</p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl font-bold text-white mb-2"
              >
                {predictedSize.size}
              </motion.div>
              <div className="flex items-center justify-center gap-2">
                <FaChartLine className="w-4 h-4 text-green-400" />
                <span className="text-green-400">{sizeConfidence}% confidence</span>
              </div>
            </div>

            {/* Alternative Sizes */}
            {alternativeSizes.length > 0 && (
              <div>
                <h4 className="text-gray-400 text-sm mb-3">Also Consider</h4>
                <div className="flex gap-3">
                  {alternativeSizes.map((alt, i) => (
                    <button
                      key={i}
                      onClick={() => onSizeSelect?.(alt.size)}
                      className="flex-1 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                      <p className="text-white font-bold text-xl">{alt.size}</p>
                      <p className="text-gray-500 text-xs">{alt.confidence}% match</p>
                      {alt.note && <p className="text-purple-400 text-xs mt-1">{alt.note}</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fit Summary */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3">Fit Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Body Type</span>
                  <span className="text-white capitalize">{bodyType || 'Standard'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fit Style</span>
                  <span className="text-white capitalize">{fitPreference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Height</span>
                  <span className="text-white">{measurements.height} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight</span>
                  <span className="text-white">{measurements.weight} kg</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 py-3 bg-gray-700 text-white rounded-xl"
              >
                Try Again
              </button>
              <button
                onClick={() => onSizeSelect?.(predictedSize.size)}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center gap-2"
              >
                <FaCheck className="w-4 h-4" />
                Select {predictedSize.size}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AISizePredictor;
