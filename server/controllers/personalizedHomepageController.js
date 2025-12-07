const PersonalizedHomepage = require('../models/PersonalizedHomepage');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Get user homepage
export const getUserHomepage = catchAsyncErrors(async (req, res) => {
  let homepage = await PersonalizedHomepage.findOne({ user: req.user._id });

  if (!homepage) {
    homepage = await PersonalizedHomepage.create({ user: req.user._id });
  }

  // Record visit
  homepage.recordVisit(0);
  await homepage.save();

  res.status(200).json({
    success: true,
    homepage
  });
});

// Update layout
export const updateLayout = catchAsyncErrors(async (req, res) => {
  const { layout } = req.body;

  const homepage = await PersonalizedHomepage.findOneAndUpdate(
    { user: req.user._id },
    { layout },
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'Layout updated successfully',
    homepage
  });
});

// Update preferences
export const updatePreferences = catchAsyncErrors(async (req, res) => {
  const { preferences } = req.body;

  const homepage = await PersonalizedHomepage.findOneAndUpdate(
    { user: req.user._id },
    { personalizationPreferences: preferences },
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    homepage
  });
});

// Refresh recommendations
export const refreshRecommendations = catchAsyncErrors(async (req, res) => {
  const homepage = await PersonalizedHomepage.findOne({ user: req.user._id });

  if (!homepage) {
    return res.status(404).json({
      success: false,
      message: 'Homepage not found'
    });
  }

  await homepage.refreshRecommendations();
  await homepage.save();

  res.status(200).json({
    success: true,
    message: 'Recommendations refreshed',
    homepage
  });
});

// Track interaction
export const trackInteraction = catchAsyncErrors(async (req, res) => {
  const { blockId, action } = req.body;

  const homepage = await PersonalizedHomepage.findOne({ user: req.user._id });

  if (!homepage) {
    return res.status(404).json({
      success: false,
      message: 'Homepage not found'
    });
  }

  homepage.trackInteraction(blockId, action);
  await homepage.save();

  res.status(200).json({
    success: true,
    message: 'Interaction tracked'
  });
});

module.exports = exports;
