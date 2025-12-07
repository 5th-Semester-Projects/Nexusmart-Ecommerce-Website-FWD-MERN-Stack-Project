import AdvancedSearchFilters from '../models/AdvancedSearchFilters.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Perform advanced search
// @route   POST /api/v1/search
// @access  Public
export const performSearch = catchAsyncErrors(async (req, res, next) => {
  const { keyword, filters, sorting, userId, sessionId } = req.body;

  let searchRecord = await AdvancedSearchFilters.findOne({
    $or: [
      { userId: userId },
      { sessionId: sessionId }
    ]
  });

  if (!searchRecord) {
    searchRecord = new AdvancedSearchFilters({
      userId,
      sessionId
    });
  }

  // Update search query
  searchRecord.searchQuery.keyword = keyword;
  searchRecord.searchQuery.originalQuery = keyword;
  searchRecord.activeFilters = filters || {};
  searchRecord.sorting = sorting || { field: 'relevance', order: 'desc' };

  // Apply filters and get products (simplified - in production, use proper search engine)
  const query = await searchRecord.applyFilters(req.app.locals.Product);

  // Simulate search results
  searchRecord.results.totalResults = 100; // Example count
  searchRecord.results.searchTime = Math.random() * 100; // milliseconds
  searchRecord.results.source = 'mongodb';

  // Add to search history
  searchRecord.addToHistory();

  // Update trending searches
  await AdvancedSearchFilters.updateTrendingSearches(keyword);

  await searchRecord.save();

  res.status(200).json({
    success: true,
    search: searchRecord
  });
});

// @desc    Get autocomplete suggestions
// @route   GET /api/v1/search/autocomplete
// @access  Public
export const getAutocompleteSuggestions = catchAsyncErrors(async (req, res, next) => {
  const { query } = req.query;

  // Simulate autocomplete (in production, use proper search index)
  const suggestions = [
    { text: `${query} shoes`, score: 0.9, category: 'Footwear' },
    { text: `${query} clothing`, score: 0.8, category: 'Apparel' },
    { text: `${query} accessories`, score: 0.7, category: 'Accessories' }
  ];

  res.status(200).json({
    success: true,
    suggestions
  });
});

// @desc    Get trending searches
// @route   GET /api/v1/search/trending
// @access  Public
export const getTrendingSearches = catchAsyncErrors(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const trending = await AdvancedSearchFilters.getTrendingSearches(parseInt(limit));

  res.status(200).json({
    success: true,
    trending
  });
});

// @desc    Get zero result queries
// @route   GET /api/v1/search/zero-results
// @access  Private/Admin
export const getZeroResultQueries = catchAsyncErrors(async (req, res, next) => {
  const { limit = 20 } = req.query;

  const queries = await AdvancedSearchFilters.getZeroResultQueries(parseInt(limit));

  res.status(200).json({
    success: true,
    queries
  });
});

// @desc    Get search history for user
// @route   GET /api/v1/search/history/:userId
// @access  Private
export const getSearchHistory = catchAsyncErrors(async (req, res, next) => {
  const searchRecord = await AdvancedSearchFilters.findOne({ userId: req.params.userId });

  if (!searchRecord) {
    return next(new ErrorHandler('Search history not found', 404));
  }

  res.status(200).json({
    success: true,
    history: searchRecord.searchHistory
  });
});

// @desc    Track search click
// @route   POST /api/v1/search/track-click
// @access  Public
export const trackSearchClick = catchAsyncErrors(async (req, res, next) => {
  const { userId, sessionId, productId, position } = req.body;

  const searchRecord = await AdvancedSearchFilters.findOne({
    $or: [{ userId }, { sessionId }]
  });

  if (!searchRecord) {
    return next(new ErrorHandler('Search record not found', 404));
  }

  searchRecord.trackClick(productId, position);
  await searchRecord.save();

  res.status(200).json({
    success: true,
    message: 'Click tracked successfully'
  });
});

// @desc    Save search
// @route   POST /api/v1/search/save
// @access  Private
export const saveSearch = catchAsyncErrors(async (req, res, next) => {
  const { userId, name, query, filters, alertEnabled, alertFrequency } = req.body;

  const searchRecord = await AdvancedSearchFilters.findOne({ userId });

  if (!searchRecord) {
    return next(new ErrorHandler('Search record not found', 404));
  }

  searchRecord.savedSearches.push({
    name,
    query,
    filters,
    alertEnabled: alertEnabled || false,
    alertFrequency: alertFrequency || 'daily',
    createdAt: Date.now()
  });

  await searchRecord.save();

  res.status(200).json({
    success: true,
    message: 'Search saved successfully'
  });
});

// @desc    Get saved searches
// @route   GET /api/v1/search/saved/:userId
// @access  Private
export const getSavedSearches = catchAsyncErrors(async (req, res, next) => {
  const searchRecord = await AdvancedSearchFilters.findOne({ userId: req.params.userId });

  if (!searchRecord) {
    return next(new ErrorHandler('Search record not found', 404));
  }

  res.status(200).json({
    success: true,
    savedSearches: searchRecord.savedSearches
  });
});

// @desc    Delete saved search
// @route   DELETE /api/v1/search/saved/:userId/:searchId
// @access  Private
export const deleteSavedSearch = catchAsyncErrors(async (req, res, next) => {
  const searchRecord = await AdvancedSearchFilters.findOne({ userId: req.params.userId });

  if (!searchRecord) {
    return next(new ErrorHandler('Search record not found', 404));
  }

  searchRecord.savedSearches = searchRecord.savedSearches.filter(
    s => s._id.toString() !== req.params.searchId
  );

  await searchRecord.save();

  res.status(200).json({
    success: true,
    message: 'Saved search deleted successfully'
  });
});

// @desc    Get search analytics
// @route   GET /api/v1/search/analytics/:userId
// @access  Private
export const getSearchAnalytics = catchAsyncErrors(async (req, res, next) => {
  const searchRecord = await AdvancedSearchFilters.findOne({ userId: req.params.userId });

  if (!searchRecord) {
    return next(new ErrorHandler('Search record not found', 404));
  }

  res.status(200).json({
    success: true,
    analytics: searchRecord.analytics
  });
});

// @desc    Get popular filters
// @route   GET /api/v1/search/popular-filters
// @access  Public
export const getPopularFilters = catchAsyncErrors(async (req, res, next) => {
  const searchRecords = await AdvancedSearchFilters.aggregate([
    { $unwind: '$popularFilters' },
    { $sort: { 'popularFilters.usageCount': -1 } },
    { $limit: 20 },
    { $project: { filter: '$popularFilters' } }
  ]);

  res.status(200).json({
    success: true,
    popularFilters: searchRecords.map(r => r.filter)
  });
});

// @desc    Update search settings
// @route   PUT /api/v1/search/settings/:userId
// @access  Private
export const updateSearchSettings = catchAsyncErrors(async (req, res, next) => {
  const searchRecord = await AdvancedSearchFilters.findOne({ userId: req.params.userId });

  if (!searchRecord) {
    return next(new ErrorHandler('Search record not found', 404));
  }

  if (req.body.advancedFeatures) {
    searchRecord.advancedFeatures = { ...searchRecord.advancedFeatures, ...req.body.advancedFeatures };
  }

  if (req.body.aiFeatures) {
    searchRecord.aiFeatures = { ...searchRecord.aiFeatures, ...req.body.aiFeatures };
  }

  await searchRecord.save();

  res.status(200).json({
    success: true,
    searchRecord
  });
});
