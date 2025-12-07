import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { ShoppableVideo, VideoComment, VideoPlaylist } from '../models/ShoppableVideo.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Public Routes
 */

// Get all published videos
router.get('/videos', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, tag } = req.query;

    const query = { status: 'published', visibility: 'public' };
    if (category) query.categories = category;
    if (tag) query.tags = tag;

    const total = await ShoppableVideo.countDocuments(query);
    const videos = await ShoppableVideo.find(query)
      .populate('products.product', 'name price images')
      .populate('createdBy', 'name avatar')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      videos,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
});

// Get single video
router.get('/videos/:id', async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findById(req.params.id)
      .populate('products.product', 'name price images rating stock')
      .populate('createdBy', 'name avatar');

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.status(200).json({ success: true, video });
  } catch (error) {
    next(error);
  }
});

// Get video comments
router.get('/videos/:id/comments', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const comments = await VideoComment.find({
      video: req.params.id,
      parentComment: null,
      isHidden: false
    })
      .populate('user', 'name avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, comments });
  } catch (error) {
    next(error);
  }
});

/**
 * User Routes
 */

// Like video
router.post('/videos/:id/like', isAuthenticatedUser, async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const userIndex = video.likedBy.indexOf(req.user._id);

    if (userIndex === -1) {
      video.likedBy.push(req.user._id);
      video.likes += 1;
    } else {
      video.likedBy.splice(userIndex, 1);
      video.likes -= 1;
    }

    await video.save();

    res.status(200).json({
      success: true,
      liked: userIndex === -1,
      likes: video.likes
    });
  } catch (error) {
    next(error);
  }
});

// Add comment
router.post('/videos/:id/comments', isAuthenticatedUser, async (req, res, next) => {
  try {
    const { text, videoTimestamp, parentComment } = req.body;

    const comment = await VideoComment.create({
      video: req.params.id,
      user: req.user._id,
      text,
      videoTimestamp,
      parentComment
    });

    // Update video comment count
    await ShoppableVideo.findByIdAndUpdate(req.params.id, { $inc: { comments: 1 } });

    await comment.populate('user', 'name avatar');

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
});

// Track product click
router.post('/videos/:id/product-click', async (req, res, next) => {
  try {
    const { productId } = req.body;

    await ShoppableVideo.findByIdAndUpdate(req.params.id, {
      $inc: { productClicks: 1 }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Track add to cart
router.post('/videos/:id/add-to-cart', isAuthenticatedUser, async (req, res, next) => {
  try {
    await ShoppableVideo.findByIdAndUpdate(req.params.id, {
      $inc: { addToCartClicks: 1 }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Track watch time
router.post('/videos/:id/watch-time', async (req, res, next) => {
  try {
    const { seconds } = req.body;

    const video = await ShoppableVideo.findByIdAndUpdate(
      req.params.id,
      { $inc: { watchTime: seconds } },
      { new: true }
    );

    video.updateAvgWatchTime();
    await video.save();

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * Creator/Seller Routes
 */

// Create video
router.post('/videos',
  isAuthenticatedUser,
  upload.single('video'),
  async (req, res, next) => {
    try {
      const { title, description, type, products, hotspots, categories, tags, visibility } = req.body;

      // In production, upload video to cloud storage and get URL
      const videoUrl = req.file ? 'uploaded_video_url' : req.body.videoUrl;

      const video = await ShoppableVideo.create({
        createdBy: req.user._id,
        title,
        description,
        videoUrl,
        type,
        products: JSON.parse(products || '[]'),
        hotspots: JSON.parse(hotspots || '[]'),
        categories: JSON.parse(categories || '[]'),
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        visibility: visibility || 'private',
        status: 'draft'
      });

      res.status(201).json({ success: true, video });
    } catch (error) {
      next(error);
    }
  }
);

// Update video
router.put('/videos/:id', isAuthenticatedUser, async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      video[key] = updates[key];
    });
    video.updatedAt = new Date();

    await video.save();

    res.status(200).json({ success: true, video });
  } catch (error) {
    next(error);
  }
});

// Publish video
router.post('/videos/:id/publish', isAuthenticatedUser, async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    video.status = 'published';
    video.publishedAt = new Date();
    await video.save();

    res.status(200).json({ success: true, video });
  } catch (error) {
    next(error);
  }
});

// Get my videos
router.get('/my-videos', isAuthenticatedUser, async (req, res, next) => {
  try {
    const videos = await ShoppableVideo.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, videos });
  } catch (error) {
    next(error);
  }
});

// Get video analytics
router.get('/videos/:id/analytics', isAuthenticatedUser, async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    video.updateConversionRate();

    res.status(200).json({
      success: true,
      analytics: {
        views: video.views,
        uniqueViews: video.uniqueViews,
        likes: video.likes,
        shares: video.shares,
        comments: video.comments,
        avgWatchTime: video.avgWatchTime,
        productClicks: video.productClicks,
        addToCartClicks: video.addToCartClicks,
        purchases: video.purchases,
        revenue: video.revenue,
        conversionRate: video.conversionRate
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Playlist Routes
 */

// Get playlists
router.get('/playlists', async (req, res, next) => {
  try {
    const playlists = await VideoPlaylist.find({ visibility: 'public' })
      .populate('creator', 'name avatar')
      .sort({ totalViews: -1 })
      .limit(20);

    res.status(200).json({ success: true, playlists });
  } catch (error) {
    next(error);
  }
});

// Create playlist
router.post('/playlists', isAuthenticatedUser, async (req, res, next) => {
  try {
    const { title, description, visibility } = req.body;

    const playlist = await VideoPlaylist.create({
      creator: req.user._id,
      title,
      description,
      visibility
    });

    res.status(201).json({ success: true, playlist });
  } catch (error) {
    next(error);
  }
});

// Add video to playlist
router.post('/playlists/:id/videos', isAuthenticatedUser, async (req, res, next) => {
  try {
    const { videoId } = req.body;

    const playlist = await VideoPlaylist.findOne({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    const maxOrder = playlist.videos.length > 0
      ? Math.max(...playlist.videos.map(v => v.order))
      : 0;

    playlist.videos.push({
      video: videoId,
      order: maxOrder + 1
    });

    await playlist.save();

    res.status(200).json({ success: true, playlist });
  } catch (error) {
    next(error);
  }
});

export default router;
