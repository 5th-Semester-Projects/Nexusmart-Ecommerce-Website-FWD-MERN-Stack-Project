import OpenAI from 'openai';
import { Product } from '../models/Product.js';
import sharp from 'sharp';

/**
 * Visual Search Service
 * AI-powered image recognition for product search
 */

class VisualSearchService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  /**
   * Analyze image and extract product features
   */
  async analyzeImage(imageBuffer) {
    try {
      // Resize and optimize image for API
      const optimizedImage = await sharp(imageBuffer)
        .resize(512, 512, { fit: 'inside' })
        .jpeg({ quality: 85 })
        .toBuffer();

      const base64Image = optimizedImage.toString('base64');

      // Use GPT-4 Vision to analyze image
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `You are a product identification expert. Analyze images and extract:
              1. Product type/category
              2. Color(s)
              3. Material (if visible)
              4. Style/design
              5. Brand (if visible)
              6. Key features
              7. Estimated price range
              
              Return a JSON object with these fields.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: 'Identify this product and extract its features for search purposes.'
              }
            ]
          }
        ],
        max_tokens: 500
      });

      const content = response.choices[0].message.content;

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { raw: content };

    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  /**
   * Search products using image
   */
  async searchByImage(imageBuffer) {
    // Analyze the image first
    const features = await this.analyzeImage(imageBuffer);

    // Build search query from extracted features
    const searchQuery = this.buildSearchQuery(features);

    // Search products using extracted features
    const products = await this.findSimilarProducts(features);

    return {
      extractedFeatures: features,
      searchQuery,
      products,
      totalResults: products.length
    };
  }

  /**
   * Build search query from extracted features
   */
  buildSearchQuery(features) {
    const queryParts = [];

    if (features.productType) queryParts.push(features.productType);
    if (features.category) queryParts.push(features.category);
    if (features.color) queryParts.push(features.color);
    if (features.material) queryParts.push(features.material);
    if (features.style) queryParts.push(features.style);
    if (features.brand) queryParts.push(features.brand);

    return queryParts.join(' ');
  }

  /**
   * Find similar products based on extracted features
   */
  async findSimilarProducts(features) {
    const searchConditions = [];

    // Text search on product name and description
    if (features.productType || features.category) {
      const searchText = [features.productType, features.category].filter(Boolean).join(' ');
      searchConditions.push({ $text: { $search: searchText } });
    }

    // Filter by color
    if (features.color) {
      const colors = Array.isArray(features.color) ? features.color : [features.color];
      searchConditions.push({
        $or: [
          { 'variants.color': { $in: colors.map(c => new RegExp(c, 'i')) } },
          { name: { $regex: colors.join('|'), $options: 'i' } },
          { description: { $regex: colors.join('|'), $options: 'i' } }
        ]
      });
    }

    // Filter by price range
    if (features.priceRange) {
      const priceFilter = this.parsePriceRange(features.priceRange);
      if (priceFilter) {
        searchConditions.push({ price: priceFilter });
      }
    }

    // Build final query
    let query = { status: 'active' };
    if (searchConditions.length > 0) {
      query.$and = searchConditions;
    }

    // Find products
    let products = await Product.find(query)
      .select('name price images rating category description')
      .sort({ 'rating.average': -1, soldCount: -1 })
      .limit(20)
      .lean();

    // If no results, try broader search
    if (products.length === 0 && features.productType) {
      products = await Product.find({
        status: 'active',
        $text: { $search: features.productType }
      })
        .select('name price images rating category description')
        .limit(20)
        .lean();
    }

    // Calculate similarity scores
    return products.map(product => ({
      ...product,
      similarityScore: this.calculateSimilarity(product, features)
    })).sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Parse price range string to MongoDB query
   */
  parsePriceRange(priceRange) {
    if (typeof priceRange === 'string') {
      const match = priceRange.match(/\$?(\d+)\s*-\s*\$?(\d+)/);
      if (match) {
        return { $gte: parseInt(match[1]), $lte: parseInt(match[2]) };
      }

      const singleMatch = priceRange.match(/\$?(\d+)/);
      if (singleMatch) {
        const price = parseInt(singleMatch[1]);
        return { $gte: price * 0.5, $lte: price * 1.5 };
      }
    }
    return null;
  }

  /**
   * Calculate similarity score between product and features
   */
  calculateSimilarity(product, features) {
    let score = 0;
    const productText = `${product.name} ${product.description || ''}`.toLowerCase();

    // Check product type match
    if (features.productType && productText.includes(features.productType.toLowerCase())) {
      score += 30;
    }

    // Check category match
    if (features.category && productText.includes(features.category.toLowerCase())) {
      score += 25;
    }

    // Check color match
    if (features.color) {
      const colors = Array.isArray(features.color) ? features.color : [features.color];
      colors.forEach(color => {
        if (productText.includes(color.toLowerCase())) {
          score += 15;
        }
      });
    }

    // Check material match
    if (features.material && productText.includes(features.material.toLowerCase())) {
      score += 10;
    }

    // Check style match
    if (features.style && productText.includes(features.style.toLowerCase())) {
      score += 10;
    }

    // Brand match
    if (features.brand && productText.includes(features.brand.toLowerCase())) {
      score += 20;
    }

    // Rating bonus
    if (product.rating?.average >= 4) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * Find visually similar products
   */
  async findVisuallySimilar(productId, limit = 10) {
    const product = await Product.findById(productId).lean();

    if (!product) {
      throw new Error('Product not found');
    }

    // Find products in same category with similar attributes
    const similarProducts = await Product.find({
      _id: { $ne: productId },
      status: 'active',
      category: product.category
    })
      .select('name price images rating category')
      .sort({ 'rating.average': -1 })
      .limit(limit)
      .lean();

    return similarProducts;
  }

  /**
   * Extract dominant colors from image
   */
  async extractColors(imageBuffer) {
    try {
      const { dominant } = await sharp(imageBuffer)
        .resize(100, 100, { fit: 'cover' })
        .stats();

      return {
        dominant: this.rgbToHex(dominant),
        channels: dominant
      };
    } catch (error) {
      console.error('Color extraction error:', error);
      return null;
    }
  }

  rgbToHex({ r, g, b }) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Complete visual search pipeline
   */
  async search(imageSource) {
    let imageBuffer;

    // Handle different image sources
    if (Buffer.isBuffer(imageSource)) {
      imageBuffer = imageSource;
    } else if (typeof imageSource === 'string') {
      // URL or base64
      if (imageSource.startsWith('data:')) {
        const base64Data = imageSource.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        // Fetch from URL
        const response = await fetch(imageSource);
        imageBuffer = Buffer.from(await response.arrayBuffer());
      }
    }

    // Run visual search
    return await this.searchByImage(imageBuffer);
  }
}

export default new VisualSearchService();
