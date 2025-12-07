import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  X, 
  Search, 
  Loader2, 
  Image as ImageIcon,
  ShoppingBag,
  Star
} from 'lucide-react';
import axios from 'axios';

const VisualSearch = ({ onClose, onProductSelect }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResults(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSearch = async () => {
    if (!image) return;

    setIsSearching(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('/api/v1/advanced-ai/visual-search', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResults(response.data);
    } catch (error) {
      console.error('Visual search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setResults(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold dark:text-white">Visual Search</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Find products by image</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!preview ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                dragActive 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    Drag & drop an image here
                  </p>
                  <p className="text-sm text-gray-400 mt-1">or use the buttons below</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview */}
              <div className="relative">
                <img
                  src={preview}
                  alt="Search preview"
                  className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-700 rounded-xl"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Extracted Features */}
              {results?.extractedFeatures && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-3">Detected Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(results.extractedFeatures).map(([key, value]) => (
                      value && typeof value === 'string' && (
                        <span
                          key={key}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                        >
                          {value}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Search Button */}
              {!results && (
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Find Similar Products
                    </>
                  )}
                </button>
              )}

              {/* Results */}
              {results?.products && results.products.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-4">
                    Similar Products ({results.products.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {results.products.map((product) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onProductSelect?.(product._id)}
                        className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                          <img
                            src={product.images?.[0]?.url || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-800 dark:text-white line-clamp-2">
                            {product.name}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                              ${product.price}
                            </span>
                            {product.rating && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {product.rating.average?.toFixed(1)}
                              </div>
                            )}
                          </div>
                          {product.similarityScore && (
                            <div className="mt-2">
                              <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                  style={{ width: `${product.similarityScore}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {product.similarityScore}% match
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {results?.products && results.products.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No similar products found. Try another image.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VisualSearch;
