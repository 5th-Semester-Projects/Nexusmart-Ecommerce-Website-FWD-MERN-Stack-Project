import { LiveStream, GroupBuy, VideoReview } from '../models/SocialCommerce.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import cloudinary from '../utils/cloudinary.js';

/**
 * Social Commerce Controller
 * Handles live shopping, group buying, video reviews, and social sharing
 */

// ==================== LIVE SHOPPING ====================

export const createLiveStream = async (req, res) => {
  try {
    const { title, description, scheduledAt, products, thumbnail } = req.body;
    const hostId = req.user._id;

    const stream = await LiveStream.create({
      title,
      description,
      host: hostId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      products: products?.map(p => ({ product: p.productId, discount: p.discount })) || [],
      thumbnail
    });

    await stream.populate('host', 'name avatar');
    await stream.populate('products.product', 'name price images');

    res.status(201).json({
      success: true,
      stream
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create live stream',
      error: error.message
    });
  }
};

export const startLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const hostId = req.user._id;

    const stream = await LiveStream.findOne({ _id: streamId, host: hostId });

    if (!stream) {
      return res.status(404).json({
        success: false,
        message: 'Stream not found or unauthorized'
      });
    }

    stream.status = 'live';
    stream.startedAt = new Date();
    await stream.save();

    // Emit socket event for live stream start
    const io = req.app.get('io');
    if (io) {
      io.emit('stream:started', {
        streamId: stream._id,
        title: stream.title
      });
    }

    res.status(200).json({
      success: true,
      stream,
      message: 'Stream started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start stream',
      error: error.message
    });
  }
};

export const endLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const hostId = req.user._id;

    const stream = await LiveStream.findOne({ _id: streamId, host: hostId });

    if (!stream) {
      return res.status(404).json({
        success: false,
        message: 'Stream not found or unauthorized'
      });
    }

    stream.status = 'ended';
    stream.endedAt = new Date();
    await stream.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('stream:ended', { streamId: stream._id });
    }

    res.status(200).json({
      success: true,
      stream,
      summary: {
        duration: (stream.endedAt - stream.startedAt) / 1000 / 60, // minutes
        peakViewers: stream.viewers.peak,
        totalViewers: stream.viewers.total,
        engagement: stream.engagement,
        sales: stream.sales
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to end stream',
      error: error.message
    });
  }
};

export const getLiveStreams = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const streams = await LiveStream.find(query)
      .populate('host', 'name avatar')
      .populate('products.product', 'name price images')
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await LiveStream.countDocuments(query);

    res.status(200).json({
      success: true,
      streams,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streams',
      error: error.message
    });
  }
};

export const joinLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user?._id;

    const stream = await LiveStream.findById(streamId)
      .populate('host', 'name avatar')
      .populate('products.product', 'name price images stock');

    if (!stream || stream.status !== 'live') {
      return res.status(404).json({
        success: false,
        message: 'Stream not found or not live'
      });
    }

    // Update viewer count
    stream.viewers.current++;
    stream.viewers.total++;
    if (stream.viewers.current > stream.viewers.peak) {
      stream.viewers.peak = stream.viewers.current;
    }
    await stream.save();

    res.status(200).json({
      success: true,
      stream,
      recentChat: stream.chat.slice(-50)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to join stream',
      error: error.message
    });
  }
};

