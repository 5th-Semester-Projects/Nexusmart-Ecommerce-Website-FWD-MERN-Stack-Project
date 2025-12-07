import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import { DeliveryZone, DeliveryPartner, DeliveryTracking } from '../models/Delivery.js';

/**
 * Hyperlocal Delivery Controller
 */

// Check delivery availability for location
export const checkDeliveryAvailability = catchAsyncErrors(async (req, res, next) => {
  const { latitude, longitude, pincode } = req.query;

  let available = false;
  let zone = null;

  if (latitude && longitude) {
    zone = await DeliveryZone.findOne({
      isActive: true,
      center: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: 50000 // 50km max
        }
      }
    });

    if (zone && zone.type === 'radius') {
      // Check if within radius
      available = true;
    }
  } else if (pincode) {
    zone = await DeliveryZone.findOne({
      isActive: true,
      pincodes: pincode
    });
    available = !!zone;
  }

  if (!available || !zone) {
    return res.status(200).json({
      success: true,
      available: false,
      message: 'Delivery not available in your area'
    });
  }

  res.status(200).json({
    success: true,
    available: true,
    zone: {
      name: zone.name,
      deliveryFee: zone.deliveryFee,
      freeDeliveryThreshold: zone.freeDeliveryThreshold,
      expressDelivery: zone.expressDelivery,
      sameDayDelivery: zone.sameDayDelivery
    }
  });
});

// Get available time slots
export const getDeliverySlots = catchAsyncErrors(async (req, res, next) => {
  const { zoneId, date } = req.query;

  const zone = await DeliveryZone.findById(zoneId);

  if (!zone) {
    return next(new ErrorHandler('Delivery zone not found', 404));
  }

  const targetDate = date ? new Date(date) : new Date();
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][targetDate.getDay()];

  const daySchedule = zone.availableSlots.find(s => s.day === dayName);

  if (!daySchedule) {
    return res.status(200).json({
      success: true,
      slots: [],
      message: 'No delivery on this day'
    });
  }

  // Filter available slots
  const availableSlots = daySchedule.slots
    .filter(slot => slot.isAvailable && slot.currentOrders < slot.maxOrders)
    .map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: slot.maxOrders - slot.currentOrders
    }));

  res.status(200).json({
    success: true,
    date: targetDate.toISOString().split('T')[0],
    slots: availableSlots,
    expressAvailable: zone.expressDelivery.available,
    sameDayAvailable: zone.sameDayDelivery.available
  });
});

// Create delivery tracking for order
export const createDeliveryTracking = catchAsyncErrors(async (req, res, next) => {
  const {
    orderId,
    pickupLocation,
    deliveryLocation,
    scheduledSlot,
    isExpress
  } = req.body;

  // Check for existing tracking
  const existing = await DeliveryTracking.findOne({ order: orderId });
  if (existing) {
    return next(new ErrorHandler('Delivery tracking already exists for this order', 400));
  }

  const tracking = await DeliveryTracking.create({
    order: orderId,
    pickupLocation,
    deliveryLocation,
    scheduledSlot,
    isExpress,
    status: 'pending'
  });

  // Generate OTP
  tracking.generateOTP();
  await tracking.save();

  res.status(201).json({
    success: true,
    tracking: {
      id: tracking._id,
      status: tracking.status,
      otp: tracking.deliveryOTP, // Send to customer
      scheduledSlot: tracking.scheduledSlot
    }
  });
});

// Get tracking details for order
export const getTrackingDetails = catchAsyncErrors(async (req, res, next) => {
  const tracking = await DeliveryTracking.findOne({ order: req.params.orderId })
    .populate('partner', 'name phone photo vehicleType rating');

  if (!tracking) {
    return next(new ErrorHandler('Tracking not found', 404));
  }

  res.status(200).json({
    success: true,
    tracking: {
      status: tracking.status,
      partner: tracking.partner,
      estimatedArrival: tracking.estimatedArrival,
      currentLocation: tracking.currentLocation,
      scheduledSlot: tracking.scheduledSlot,
      proofOfDelivery: tracking.proofOfDelivery
    }
  });
});

// Update delivery partner location (for partner app)
export const updatePartnerLocation = catchAsyncErrors(async (req, res, next) => {
  const { latitude, longitude } = req.body;

  const partner = await DeliveryPartner.findOne({ user: req.user._id });

  if (!partner) {
    return next(new ErrorHandler('Delivery partner not found', 404));
  }

  partner.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
  partner.lastLocationUpdate = new Date();

  await partner.save();

  // Update active deliveries ETA
  for (const deliveryId of partner.activeDeliveries) {
    const delivery = await DeliveryTracking.findById(deliveryId);
    if (delivery && ['on_the_way', 'nearby'].includes(delivery.status)) {
      delivery.currentLocation = partner.currentLocation;
      delivery.locationHistory.push({
        coordinates: [longitude, latitude],
        timestamp: new Date()
      });
      delivery.calculateETA([longitude, latitude]);
      await delivery.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Location updated'
  });
});

