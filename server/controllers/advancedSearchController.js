const AdvancedSearch = require('../models/AdvancedSearch');
const Product = require('../models/Product');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Perform search
exports.search = catchAsyncErrors(async (req, res) => {
  const { query, filters, page = 1, limit = 20 } = req.body;

  // Create search record
  const searchRecord = await AdvancedSearch.create({
    user: req.user?._id,
    sessionId: req.sessionID || `session_${Date.now()}`,
    query,
    filters,
    searchType: filters?.searchType || 'text'
  });

  // Perform actual search (this would integrate with your search engine)
  const results = await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Product.countDocuments({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  });

  // Update search record with results
  searchRecord.resultsCount = count;
  searchRecord.results = results.map(p => ({ product: p._id, score: 1.0 }));
  await searchRecord.save();

  res.status(200).json({
    success: true,
    searchId: searchRecord._id,
    results,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalResults: count
  });
});

// Track interaction
exports.trackInteraction = catchAsyncErrors(async (req, res) => {
  const { searchId } = req.params;
  const { productId, interactionType } = req.body;

  const search = await AdvancedSearch.findById(searchId);

  if (!search) {
    return res.status(404).json({
      success: false,
      message: 'Search not found'
    });
  }

  search.interactions.push({
    product: productId,
    interactionType,
    timestamp: Date.now()
  });

  await search.save();

  res.status(200).json({
    success: true,
    message: 'Interaction tracked'
  });
});

// Get search history
exports.getSearchHistory = catchAsyncErrors(async (req, res) => {
  const { limit = 10 } = req.query;

  const history = await AdvancedSearch.find({ user: req.user._id })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .select('query searchType resultsCount timestamp');

  res.status(200).json({
    success: true,
    history
  });
});

// Get popular searches
exports.getPopularSearches = catchAsyncErrors(async (req, res) => {
  const { limit = 10 } = req.query;

  const popular = await AdvancedSearch.aggregate([
    { $match: { resultsCount: { $gt: 0 } } },
    {
      $group: {
        _id: '$query',
        count: { $sum: 1 },
        avgResults: { $avg: '$resultsCount' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: parseInt(limit) }
  ]);

  res.status(200).json({
    success: true,
    popular
  });
});

module.exports = exports;