export const sendStreamMessage = async (req, res) => {
  try {
    const { streamId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const stream = await LiveStream.findById(streamId);

    if (!stream || stream.status !== 'live') {
      return res.status(404).json({
        success: false,
        message: 'Stream not found or not live'
      });
    }

    const chatMessage = {
      user: userId,
      message,
      timestamp: new Date(),
      isHost: stream.host.toString() === userId.toString()
    };

    stream.chat.push(chatMessage);
    stream.engagement.comments++;
    await stream.save();

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      const user = await User.findById(userId).select('name avatar');
      io.to(`stream:${streamId}`).emit('chat:message', {
        ...chatMessage,
        user: { _id: userId, name: user.name, avatar: user.avatar }
      });
    }

    res.status(200).json({
      success: true,
      message: chatMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

export const createFlashSale = async (req, res) => {
  try {
    const { streamId } = req.params;
    const { productId, discount, quantity, duration } = req.body;
    const hostId = req.user._id;

    const stream = await LiveStream.findOne({ _id: streamId, host: hostId });

    if (!stream || stream.status !== 'live') {
      return res.status(404).json({
        success: false,
        message: 'Stream not found or not live'
      });
    }

    const productIndex = stream.products.findIndex(
      p => p.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in stream'
      });
    }

    stream.products[productIndex].flashSale = {
      active: true,
      discount,
      quantity,
      claimed: 0,
      expiresAt: new Date(Date.now() + duration * 1000)
    };
    stream.products[productIndex].featuredAt = new Date();

    await stream.save();

    // Emit flash sale event
    const io = req.app.get('io');
    if (io) {
      const product = await Product.findById(productId);
      io.to(`stream:${streamId}`).emit('flash:sale', {
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]
        },
        discount,
        quantity,
        expiresAt: stream.products[productIndex].flashSale.expiresAt
      });
    }

    res.status(200).json({
      success: true,
      flashSale: stream.products[productIndex].flashSale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create flash sale',
      error: error.message
    });
  }
};

// ==================== GROUP BUYING ====================

export const createGroupBuy = async (req, res) => {
  try {
    const {
      productId,
      title,
      description,
      targetQuantity,
      discountTiers,
      endDate
    } = req.body;
    const organizerId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const groupBuy = await GroupBuy.create({
      product: productId,
      organizer: organizerId,
      title: title || `Group Buy: ${product.name}`,
      description,
      targetQuantity,
      originalPrice: product.price,
      discountTiers: discountTiers || [
        { minQuantity: 5, discountPercent: 10, price: product.price * 0.9 },
        { minQuantity: 10, discountPercent: 15, price: product.price * 0.85 },
        { minQuantity: 20, discountPercent: 20, price: product.price * 0.8 },
        { minQuantity: 50, discountPercent: 30, price: product.price * 0.7 }
      ],
      endDate: new Date(endDate),
      participants: [{
        user: organizerId,
        quantity: 1
      }],
      currentQuantity: 1
    });

    await groupBuy.populate('product', 'name price images');
    await groupBuy.populate('organizer', 'name avatar');

    res.status(201).json({
      success: true,
      groupBuy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create group buy',
      error: error.message
    });
  }
};

export const joinGroupBuy = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const { quantity = 1 } = req.body;
    const userId = req.user._id;

    const groupBuy = await GroupBuy.findOne({
      inviteCode,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (!groupBuy) {
      return res.status(404).json({
        success: false,
        message: 'Group buy not found or expired'
      });
    }

    // Check if already participant
    const existingParticipant = groupBuy.participants.find(
      p => p.user.toString() === userId.toString()
    );

    if (existingParticipant) {
      existingParticipant.quantity += quantity;
    } else {
      groupBuy.participants.push({
        user: userId,
        quantity
      });
    }

    groupBuy.currentQuantity += quantity;

    // Check if target reached
    if (groupBuy.currentQuantity >= groupBuy.targetQuantity) {
      groupBuy.status = 'successful';
    }

    await groupBuy.save();
    await groupBuy.populate('product', 'name price images');

    res.status(200).json({
      success: true,
      groupBuy,
      message: existingParticipant
        ? 'Quantity updated successfully'
        : 'Joined group buy successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to join group buy',
      error: error.message
    });
  }
};

export const getGroupBuys = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const groupBuys = await GroupBuy.find(query)
      .populate('product', 'name price images')
      .populate('organizer', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await GroupBuy.countDocuments(query);

    res.status(200).json({
      success: true,
      groupBuys,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group buys',
      error: error.message
    });
  }
};

