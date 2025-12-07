import CommunityQA from '../models/CommunityQA.js';
import InfluencerMarketplace from '../models/InfluencerMarketplace.js';
import GroupBuying from '../models/GroupBuying.js';
import WishlistSharing from '../models/WishlistSharing.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Community Q&A Controllers

export const askQuestion = catchAsyncErrors(async (req, res, next) => {
  const { productId, text, category, tags, isAnonymous } = req.body;

  const qa = await CommunityQA.create({
    product: productId,
    question: {
      user: req.user.id,
      text,
      isAnonymous: isAnonymous || false
    },
    category: category || 'product_info',
    tags: tags || [],
    status: 'open'
  });

  await qa.populate('product', 'name');
  await qa.populate('question.user', 'name');

  res.status(201).json({
    success: true,
    data: qa
  });
});

export const answerQuestion = catchAsyncErrors(async (req, res, next) => {
  const { questionId } = req.params;
  const { text } = req.body;

  const qa = await CommunityQA.findById(questionId);
  if (!qa) {
    return next(new ErrorHandler('Question not found', 404));
  }

  qa.answers.push({
    user: req.user.id,
    text,
    answeredAt: Date.now()
  });

  qa.status = 'answered';
  await qa.save();
  await qa.populate('answers.user', 'name');

  res.status(200).json({
    success: true,
    data: qa
  });
});

export const voteAnswer = catchAsyncErrors(async (req, res, next) => {
  const { questionId, answerId, voteType } = req.body;

  const qa = await CommunityQA.findById(questionId);
  if (!qa) {
    return next(new ErrorHandler('Question not found', 404));
  }

  const answer = qa.answers.id(answerId);
  if (!answer) {
    return next(new ErrorHandler('Answer not found', 404));
  }

  // Remove previous vote if exists
  answer.votes.up = answer.votes.up.filter(id => id.toString() !== req.user.id);
  answer.votes.down = answer.votes.down.filter(id => id.toString() !== req.user.id);

  // Add new vote
  if (voteType === 'up') {
    answer.votes.up.push(req.user.id);
  } else {
    answer.votes.down.push(req.user.id);
  }

  answer.reputation = answer.votes.up.length - answer.votes.down.length;
  await qa.save();

  res.status(200).json({
    success: true,
    data: qa
  });
});

export const getProductQuestions = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const questions = await CommunityQA.find({ product: productId })
    .populate('question.user', 'name')
    .populate('answers.user', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions
  });
});

// Influencer Marketplace Controllers

export const createInfluencerProfile = catchAsyncErrors(async (req, res, next) => {
  const { bio, categories, socialMedia, pricing } = req.body;

  let profile = await InfluencerMarketplace.findOne({ influencer: req.user.id });

  if (profile) {
    return next(new ErrorHandler('Influencer profile already exists', 400));
  }

  // Calculate total reach
  const totalReach = Object.values(socialMedia).reduce((sum, platform) => {
    return sum + (platform.followers || platform.subscribers || 0);
  }, 0);

  profile = await InfluencerMarketplace.create({
    influencer: req.user.id,
    profile: {
      bio,
      categories,
      socialMedia,
      totalReach,
      engagementRate: 5.5 // Default, calculate based on actual data
    },
    pricing
  });

  res.status(201).json({
    success: true,
    data: profile
  });
});

export const searchInfluencers = catchAsyncErrors(async (req, res, next) => {
  const { category, minReach, maxBudget, platform } = req.query;

  const query = { 'availability.accepting': true };

  if (category) {
    query['profile.categories'] = category;
  }

  if (minReach) {
    query['profile.totalReach'] = { $gte: parseInt(minReach) };
  }

  const influencers = await InfluencerMarketplace.find(query)
    .populate('influencer', 'name email')
    .sort('-profile.totalReach')
    .limit(20);

  res.status(200).json({
    success: true,
    count: influencers.length,
    data: influencers
  });
});

export const createCampaignProposal = catchAsyncErrors(async (req, res, next) => {
  const { influencerId } = req.params;
  const { title, description, products, deliverables, compensation, startDate, endDate } = req.body;

  const profile = await InfluencerMarketplace.findById(influencerId);
  if (!profile) {
    return next(new ErrorHandler('Influencer profile not found', 404));
  }

  profile.campaigns.push({
    brand: req.user.id,
    title,
    description,
    products,
    deliverables,
    compensation,
    startDate,
    endDate,
    status: 'proposed'
  });

  await profile.save();

  res.status(201).json({
    success: true,
    data: profile
  });
});

// Group Buying Controllers

