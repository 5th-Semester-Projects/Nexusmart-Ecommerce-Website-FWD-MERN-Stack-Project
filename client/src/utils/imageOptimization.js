/**
 * Image optimization utilities
 */

/**
 * Generate srcSet for responsive images
 * @param {string} src - Base image URL
 * @param {Array<number>} widths - Array of widths for srcSet
 * @returns {string} - srcSet string
 */
export const generateSrcSet = (src, widths = [320, 640, 768, 1024, 1280]) => {
  return widths
    .map((width) => `${src}?w=${width} ${width}w`)
    .join(', ');
};

/**
 * Lazy load images with Intersection Observer
 * @param {HTMLImageElement} img - Image element
 */
export const lazyLoadImage = (img) => {
  const src = img.dataset.src;
  if (!src) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = src;
        img.classList.add('loaded');
        observer.disconnect();
      }
    });
  });

  observer.observe(img);
};

/**
 * Convert image to WebP format
 * @param {string} url - Image URL
 * @returns {string} - WebP URL
 */
export const toWebP = (url) => {
  if (!url) return '';
  return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

/**
 * Check if browser supports WebP
 * @returns {Promise<boolean>}
 */
export const supportsWebP = () => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Get optimized image URL
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'auto',
  } = options;

  if (!url) return '';

  const params = new URLSearchParams();
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality) params.append('q', quality);
  if (format) params.append('f', format);

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

/**
 * Blur placeholder for images
 * @param {string} src - Image source
 * @returns {string} - Base64 blur placeholder
 */
export const getBlurPlaceholder = (src) => {
  // Generate a low quality blur placeholder
  return getOptimizedImageUrl(src, { width: 10, quality: 10 });
};

/**
 * Preload critical images
 * @param {Array<string>} urls - Array of image URLs
 */
export const preloadImages = (urls) => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Image component with lazy loading
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  ...props
}) => {
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    if (lazy && imgRef.current) {
      lazyLoadImage(imgRef.current);
    }
  }, [lazy]);

  const optimizedSrc = getOptimizedImageUrl(src, { width, height });
  const placeholder = getBlurPlaceholder(src);

  return (
    <img
      ref={imgRef}
      src={lazy ? placeholder : optimizedSrc}
      data-src={lazy ? optimizedSrc : undefined}
      alt={alt}
      width={width}
      height={height}
      className={`${className} transition-opacity duration-300`}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      {...props}
    />
  );
};
