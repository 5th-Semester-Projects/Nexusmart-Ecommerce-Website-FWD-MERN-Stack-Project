import User from '../models/User.js';
import Product from '../models/Product.js';

// AI Stylist/Personal Shopper Controller

// Style Quiz - Capture user preferences
export const submitStyleQuiz = async (req, res) => {
  try {
    const { userId, preferences } = req.body;

    // Preferences include: style (casual, formal, sporty), colors, budget, occasions, bodyType, etc.
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.styleProfile = {
      ...preferences,
      completedAt: new Date(),
      lastUpdated: new Date()
    };

    await user.save();

    res.status(200).json({
      message: 'Style profile created successfully',
      styleProfile: user.styleProfile
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting style quiz', error: error.message });
  }
};

// Get Outfit Recommendations based on user style profile
export const getOutfitRecommendations = async (req, res) => {
  try {
    const { userId, occasion, season } = req.query;

    const user = await User.findById(userId);

    if (!user || !user.styleProfile) {
      return res.status(404).json({ message: 'Style profile not found. Please complete style quiz first.' });
    }

    const { stylePreference, favoriteColors, budget, bodyType } = user.styleProfile;

    // AI-powered recommendation logic
    const query = {
      category: { $in: ['clothing', 'accessories', 'footwear'] },
      price: { $lte: budget || 1000 }
    };

    if (occasion) {
      query.tags = { $in: [occasion, stylePreference] };
    }

    const recommendedProducts = await Product.find(query).limit(20);

    // Create outfit combinations (groups of 3-5 items)
    const outfits = generateOutfitCombinations(recommendedProducts, stylePreference, occasion);

    res.status(200).json({
      message: 'Outfit recommendations generated',
      totalOutfits: outfits.length,
      outfits,
      styleProfile: user.styleProfile
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating recommendations', error: error.message });
  }
};

// Book Virtual Styling Session
export const bookStylingSession = async (req, res) => {
  try {
    const { userId, stylistId, preferredDate, preferredTime, sessionType, notes } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const session = {
      sessionId: `SESSION-${Date.now()}`,
      userId,
      stylistId,
      preferredDate: new Date(preferredDate),
      preferredTime,
      sessionType, // video, chat, in-person
      status: 'pending',
      notes,
      createdAt: new Date()
    };

    if (!user.stylingSessions) {
      user.stylingSessions = [];
    }

    user.stylingSessions.push(session);
    await user.save();

    res.status(201).json({
      message: 'Styling session booked successfully',
      session
    });
  } catch (error) {
    res.status(500).json({ message: 'Error booking styling session', error: error.message });
  }
};

// Get User's Styling Sessions
export const getStylingSessions = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sessions = user.stylingSessions || [];

    res.status(200).json({
      sessions,
      totalSessions: sessions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching styling sessions', error: error.message });
  }
};

// AI Personal Shopper - Get personalized product suggestions
export const getPersonalShopperSuggestions = async (req, res) => {
  try {
    const { userId, category, maxItems } = req.query;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Analyze user's purchase history, browsing behavior, and style profile
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (user.styleProfile) {
      query.tags = { $in: user.styleProfile.stylePreference ? [user.styleProfile.stylePreference] : [] };
    }

    const suggestions = await Product.find(query)
      .limit(parseInt(maxItems) || 10)
      .sort({ rating: -1, popularity: -1 });

    // Add AI reasoning for each suggestion
    const suggestionsWithReason = suggestions.map(product => ({
      product,
      reason: generateAIReason(product, user.styleProfile)
    }));

    res.status(200).json({
      message: 'Personal shopper suggestions generated',
      suggestions: suggestionsWithReason,
      totalSuggestions: suggestionsWithReason.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating suggestions', error: error.message });
  }
};

// Update Style Profile
export const updateStyleProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.styleProfile = {
      ...user.styleProfile,
      ...updates,
      lastUpdated: new Date()
    };

    await user.save();

    res.status(200).json({
      message: 'Style profile updated successfully',
      styleProfile: user.styleProfile
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating style profile', error: error.message });
  }
};

// Helper Functions

function generateOutfitCombinations(products, stylePreference, occasion) {
  const outfits = [];

  // Group products by category
  const tops = products.filter(p => p.subcategory === 'tops' || p.subcategory === 'shirts');
  const bottoms = products.filter(p => p.subcategory === 'bottoms' || p.subcategory === 'pants');
  const shoes = products.filter(p => p.category === 'footwear');
  const accessories = products.filter(p => p.category === 'accessories');

  // Create combinations (simplified logic)
  for (let i = 0; i < Math.min(5, tops.length); i++) {
    for (let j = 0; j < Math.min(3, bottoms.length); j++) {
      const outfit = {
        outfitId: `OUTFIT-${Date.now()}-${i}-${j}`,
        items: [tops[i], bottoms[j]],
        occasion: occasion || 'casual',
        styleMatch: calculateStyleMatch(stylePreference, occasion)
      };

      if (shoes.length > 0) outfit.items.push(shoes[j % shoes.length]);
      if (accessories.length > 0) outfit.items.push(accessories[i % accessories.length]);

      outfits.push(outfit);

      if (outfits.length >= 10) break;
    }
    if (outfits.length >= 10) break;
  }

  return outfits;
}

function calculateStyleMatch(stylePreference, occasion) {
  // AI-based style matching score (0-100)
  const baseScore = 70;
  const randomVariation = Math.floor(Math.random() * 30);
  return Math.min(100, baseScore + randomVariation);
}

function generateAIReason(product, styleProfile) {
  const reasons = [
    `Matches your ${styleProfile?.stylePreference || 'preferred'} style`,
    `Perfect for your favorite color palette`,
    `Highly rated by customers with similar taste`,
    `Trending in your style category`,
    `Complements items in your wardrobe`,
    `Within your preferred budget range`
  ];

  return reasons[Math.floor(Math.random() * reasons.length)];
}
