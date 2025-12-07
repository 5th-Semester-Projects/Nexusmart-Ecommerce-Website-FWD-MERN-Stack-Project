import Product from '../models/Product.js';
import Order from '../models/Order.js';
import crypto from 'crypto';

// Sustainability Tracking Controller

// Carbon Footprint Calculator

// Calculate Product Carbon Footprint
export const calculateProductCarbonFootprint = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate carbon footprint based on various factors
    const carbonFootprint = {
      productId,
      productName: product.name,
      totalCO2: 0,
      breakdown: {
        manufacturing: calculateManufacturingCO2(product),
        transportation: calculateTransportationCO2(product),
        packaging: calculatePackagingCO2(product),
        distribution: calculateDistributionCO2(product)
      },
      unit: 'kg CO2e',
      comparisonToAverage: null,
      offsetOptions: [],
      calculatedAt: new Date()
    };

    // Sum up all components
    carbonFootprint.totalCO2 =
      carbonFootprint.breakdown.manufacturing +
      carbonFootprint.breakdown.transportation +
      carbonFootprint.breakdown.packaging +
      carbonFootprint.breakdown.distribution;

    // Round to 2 decimal places
    carbonFootprint.totalCO2 = Math.round(carbonFootprint.totalCO2 * 100) / 100;

    // Calculate comparison to category average
    const categoryAverage = 12.5; // kg CO2e
    carbonFootprint.comparisonToAverage = {
      percentage: Math.round(((carbonFootprint.totalCO2 - categoryAverage) / categoryAverage) * 100),
      betterThanAverage: carbonFootprint.totalCO2 < categoryAverage
    };

    // Provide offset options
    carbonFootprint.offsetOptions = generateOffsetOptions(carbonFootprint.totalCO2);

    // Store in product
    product.sustainability = product.sustainability || {};
    product.sustainability.carbonFootprint = carbonFootprint;
    await product.save();

    res.status(200).json(carbonFootprint);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating carbon footprint', error: error.message });
  }
};

// Calculate Order Carbon Footprint
export const calculateOrderCarbonFootprint = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let totalCO2 = 0;
    const productBreakdown = [];

    // Calculate for each product
    for (const item of order.items) {
      const productCO2 = await calculateProductCO2(item.product);
      const itemTotal = productCO2 * item.quantity;
      totalCO2 += itemTotal;

      productBreakdown.push({
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        co2PerUnit: productCO2,
        totalCO2: itemTotal
      });
    }

    // Add shipping emissions
    const shippingCO2 = calculateShippingCO2(order);
    totalCO2 += shippingCO2;

    const orderCarbonFootprint = {
      orderId,
      totalCO2: Math.round(totalCO2 * 100) / 100,
      productBreakdown,
      shippingCO2,
      unit: 'kg CO2e',
      equivalentTo: generateEquivalents(totalCO2),
      offsetOptions: generateOffsetOptions(totalCO2),
      calculatedAt: new Date()
    };

    res.status(200).json(orderCarbonFootprint);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating order carbon footprint', error: error.message });
  }
};

// Eco-Friendly Product Badges

