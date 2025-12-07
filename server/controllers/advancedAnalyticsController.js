import advancedAnalyticsService from '../services/advancedAnalyticsService.js';

/**
 * Advanced Analytics Controller
 * Handles heatmaps, A/B testing, cohort analysis, and revenue dashboards
 */

// Heatmap endpoints
export const recordHeatmapClick = async (req, res) => {
  try {
    const { page, x, y, element, sessionId } = req.body;
    const userId = req.user?._id?.toString();

    const result = await advancedAnalyticsService.recordClick({
      page,
      x,
      y,
      element,
      userId,
      sessionId
    });

    res.status(200).json({ success: true, recorded: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record click',
      error: error.message
    });
  }
};

export const getHeatmapData = async (req, res) => {
  try {
    const { page, timeRange } = req.query;

    const data = await advancedAnalyticsService.getHeatmapData(
      page || '/',
      timeRange || '7d'
    );

    res.status(200).json({
      success: true,
      page,
      timeRange,
      data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get heatmap data',
      error: error.message
    });
  }
};

export const recordScrollDepth = async (req, res) => {
  try {
    const { page, depth, sessionId } = req.body;
    const userId = req.user?._id?.toString();

    await advancedAnalyticsService.recordScrollDepth({
      page,
      depth,
      userId,
      sessionId
    });

    res.status(200).json({ success: true, recorded: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record scroll depth',
      error: error.message
    });
  }
};

// A/B Testing endpoints
export const createABTest = async (req, res) => {
  try {
    const { name, description, variants, targetPages, targetAudience, endDate } = req.body;

    if (!name || !variants || variants.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name and at least 2 variants are required'
      });
    }

    const test = advancedAnalyticsService.createABTest({
      name,
      description,
      variants,
      targetPages,
      targetAudience,
      endDate: endDate ? new Date(endDate) : null
    });

    res.status(201).json({
      success: true,
      test
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create A/B test',
      error: error.message
    });
  }
};

export const getABTestVariant = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user?._id?.toString() || req.query.sessionId || 'anonymous';

    const variant = advancedAnalyticsService.getVariantForUser(testId, userId);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Test not found or inactive'
      });
    }

    res.status(200).json({
      success: true,
      variant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get variant',
      error: error.message
    });
  }
};

export const recordABTestConversion = async (req, res) => {
  try {
    const { testId, variantId, revenue, timeOnPage } = req.body;

    const result = advancedAnalyticsService.recordConversion(testId, variantId, {
      revenue,
      timeOnPage
    });

    res.status(200).json({
      success: true,
      recorded: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record conversion',
      error: error.message
    });
  }
};

export const getABTestResults = async (req, res) => {
  try {
    const { testId } = req.params;

    const results = advancedAnalyticsService.getTestResults(testId);

    if (!results) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get test results',
      error: error.message
    });
  }
};

// Cohort Analysis endpoints
export const createCohort = async (req, res) => {
  try {
    const { name, type, definition, startDate, endDate } = req.body;

    const cohort = await advancedAnalyticsService.createCohort({
      name,
      type,
      definition,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null
    });

    res.status(201).json({
      success: true,
      cohort
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create cohort',
      error: error.message
    });
  }
};

export const getCohortRetention = async (req, res) => {
  try {
    const { cohortId } = req.params;
    const { periods } = req.query;

    const retention = await advancedAnalyticsService.getCohortRetention(
      cohortId,
      parseInt(periods) || 12
    );

    if (!retention) {
      return res.status(404).json({
        success: false,
        message: 'Cohort not found'
      });
    }

    res.status(200).json({
      success: true,
      cohortId,
      retention
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cohort retention',
      error: error.message
    });
  }
};

// Revenue Dashboard endpoints
export const getRevenueDashboard = async (req, res) => {
  try {
    const { timeRange } = req.query;

    const dashboard = await advancedAnalyticsService.getRevenueDashboard(
      timeRange || '30d'
    );

    res.status(200).json({
      success: true,
      dashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue dashboard',
      error: error.message
    });
  }
};

export const getConversionFunnel = async (req, res) => {
  try {
    const { timeRange } = req.query;

    const funnel = await advancedAnalyticsService.getConversionFunnel(
      timeRange || '30d'
    );

    res.status(200).json({
      success: true,
      funnel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get conversion funnel',
      error: error.message
    });
  }
};

export const getCustomerLTV = async (req, res) => {
  try {
    const ltv = await advancedAnalyticsService.getCustomerLTV();

    res.status(200).json({
      success: true,
      ltv
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get customer LTV',
      error: error.message
    });
  }
};

export default {
  recordHeatmapClick,
  getHeatmapData,
  recordScrollDepth,
  createABTest,
  getABTestVariant,
  recordABTestConversion,
  getABTestResults,
  createCohort,
  getCohortRetention,
  getRevenueDashboard,
  getConversionFunnel,
  getCustomerLTV
};