export const createGroupBuy = catchAsyncErrors(async (req, res, next) => {
  const { productId, title, description, pricingTiers, targetQuantity, endDate, rules } = req.body;

  const currentPrice = pricingTiers[0].pricePerUnit;

  const groupBuy = await GroupBuying.create({
    product: productId,
    organizer: req.user.id,
    title,
    description,
    pricingTiers,
    currentPrice,
    targetQuantity,
    timeline: {
      endDate
    },
    rules: rules || {}
  });

  await groupBuy.populate('product');

  res.status(201).json({
    success: true,
    data: groupBuy
  });
});

export const joinGroupBuy = catchAsyncErrors(async (req, res, next) => {
  const { groupBuyId } = req.params;
  const { quantity } = req.body;

  const groupBuy = await GroupBuying.findById(groupBuyId);
  if (!groupBuy) {
    return next(new ErrorHandler('Group buy not found', 404));
  }

  if (groupBuy.status !== 'open') {
    return next(new ErrorHandler('Group buy is not open', 400));
  }

  // Check if user already joined
  const existingParticipant = groupBuy.participants.find(
    p => p.user.toString() === req.user.id
  );

  if (existingParticipant) {
    return next(new ErrorHandler('Already joined this group buy', 400));
  }

  // Calculate price based on tier
  const newQuantity = groupBuy.currentQuantity + quantity;
  const tier = groupBuy.pricingTiers
    .reverse()
    .find(t => newQuantity >= t.minQuantity);

  const pricePerUnit = tier ? tier.pricePerUnit : groupBuy.pricingTiers[0].pricePerUnit;

  groupBuy.participants.push({
    user: req.user.id,
    quantity,
    amount: pricePerUnit * quantity
  });

  groupBuy.currentQuantity = newQuantity;
  groupBuy.currentPrice = pricePerUnit;

  // Check if target reached
  if (newQuantity >= groupBuy.targetQuantity) {
    groupBuy.status = 'reached_target';
  }

  await groupBuy.save();

  res.status(200).json({
    success: true,
    data: groupBuy
  });
});

export const getActiveGroupBuys = catchAsyncErrors(async (req, res, next) => {
  const groupBuys = await GroupBuying.find({
    status: { $in: ['open', 'reached_target'] }
  })
    .populate('product')
    .populate('organizer', 'name')
    .sort('-createdAt')
    .limit(20);

  res.status(200).json({
    success: true,
    count: groupBuys.length,
    data: groupBuys
  });
});

// Wishlist Sharing Controllers

export const createSharedWishlist = catchAsyncErrors(async (req, res, next) => {
  const { title, description, occasion, eventDate, items, isPublic } = req.body;

  const shareUrl = generateShareUrl();

  const wishlist = await WishlistSharing.create({
    owner: req.user.id,
    title,
    description,
    occasion,
    eventDate,
    items: items.map(item => ({
      product: item.productId,
      priority: item.priority || 'medium',
      quantity: item.quantity || 1,
      notes: item.notes
    })),
    sharing: {
      isPublic: isPublic || false,
      shareUrl
    }
  });

  await wishlist.populate('items.product');

  res.status(201).json({
    success: true,
    data: wishlist
  });
});

export const voteWishlistItem = catchAsyncErrors(async (req, res, next) => {
  const { wishlistId, itemId } = req.params;

  const wishlist = await WishlistSharing.findById(wishlistId);
  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  const item = wishlist.items.id(itemId);
  if (!item) {
    return next(new ErrorHandler('Item not found', 404));
  }

  // Check if already voted
  const hasVoted = item.votes.some(v => v.user.toString() === req.user.id);
  if (!hasVoted) {
    item.votes.push({ user: req.user.id, votedAt: Date.now() });
    await wishlist.save();
  }

  res.status(200).json({
    success: true,
    data: wishlist
  });
});

export const purchaseWishlistItem = catchAsyncErrors(async (req, res, next) => {
  const { wishlistId, itemId } = req.params;

  const wishlist = await WishlistSharing.findById(wishlistId);
  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  const item = wishlist.items.id(itemId);
  if (!item) {
    return next(new ErrorHandler('Item not found', 404));
  }

  if (item.purchased) {
    return next(new ErrorHandler('Item already purchased', 400));
  }

  item.purchased = true;
  item.purchasedBy = req.user.id;
  item.purchasedAt = Date.now();

  await wishlist.save();

  res.status(200).json({
    success: true,
    data: wishlist
  });
});

export const getSharedWishlist = catchAsyncErrors(async (req, res, next) => {
  const { shareUrl } = req.params;

  const wishlist = await WishlistSharing.findOne({ 'sharing.shareUrl': shareUrl })
    .populate('items.product')
    .populate('owner', 'name');

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  wishlist.statistics.views += 1;
  await wishlist.save();

  res.status(200).json({
    success: true,
    data: wishlist
  });
});

// Helper function
function generateShareUrl() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
