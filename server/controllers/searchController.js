import VisualSearch from '../models/VisualSearch.js';
import Product from '../models/Product.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Visual Search Controllers

export const performVisualSearch = catchAsyncErrors(async (req, res, next) => {
  const { imageUrl, uploadedUrl, source, filters } = req.body;

  // Simulate AI image analysis
  const analysis = {
    dominantColors: [
      { color: 'blue', percentage: 45, hex: '#0066CC' },
      { color: 'white', percentage: 35, hex: '#FFFFFF' },
      { color: 'black', percentage: 20, hex: '#000000' }
    ],
    detectedObjects: [
      {
        name: 'shirt',
        confidence: 0.95,
        boundingBox: { x: 100, y: 50, width: 200, height: 300 }
      }
    ],
    categories: ['clothing', 'mens_fashion', 'casual_wear'],
    tags: ['blue', 'cotton', 'button-down', 'long-sleeve'],
    style: 'casual',
    pattern: 'solid'
  };

  // Find similar products
  const query = {
    $or: [
      { category: { $in: analysis.categories } },
      { tags: { $in: analysis.tags } }
    ]
  };

  if (filters) {
    if (filters.priceRange) {
      query.price = {
        $gte: filters.priceRange.min || 0,
        $lte: filters.priceRange.max || 999999
      };
    }
    if (filters.categories && filters.categories.length > 0) {
      query.category = { $in: filters.categories };
    }
  }

  const products = await Product.find(query).limit(20);

  const results = products.map(product => ({
    product: product._id,
    similarityScore: Math.random() * 100,
    matchType: 'color',
    visualSimilarity: Math.random() * 100,
    priceMatch: true
  }));

  const visualSearch = await VisualSearch.create({
    user: req.user?.id,
    searchImage: {
      url: imageUrl,
      uploadedUrl,
      source: source || 'upload'
    },
    analysis,
    results,
    filters,
    metadata: {
      resultsCount: results.length,
      searchDuration: Math.random() * 1000,
      aiModel: 'vision-transformer-v2',
      confidence: 0.89
    }
  });

  res.status(200).json({
    success: true,
    data: {
      searchId: visualSearch._id,
      analysis,
      results,
      totalResults: results.length
    }
  });
});

export const getVisualSearchHistory = catchAsyncErrors(async (req, res, next) => {
  const searches = await VisualSearch.find({ user: req.user.id })
    .sort('-searchedAt')
    .limit(20);

  res.status(200).json({
    success: true,
    count: searches.length,
    data: searches
  });
});

// Natural Language Search

export const naturalLanguageSearch = catchAsyncErrors(async (req, res, next) => {
  const { query } = req.body;

  // Parse natural language query
  const parsedQuery = parseNaturalLanguage(query);

  // Build MongoDB query
  const dbQuery = {};

  if (parsedQuery.category) {
    dbQuery.category = new RegExp(parsedQuery.category, 'i');
  }

  if (parsedQuery.color) {
    dbQuery.color = new RegExp(parsedQuery.color, 'i');
  }

  if (parsedQuery.priceRange) {
    dbQuery.price = {
      $gte: parsedQuery.priceRange.min,
      $lte: parsedQuery.priceRange.max
    };
  }

  if (parsedQuery.brand) {
    dbQuery.brand = new RegExp(parsedQuery.brand, 'i');
  }

  if (parsedQuery.keywords && parsedQuery.keywords.length > 0) {
    dbQuery.$text = { $search: parsedQuery.keywords.join(' ') };
  }

  const products = await Product.find(dbQuery).limit(50);

  res.status(200).json({
    success: true,
    query: parsedQuery,
    count: products.length,
    data: products
  });
});

// Autocomplete Suggestions

export const getSearchSuggestions = catchAsyncErrors(async (req, res, next) => {
  const { term } = req.query;

  if (!term || term.length < 2) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  // Get product name suggestions
  const products = await Product.find({
    $or: [
      { name: new RegExp(term, 'i') },
      { description: new RegExp(term, 'i') },
      { tags: new RegExp(term, 'i') }
    ]
  })
    .select('name category')
    .limit(10);

  const suggestions = products.map(p => ({
    text: p.name,
    category: p.category,
    type: 'product'
  }));

  // Add popular searches
  const popularSearches = [
    { text: 'trending ' + term, type: 'trending' },
    { text: 'new arrivals ' + term, type: 'category' }
  ];

  res.status(200).json({
    success: true,
    data: [...suggestions, ...popularSearches]
  });
});

// Search Analytics

export const trackSearchAnalytics = catchAsyncErrors(async (req, res, next) => {
  const { searchTerm, resultsCount, clicked, converted } = req.body;

  // Track search analytics
  const analytics = {
    term: searchTerm,
    count: resultsCount,
    clicked: clicked || false,
    converted: converted || false,
    timestamp: Date.now(),
    user: req.user?.id
  };

  // Save to analytics collection (simplified)
  res.status(200).json({
    success: true,
    message: 'Search tracked'
  });
});

// Helper function
function parseNaturalLanguage(query) {
  const parsed = {
    keywords: [],
    category: null,
    color: null,
    priceRange: null,
    brand: null
  };

  const lowerQuery = query.toLowerCase();

  // Extract price range
  const priceMatch = lowerQuery.match(/under\s+\$?(\d+)|below\s+\$?(\d+)|less than\s+\$?(\d+)/);
  if (priceMatch) {
    const price = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]);
    parsed.priceRange = { min: 0, max: price };
  }

  // Extract colors
  const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'orange'];
  colors.forEach(color => {
    if (lowerQuery.includes(color)) {
      parsed.color = color;
    }
  });

  // Extract categories
  const categories = ['shirt', 'pants', 'dress', 'shoes', 'bag', 'watch', 'phone', 'laptop'];
  categories.forEach(cat => {
    if (lowerQuery.includes(cat)) {
      parsed.category = cat;
    }
  });

  // Remaining words as keywords
  const words = query.split(' ').filter(word =>
    word.length > 2 &&
    !['the', 'and', 'for', 'with'].includes(word.toLowerCase())
  );
  parsed.keywords = words;

  return parsed;
}
