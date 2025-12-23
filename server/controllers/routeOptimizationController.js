import { RouteOptimization } from '../models/RouteOptimization.js';
import { Order } from '../models/Order.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Create optimized delivery route
export const createRoute = catchAsyncErrors(async (req, res, next) => {
  const { deliveryDate, warehouseId, orderIds } = req.body;

  // Fetch orders with addresses
  const orders = await Order.find({
    _id: { $in: orderIds },
    orderStatus: { $in: ['processing', 'confirmed'] }
  });

  if (orders.length === 0) {
    return next(new ErrorHandler('No valid orders found', 404));
  }

  // Prepare order data for optimization
  const orderData = orders.map(order => ({
    order: order._id,
    deliveryAddress: {
      latitude: order.shippingAddress.coordinates?.lat || 0,
      longitude: order.shippingAddress.coordinates?.lng || 0,
      fullAddress: `${order.shippingAddress.address1}, ${order.shippingAddress.city}`
    },
    priority: order.deliveryPriority || 'normal',
    timeWindow: {
      start: order.deliveryTimeWindow?.start,
      end: order.deliveryTimeWindow?.end
    },
    status: 'pending'
  }));

  // Run route optimization algorithm
  const optimizedRoute = await optimizeRoute(orderData, {
    algorithm: 'genetic',
    considerTraffic: true,
    considerTimeWindows: true
  });

  // Create route in database
  const route = await RouteOptimization.create({
    deliveryDate,
    warehouse: warehouseId,
    orders: optimizedRoute.orders,
    route: optimizedRoute.route,
    optimization: optimizedRoute.optimization,
    constraints: req.body.constraints || {
      maxDistance: 200,
      maxDuration: 480, // 8 hours
      maxStops: 30,
      trafficConsideration: true
    }
  });

  res.status(201).json({
    success: true,
    route,
    savings: {
      distanceSaved: optimizedRoute.savings.distance,
      timeSaved: optimizedRoute.savings.time,
      costSaved: optimizedRoute.savings.cost
    }
  });
});

// Get route by ID
export const getRoute = catchAsyncErrors(async (req, res, next) => {
  const route = await RouteOptimization.findById(req.params.id)
    .populate('orders.order')
    .populate('warehouse')
    .populate('driver');

  if (!route) {
    return next(new ErrorHandler('Route not found', 404));
  }

  res.status(200).json({
    success: true,
    route
  });
});

// Get routes for driver
export const getDriverRoutes = catchAsyncErrors(async (req, res, next) => {
  const routes = await RouteOptimization.find({
    driver: req.user.id,
    status: { $in: ['planned', 'active'] }
  }).populate('orders.order');

  res.status(200).json({
    success: true,
    count: routes.length,
    routes
  });
});

// Assign driver to route
export const assignDriver = catchAsyncErrors(async (req, res, next) => {
  const { routeId, driverId, vehicleInfo } = req.body;

  const route = await RouteOptimization.findById(routeId);

  if (!route) {
    return next(new ErrorHandler('Route not found', 404));
  }

  route.driver = driverId;
  route.vehicle = vehicleInfo;
  route.status = 'planned';

  await route.save();

  // Notify driver
  await notifyDriver(driverId, route);

  res.status(200).json({
    success: true,
    route
  });
});

// Start route delivery
export const startRoute = catchAsyncErrors(async (req, res, next) => {
  const route = await RouteOptimization.findById(req.params.id);

  if (!route) {
    return next(new ErrorHandler('Route not found', 404));
  }

  if (route.driver.toString() !== req.user.id) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  route.status = 'active';
  await route.save();

  res.status(200).json({
    success: true,
    message: 'Route started',
    route
  });
});

// Update delivery status
export const updateDeliveryStatus = catchAsyncErrors(async (req, res, next) => {
  const { routeId, orderId, status, location } = req.body;

  const route = await RouteOptimization.findById(routeId);

  if (!route) {
    return next(new ErrorHandler('Route not found', 404));
  }

  // Find order in route
  const orderIndex = route.orders.findIndex(
    o => o.order.toString() === orderId
  );

  if (orderIndex === -1) {
    return next(new ErrorHandler('Order not in route', 404));
  }

  route.orders[orderIndex].status = status;

  if (status === 'delivered') {
    route.orders[orderIndex].actualDeliveryTime = Date.now();

    // Update main order status
    await Order.findByIdAndUpdate(orderId, {
      orderStatus: 'delivered',
      deliveredAt: Date.now()
    });
  }

  // Update waypoint completion
  const waypointIndex = route.route.waypoints.findIndex(
    w => w.order.toString() === orderId
  );

  if (waypointIndex !== -1 && status === 'delivered') {
    route.route.waypoints[waypointIndex].completed = true;
    route.route.waypoints[waypointIndex].departureTime = Date.now();
  }

  await route.save();

  res.status(200).json({
    success: true,
    message: 'Delivery status updated',
    route
  });
});

