import LifeStageTargeting from '../models/LifeStageTargeting.js';
import LifestyleClustering from '../models/LifestyleClustering.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Analyze and set user life stage
export const analyzeUserLifeStage = catchAsyncErrors(async (req, res, next) => {
  const { lifeStage, demographics, lifestyleIndicators } = req.body;

  let targeting = await LifeStageTargeting.findOne({ user: req.user.id });

  // Analyze shopping behavior
  const orders = await Order.find({ user: req.user.id }).populate('orderItems.product');
  const shoppingBehavior = analyzeShoppingBehavior(orders);

  // Generate recommendations
  const recommendations = await generateLifeStageRecommendations(lifeStage, demographics);

  if (targeting) {
    targeting.lifeStage = lifeStage;
    targeting.demographics = demographics;
    targeting.lifestyleIndicators = lifestyleIndicators;
    targeting.shoppingBehavior = shoppingBehavior;
    targeting.recommendations = recommendations;
    targeting.lastUpdated = Date.now();
    targeting.updateSource = 'user_input';
  } else {
    targeting = await LifeStageTargeting.create({
      user: req.user.id,
      lifeStage,
      demographics,
      lifestyleIndicators,
      shoppingBehavior,
      recommendations,
      updateSource: 'user_input'
    });
  }

  await targeting.save();

  res.status(200).json({
    success: true,
    data: targeting
  });
});

// Get user life stage profile
export const getUserLifeStage = catchAsyncErrors(async (req, res, next) => {
  const targeting = await LifeStageTargeting.findOne({ user: req.user.id })
    .populate('recommendations.products');

  if (!targeting) {
    return next(new ErrorHandler('Life stage profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: targeting
  });
});

// Analyze user lifestyle cluster
export const analyzeLifestyleCluster = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  // Get user orders and behavior
  const orders = await Order.find({ user: userId }).populate('orderItems.product');

  // Calculate behavior profile
  const behaviorProfile = calculateBehaviorProfile(orders);

  // Determine cluster
  const cluster = determineCluster(behaviorProfile);

  // Find similar users
  const similarUsers = await findSimilarUsers(behaviorProfile, userId);

  // Generate recommendations
  const recommendations = await generateClusterRecommendations(cluster, behaviorProfile);

  let clustering = await LifestyleClustering.findOne({ user: userId });

  if (clustering) {
    // Check if cluster changed
    if (clustering.cluster.name !== cluster.name) {
      clustering.clusterMigration.push({
        fromCluster: clustering.cluster.name,
        toCluster: cluster.name,
        migratedAt: Date.now(),
        reason: 'Behavior pattern change detected'
      });
    }
    clustering.cluster = cluster;
    clustering.behaviorProfile = behaviorProfile;
    clustering.similarUsers = similarUsers;
    clustering.recommendations = recommendations;
    clustering.lastAnalyzed = Date.now();
  } else {
    clustering = await LifestyleClustering.create({
      user: userId,
      cluster,
      behaviorProfile,
      similarUsers,
      recommendations
    });
  }

  await clustering.save();

  res.status(200).json({
    success: true,
    data: clustering
  });
});

// Get lifestyle cluster profile
export const getLifestyleCluster = catchAsyncErrors(async (req, res, next) => {
  const clustering = await LifestyleClustering.findOne({ user: req.user.id })
    .populate('similarUsers.user', 'name email');

  if (!clustering) {
    return next(new ErrorHandler('Lifestyle cluster not found', 404));
  }

  res.status(200).json({
    success: true,
    data: clustering
  });
});

// Get cluster-based recommendations
export const getClusterRecommendations = catchAsyncErrors(async (req, res, next) => {
  const clustering = await LifestyleClustering.findOne({ user: req.user.id });

  if (!clustering) {
    return next(new ErrorHandler('Lifestyle cluster not found', 404));
  }

  // Get fresh recommendations
  const recommendations = await generateClusterRecommendations(
    clustering.cluster,
    clustering.behaviorProfile
  );

  res.status(200).json({
    success: true,
    data: recommendations
  });
});

