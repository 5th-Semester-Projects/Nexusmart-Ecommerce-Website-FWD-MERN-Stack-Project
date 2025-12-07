import CrowdsourcedDelivery from '../models/CrowdsourcedDelivery.js';
import LockerNetwork from '../models/LockerNetwork.js';
import GreenDelivery from '../models/GreenDelivery.js';
import ReturnsAggregation from '../models/ReturnsAggregation.js';
import RouteOptimization from '../models/RouteOptimization.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Crowdsourced Delivery Controllers

export const requestCrowdsourcedDelivery = catchAsyncErrors(async (req, res, next) => {
  const { orderId, pickupLocation, dropoffLocation, packageDetails } = req.body;

  const delivery = await CrowdsourcedDelivery.create({
    order: orderId,
    deliveryType: 'crowdsourced',
    pickupLocation,
    dropoffLocation,
    package: packageDetails,
    pricing: {
      baseFare: 5,
      distanceFee: calculateDistanceFee(pickupLocation, dropoffLocation),
      timeFee: 0,
      surcharge: 0,
      total: 0
    },
    status: 'searching_driver'
  });

  // Simulate driver matching
  setTimeout(async () => {
    delivery.status = 'driver_assigned';
    delivery.driver = null; // Would be actual driver ID
    delivery.driverDetails = {
      name: 'John Driver',
      phone: '+1234567890',
      vehicle: 'Honda Civic',
      rating: 4.8,
      completedDeliveries: 250
    };
    await delivery.save();
  }, 5000);

  res.status(201).json({
    success: true,
    data: delivery
  });
});

export const trackCrowdsourcedDelivery = catchAsyncErrors(async (req, res, next) => {
  const delivery = await CrowdsourcedDelivery.findOne({ order: req.params.orderId });

  if (!delivery) {
    return next(new ErrorHandler('Delivery not found', 404));
  }

  res.status(200).json({
    success: true,
    data: delivery
  });
});

// Locker Network Controllers

export const findNearbyLockers = catchAsyncErrors(async (req, res, next) => {
  const { lat, lng, radius = 5000 } = req.query;

  const lockers = await LockerNetwork.find({
    'locker.location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(radius)
      }
    },
    'locker.status': 'active'
  }).limit(10);

  res.status(200).json({
    success: true,
    count: lockers.length,
    data: lockers
  });
});

export const scheduleLockerDelivery = catchAsyncErrors(async (req, res, next) => {
  const { orderId, lockerId, compartmentSize } = req.body;

  const locker = await LockerNetwork.findOne({ 'locker.id': lockerId });

  if (!locker) {
    return next(new ErrorHandler('Locker not found', 404));
  }

  // Find available compartment
  const availableCompartment = locker.locker.compartments.find(
    c => c.size === compartmentSize && c.available
  );

  if (!availableCompartment) {
    return next(new ErrorHandler('No compartments available', 400));
  }

  const accessCode = generateAccessCode();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  locker.deliveries.push({
    order: orderId,
    user: req.user.id,
    compartmentNumber: availableCompartment.number,
    accessCode,
    expiresAt,
    status: 'pending'
  });

  availableCompartment.available = false;
  await locker.save();

  res.status(200).json({
    success: true,
    data: {
      lockerId,
      compartmentNumber: availableCompartment.number,
      accessCode,
      expiresAt,
      location: locker.locker.location
    }
  });
});

// Green Delivery Controllers

