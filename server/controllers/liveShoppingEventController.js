const LiveShoppingEvent = require('../models/LiveShoppingEvent');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create event
exports.createEvent = catchAsyncErrors(async (req, res) => {
  const event = await LiveShoppingEvent.create({
    ...req.body,
    host: {
      user: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar,
      bio: req.user.bio || '',
      isVerified: req.user.isVerified || false
    }
  });

  res.status(201).json({
    success: true,
    event
  });
});

// Get event by slug
exports.getEvent = catchAsyncErrors(async (req, res) => {
  const { slug } = req.params;

  const event = await LiveShoppingEvent.findOne({ slug })
    .populate('featuredProducts.product coHosts.user');

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  res.status(200).json({
    success: true,
    event
  });
});

// Get upcoming events
exports.getUpcomingEvents = catchAsyncErrors(async (req, res) => {
  const { limit = 10 } = req.query;

  const events = await LiveShoppingEvent.getUpcomingEvents(parseInt(limit));

  res.status(200).json({
    success: true,
    events
  });
});

// Get live events
exports.getLiveEvents = catchAsyncErrors(async (req, res) => {
  const events = await LiveShoppingEvent.getLiveEvents();

  res.status(200).json({
    success: true,
    events
  });
});

// Start stream
exports.startStream = catchAsyncErrors(async (req, res) => {
  const { slug } = req.params;

  const event = await LiveShoppingEvent.findOne({ slug });

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  event.startStream();
  await event.save();

  res.status(200).json({
    success: true,
    message: 'Stream started',
    event
  });
});

// End stream
exports.endStream = catchAsyncErrors(async (req, res) => {
  const { slug } = req.params;

  const event = await LiveShoppingEvent.findOne({ slug });

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  event.endStream();
  await event.save();

  res.status(200).json({
    success: true,
    message: 'Stream ended',
    event
  });
});

// Update viewer count
exports.updateViewerCount = catchAsyncErrors(async (req, res) => {
  const { slug } = req.params;
  const { count } = req.body;

  const event = await LiveShoppingEvent.findOne({ slug });

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  event.updateViewerCount(count);
  await event.save();

  res.status(200).json({
    success: true,
    message: 'Viewer count updated'
  });
});

module.exports = exports;
