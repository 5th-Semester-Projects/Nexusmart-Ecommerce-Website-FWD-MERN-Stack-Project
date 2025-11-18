import Product from '../models/Product.js';

/**
 * NLP-based intelligent search
 * Parses natural language queries and extracts filters
 */
export const intelligentSearch = async (query) => {
  try {
    const filters = {};
    let searchKeywords = query.toLowerCase();

    // Extract price range
    const pricePatterns = [
      /under (\d+)/,
      /below (\d+)/,
      /less than (\d+)/,
      /above (\d+)/,
      /over (\d+)/,
      /more than (\d+)/,
      /between (\d+) and (\d+)/,
      /from (\d+) to (\d+)/,
    ];

    for (const pattern of pricePatterns) {
      const match = searchKeywords.match(pattern);
      if (match) {
        if (match[0].includes('under') || match[0].includes('below') || match[0].includes('less')) {
          filters.price = { $lte: parseInt(match[1]) };
        } else if (match[0].includes('above') || match[0].includes('over') || match[0].includes('more')) {
          filters.price = { $gte: parseInt(match[1]) };
        } else if (match[0].includes('between') || match[0].includes('from')) {
          filters.price = { $gte: parseInt(match[1]), $lte: parseInt(match[2]) };
        }
        searchKeywords = searchKeywords.replace(match[0], '').trim();
      }
    }

    // Extract colors
    const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey'];
    const foundColors = colors.filter(color => searchKeywords.includes(color));
    if (foundColors.length > 0) {
      filters.tags = { $in: foundColors };
      foundColors.forEach(color => {
        searchKeywords = searchKeywords.replace(color, '').trim();
      });
    }

    // Extract sizes
    const sizes = ['xs', 'small', 'medium', 'large', 'xl', 'xxl', 's', 'm', 'l'];
    const foundSizes = sizes.filter(size =>
      searchKeywords.includes(size) || searchKeywords.includes(size.toUpperCase())
    );
    if (foundSizes.length > 0) {
      filters['variants.size'] = { $in: foundSizes };
      foundSizes.forEach(size => {
        searchKeywords = searchKeywords.replace(size, '').trim();
      });
    }

    // Extract ratings
    const ratingPattern = /(\d+)\s*(star|stars)/;
    const ratingMatch = searchKeywords.match(ratingPattern);
    if (ratingMatch) {
      filters.ratings = { $gte: parseInt(ratingMatch[1]) };
      searchKeywords = searchKeywords.replace(ratingMatch[0], '').trim();
    }

    // Extract categories (common product types)
    const categories = {
      'clothing': ['shirt', 'tshirt', 't-shirt', 'dress', 'jeans', 'pants', 'jacket', 'coat', 'sweater'],
      'electronics': ['phone', 'laptop', 'tablet', 'computer', 'headphone', 'earphone', 'speaker', 'tv', 'camera'],
      'shoes': ['shoes', 'sneakers', 'boots', 'sandals', 'slippers'],
      'accessories': ['watch', 'bag', 'wallet', 'belt', 'sunglasses', 'jewelry'],
      'home': ['furniture', 'decor', 'lamp', 'cushion', 'rug', 'curtain'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => searchKeywords.includes(keyword))) {
        // This would need to match actual category IDs in the database
        // For now, we'll search in name and description
        break;
      }
    }

    // Extract discount/sale keywords
    if (searchKeywords.includes('sale') || searchKeywords.includes('discount') || searchKeywords.includes('offer')) {
      filters.discount = { $gt: 0 };
      searchKeywords = searchKeywords.replace(/sale|discount|offer/g, '').trim();
    }

    // Extract stock availability
    if (searchKeywords.includes('in stock') || searchKeywords.includes('available')) {
      filters.stock = { $gt: 0 };
      searchKeywords = searchKeywords.replace(/in stock|available/g, '').trim();
    }

    // Extract brand mentions
    const commonBrands = ['nike', 'adidas', 'apple', 'samsung', 'sony', 'lg', 'dell', 'hp', 'lenovo', 'zara', 'h&m'];
    const foundBrands = commonBrands.filter(brand => searchKeywords.includes(brand));
    if (foundBrands.length > 0) {
      filters.brand = { $in: foundBrands };
      foundBrands.forEach(brand => {
        searchKeywords = searchKeywords.replace(brand, '').trim();
      });
    }

    // Clean up remaining keywords
    searchKeywords = searchKeywords
      .replace(/\s+/g, ' ')
      .trim();

    // Add text search if there are remaining keywords
    if (searchKeywords) {
      filters.$text = { $search: searchKeywords };
    }

    // Build the query
    const mongoFilters = {
      isActive: true,
      ...filters,
    };

    // Execute search
    const products = await Product.find(mongoFilters)
      .sort(searchKeywords ? { score: { $meta: 'textScore' } } : { ratings: -1 })
      .limit(50);

    return {
      success: true,
      products,
      filters: mongoFilters,
      extractedTerms: {
        keywords: searchKeywords || 'all products',
        colors: foundColors,
        sizes: foundSizes,
        brands: foundBrands,
        priceFilter: filters.price,
        ratingFilter: filters.ratings,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get search suggestions based on partial query
 */
export const getSearchSuggestions = async (partialQuery, limit = 10) => {
  try {
    const regex = new RegExp(partialQuery, 'i');

    // Search in product names and tags
    const suggestions = await Product.aggregate([
      {
        $match: {
          $or: [
            { name: regex },
            { tags: regex },
            { brand: regex },
          ],
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          names: { $addToSet: '$name' },
          tags: { $addToSet: '$tags' },
          brands: { $addToSet: '$brand' },
        },
      },
      {
        $project: {
          suggestions: {
            $concatArrays: ['$names', { $reduce: { input: '$tags', initialValue: [], in: { $concatArrays: ['$$value', '$$this'] } } }, '$brands'],
          },
        },
      },
    ]);

    if (suggestions.length === 0) {
      return { success: true, suggestions: [] };
    }

    // Filter and limit suggestions
    const allSuggestions = suggestions[0].suggestions
      .filter(s => s && s.toLowerCase().includes(partialQuery.toLowerCase()))
      .slice(0, limit);

    return {
      success: true,
      suggestions: [...new Set(allSuggestions)], // Remove duplicates
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Analyze search trends
 */
export const analyzeSearchTrends = async (days = 7) => {
  try {
    // This would typically be tracked in a separate SearchLog collection
    // For now, we'll analyze product views as a proxy

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const trends = await Product.find({
      updatedAt: { $gte: dateFrom },
      views: { $gt: 0 },
    })
      .sort({ views: -1 })
      .limit(20)
      .select('name views tags category');

    // Extract trending keywords from product names and tags
    const keywords = {};
    trends.forEach(product => {
      // Split product name into words
      const words = product.name.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) { // Ignore short words
          keywords[word] = (keywords[word] || 0) + product.views;
        }
      });

      // Count tags
      if (product.tags) {
        product.tags.forEach(tag => {
          keywords[tag] = (keywords[tag] || 0) + product.views;
        });
      }
    });

    // Sort by frequency
    const sortedKeywords = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count }));

    return {
      success: true,
      trendingKeywords: sortedKeywords,
      trendingProducts: trends,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Spell check and suggest corrections
 */
export const spellCheckQuery = async (query) => {
  try {
    // Get all product names and common terms
    const products = await Product.find({ isActive: true })
      .select('name tags brand')
      .limit(1000);

    const dictionary = new Set();
    products.forEach(product => {
      product.name.toLowerCase().split(/\s+/).forEach(word => dictionary.add(word));
      if (product.tags) {
        product.tags.forEach(tag => dictionary.add(tag.toLowerCase()));
      }
      if (product.brand) {
        dictionary.add(product.brand.toLowerCase());
      }
    });

    const queryWords = query.toLowerCase().split(/\s+/);
    const corrections = [];

    queryWords.forEach(word => {
      if (!dictionary.has(word)) {
        // Find closest match using simple edit distance
        let bestMatch = word;
        let minDistance = Infinity;

        for (const dictWord of dictionary) {
          const distance = levenshteinDistance(word, dictWord);
          if (distance < minDistance && distance <= 2) { // Max 2 character difference
            minDistance = distance;
            bestMatch = dictWord;
          }
        }

        if (bestMatch !== word) {
          corrections.push({ original: word, suggested: bestMatch });
        }
      }
    });

    return {
      success: true,
      hasCorrections: corrections.length > 0,
      corrections,
      suggestedQuery: corrections.length > 0
        ? queryWords.map(word => {
          const correction = corrections.find(c => c.original === word);
          return correction ? correction.suggested : word;
        }).join(' ')
        : query,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Levenshtein distance (edit distance) helper
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

export default {
  intelligentSearch,
  getSearchSuggestions,
  analyzeSearchTrends,
  spellCheckQuery,
};