// Helper functions
function analyzeShoppingBehavior(orders) {
  if (orders.length === 0) {
    return {
      averageOrderValue: 0,
      purchaseFrequency: 'new',
      preferredCategories: [],
      pricesensitivity: 'medium',
      brandLoyalty: 'medium'
    };
  }

  const totalValue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const avgOrderValue = totalValue / orders.length;

  // Extract categories
  const categories = {};
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      if (item.product?.category) {
        categories[item.product.category] = (categories[item.product.category] || 0) + 1;
      }
    });
  });

  return {
    averageOrderValue: avgOrderValue,
    purchaseFrequency: orders.length > 10 ? 'high' : orders.length > 5 ? 'medium' : 'low',
    preferredCategories: Object.keys(categories).slice(0, 5),
    pricesensitivity: avgOrderValue > 5000 ? 'low' : avgOrderValue > 2000 ? 'medium' : 'high',
    brandLoyalty: 'medium'
  };
}

async function generateLifeStageRecommendations(lifeStage, demographics) {
  const recommendations = [];

  // Define category mappings for life stages
  const lifeStageMappings = {
    'student': ['electronics', 'books', 'fashion'],
    'young_professional': ['fashion', 'electronics', 'home_decor'],
    'new_parent': ['baby_products', 'home_essentials', 'health'],
    'retiree': ['health', 'hobbies', 'travel']
  };

  const categories = lifeStageMappings[lifeStage] || ['fashion', 'electronics'];

  for (const category of categories) {
    const products = await Product.find({ category }).limit(5);
    recommendations.push({
      category,
      products: products.map(p => p._id),
      reason: `Recommended for ${lifeStage}`,
      priority: 1
    });
  }

  return recommendations;
}

function calculateBehaviorProfile(orders) {
  const profile = {
    browsingPatterns: {
      avgSessionDuration: 600,
      pagesPerSession: 15,
      peakShoppingHours: [10, 14, 20],
      peakShoppingDays: ['Saturday', 'Sunday'],
      devicePreference: 'mobile'
    },
    purchasePatterns: {
      avgOrderValue: 0,
      avgItemsPerOrder: 0,
      purchaseFrequency: 'medium',
      preferredPaymentMethod: 'card',
      usesDiscounts: false,
      cartAbandonmentRate: 0.3
    },
    productPreferences: {
      topCategories: [],
      topBrands: [],
      priceRange: { min: 0, max: 0, avg: 0 },
      preferredColors: [],
      preferredSizes: []
    }
  };

  if (orders.length > 0) {
    const totalValue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalItems = orders.reduce((sum, order) => sum + order.orderItems.length, 0);

    profile.purchasePatterns.avgOrderValue = totalValue / orders.length;
    profile.purchasePatterns.avgItemsPerOrder = totalItems / orders.length;
  }

  return profile;
}

function determineCluster(behaviorProfile) {
  const avgOrderValue = behaviorProfile.purchasePatterns.avgOrderValue;

  if (avgOrderValue > 5000) {
    return {
      id: 'luxury_seekers',
      name: 'luxury_seekers',
      description: 'High-value shoppers seeking premium products',
      confidence: 0.85
    };
  } else if (avgOrderValue < 1000) {
    return {
      id: 'bargain_hunters',
      name: 'bargain_hunters',
      description: 'Price-conscious shoppers looking for deals',
      confidence: 0.82
    };
  } else {
    return {
      id: 'practical_shoppers',
      name: 'practical_shoppers',
      description: 'Balanced shoppers seeking value',
      confidence: 0.78
    };
  }
}

async function findSimilarUsers(behaviorProfile, currentUserId) {
  // Simplified similarity detection
  const allClusters = await LifestyleClustering.find({
    user: { $ne: currentUserId }
  }).limit(10);

  return allClusters.map(cluster => ({
    user: cluster.user,
    similarityScore: Math.random() * 0.5 + 0.5,
    sharedBehaviors: ['price_range', 'category_preference']
  }));
}

async function generateClusterRecommendations(cluster, behaviorProfile) {
  const recommendations = [];

  // Get products based on cluster
  const products = await Product.find({ featured: true }).limit(10);

  products.forEach(product => {
    recommendations.push({
      type: 'product',
      referenceId: product._id.toString(),
      reason: `Popular with ${cluster.name}`,
      score: Math.random() * 0.5 + 0.5,
      generatedAt: Date.now()
    });
  });

  return recommendations;
}
