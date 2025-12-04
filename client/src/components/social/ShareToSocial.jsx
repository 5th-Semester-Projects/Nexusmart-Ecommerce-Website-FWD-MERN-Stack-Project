import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaWhatsapp, FaFacebook, FaTwitter, FaInstagram, FaPinterest,
  FaLinkedin, FaTelegram, FaReddit, FaEnvelope, FaLink,
  FaCopy, FaCheck, FaShareAlt, FaQrcode
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode.react';

const ShareToSocial = ({ product, url, title, description, image }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = title || product?.name || 'Check this out!';
  const shareDescription = description || product?.description || '';
  const shareImage = image || product?.images?.[0]?.url || '';

  const platforms = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: '#25D366',
      bgColor: 'bg-green-500',
      getUrl: () => `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`,
      primary: true
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: '#1877F2',
      bgColor: 'bg-blue-600',
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`,
      primary: true
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: '#1DA1F2',
      bgColor: 'bg-sky-500',
      getUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      primary: true
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      color: '#E4405F',
      bgColor: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
      getUrl: () => null, // Instagram doesn't support direct sharing via URL
      action: 'copy',
      primary: true
    },
    {
      name: 'Pinterest',
      icon: FaPinterest,
      color: '#BD081C',
      bgColor: 'bg-red-600',
      getUrl: () => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(shareImage)}&description=${encodeURIComponent(shareTitle)}`,
      primary: false
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: '#0A66C2',
      bgColor: 'bg-blue-700',
      getUrl: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      primary: false
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      color: '#0088CC',
      bgColor: 'bg-sky-600',
      getUrl: () => `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      primary: false
    },
    {
      name: 'Reddit',
      icon: FaReddit,
      color: '#FF4500',
      bgColor: 'bg-orange-600',
      getUrl: () => `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      primary: false
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      color: '#EA4335',
      bgColor: 'bg-red-500',
      getUrl: () => `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\n${shareUrl}`)}`,
      primary: false
    }
  ];

  const handleShare = async (platform) => {
    // Track share event
    console.log(`Sharing to ${platform.name}`);

    if (platform.action === 'copy') {
      await copyLink();
      toast.success(`Link copied! Now share it on ${platform.name}`);
      return;
    }

    const url = platform.getUrl();
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      setShowAllPlatforms(true);
    }
  };

  const primaryPlatforms = platforms.filter(p => p.primary);
  const secondaryPlatforms = platforms.filter(p => !p.primary);

  return (
    <div className="relative">
      {/* Quick Share Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white transition-all"
      >
        <FaShareAlt className="w-4 h-4" />
        <span>Share</span>
      </motion.button>

      {/* Share Modal */}
      {showAllPlatforms && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAllPlatforms(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FaShareAlt className="text-purple-400" />
              Share this product
            </h3>

            {/* Product Preview */}
            {product && (
              <div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl mb-6">
                {product.images?.[0] && (
                  <img 
                    src={product.images[0].url} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{product.name}</p>
                  <p className="text-purple-400 font-bold">${product.price}</p>
                </div>
              </div>
            )}

            {/* Primary Platforms */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {primaryPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <motion.button
                    key={platform.name}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleShare(platform)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl ${platform.bgColor} text-white`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs">{platform.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Secondary Platforms */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {secondaryPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <motion.button
                    key={platform.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleShare(platform)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    <Icon className="w-5 h-5" style={{ color: platform.color }} />
                    <span className="text-xs text-gray-400">{platform.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Copy Link */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 px-4 py-3 bg-black/30 rounded-xl text-gray-400 text-sm truncate">
                {shareUrl}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyLink}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-2"
              >
                {copied ? <FaCheck /> : <FaCopy />}
              </motion.button>
            </div>

            {/* QR Code Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowQR(!showQR)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center gap-2"
            >
              <FaQrcode />
              {showQR ? 'Hide' : 'Show'} QR Code
            </motion.button>

            {/* QR Code */}
            {showQR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 flex justify-center"
              >
                <div className="p-4 bg-white rounded-xl">
                  <QRCode 
                    value={shareUrl} 
                    size={150}
                    level="H"
                    includeMargin
                  />
                </div>
              </motion.div>
            )}

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowAllPlatforms(false)}
              className="w-full mt-4 py-3 text-gray-400 hover:text-white"
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Inline share buttons component
export const InlineShareButtons = ({ product, url, compact = false }) => {
  const shareUrl = url || window.location.href;
  const shareTitle = product?.name || 'Check this out!';

  const quickPlatforms = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: '#25D366',
      getUrl: () => `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: '#1877F2',
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: '#1DA1F2',
      getUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`
    }
  ];

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
      {quickPlatforms.map((platform) => {
        const Icon = platform.icon;
        return (
          <motion.button
            key={platform.name}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.open(platform.getUrl(), '_blank', 'width=600,height=400')}
            className={`${compact ? 'p-1.5' : 'p-2'} rounded-full hover:bg-gray-700 transition-colors`}
            title={`Share on ${platform.name}`}
          >
            <Icon 
              className={compact ? 'w-4 h-4' : 'w-5 h-5'} 
              style={{ color: platform.color }}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

export default ShareToSocial;
