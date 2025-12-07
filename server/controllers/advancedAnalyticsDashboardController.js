import AdvancedAnalyticsDashboard from '../models/AdvancedAnalyticsDashboard.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Get dashboard by business
// @route   GET /api/v1/analytics/dashboard/:businessId
// @access  Private/Admin
export const getDashboard = catchAsyncErrors(async (req, res, next) => {
  const { period = 'monthly' } = req.query;

  const dashboard = await AdvancedAnalyticsDashboard.getDashboardByPeriod(
    req.params.businessId,
    period
  );

  if (!dashboard) {
    return next(new ErrorHandler('Dashboard not found', 404));
  }

  res.status(200).json({
    success: true,
    dashboard
  });
});

// @desc    Create new dashboard
// @route   POST /api/v1/analytics/dashboard
// @access  Private/Admin
export const createDashboard = catchAsyncErrors(async (req, res, next) => {
  const dashboard = await AdvancedAnalyticsDashboard.create(req.body);

  res.status(201).json({
    success: true,
    dashboard
  });
});

// @desc    Get sales forecast
// @route   GET /api/v1/analytics/dashboard/:id/sales-forecast
// @access  Private/Admin
export const getSalesForecast = catchAsyncErrors(async (req, res, next) => {
  const dashboard = await AdvancedAnalyticsDashboard.findById(req.params.id);

  if (!dashboard) {
    return next(new ErrorHandler('Dashboard not found', 404));
  }

  res.status(200).json({
    success: true,
    forecast: dashboard.salesForecast
  });
});

// @desc    Get conversion funnel
// @route   GET /api/v1/analytics/dashboard/:id/conversion-funnel
// @access  Private/Admin
export const getConversionFunnel = catchAsyncErrors(async (req, res, next) => {
  const dashboard = await AdvancedAnalyticsDashboard.findById(req.params.id);

  if (!dashboard) {
    return next(new ErrorHandler('Dashboard not found', 404));
  }

  const overallConversion = dashboard.calculateOverallConversionRate();

  res.status(200).json({
    success: true,
    conversionFunnel: {
      ...dashboard.conversionFunnel.toObject(),
      overallConversion
    }
  });
});

// @desc    Get revenue attribution
// @route   GET /api/v1/analytics/dashboard/:id/revenue-attribution
// @access  Private/Admin
export const getRevenueAttribution = catchAsyncErrors(async (req, res, next) => {
  const dashboard = await AdvancedAnalyticsDashboard.findById(req.params.id);

  if (!dashboard) {
    return next(new ErrorHandler('Dashboard not found', 404));
  }

  const topChannel = dashboard.getTopRevenueChannel();

  res.status(200).json({
    success: true,
    revenueAttribution: dashboard.revenueAttribution,
    topChannel
  });
});

// @desc    Get product performance
// @route   GET /api/v1/analytics/dashboard/:id/product-performance
// @access  Private/Admin
export const getProductPerformance = catchAsyncErrors(async (req, res, next) => {
  const dashboard = await AdvancedAnalyticsDashboard.findById(req.params.id)
    .populate('productPerformance.topProducts.product')
    .populate('productPerformance.underperformingProducts.product');

  if (!dashboard) {
    return next(new ErrorHandler('Dashboard not found', 404));
  }

  res.status(200).json({
    success: true,
    productPerformance: dashboard.productPerformance
  });
});

// @desc    Get customer analytics
// @route   GET /api/v1/analytics/dashboard/:id/customer-analytics
// @access  Private/Admin
export const getCustomerAnalytics = catchAsyncErrors(async (req, res, next) => {
  const dashboard = await AdvancedAnalyticsDashboard.findById(req.params.id);

  if (!dashboard) {
    return next(new ErrorHandler('Dashboard not found', 404));
  }

  res.status(200).json({
    success: true,
    customerAnalytics: dashboard.customerAnalytics
  });
});

// @desc    Get behavior heatmaps
// @route   GET /api/v1/analytics/dashboard/:id/heatmaps
// @access  Private/Admin
export const getBehaviorHeatmaps = catchAsyncErrors(async (req, res, next) => {
  const dashboard = await AdvancedAnalyticsDashboard.findById(req.params.id);

  if (!dashboard) {
    return next(new ErrorHandler('Dashboard not found', 404));
  }

  res.status(200).json({
    success: true,
    heatmaps: dashboard.behaviorHeatmaps
  });
});

// @desc    Get real-time metrics
// @route   GET /api/v1/analytics/dashboard/:id/real-time
// @access  Private/Admin
export const getRealTimeMetrics = catchAsyncErrors(async (req, res, next) => {
  const dashboard = await AdvancedAnalyticsDashboard.findById(req.params.id);

  if (!dashboard) {
    return next(new ErrorHandler('Dashboard not found', 404));
  }

  res.status(200).json({
    success: true,
    realTimeMetrics: dashboard.realTimeMetrics
  });
});

// @desc    Predict next month revenue
// @route   GET /api/v1/analytics/dashboard/:id/predict-revenue
// @access  Private/Admin
export const predictNextMonthRevenue = catchAsyncErrors(async (req, res, next) => {
  const dashboard = await AdvancedAnalyticsDashboard.findById(req.params.id);

  if (!dashboard) {
    return next(new ErrorHandler('Dashboard not found', 404));
  }

  const prediction = dashboard.predictNextMonthRevenue();

  res.status(200).json({
    success: true,
    prediction
  });
});

// @desc    Generate report
// @route   POST /api/v1/analytics/dashboard/:id/generate-report
// @access  Private/Admin
export const generateReport = catchAsyncErrors(async (req, res, next) => {
  const dashboard = await AdvancedAnalyticsDashboard.findById(req.params.id);

  if (!dashboard) {
    return next(new ErrorHandler('Dashboard not found', 404));
  }

  const { reportType, format } = req.body;

  // Simulate report generation
  const report = {
    reportType,
    generatedAt: Date.now(),
    fileUrl: `/reports/${dashboard._id}-${Date.now()}.${format}`,
    format,
    size: Math.floor(Math.random() * 5000000)
  };

  dashboard.generatedReports.push(report);
  await dashboard.save();

  res.status(200).json({
    success: true,
    report
  });
});

// @desc    Get recent dashboards
// @route   GET /api/v1/analytics/dashboard/business/:businessId/recent
// @access  Private/Admin
export const getRecentDashboards = catchAsyncErrors(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const dashboards = await AdvancedAnalyticsDashboard.getRecentDashboards(
    req.params.businessId,
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    count: dashboards.length,
    dashboards
  });
});

// @desc    Update dashboard settings
// @route   PUT /api/v1/analytics/dashboard/:id/settings
// @access  Private/Admin
export const updateDashboardSettings = catchAsyncErrors(async (req, res, next) => {
  const dashboard = await AdvancedAnalyticsDashboard.findByIdAndUpdate(
    req.params.id,
    { settings: req.body },
    { new: true, runValidators: true }
  );

  if (!dashboard) {
    return next(new ErrorHandler('Dashboard not found', 404));
  }

  res.status(200).json({
    success: true,
    dashboard
  });
});