// Real-time route update (traffic, delays)
export const updateRoute = catchAsyncErrors(async (req, res, next) => {
  const { routeId, updateType, newETA, adjustedRoute } = req.body;

  const route = await RouteOptimization.findById(routeId);

  if (!route) {
    return next(new ErrorHandler('Route not found', 404));
  }

  route.realTimeUpdates.push({
    timestamp: Date.now(),
    type: updateType,
    description: req.body.description,
    newETA,
    adjustedRoute
  });

  // If route needs major adjustment, re-optimize remaining stops
  if (updateType === 'reroute') {
    const remainingOrders = route.orders.filter(o => o.status === 'pending');
    const reoptimized = await optimizeRoute(remainingOrders, {
      algorithm: 'nearest_neighbor' // Faster algorithm for real-time
    });

    route.route = reoptimized.route;
  }

  await route.save();

  // Notify affected customers
  await notifyCustomersOfDelay(route, newETA);

  res.status(200).json({
    success: true,
    route
  });
});

// Complete route
export const completeRoute = catchAsyncErrors(async (req, res, next) => {
  const route = await RouteOptimization.findById(req.params.id);

  if (!route) {
    return next(new ErrorHandler('Route not found', 404));
  }

  if (route.driver.toString() !== req.user.id) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  // Calculate performance metrics
  const deliveredOrders = route.orders.filter(o => o.status === 'delivered');
  const onTimeDeliveries = deliveredOrders.filter(o => {
    if (!o.timeWindow.end) return true;
    return new Date(o.actualDeliveryTime) <= new Date(o.timeWindow.end);
  });

  route.performance = {
    onTimeDeliveries: onTimeDeliveries.length,
    totalDeliveries: deliveredOrders.length,
    averageTimePerStop: route.route.totalDuration / deliveredOrders.length,
    fuelEfficiency: 10, // km per liter - calculate based on vehicle
    costPerDelivery: calculateCostPerDelivery(route)
  };

  route.status = 'completed';
  await route.save();

  res.status(200).json({
    success: true,
    message: 'Route completed successfully',
    performance: route.performance
  });
});

// Get route analytics
export const getRouteAnalytics = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const routes = await RouteOptimization.find({
    deliveryDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    status: 'completed'
  });

  const analytics = {
    totalRoutes: routes.length,
    totalDeliveries: routes.reduce((sum, r) => sum + r.performance.totalDeliveries, 0),
    totalDistance: routes.reduce((sum, r) => sum + r.route.totalDistance, 0),
    averageOnTimeRate: routes.reduce((sum, r) =>
      sum + (r.performance.onTimeDeliveries / r.performance.totalDeliveries), 0
    ) / routes.length * 100,
    totalCost: routes.reduce((sum, r) =>
      sum + (r.performance.costPerDelivery * r.performance.totalDeliveries), 0
    )
  };

  res.status(200).json({
    success: true,
    analytics
  });
});

// Helper Functions
async function optimizeRoute(orders, options) {
  // Mock optimization - implement actual algorithm (Genetic, Ant Colony, etc.)
  // Or integrate with Google Maps Optimization API, MapBox, etc.

  const waypoints = orders.map((order, index) => ({
    latitude: order.deliveryAddress.latitude,
    longitude: order.deliveryAddress.longitude,
    address: order.deliveryAddress.fullAddress,
    order: order.order,
    sequenceNumber: index + 1,
    completed: false
  }));

  // Sort by nearest neighbor (simplified)
  const sortedWaypoints = nearestNeighborSort(waypoints);

  // Calculate total distance and duration
  const totalDistance = calculateTotalDistance(sortedWaypoints);
  const totalDuration = totalDistance * 2; // Assume 2 min per km

  return {
    orders: orders.map((o, i) => ({
      ...o,
      sequenceNumber: i + 1,
      estimatedDeliveryTime: new Date(Date.now() + (i + 1) * 30 * 60000) // 30 min per stop
    })),
    route: {
      waypoints: sortedWaypoints,
      totalDistance,
      totalDuration,
      optimizationScore: 0.85
    },
    optimization: {
      algorithm: options.algorithm,
      iterations: 100,
      computeTime: 150
    },
    savings: {
      distance: 15.5, // km saved
      time: 45, // minutes saved
      cost: 12.5 // currency saved
    }
  };
}

function nearestNeighborSort(waypoints) {
  // Simplified nearest neighbor algorithm
  if (waypoints.length === 0) return [];

  const sorted = [waypoints[0]];
  const remaining = waypoints.slice(1);

  while (remaining.length > 0) {
    const last = sorted[sorted.length - 1];
    let nearestIndex = 0;
    let minDistance = Infinity;

    remaining.forEach((wp, index) => {
      const dist = calculateDistance(last.latitude, last.longitude, wp.latitude, wp.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = index;
      }
    });

    sorted.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }

  return sorted;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTotalDistance(waypoints) {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += calculateDistance(
      waypoints[i].latitude,
      waypoints[i].longitude,
      waypoints[i + 1].latitude,
      waypoints[i + 1].longitude
    );
  }
  return total;
}

function calculateCostPerDelivery(route) {
  const fuelCostPerKm = 0.15; // Example: $0.15 per km
  const laborCost = 20; // $20 per hour
  const hours = route.route.totalDuration / 60;
  const totalCost = (route.route.totalDistance * fuelCostPerKm) + (hours * laborCost);
  return totalCost / route.performance.totalDeliveries;
}

async function notifyDriver(driverId, route) {
  console.log(`Notifying driver ${driverId} about route ${route._id}`);
}

async function notifyCustomersOfDelay(route, newETA) {
  console.log(`Notifying customers about delivery delay`);
}
