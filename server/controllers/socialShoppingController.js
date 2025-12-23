import SocialShopping from '../models/SocialShopping.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';

// Create post
export const createPost = catchAsyncErrors(async (req, res) => {
  const post = await SocialShopping.create({
    ...req.body,
    user: req.user._id
  });

  await post.populate('user taggedProducts.product');

  res.status(201).json({
    success: true,
    post
  });
});

// Get post
export const getPost = catchAsyncErrors(async (req, res) => {
  const { postId } = req.params;

  const post = await SocialShopping.findById(postId)
    .populate('user taggedProducts.product comments.user');

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Increment views
  post.engagement.views += 1;
  await post.save();

  res.status(200).json({
    success: true,
    post
  });
});

// Get user feed
export const getUserFeed = catchAsyncErrors(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Get user's following list (you'd need to implement this)
  const following = req.user.following || [];

  const posts = await SocialShopping.getUserFeed(
    req.user._id,
    following,
    parseInt(limit),
    skip
  );

  res.status(200).json({
    success: true,
    posts,
    currentPage: page
  });
});

// Toggle like
export const toggleLike = catchAsyncErrors(async (req, res) => {
  const { postId } = req.params;

  const post = await SocialShopping.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  post.toggleLike(req.user._id);
  await post.save();

  res.status(200).json({
    success: true,
    liked: post.userInteractions.likedBy.includes(req.user._id)
  });
});

// Toggle save
export const toggleSave = catchAsyncErrors(async (req, res) => {
  const { postId } = req.params;

  const post = await SocialShopping.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  post.toggleSave(req.user._id);
  await post.save();

  res.status(200).json({
    success: true,
    saved: post.userInteractions.savedBy.includes(req.user._id)
  });
});

// Add comment
export const addComment = catchAsyncErrors(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  const post = await SocialShopping.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  post.addComment(req.user._id, text);
  await post.save();

  res.status(200).json({
    success: true,
    message: 'Comment added'
  });
});

// Get trending posts
export const getTrendingPosts = catchAsyncErrors(async (req, res) => {
  const { limit = 10 } = req.query;

  const posts = await SocialShopping.getTrendingPosts(parseInt(limit));

  res.status(200).json({
    success: true,
    posts
  });
});

module.exports = exports;
