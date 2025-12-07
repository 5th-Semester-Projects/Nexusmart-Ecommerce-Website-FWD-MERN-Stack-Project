const StyleProfile = require('../models/StyleProfile');
const Product = require('../models/Product');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');

// Create or update style profile
export const createProfile = catchAsyncErrors(async (req, res, next) => {
  const {
    fashionStyle,
    bodyMeasurements,
    colorPreferences,
    brandPreferences,
    occasions,
    stylePersonality
  } = req.body;

  let profile = await StyleProfile.findOne({ user: req.user.id });

  if (profile) {
    // Update existing profile
    profile = await StyleProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        fashionStyle,
        bodyMeasurements,
        colorPreferences,
        brandPreferences,
        occasions,
        stylePersonality,
        lastUpdated: Date.now()
      },
      { new: true, runValidators: true }
    );
  } else {
    // Create new profile
    profile = await StyleProfile.create({
      user: req.user.id,
      fashionStyle,
      bodyMeasurements,
      colorPreferences,
      brandPreferences,
      occasions,
      stylePersonality
    });
  }

  res.status(201).json({
    success: true,
    profile
  });
});

// Get style profile
export const getProfile = catchAsyncErrors(async (req, res, next) => {
  const profile = await StyleProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ErrorHandler('Style profile not found', 404));
  }

  res.status(200).json({
    success: true,
    profile
  });
});

// Take style quiz
export const styleQuiz = catchAsyncErrors(async (req, res, next) => {
  const { answers } = req.body;

  // Process quiz answers and generate style profile
  const styleAnalysis = analyzeStyleQuiz(answers);

  let profile = await StyleProfile.findOne({ user: req.user.id });

  if (!profile) {
    profile = await StyleProfile.create({
      user: req.user.id,
      fashionStyle: styleAnalysis.fashionStyle,
      stylePersonality: styleAnalysis.stylePersonality,
      colorPreferences: styleAnalysis.colorPreferences,
      quizResults: {
        completedAt: Date.now(),
        score: answers
      }
    });
  } else {
    profile.fashionStyle = styleAnalysis.fashionStyle;
    profile.stylePersonality = styleAnalysis.stylePersonality;
    profile.quizResults = {
      completedAt: Date.now(),
      score: answers
    };
    await profile.save();
  }

  res.status(200).json({
    success: true,
    profile,
    styleAnalysis
  });
});

// Get AI-powered recommendations
export const getRecommendations = catchAsyncErrors(async (req, res, next) => {
  const profile = await StyleProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ErrorHandler('Please complete your style profile first', 404));
  }

  // Generate AI recommendations based on profile
  const recommendations = await generateStyleRecommendations(profile);

  // Save recommendations
  profile.aiRecommendations.push({
    date: Date.now(),
    products: recommendations.map(r => r._id),
    reason: 'Based on your style profile and preferences',
    clicked: false,
    purchased: false
  });

  await profile.save();

  res.status(200).json({
    success: true,
    recommendations
  });
});

// Update body measurements
export const updateMeasurements = catchAsyncErrors(async (req, res, next) => {
  const profile = await StyleProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ErrorHandler('Style profile not found', 404));
  }

  profile.bodyMeasurements = {
    ...profile.bodyMeasurements,
    ...req.body
  };

  await profile.save();

  res.status(200).json({
    success: true,
    profile
  });
});

// Get outfit suggestions
export const getOutfitSuggestions = catchAsyncErrors(async (req, res, next) => {
  const { occasion, weather, season } = req.query;
  const profile = await StyleProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ErrorHandler('Style profile not found', 404));
  }

  const outfits = await generateOutfitSuggestions(profile, {
    occasion,
    weather,
    season
  });

  res.status(200).json({
    success: true,
    outfits
  });
});

// Helper Functions
function analyzeStyleQuiz(answers) {
  // Mock analysis - integrate with ML model
  const stylePersonality = {
    adventurous: answers.filter(a => a.type === 'adventurous').length * 20,
    classic: answers.filter(a => a.type === 'classic').length * 20,
    trendy: answers.filter(a => a.type === 'trendy').length * 20,
    comfortable: answers.filter(a => a.type === 'comfortable').length * 20,
    luxurious: answers.filter(a => a.type === 'luxurious').length * 20
  };

  const primaryStyle = Object.keys(stylePersonality).reduce((a, b) =>
    stylePersonality[a] > stylePersonality[b] ? a : b
  );

  return {
    fashionStyle: {
      primary: primaryStyle,
      secondary: Object.keys(stylePersonality)
        .filter(k => k !== primaryStyle && stylePersonality[k] > 40)
    },
    stylePersonality,
    colorPreferences: {
      favorites: ['black', 'white', 'navy'],
      seasonalPalette: 'autumn'
    }
  };
}

async function generateStyleRecommendations(profile) {
  let query = {};

  if (profile.fashionStyle?.primary) {
    query.tags = { $in: [profile.fashionStyle.primary] };
  }

  if (profile.colorPreferences?.favorites) {
    query.colors = { $in: profile.colorPreferences.favorites };
  }

  const products = await Product.find(query).limit(10);
  return products;
}

async function generateOutfitSuggestions(profile, context) {
  // Generate complete outfit suggestions
  const outfits = [];

  const topQuery = { category: 'clothing', subCategory: 'tops' };
  const bottomQuery = { category: 'clothing', subCategory: 'bottoms' };
  const shoesQuery = { category: 'footwear' };

  if (context.occasion) {
    topQuery.tags = context.occasion;
    bottomQuery.tags = context.occasion;
  }

  const tops = await Product.find(topQuery).limit(3);
  const bottoms = await Product.find(bottomQuery).limit(3);
  const shoes = await Product.find(shoesQuery).limit(3);

  // Create outfit combinations
  for (let i = 0; i < Math.min(3, tops.length); i++) {
    outfits.push({
      top: tops[i],
      bottom: bottoms[i % bottoms.length],
      shoes: shoes[i % shoes.length],
      occasion: context.occasion,
      styleScore: Math.random() * 30 + 70 // Mock score
    });
  }

  return outfits;
}