export const calculateCarbonFootprint = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;

  const carbonFootprint = {
    packaging: {
      material: 'recycled_cardboard',
      weight: 0.5,
      co2Emissions: 0.3,
      recyclable: true,
      recycledContent: 80
    },
    transportation: {
      distance: 25,
      mode: 'electric_vehicle',
      co2Emissions: 0.5,
      fuelUsed: 0
    },
    warehouse: {
      co2Emissions: 0.2,
      energyUsed: 5,
      renewableEnergy: true
    },
    total: {
      co2Emissions: 1.0,
      co2Offset: 0,
      netEmissions: 1.0
    }
  };

  const offsetOptions = [
    {
      provider: 'CarbonOffset Plus',
      project: {
        name: 'Amazon Rainforest Preservation',
        type: 'reforestation',
        location: 'Brazil',
        description: 'Plant trees to offset carbon emissions',
        certification: 'Gold Standard'
      },
      cost: 1.5,
      co2Offset: 1.0
    },
    {
      provider: 'Green Future',
      project: {
        name: 'Wind Energy Project',
        type: 'renewable_energy',
        location: 'Texas, USA',
        description: 'Support renewable wind energy',
        certification: 'VCS'
      },
      cost: 1.2,
      co2Offset: 1.0
    }
  ];

  const greenDelivery = await GreenDelivery.create({
    order: orderId,
    user: req.user.id,
    carbonFootprint,
    offsetOptions,
    ecoScore: {
      overall: 85,
      packaging: 90,
      shipping: 88,
      production: 78,
      grade: 'A'
    },
    greenOptions: {
      consolidatedShipping: true,
      minimalPackaging: true,
      carbonNeutral: false
    }
  });

  res.status(200).json({
    success: true,
    data: greenDelivery
  });
});

export const purchaseCarbonOffset = catchAsyncErrors(async (req, res, next) => {
  const { orderId, offsetOptionIndex } = req.body;

  const greenDelivery = await GreenDelivery.findOne({ order: orderId });

  if (!greenDelivery) {
    return next(new ErrorHandler('Green delivery not found', 404));
  }

  const selectedOffset = greenDelivery.offsetOptions[offsetOptionIndex];

  greenDelivery.offsetPurchased = {
    purchased: true,
    provider: selectedOffset.provider,
    project: selectedOffset.project.name,
    amount: selectedOffset.cost,
    co2Offset: selectedOffset.co2Offset,
    certificate: {
      number: generateCertificateNumber(),
      issuedAt: Date.now()
    }
  };

  greenDelivery.carbonFootprint.total.co2Offset = selectedOffset.co2Offset;
  greenDelivery.carbonFootprint.total.netEmissions =
    greenDelivery.carbonFootprint.total.co2Emissions - selectedOffset.co2Offset;

  await greenDelivery.save();

  res.status(200).json({
    success: true,
    data: greenDelivery
  });
});

// Returns Aggregation Controllers

export const scheduleReturnPickup = catchAsyncErrors(async (req, res, next) => {
  const { returns, pickupDate, timeSlot, address } = req.body;

  const returnsAgg = await ReturnsAggregation.create({
    user: req.user.id,
    returns: returns.map(r => ({
      order: r.orderId,
      product: r.productId,
      quantity: r.quantity,
      reason: r.reason,
      requestedAt: Date.now(),
      status: 'approved'
    })),
    pickup: {
      scheduled: true,
      date: pickupDate,
      timeSlot,
      address
    },
    consolidation: {
      batchId: generateBatchId(),
      numberOfItems: returns.length,
      qrCode: generateQRCode()
    },
    status: 'scheduled'
  });

  res.status(201).json({
    success: true,
    data: returnsAgg
  });
});

export const getUserReturns = catchAsyncErrors(async (req, res, next) => {
  const returns = await ReturnsAggregation.find({ user: req.user.id })
    .populate('returns.order')
    .populate('returns.product')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: returns.length,
    data: returns
  });
});

// Helper functions
function calculateDistanceFee(pickup, dropoff) {
  // Simplified distance calculation
  return 10; // $10 base distance fee
}

function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateCertificateNumber() {
  return 'CO2-' + Date.now() + '-' + Math.random().toString(36).substring(7).toUpperCase();
}

function generateBatchId() {
  return 'BATCH-' + Date.now();
}

function generateQRCode() {
  return 'QR-' + Math.random().toString(36).substring(2, 15);
}
