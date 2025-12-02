import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShare2, FiCopy, FiCheck, FiX,
  FiFacebook, FiTwitter, FiMail, FiMessageCircle
} from 'react-icons/fi';
import { FaWhatsapp, FaPinterest, FaTelegram, FaLinkedin } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Social Share Platforms Configuration
const socialPlatforms = [
  {
    name: 'WhatsApp',
    icon: FaWhatsapp,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    getUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: 'Facebook',
    icon: FiFacebook,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    getUrl: (url, text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  {
    name: 'Twitter',
    icon: FiTwitter,
    color: 'bg-sky-500',
    hoverColor: 'hover:bg-sky-600',
    getUrl: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: 'Pinterest',
    icon: FaPinterest,
    color: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
    getUrl: (url, text, image) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(text)}`,
  },
  {
    name: 'Telegram',
    icon: FaTelegram,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    getUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: 'LinkedIn',
    icon: FaLinkedin,
    color: 'bg-blue-700',
    hoverColor: 'hover:bg-blue-800',
    getUrl: (url, text) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    name: 'Email',
    icon: FiMail,
    color: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700',
    getUrl: (url, text, image, subject) => `mailto:?subject=${encodeURIComponent(subject || text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
];

// Share Button Component
export const ShareButton = ({ 
  url, 
  title, 
  description, 
  image,
  variant = 'button', // 'button' | 'icon' | 'floating'
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`p-3 bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white rounded-xl transition-all ${className}`}
          title="Share"
        >
          <FiShare2 />
        </button>
        <ShareModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          url={url}
          title={title}
          description={description}
          image={image}
        />
      </>
    );
  }

  if (variant === 'floating') {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowModal(true)}
          className={`fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center ${className}`}
        >
          <FiShare2 className="text-xl" />
        </motion.button>
        <ShareModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          url={url}
          title={title}
          description={description}
          image={image}
        />
      </>
    );
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-xl transition-all ${className}`}
      >
        <FiShare2 />
        <span>Share</span>
      </motion.button>
      <ShareModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        url={url}
        title={title}
        description={description}
        image={image}
      />
    </>
  );
};

// Share Modal Component
export const ShareModal = ({
  isOpen,
  onClose,
  url,
  title,
  description = '',
  image = '',
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const shareText = description || title || 'Check out this product!';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleShare = (platform) => {
    const shareWindow = window.open(
      platform.getUrl(shareUrl, shareText, image, title),
      '_blank',
      'width=600,height=400'
    );
    
    if (shareWindow) {
      shareWindow.focus();
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiShare2 className="text-cyan-400" />
                Share Product
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <FiX className="text-gray-400" />
              </button>
            </div>

            {/* Product Preview */}
            {(image || title) && (
              <div className="p-4 mx-6 mt-4 bg-white/5 rounded-2xl flex items-center gap-4">
                {image && (
                  <img
                    src={image}
                    alt={title}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{title}</p>
                  {description && (
                    <p className="text-sm text-gray-400 truncate">{description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Social Platforms */}
            <div className="p-6">
              <p className="text-sm text-gray-400 mb-4">Share via</p>
              <div className="grid grid-cols-4 gap-3">
                {socialPlatforms.map((platform) => (
                  <motion.button
                    key={platform.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare(platform)}
                    className={`flex flex-col items-center gap-2 p-3 ${platform.color} ${platform.hoverColor} rounded-2xl transition-colors`}
                  >
                    <platform.icon className="text-xl text-white" />
                    <span className="text-xs text-white/90">{platform.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Copy Link */}
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-400 mb-2">Or copy link</p>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 truncate">
                  {shareUrl}
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                  }`}
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                </motion.button>
              </div>
            </div>

            {/* Native Share (Mobile) */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <div className="px-6 pb-6">
                <button
                  onClick={handleNativeShare}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FiShare2 />
                  More sharing options
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Inline Share Buttons (for product cards)
export const InlineShareButtons = ({ url, title, className = '' }) => {
  const shareUrl = url || window.location.href;

  const quickShare = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'text-green-500 hover:text-green-400',
      getUrl: () => `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
    },
    {
      name: 'Facebook',
      icon: FiFacebook,
      color: 'text-blue-500 hover:text-blue-400',
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Twitter',
      icon: FiTwitter,
      color: 'text-sky-500 hover:text-sky-400',
      getUrl: () => `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {quickShare.map((platform) => (
        <a
          key={platform.name}
          href={platform.getUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 ${platform.color} transition-colors`}
          title={`Share on ${platform.name}`}
        >
          <platform.icon className="text-lg" />
        </a>
      ))}
    </div>
  );
};

// WhatsApp Quick Share Button
export const WhatsAppShareButton = ({ url, title, phone = '', className = '' }) => {
  const shareUrl = url || window.location.href;
  const message = `Check out this product: ${title}\n${shareUrl}`;
  
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors ${className}`}
    >
      <FaWhatsapp className="text-lg" />
      Share on WhatsApp
    </motion.a>
  );
};

export default ShareButton;