// Assign Eco-Friendly Badge
export const assignEcoBadge = async (req, res) => {
  try {
    const { productId, badgeType, certificationDetails } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const ecoBadge = {
      badgeId: `ECO-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      badgeType, // carbon-neutral, organic, recycled, fair-trade, eco-friendly
      certificationDetails: {
        certifyingBody: certificationDetails?.certifyingBody || 'Green Certification Authority',
        certificationNumber: certificationDetails?.certificationNumber || `CERT-${crypto.randomBytes(4).toString('hex')}`,
        certificationDate: new Date(certificationDetails?.certificationDate || Date.now()),
        expiryDate: new Date(certificationDetails?.expiryDate || Date.now() + 365 * 24 * 60 * 60 * 1000),
        verificationUrl: certificationDetails?.verificationUrl
      },
      criteria: {
        carbonFootprint: certificationDetails?.carbonFootprint || 'low',
        renewableEnergy: certificationDetails?.renewableEnergy || true,
        sustainableMaterials: certificationDetails?.sustainableMaterials || true,
        fairLabor: certificationDetails?.fairLabor || true
      },
      issuedAt: new Date()
    };

    if (!product.sustainability) {
      product.sustainability = {};
    }

    if (!product.sustainability.ecoBadges) {
      product.sustainability.ecoBadges = [];
    }

    product.sustainability.ecoBadges.push(ecoBadge);
    await product.save();

    res.status(201).json({
      message: 'Eco-friendly badge assigned successfully',
      ecoBadge,
      product: {
        id: product._id,
        name: product.name,
        totalEcoBadges: product.sustainability.ecoBadges.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning eco badge', error: error.message });
  }
};

// Get Products with Eco Badges
export const getEcoFriendlyProducts = async (req, res) => {
  try {
    const { badgeType, page = 1, limit = 20 } = req.query;

    const query = {
      'sustainability.ecoBadges': { $exists: true, $ne: [] },
      isActive: true
    };

    if (badgeType) {
      query['sustainability.ecoBadges.badgeType'] = badgeType;
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'sustainability.ecoBadges.issuedAt': -1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching eco-friendly products', error: error.message });
  }
};

// Sustainable Packaging Options

// Get Packaging Options
export const getPackagingOptions = async (req, res) => {
  try {
    const packagingOptions = [
      {
        optionId: 'standard',
        name: 'Standard Packaging',
        description: 'Regular cardboard packaging',
        isEcoFriendly: false,
        cost: 0,
        co2Impact: 0.5,
        materials: ['cardboard', 'plastic-tape'],
        recyclable: true,
        biodegradable: false
      },
      {
        optionId: 'eco-basic',
        name: 'Eco-Friendly Basic',
        description: 'Recycled cardboard with paper tape',
        isEcoFriendly: true,
        cost: 1.50,
        co2Impact: 0.2,
        materials: ['recycled-cardboard', 'paper-tape'],
        recyclable: true,
        biodegradable: true,
        discount: 5 // 5% discount on order
      },
      {
        optionId: 'eco-premium',
        name: 'Eco-Friendly Premium',
        description: 'Biodegradable materials with plant-based fillers',
        isEcoFriendly: true,
        cost: 3.00,
        co2Impact: 0.1,
        materials: ['biodegradable-cardboard', 'plant-based-fillers', 'compostable-tape'],
        recyclable: true,
        biodegradable: true,
        compostable: true,
        discount: 10 // 10% discount on order
      },
      {
        optionId: 'zero-waste',
        name: 'Zero Waste Packaging',
        description: 'Fully compostable and reusable packaging',
        isEcoFriendly: true,
        cost: 5.00,
        co2Impact: 0.05,
        materials: ['reusable-container', 'compostable-fillers'],
        recyclable: true,
        biodegradable: true,
        compostable: true,
        reusable: true,
        discount: 15, // 15% discount on order
        loyaltyPoints: 100
      }
    ];

    res.status(200).json({
      packagingOptions,
      totalOptions: packagingOptions.length,
      recommendedOption: 'eco-premium'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching packaging options', error: error.message });
  }
};

// Select Packaging for Order
export const selectPackaging = async (req, res) => {
  try {
    const { orderId, packagingOptionId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get packaging details
    const packagingOptions = await getPackagingOptionsList();
    const selectedPackaging = packagingOptions.find(opt => opt.optionId === packagingOptionId);

    if (!selectedPackaging) {
      return res.status(404).json({ message: 'Packaging option not found' });
    }

    order.packaging = {
      option: selectedPackaging,
      selectedAt: new Date()
    };

    // Apply discount if eco-friendly
    if (selectedPackaging.isEcoFriendly && selectedPackaging.discount) {
      const discountAmount = (order.totalAmount * selectedPackaging.discount) / 100;
      order.discounts = order.discounts || [];
      order.discounts.push({
        type: 'eco-packaging',
        amount: discountAmount,
        description: `${selectedPackaging.discount}% discount for eco-friendly packaging`
      });
    }

    await order.save();

    res.status(200).json({
      message: 'Packaging option selected successfully',
      order: {
        id: order._id,
        packaging: order.packaging,
        discountsApplied: order.discounts
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error selecting packaging', error: error.message });
  }
};

// Green Shipping Options

// Get Green Shipping Options
export const getGreenShippingOptions = async (req, res) => {
  try {
    const { orderId, destination } = req.query;

    const greenShippingOptions = [
      {
        optionId: 'carbon-neutral-standard',
        name: 'Carbon Neutral Standard',
        description: '5-7 business days with carbon offset',
        cost: 5.99,
        estimatedDays: '5-7',
        carbonOffset: true,
        co2Emissions: 2.5,
        co2Offset: 2.5,
        netCO2: 0,
        carrier: 'Green Express',
        vehicleType: 'electric-van'
      },
      {
        optionId: 'eco-express',
        name: 'Eco Express',
        description: '2-3 business days with partial carbon offset',
        cost: 12.99,
        estimatedDays: '2-3',
        carbonOffset: true,
        co2Emissions: 3.5,
        co2Offset: 2.0,
        netCO2: 1.5,
        carrier: 'Eco Logistics',
        vehicleType: 'hybrid-vehicle'
      },
      {
        optionId: 'bike-delivery',
        name: 'Local Bike Delivery',
        description: 'Same-day delivery by electric bike (local only)',
        cost: 8.99,
        estimatedDays: 'same-day',
        carbonOffset: false,
        co2Emissions: 0.1,
        co2Offset: 0,
        netCO2: 0.1,
        carrier: 'Green Wheels',
        vehicleType: 'electric-bike',
        localOnly: true,
        maxDistance: '10 miles'
      },
      {
        optionId: 'consolidated-shipping',
        name: 'Consolidated Green Shipping',
        description: '7-10 business days, lowest emissions',
        cost: 3.99,
        estimatedDays: '7-10',
        carbonOffset: true,
        co2Emissions: 1.0,
        co2Offset: 1.0,
        netCO2: 0,
        carrier: 'Eco Freight',
        vehicleType: 'consolidated-route',
        savings: 'Best for environment'
      }
    ];

    res.status(200).json({
      greenShippingOptions,
      totalOptions: greenShippingOptions.length,
      recommendedOption: 'carbon-neutral-standard'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching green shipping options', error: error.message });
  }
};

// Carbon Offset Program

// Purchase Carbon Offset
export const purchaseCarbonOffset = async (req, res) => {
  try {
    const { orderId, offsetAmount, offsetType } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Calculate offset cost (typically $15-25 per ton CO2)
    const costPerKg = 0.02; // $0.02 per kg CO2
    const offsetCost = offsetAmount * costPerKg;

    const carbonOffset = {
      offsetId: `OFFSET-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      orderId,
      offsetAmount, // kg CO2
      offsetType, // reforestation, renewable-energy, ocean-cleanup
      cost: offsetCost,
      provider: 'Green Earth Initiative',
      certificateNumber: `CERT-${crypto.randomBytes(6).toString('hex')}`,
      projectDetails: {
        name: getOffsetProjectName(offsetType),
        location: getOffsetProjectLocation(offsetType),
        description: getOffsetProjectDescription(offsetType)
      },
      purchasedAt: new Date(),
      certificateUrl: `https://certificates.nexusmart.com/carbon-offset/${crypto.randomBytes(8).toString('hex')}`
    };

    order.carbonOffset = carbonOffset;
    await order.save();

    res.status(201).json({
      message: 'Carbon offset purchased successfully',
      carbonOffset,
      certificate: carbonOffset.certificateUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Error purchasing carbon offset', error: error.message });
  }
};

// Get Sustainability Dashboard
export const getSustainabilityDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = '30' } = req.query; // days

    const startDate = new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000);

    // Get user's orders in timeframe
    const orders = await Order.find({
      user: userId,
      createdAt: { $gte: startDate }
    }).populate('items.product');

    let totalCO2Saved = 0;
    let totalCO2Offset = 0;
    let ecoFriendlyPurchases = 0;
    let greenShipmentsUsed = 0;

    for (const order of orders) {
      if (order.carbonOffset) {
        totalCO2Offset += order.carbonOffset.offsetAmount;
      }

      if (order.packaging?.option?.isEcoFriendly) {
        ecoFriendlyPurchases++;
        totalCO2Saved += order.packaging.option.co2Impact;
      }

      if (order.shipping?.carbonOffset) {
        greenShipmentsUsed++;
      }
    }

    const dashboard = {
      userId,
      timeframe: `${timeframe} days`,
      metrics: {
        totalOrders: orders.length,
        totalCO2Saved: Math.round(totalCO2Saved * 100) / 100,
        totalCO2Offset: Math.round(totalCO2Offset * 100) / 100,
        ecoFriendlyPurchases,
        greenShipmentsUsed,
        sustainabilityScore: calculateSustainabilityScore(orders)
      },
      achievements: generateSustainabilityAchievements(orders),
      recommendations: [
        'Choose eco-friendly packaging for 15% discount',
        'Use consolidated shipping to reduce emissions',
        'Purchase carbon offsets to neutralize your footprint'
      ],
      equivalentImpact: generateEquivalents(totalCO2Saved + totalCO2Offset)
    };

    res.status(200).json(dashboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sustainability dashboard', error: error.message });
  }
};

