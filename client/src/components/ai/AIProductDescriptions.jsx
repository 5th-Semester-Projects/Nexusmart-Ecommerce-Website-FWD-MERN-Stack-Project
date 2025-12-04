import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiEdit3, FiCopy, FiCheck, FiRefreshCw, FiZap,
  FiTarget, FiHash, FiType, FiList
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const AIProductDescriptions = ({ product, onDescriptionGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    description: '',
    shortDescription: '',
    seoTitle: '',
    seoDescription: '',
    keywords: [],
    bulletPoints: []
  });
  const [tone, setTone] = useState('professional');
  const [targetAudience, setTargetAudience] = useState('general');
  const [copied, setCopied] = useState({});

  const generateDescriptions = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/ai/generate-descriptions', {
        productName: product?.name,
        category: product?.category,
        features: product?.features,
        price: product?.price,
        tone,
        targetAudience
      });
      setGeneratedContent(response.data);
      toast.success('Descriptions generated!');
    } catch (error) {
      generateDemoContent();
    } finally {
      setLoading(false);
    }
  };

  const generateDemoContent = () => {
    const productName = product?.name || 'Premium Product';
    
    setGeneratedContent({
      description: `Discover the exceptional quality of the ${productName}. Crafted with precision and designed for modern lifestyles, this product combines innovative technology with sleek aesthetics. Whether you're a professional seeking reliability or an enthusiast demanding performance, the ${productName} delivers beyond expectations. Experience the perfect blend of form and function that sets new standards in its category.`,
      
      shortDescription: `Premium ${productName} featuring cutting-edge technology, elegant design, and unmatched performance. Perfect for discerning users who demand the best.`,
      
      seoTitle: `${productName} | Premium Quality | Free Shipping | NexusMart`,
      
      seoDescription: `Shop the ${productName} at NexusMart. ✓ Premium Quality ✓ Fast Delivery ✓ Best Price Guarantee ✓ 30-Day Returns. Order now and experience excellence!`,
      
      keywords: [
        productName.toLowerCase(),
        'premium quality',
        'best seller',
        'top rated',
        'free shipping',
        'buy online',
        'best price',
        product?.category?.toLowerCase() || 'electronics'
      ],
      
      bulletPoints: [
        '✨ Premium build quality with attention to every detail',
        '🚀 Advanced features for enhanced performance',
        '💎 Elegant design that complements any style',
        '🛡️ Durable construction for long-lasting use',
        '📦 Fast shipping with secure packaging',
        '💯 100% satisfaction guarantee'
      ]
    });
    toast.success('Demo descriptions generated!');
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
  };

  const applyDescription = () => {
    if (onDescriptionGenerated) {
      onDescriptionGenerated(generatedContent);
    }
    toast.success('Description applied!');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
            <FiEdit3 className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white">AI Description Generator</h2>
            <p className="text-sm text-gray-500">Generate SEO-optimized product content</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="luxury">Luxury</option>
            <option value="playful">Playful</option>
            <option value="technical">Technical</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Audience
          </label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="general">General</option>
            <option value="professionals">Professionals</option>
            <option value="young-adults">Young Adults</option>
            <option value="families">Families</option>
            <option value="tech-enthusiasts">Tech Enthusiasts</option>
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={generateDescriptions}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 mb-6"
      >
        {loading ? (
          <>
            <FiRefreshCw className="animate-spin" />
            Generating with AI...
          </>
        ) : (
          <>
            <FiZap />
            Generate Descriptions
          </>
        )}
      </motion.button>

      {/* Generated Content */}
      {generatedContent.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Full Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FiType /> Full Description
              </label>
              <button
                onClick={() => copyToClipboard(generatedContent.description, 'desc')}
                className="text-sm text-purple-500 flex items-center gap-1"
              >
                {copied.desc ? <FiCheck /> : <FiCopy />}
                {copied.desc ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              value={generatedContent.description}
              onChange={(e) => setGeneratedContent({...generatedContent, description: e.target.value})}
              className="w-full p-4 border rounded-lg h-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Short Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FiType /> Short Description
              </label>
              <button
                onClick={() => copyToClipboard(generatedContent.shortDescription, 'short')}
                className="text-sm text-purple-500 flex items-center gap-1"
              >
                {copied.short ? <FiCheck /> : <FiCopy />}
              </button>
            </div>
            <textarea
              value={generatedContent.shortDescription}
              onChange={(e) => setGeneratedContent({...generatedContent, shortDescription: e.target.value})}
              className="w-full p-4 border rounded-lg h-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* SEO Title & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiTarget /> SEO Title
                </label>
                <button
                  onClick={() => copyToClipboard(generatedContent.seoTitle, 'seoTitle')}
                  className="text-sm text-purple-500"
                >
                  {copied.seoTitle ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
              <input
                value={generatedContent.seoTitle}
                onChange={(e) => setGeneratedContent({...generatedContent, seoTitle: e.target.value})}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">{generatedContent.seoTitle.length}/60 characters</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiTarget /> SEO Description
                </label>
                <button
                  onClick={() => copyToClipboard(generatedContent.seoDescription, 'seoDesc')}
                  className="text-sm text-purple-500"
                >
                  {copied.seoDesc ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
              <textarea
                value={generatedContent.seoDescription}
                onChange={(e) => setGeneratedContent({...generatedContent, seoDescription: e.target.value})}
                className="w-full p-3 border rounded-lg h-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">{generatedContent.seoDescription.length}/160 characters</p>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiHash /> Keywords
            </label>
            <div className="flex flex-wrap gap-2">
              {generatedContent.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Bullet Points */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiList /> Key Features
            </label>
            <div className="space-y-2">
              {generatedContent.bulletPoints.map((point, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm dark:text-gray-300"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={applyDescription}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <FiCheck /> Apply to Product
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default AIProductDescriptions;