export const getGroupBuyDetails = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const groupBuy = await GroupBuy.findOne({ inviteCode })
      .populate('product', 'name price images description')
      .populate('organizer', 'name avatar')
      .populate('participants.user', 'name avatar');

    if (!groupBuy) {
      return res.status(404).json({
        success: false,
        message: 'Group buy not found'
      });
    }

    res.status(200).json({
      success: true,
      groupBuy,
      progress: {
        current: groupBuy.currentQuantity,
        target: groupBuy.targetQuantity,
        percentage: Math.min(100, (groupBuy.currentQuantity / groupBuy.targetQuantity) * 100).toFixed(1)
      },
      timeRemaining: Math.max(0, new Date(groupBuy.endDate) - new Date())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group buy',
      error: error.message
    });
  }
};

// ==================== VIDEO REVIEWS ====================

export const uploadVideoReview = async (req, res) => {
  try {
    const { productId, title, rating } = req.body;
    const userId = req.user._id;

    // Check if user purchased the product
    const hasPurchased = await Order.exists({
      user: userId,
      'items.product': productId,
      paymentStatus: 'paid'
    });

    // Upload video to cloudinary
    let videoUrl, thumbnailUrl;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        folder: 'nexusmart/video-reviews',
        eager: [{ format: 'jpg', transformation: [{ width: 300, height: 200, crop: 'fill' }] }]
      });

      videoUrl = result.secure_url;
      thumbnailUrl = result.eager?.[0]?.secure_url;
    } else if (req.body.videoUrl) {
      videoUrl = req.body.videoUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Video is required'
      });
    }

    const videoReview = await VideoReview.create({
      product: productId,
      user: userId,
      videoUrl,
      thumbnailUrl,
      title,
      rating,
      verified: hasPurchased
    });

    await videoReview.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      videoReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload video review',
      error: error.message
    });
  }
};

export const getVideoReviews = async (req, res) => {
  try {
    const { productId, status = 'approved', page = 1, limit = 10 } = req.query;

    const query = { status };
    if (productId) query.product = productId;

    const reviews = await VideoReview.find(query)
      .populate('user', 'name avatar')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await VideoReview.countDocuments(query);

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video reviews',
      error: error.message
    });
  }
};

export const moderateVideoReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    const review = await VideoReview.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to moderate review',
      error: error.message
    });
  }
};

// ==================== SOCIAL SHARING ====================

export const generateShareLink = async (req, res) => {
  try {
    const { type, id, platform } = req.body; // type: 'product', 'groupbuy', 'stream'

    let shareData = {};

    switch (type) {
      case 'product':
        const product = await Product.findById(id);
        if (!product) throw new Error('Product not found');
        shareData = {
          title: product.name,
          description: product.description?.substring(0, 160),
          url: `${process.env.FRONTEND_URL}/product/${id}`,
          image: product.images?.[0]
        };
        break;

      case 'groupbuy':
        const groupBuy = await GroupBuy.findById(id).populate('product');
        if (!groupBuy) throw new Error('Group buy not found');
        shareData = {
          title: `Join my group buy: ${groupBuy.product.name}`,
          description: `Save up to ${Math.max(...groupBuy.discountTiers.map(t => t.discountPercent))}% by joining!`,
          url: groupBuy.shareLink,
          image: groupBuy.product.images?.[0]
        };
        break;

      case 'stream':
        const stream = await LiveStream.findById(id);
        if (!stream) throw new Error('Stream not found');
        shareData = {
          title: stream.title,
          description: 'Watch this live shopping event!',
          url: `${process.env.FRONTEND_URL}/live/${id}`,
          image: stream.thumbnail
        };
        break;
    }

    // Generate platform-specific share URLs
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareData.title}\n${shareData.url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`,
      instagram: shareData.url, // Instagram doesn't support direct share URLs
      copy: shareData.url
    };

    res.status(200).json({
      success: true,
      shareData,
      shareUrls,
      selectedUrl: shareUrls[platform] || shareUrls.copy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate share link',
      error: error.message
    });
  }
};

export default {
  createLiveStream,
  startLiveStream,
  endLiveStream,
  getLiveStreams,
  joinLiveStream,
  sendStreamMessage,
  createFlashSale,
  createGroupBuy,
  joinGroupBuy,
  getGroupBuys,
  getGroupBuyDetails,
  uploadVideoReview,
  getVideoReviews,
  moderateVideoReview,
  generateShareLink
};