// Helper Functions

function calculateManufacturingCO2(product) {
  // Base calculation on product category and weight
  const baseCO2 = 5.0; // kg CO2e
  const categoryMultiplier = {
    electronics: 2.0,
    clothing: 1.2,
    furniture: 1.8,
    accessories: 0.8
  };

  return baseCO2 * (categoryMultiplier[product.category] || 1.0);
}

function calculateTransportationCO2(product) {
  // Average transportation emissions
  return 3.5; // kg CO2e
}

function calculatePackagingCO2(product) {
  // Packaging emissions
  return 0.5; // kg CO2e
}

function calculateDistributionCO2(product) {
  // Last-mile delivery emissions
  return 1.0; // kg CO2e
}

async function calculateProductCO2(product) {
  if (product.sustainability?.carbonFootprint?.totalCO2) {
    return product.sustainability.carbonFootprint.totalCO2;
  }
  return 10.0; // Default value
}

function calculateShippingCO2(order) {
  const distance = order.shipping?.distance || 500; // km
  const co2PerKm = 0.02; // kg CO2 per km
  return distance * co2PerKm;
}

function generateOffsetOptions(co2Amount) {
  return [
    {
      type: 'reforestation',
      trees: Math.ceil(co2Amount / 20),
      cost: Math.round(co2Amount * 0.02 * 100) / 100,
      description: 'Plant trees to absorb CO2'
    },
    {
      type: 'renewable-energy',
      kwhOffset: Math.ceil(co2Amount * 1.5),
      cost: Math.round(co2Amount * 0.025 * 100) / 100,
      description: 'Support renewable energy projects'
    },
    {
      type: 'ocean-cleanup',
      plasticRemoved: Math.ceil(co2Amount * 0.5),
      cost: Math.round(co2Amount * 0.03 * 100) / 100,
      description: 'Fund ocean cleanup initiatives'
    }
  ];
}

