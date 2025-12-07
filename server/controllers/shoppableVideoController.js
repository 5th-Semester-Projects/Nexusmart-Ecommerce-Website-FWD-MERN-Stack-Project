import { ShoppableVideo, VideoComment, VideoPlaylist } from '../models/ShoppableVideo.js';
import cloudinary from '../utils/cloudinary.js';

/**
 * Shoppable Video Controller
 * Handles video management, hotspots, and analytics
 */

// Get all published videos
export const getVideos = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, tag, sort = 'latest' } = req.query;

    const query = { status: 'published', visibility: 'public' };
    if (category) query.categories = category;
    if (tag) query.tags = tag;

    let sortOption = { publishedAt: -1 };
    if (sort === 'popular') sortOption = { 'analytics.views': -1 };
    if (sort === 'trending') sortOption = { 'analytics.engagement': -1 };

    const total = await ShoppableVideo.countDocuments(query);
    const videos = await ShoppableVideo.find(query)
      .populate('products.product', 'name price images')
      .populate('createdBy', 'name avatar')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      videos,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single video
export const getVideo = async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findById(req.params.id)
      .populate('products.product', 'name price images rating stock')
      .populate('createdBy', 'name avatar');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Increment views
    video.analytics.views += 1;
    await video.save();

    res.status(200).json({ success: true, video });
  } catch (error) {
    next(error);
  }
};

// Create new video
export const createVideo = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      categories,
      tags,
      products,
      hotspots,
      visibility
    } = req.body;

    // Handle video upload
    let videoData = {};
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        folder: 'shoppable-videos'
      });
      videoData = {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration
      };
    } else if (req.body.videoUrl) {
      videoData = { url: req.body.videoUrl };
    }

    const video = await ShoppableVideo.create({
      title,
      description,
      video: videoData,
      type: type || 'standard',
      categories,
      tags,
      products,
      hotspots,
      visibility: visibility || 'public',
      createdBy: req.user._id,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      video
    });
  } catch (error) {
    next(error);
  }
};

// Update video
export const updateVideo = async (req, res, next) => {
  try {
    let video = await ShoppableVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check ownership
    if (video.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this video'
      });
    }

    video = await ShoppableVideo.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    next(error);
  }
};

// Delete video
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check ownership
    if (video.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }

    // Delete from cloudinary if exists
    if (video.video?.publicId) {
      await cloudinary.uploader.destroy(video.video.publicId, { resource_type: 'video' });
    }

    await video.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Publish video
export const publishVideo = async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    video.status = 'published';
    video.publishedAt = new Date();
    await video.save();

    res.status(200).json({
      success: true,
      message: 'Video published successfully',
      video
    });
  } catch (error) {
    next(error);
  }
};

// Add hotspot to video
export const addHotspot = async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const { product, startTime, endTime, position, label } = req.body;

    video.hotspots.push({
      product,
      startTime,
      endTime,
      position,
      label,
      clicks: 0
    });

    await video.save();

    res.status(200).json({
      success: true,
      message: 'Hotspot added successfully',
      video
    });
  } catch (error) {
    next(error);
  }
};

// Remove hotspot
export const removeHotspot = async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    video.hotspots = video.hotspots.filter(
      h => h._id.toString() !== req.params.hotspotId
    );

    await video.save();

    res.status(200).json({
      success: true,
      message: 'Hotspot removed successfully',
      video
    });
  } catch (error) {
    next(error);
  }
};

// Track hotspot click
export const trackHotspotClick = async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const hotspot = video.hotspots.id(req.params.hotspotId);
    if (hotspot) {
      hotspot.clicks += 1;
      video.analytics.productClicks += 1;
      await video.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Get video comments
export const getComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const total = await VideoComment.countDocuments({ video: req.params.id });
    const comments = await VideoComment.find({ video: req.params.id })
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      comments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add comment
export const addComment = async (req, res, next) => {
  try {
    const { text, timestamp } = req.body;

    const comment = await VideoComment.create({
      video: req.params.id,
      user: req.user._id,
      text,
      timestamp
    });

    await comment.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comment
    });
  } catch (error) {
    next(error);
  }
};

// Like video
export const likeVideo = async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const userId = req.user._id.toString();
    const likeIndex = video.likes.indexOf(userId);

    if (likeIndex > -1) {
      video.likes.splice(likeIndex, 1);
    } else {
      video.likes.push(userId);
    }

    await video.save();

    res.status(200).json({
      success: true,
      liked: likeIndex === -1,
      likesCount: video.likes.length
    });
  } catch (error) {
    next(error);
  }
};

// Share video
export const shareVideo = async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    video.analytics.shares += 1;
    await video.save();

    res.status(200).json({
      success: true,
      shareUrl: `${process.env.FRONTEND_URL}/videos/${video._id}`
    });
  } catch (error) {
    next(error);
  }
};

// Get video analytics
export const getVideoAnalytics = async (req, res, next) => {
  try {
    const video = await ShoppableVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check ownership
    if (video.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics'
      });
    }

    res.status(200).json({
      success: true,
      analytics: {
        ...video.analytics,
        likesCount: video.likes.length,
        hotspotPerformance: video.hotspots.map(h => ({
          id: h._id,
          label: h.label,
          clicks: h.clicks
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create playlist
export const createPlaylist = async (req, res, next) => {
  try {
    const { name, description, videos, visibility } = req.body;

    const playlist = await VideoPlaylist.create({
      name,
      description,
      videos,
      visibility: visibility || 'public',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Playlist created',
      playlist
    });
  } catch (error) {
    next(error);
  }
};

// Get user's playlists
export const getPlaylists = async (req, res, next) => {
  try {
    const playlists = await VideoPlaylist.find({ createdBy: req.user._id })
      .populate('videos.video', 'title video.thumbnail analytics.views')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      playlists
    });
  } catch (error) {
    next(error);
  }
};

// Get feed for user (algorithm-based)
export const getVideoFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Simple algorithm: mix trending, recent, and based on user preferences
    const videos = await ShoppableVideo.aggregate([
      { $match: { status: 'published', visibility: 'public' } },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ['$analytics.views', 0.3] },
              { $multiply: ['$analytics.engagement', 0.4] },
              { $multiply: [{ $size: '$likes' }, 0.3] }
            ]
          }
        }
      },
      { $sort: { score: -1, publishedAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    await ShoppableVideo.populate(videos, [
      { path: 'products.product', select: 'name price images' },
      { path: 'createdBy', select: 'name avatar' }
    ]);

    res.status(200).json({
      success: true,
      videos,
      page: parseInt(page)
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  publishVideo,
  addHotspot,
  removeHotspot,
  trackHotspotClick,
  getComments,
  addComment,
  likeVideo,
  shareVideo,
  getVideoAnalytics,
  createPlaylist,
  getPlaylists,
  getVideoFeed
};
