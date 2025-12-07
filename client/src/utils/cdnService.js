/**
 * CDN Integration Utility
 * Handles CDN URL generation and asset optimization
 */

class CDNService {
  constructor() {
    // CDN provider configuration
    this.providers = {
      cloudflare: {
        baseUrl: process.env.REACT_APP_CLOUDFLARE_CDN_URL || 'https://cdn.example.com',
        imageOptimization: true,
        formats: ['webp', 'avif']
      },
      cloudinary: {
        baseUrl: process.env.REACT_APP_CLOUDINARY_CDN_URL || 'https://res.cloudinary.com',
        cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo',
        imageOptimization: true,
        formats: ['webp', 'avif', 'auto']
      },
      aws: {
        baseUrl: process.env.REACT_APP_AWS_CDN_URL || '',
        imageOptimization: false
      }
    };

    this.activeProvider = process.env.REACT_APP_CDN_PROVIDER || 'cloudinary';
    this.fallbackUrl = process.env.REACT_APP_API_URL || '';
  }

  // Get CDN base URL
  getBaseUrl() {
    return this.providers[this.activeProvider]?.baseUrl || this.fallbackUrl;
  }

  // Generate optimized image URL
  getImageUrl(imagePath, options = {}) {
    const {
      width,
      height,
      quality = 80,
      format = 'auto',
      crop = 'fill',
      blur,
      grayscale,
      placeholder
    } = options;

    if (!imagePath) {
      return placeholder || '/placeholder.png';
    }

    // If it's already a CDN URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return this.optimizeExternalUrl(imagePath, options);
    }

    switch (this.activeProvider) {
      case 'cloudinary':
        return this.getCloudinaryUrl(imagePath, options);
      case 'cloudflare':
        return this.getCloudflareUrl(imagePath, options);
      default:
        return `${this.getBaseUrl()}${imagePath}`;
    }
  }

  // Cloudinary URL generation
  getCloudinaryUrl(imagePath, options) {
    const { cloudName } = this.providers.cloudinary;
    const transformations = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.blur) transformations.push(`e_blur:${options.blur}`);
    if (options.grayscale) transformations.push('e_grayscale');

    const transformation = transformations.length > 0
      ? transformations.join(',') + '/'
      : '';

    return `${this.providers.cloudinary.baseUrl}/${cloudName}/image/upload/${transformation}${imagePath}`;
  }

  // Cloudflare URL generation
  getCloudflareUrl(imagePath, options) {
    const params = new URLSearchParams();

    if (options.width) params.append('width', options.width);
    if (options.height) params.append('height', options.height);
    if (options.quality) params.append('quality', options.quality);
    if (options.format && options.format !== 'auto') params.append('format', options.format);
    if (options.crop === 'fill') params.append('fit', 'cover');

    const queryString = params.toString();
    const baseUrl = this.providers.cloudflare.baseUrl;

    return queryString
      ? `${baseUrl}${imagePath}?${queryString}`
      : `${baseUrl}${imagePath}`;
  }

  // Optimize external URLs
  optimizeExternalUrl(url, options) {
    // Use Cloudinary fetch for external images
    if (this.activeProvider === 'cloudinary') {
      const { cloudName } = this.providers.cloudinary;
      const transformations = [];

      if (options.width) transformations.push(`w_${options.width}`);
      if (options.height) transformations.push(`h_${options.height}`);
      if (options.quality) transformations.push(`q_${options.quality}`);
      transformations.push('f_auto');

      const transformation = transformations.length > 0
        ? transformations.join(',') + '/'
        : '';

      return `${this.providers.cloudinary.baseUrl}/${cloudName}/image/fetch/${transformation}${encodeURIComponent(url)}`;
    }

    return url;
  }

  // Get responsive image srcset
  getResponsiveSrcSet(imagePath, options = {}) {
    const widths = options.widths || [320, 640, 768, 1024, 1280, 1536, 1920];

    return widths.map(width => {
      const url = this.getImageUrl(imagePath, { ...options, width });
      return `${url} ${width}w`;
    }).join(', ');
  }

  // Get low-quality placeholder URL
  getPlaceholderUrl(imagePath, options = {}) {
    return this.getImageUrl(imagePath, {
      ...options,
      width: 20,
      quality: 30,
      blur: 500
    });
  }

  // Preload critical images
  preloadImage(imagePath, options = {}) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = this.getImageUrl(imagePath, options);

    if (options.format) {
      link.type = `image/${options.format}`;
    }

    document.head.appendChild(link);
  }

  // Get video URL
  getVideoUrl(videoPath, options = {}) {
    if (this.activeProvider === 'cloudinary') {
      const { cloudName } = this.providers.cloudinary;
      const transformations = [];

      if (options.quality) transformations.push(`q_${options.quality}`);
      if (options.format) transformations.push(`f_${options.format}`);

      const transformation = transformations.length > 0
        ? transformations.join(',') + '/'
        : '';

      return `${this.providers.cloudinary.baseUrl}/${cloudName}/video/upload/${transformation}${videoPath}`;
    }

    return `${this.getBaseUrl()}${videoPath}`;
  }

  // Get static asset URL
  getStaticUrl(path) {
    return `${this.getBaseUrl()}/static${path}`;
  }

  // Check if WebP is supported
  async isWebPSupported() {
    if (typeof window === 'undefined') return false;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // Check if AVIF is supported
  async isAvifSupported() {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = image.onerror = () => {
        resolve(image.height === 1);
      };
      image.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgADlAgIDU8hA==';
    });
  }
}

// Create singleton instance
const cdnService = new CDNService();

export default cdnService;

// React hooks for CDN
import { useState, useEffect, useMemo } from 'react';

export const useCDNImage = (imagePath, options = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const imageUrl = useMemo(() => {
    return cdnService.getImageUrl(imagePath, options);
  }, [imagePath, JSON.stringify(options)]);

  const placeholderUrl = useMemo(() => {
    return cdnService.getPlaceholderUrl(imagePath, options);
  }, [imagePath, JSON.stringify(options)]);

  const srcSet = useMemo(() => {
    if (options.responsive) {
      return cdnService.getResponsiveSrcSet(imagePath, options);
    }
    return undefined;
  }, [imagePath, options.responsive, JSON.stringify(options)]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLoading(false);
    img.onerror = (e) => {
      setError(e);
      setIsLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return {
    src: imageUrl,
    srcSet,
    placeholder: placeholderUrl,
    isLoading,
    error
  };
};

export const useFormatSupport = () => {
  const [webpSupported, setWebpSupported] = useState(true);
  const [avifSupported, setAvifSupported] = useState(false);

  useEffect(() => {
    cdnService.isWebPSupported().then(setWebpSupported);
    cdnService.isAvifSupported().then(setAvifSupported);
  }, []);

  return { webpSupported, avifSupported };
};