function generateEquivalents(co2Amount) {
  return {
    treesPlanted: Math.ceil(co2Amount / 20),
    milesDriven: Math.ceil(co2Amount / 0.404),
    smartphoneCharges: Math.ceil(co2Amount / 0.008),
    daysOfElectricity: Math.ceil(co2Amount / 12)
  };
}

function getOffsetProjectName(type) {
  const projects = {
    reforestation: 'Amazon Rainforest Restoration',
    'renewable-energy': 'Solar Farm Development - India',
    'ocean-cleanup': 'Pacific Ocean Plastic Removal'
  };
  return projects[type] || 'Green Earth Project';
}

function getOffsetProjectLocation(type) {
  const locations = {
    reforestation: 'Brazil',
    'renewable-energy': 'India',
    'ocean-cleanup': 'Pacific Ocean'
  };
  return locations[type] || 'Global';
}

function getOffsetProjectDescription(type) {
  const descriptions = {
    reforestation: 'Planting native trees to restore the Amazon rainforest ecosystem',
    'renewable-energy': 'Building solar farms to provide clean energy to rural communities',
    'ocean-cleanup': 'Removing plastic waste from the Pacific Ocean'
  };
  return descriptions[type] || 'Supporting global sustainability initiatives';
}

async function getPackagingOptionsList() {
  return [
    { optionId: 'standard', isEcoFriendly: false, discount: 0, co2Impact: 0.5 },
    { optionId: 'eco-basic', isEcoFriendly: true, discount: 5, co2Impact: 0.2 },
    { optionId: 'eco-premium', isEcoFriendly: true, discount: 10, co2Impact: 0.1 },
    { optionId: 'zero-waste', isEcoFriendly: true, discount: 15, co2Impact: 0.05 }
  ];
}

function calculateSustainabilityScore(orders) {
  // Score out of 100
  let score = 50; // Base score

  orders.forEach(order => {
    if (order.packaging?.option?.isEcoFriendly) score += 5;
    if (order.carbonOffset) score += 10;
    if (order.shipping?.carbonOffset) score += 5;
  });

  return Math.min(100, score);
}

function generateSustainabilityAchievements(orders) {
  const achievements = [];

  const ecoCount = orders.filter(o => o.packaging?.option?.isEcoFriendly).length;

  if (ecoCount >= 1) achievements.push({ name: 'Eco Beginner', icon: '🌱' });
  if (ecoCount >= 5) achievements.push({ name: 'Eco Warrior', icon: '🌍' });
  if (ecoCount >= 10) achievements.push({ name: 'Sustainability Champion', icon: '🏆' });

  return achievements;
}

export {
  calculateProductCarbonFootprint,
  calculateOrderCarbonFootprint,
  assignEcoBadge,
  getEcoFriendlyProducts,
  getPackagingOptions,
  selectPackaging,
  getGreenShippingOptions,
  purchaseCarbonOffset,
  getSustainabilityDashboard
};