// Update delivery status (for partner app)
export const updateDeliveryStatus = catchAsyncErrors(async (req, res, next) => {
  const { status, proofOfDelivery, failureReason } = req.body;

  const tracking = await DeliveryTracking.findById(req.params.id);

  if (!tracking) {
    return next(new ErrorHandler('Delivery not found', 404));
  }

  const validTransitions = {
    'pending': ['assigned'],
    'assigned': ['picking_up'],
    'picking_up': ['picked_up'],
    'picked_up': ['on_the_way'],
    'on_the_way': ['nearby', 'failed'],
    'nearby': ['arrived'],
    'arrived': ['delivered', 'failed']
  };

  if (!validTransitions[tracking.status]?.includes(status)) {
    return next(new ErrorHandler('Invalid status transition', 400));
  }

  tracking.status = status;

  switch (status) {
    case 'picked_up':
      tracking.pickedUpAt = new Date();
      break;
    case 'delivered':
      tracking.deliveredAt = new Date();
      tracking.proofOfDelivery = proofOfDelivery;
      break;
    case 'failed':
      tracking.failureReason = failureReason;
      tracking.deliveryAttempts += 1;
      break;
  }

  await tracking.save();

  // Emit real-time update via Socket.IO
  // io.to(`order_${tracking.order}`).emit('delivery_update', { status, tracking });

  res.status(200).json({
    success: true,
    tracking
  });
});

// Verify delivery OTP
export const verifyDeliveryOTP = catchAsyncErrors(async (req, res, next) => {
  const { otp } = req.body;

  const tracking = await DeliveryTracking.findById(req.params.id);

  if (!tracking) {
    return next(new ErrorHandler('Delivery not found', 404));
  }

  if (tracking.deliveryOTP !== otp) {
    return next(new ErrorHandler('Invalid OTP', 400));
  }

  tracking.otpVerified = true;
  await tracking.save();

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully'
  });
});

// Send chat message
export const sendChatMessage = catchAsyncErrors(async (req, res, next) => {
  const { message } = req.body;

  const tracking = await DeliveryTracking.findById(req.params.id);

  if (!tracking) {
    return next(new ErrorHandler('Delivery not found', 404));
  }

  // Determine sender type
  const partner = await DeliveryPartner.findOne({ user: req.user._id });
  const sender = partner ? 'partner' : 'customer';

  tracking.chatMessages.push({
    sender,
    message,
    timestamp: new Date()
  });

  await tracking.save();

  // Emit to socket for real-time
  // io.to(`delivery_${tracking._id}`).emit('new_message', { sender, message });

  res.status(200).json({
    success: true,
    message: 'Message sent'
  });
});

// Rate delivery
export const rateDelivery = catchAsyncErrors(async (req, res, next) => {
  const { rating, feedback } = req.body;

  const tracking = await DeliveryTracking.findById(req.params.id);

  if (!tracking) {
    return next(new ErrorHandler('Delivery not found', 404));
  }

  if (tracking.status !== 'delivered') {
    return next(new ErrorHandler('Can only rate completed deliveries', 400));
  }

  tracking.rating = rating;
  tracking.feedback = feedback;
  await tracking.save();

  // Update partner rating
  if (tracking.partner) {
    const partner = await DeliveryPartner.findById(tracking.partner);
    const newCount = partner.rating.count + 1;
    const newAverage = ((partner.rating.average * partner.rating.count) + rating) / newCount;

    partner.rating.count = newCount;
    partner.rating.average = Math.round(newAverage * 10) / 10;
    await partner.save();
  }

  res.status(200).json({
    success: true,
    message: 'Thank you for your feedback'
  });
});

// Admin: Get all delivery zones
export const getAllZones = catchAsyncErrors(async (req, res, next) => {
  const zones = await DeliveryZone.find().sort({ name: 1 });

  res.status(200).json({
    success: true,
    zones
  });
});

// Admin: Create delivery zone
export const createDeliveryZone = catchAsyncErrors(async (req, res, next) => {
  const zone = await DeliveryZone.create(req.body);

  res.status(201).json({
    success: true,
    zone
  });
});

// Admin: Get all delivery partners
export const getAllPartners = catchAsyncErrors(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const total = await DeliveryPartner.countDocuments(query);
  const partners = await DeliveryPartner.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    partners,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

// Admin: Assign delivery partner
export const assignPartner = catchAsyncErrors(async (req, res, next) => {
  const { partnerId } = req.body;

  const tracking = await DeliveryTracking.findById(req.params.id);
  const partner = await DeliveryPartner.findById(partnerId);

  if (!tracking) {
    return next(new ErrorHandler('Delivery not found', 404));
  }

  if (!partner) {
    return next(new ErrorHandler('Partner not found', 404));
  }

  if (partner.activeDeliveries.length >= partner.maxActiveDeliveries) {
    return next(new ErrorHandler('Partner has maximum active deliveries', 400));
  }

  tracking.partner = partnerId;
  tracking.status = 'assigned';
  tracking.assignedAt = new Date();
  await tracking.save();

  partner.activeDeliveries.push(tracking._id);
  partner.status = 'busy';
  await partner.save();

  res.status(200).json({
    success: true,
    message: 'Partner assigned successfully',
    tracking
  });
});
