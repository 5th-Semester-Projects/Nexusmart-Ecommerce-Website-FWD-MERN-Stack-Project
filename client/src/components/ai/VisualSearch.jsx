import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera, FaUpload, FaTimes, FaSearch, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VisualSearch = ({ onClose }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setShowCamera(true);
    } catch (error) {
      alert('Unable to access camera');
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      setImage(blob);
      setPreview(canvas.toDataURL());
      stopCamera();
    });
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach(track => track.stop());
    setShowCamera(false);
  };

  const handleSearch = async () => {
    if (!image) return;

    setIsSearching(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const { data } = await axios.post('/api/v1/ai/visual-search', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(data.products);
    } catch (error) {
      console.error('Visual search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaCamera className="text-purple-600" />
            Visual Search
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!preview && !showCamera ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 transition"
              >
                <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Click to upload an image</p>
                <p className="text-sm text-gray-400 mt-2">or drag and drop</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-center">
                <span className="text-gray-400">or</span>
              </div>
              <button
                onClick={startCamera}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl flex items-center justify-center gap-2"
              >
                <FaCamera />
                Take a Photo
              </button>
            </div>
          ) : showCamera ? (
            <div className="space-y-4">
              <video ref={videoRef} autoPlay className="w-full rounded-xl" />
              <div className="flex gap-4">
                <button
                  onClick={stopCamera}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl"
                >
                  Capture
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-xl" />
              <div className="flex gap-4">
                <button
                  onClick={() => { setImage(null); setPreview(null); }}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl"
                >
                  Clear
                </button>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      Find Similar Products
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-4">Similar Products Found</h3>
              <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {results.map((product) => (
                  <motion.div
                    key={product._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => { navigate(`/product/${product._id}`); onClose(); }}
                    className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 cursor-pointer"
                  >
                    <img
                      src={(Array.isArray(product.images) && product.images[0]?.url) || product.image || 'https://via.placeholder.com/200?text=No+Image'}
                      alt={product.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-purple-600 font-bold">${product.price}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VisualSearch;
