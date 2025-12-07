import MarketingAutomation from '../models/MarketingAutomation.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Get all campaigns
// @route   GET /api/v1/marketing/campaigns
// @access  Private/Admin
export const getAllCampaigns = catchAsyncErrors(async (req, res, next) => {
  const { businessId, status, campaignType } = req.query;

  const query = {};
  if (businessId) query.businessId = businessId;
  if (status) query.status = status;
  if (campaignType) query.campaignType = campaignType;

  const campaigns = await MarketingAutomation.find(query)
    .sort({ createdAt: -1 })
    .populate('audience.segment')
    .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    count: campaigns.length,
    campaigns
  });
});

// @desc    Get single campaign
// @route   GET /api/v1/marketing/campaigns/:id
// @access  Private/Admin
export const getCampaign = catchAsyncErrors(async (req, res, next) => {
  const campaign = await MarketingAutomation.findById(req.params.id)
    .populate('audience.segment')
    .populate('createdBy lastModifiedBy', 'name email');

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  res.status(200).json({
    success: true,
    campaign
  });
});

// @desc    Create campaign
// @route   POST /api/v1/marketing/campaigns
// @access  Private/Admin
export const createCampaign = catchAsyncErrors(async (req, res, next) => {
  req.body.createdBy = req.user._id;

  const campaign = await MarketingAutomation.create(req.body);

  res.status(201).json({
    success: true,
    campaign
  });
});

// @desc    Update campaign
// @route   PUT /api/v1/marketing/campaigns/:id
// @access  Private/Admin
export const updateCampaign = catchAsyncErrors(async (req, res, next) => {
  req.body.lastModifiedBy = req.user._id;

  const campaign = await MarketingAutomation.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  res.status(200).json({
    success: true,
    campaign
  });
});

// @desc    Delete campaign
// @route   DELETE /api/v1/marketing/campaigns/:id
// @access  Private/Admin
export const deleteCampaign = catchAsyncErrors(async (req, res, next) => {
  const campaign = await MarketingAutomation.findById(req.params.id);

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  await campaign.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Campaign deleted successfully'
  });
});

// @desc    Add send record
// @route   POST /api/v1/marketing/campaigns/:id/send
// @access  Private/Admin
export const addSendRecord = catchAsyncErrors(async (req, res, next) => {
  const campaign = await MarketingAutomation.findById(req.params.id);

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  const { recipientData, channel, variant } = req.body;

  campaign.addSendRecord(recipientData, channel, variant);
  await campaign.save();

  res.status(200).json({
    success: true,
    message: 'Send record added successfully'
  });
});

// @desc    Record interaction
// @route   POST /api/v1/marketing/campaigns/:id/interaction
// @access  Public
export const recordInteraction = catchAsyncErrors(async (req, res, next) => {
  const campaign = await MarketingAutomation.findById(req.params.id);

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  const { sendId, interactionType, data } = req.body;

  campaign.recordInteraction(sendId, interactionType, data);
  await campaign.save();

  res.status(200).json({
    success: true,
    message: 'Interaction recorded successfully'
  });
});

// @desc    Get campaign metrics
// @route   GET /api/v1/marketing/campaigns/:id/metrics
// @access  Private/Admin
export const getCampaignMetrics = catchAsyncErrors(async (req, res, next) => {
  const campaign = await MarketingAutomation.findById(req.params.id);

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  campaign.calculateRates();
  await campaign.save();

  res.status(200).json({
    success: true,
    metrics: campaign.metrics
  });
});

// @desc    Select A/B test winner
// @route   POST /api/v1/marketing/campaigns/:id/ab-test/select-winner
// @access  Private/Admin
export const selectABTestWinner = catchAsyncErrors(async (req, res, next) => {
  const campaign = await MarketingAutomation.findById(req.params.id);

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  const winner = campaign.selectABTestWinner();
  await campaign.save();

  res.status(200).json({
    success: true,
    winner
  });
});

// @desc    Get active campaigns
// @route   GET /api/v1/marketing/campaigns/active/:businessId
// @access  Private/Admin
export const getActiveCampaigns = catchAsyncErrors(async (req, res, next) => {
  const campaigns = await MarketingAutomation.getActiveCampaigns(req.params.businessId);

  res.status(200).json({
    success: true,
    count: campaigns.length,
    campaigns
  });
});

// @desc    Get due campaigns
// @route   GET /api/v1/marketing/campaigns/due
// @access  Private/Admin
export const getDueCampaigns = catchAsyncErrors(async (req, res, next) => {
  const campaigns = await MarketingAutomation.getDueCampaigns();

  res.status(200).json({
    success: true,
    count: campaigns.length,
    campaigns
  });
});

// @desc    Get campaign performance by type
// @route   GET /api/v1/marketing/campaigns/performance/:businessId/:campaignType
// @access  Private/Admin
export const getCampaignPerformance = catchAsyncErrors(async (req, res, next) => {
  const performance = await MarketingAutomation.getCampaignPerformance(
    req.params.businessId,
    req.params.campaignType
  );

  res.status(200).json({
    success: true,
    performance
  });
});

// @desc    Activate campaign
// @route   PUT /api/v1/marketing/campaigns/:id/activate
// @access  Private/Admin
export const activateCampaign = catchAsyncErrors(async (req, res, next) => {
  const campaign = await MarketingAutomation.findByIdAndUpdate(
    req.params.id,
    { status: 'active', 'schedule.startDate': Date.now() },
    { new: true }
  );

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  res.status(200).json({
    success: true,
    campaign
  });
});

// @desc    Pause campaign
// @route   PUT /api/v1/marketing/campaigns/:id/pause
// @access  Private/Admin
export const pauseCampaign = catchAsyncErrors(async (req, res, next) => {
  const campaign = await MarketingAutomation.findByIdAndUpdate(
    req.params.id,
    { status: 'paused' },
    { new: true }
  );

  if (!campaign) {
    return next(new ErrorHandler('Campaign not found', 404));
  }

  res.status(200).json({
    success: true,
    campaign
  });
});
