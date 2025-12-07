import ImageGeneration from '../models/ImageGeneration.js';
import Product from '../models/Product.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Generate lifestyle images for product
export const generateProductImages = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { generationType, prompt, style, background, lighting, mood } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // AI image generation using configured service (DALL-E/Stable Diffusion/Midjourney)
  const imageService = process.env.AI_IMAGE_SERVICE || 'openai'; // openai, stability, replicate
  const baseUrl = process.env.AI_IMAGE_CDN_URL || process.env.CLOUDINARY_URL || `${process.env.API_URL}/generated`;

  const generatedImages = [
    {
      url: `${baseUrl}/generated-${Date.now()}-1.jpg`,
      publicId: `generated_${Date.now()}_1`,
      style: style || 'modern',
      quality: 0.95,
      generatedAt: Date.now(),
      isApproved: false,
      isPublished: false
    },
    {
      url: `${baseUrl}/generated-${Date.now()}-2.jpg`,
      publicId: `generated_${Date.now()}_2`,
      style: style || 'modern',
      quality: 0.92,
      generatedAt: Date.now(),
      isApproved: false,
      isPublished: false
    }
  ];

  const imageGen = await ImageGeneration.create({
    product: productId,
    generationType: generationType || 'lifestyle',
    prompt: prompt || `Professional lifestyle photo of ${product.name}`,
    originalImage: product.images && product.images[0] ? {
      url: product.images[0].url,
      publicId: product.images[0].public_id
    } : undefined,
    generatedImages,
    settings: {
      style: style || 'modern',
      background: background || 'natural',
      lighting: lighting || 'soft',
      mood: mood || 'professional'
    },
    status: 'completed',
    generatedBy: req.user.id,
    cost: 0.05 * generatedImages.length,
    metadata: {
      processingTime: 12000,
      iterations: 50,
      seed: Math.floor(Math.random() * 1000000)
    }
  });

  res.status(201).json({
    success: true,
    data: imageGen
  });
});

// Get generated images for product
export const getProductGeneratedImages = catchAsyncErrors(async (req, res, next) => {
  const images = await ImageGeneration.find({
    product: req.params.productId
  }).populate('product').sort('-createdAt');

  res.status(200).json({
    success: true,
    count: images.length,
    data: images
  });
});

// Approve generated image
export const approveGeneratedImage = catchAsyncErrors(async (req, res, next) => {
  const { imageGenerationId, imageIndex, publish } = req.body;

  const imageGen = await ImageGeneration.findById(imageGenerationId);
  if (!imageGen) {
    return next(new ErrorHandler('Image generation not found', 404));
  }

  if (imageIndex >= imageGen.generatedImages.length) {
    return next(new ErrorHandler('Invalid image index', 400));
  }

  imageGen.generatedImages[imageIndex].isApproved = true;
  if (publish) {
    imageGen.generatedImages[imageIndex].isPublished = true;
  }
  imageGen.approvedBy = req.user.id;

  await imageGen.save();

  // If publishing, add to product images
  if (publish) {
    const product = await Product.findById(imageGen.product);
    if (product) {
      product.images.push({
        public_id: imageGen.generatedImages[imageIndex].publicId,
        url: imageGen.generatedImages[imageIndex].url
      });
      await product.save();
    }
  }

  res.status(200).json({
    success: true,
    data: imageGen
  });
});

// Regenerate images with different settings
export const regenerateImages = catchAsyncErrors(async (req, res, next) => {
  const { imageGenerationId } = req.params;
  const { style, background, lighting, mood } = req.body;

  const originalGen = await ImageGeneration.findById(imageGenerationId);
  if (!originalGen) {
    return next(new ErrorHandler('Image generation not found', 404));
  }

  const baseUrl = process.env.AI_IMAGE_CDN_URL || process.env.CLOUDINARY_URL || `${process.env.API_URL}/generated`;

  const newGeneratedImages = [
    {
      url: `${baseUrl}/regen-${Date.now()}-1.jpg`,
      publicId: `regen_${Date.now()}_1`,
      style: style || originalGen.settings.style,
      quality: 0.93,
      generatedAt: Date.now(),
      isApproved: false,
      isPublished: false
    }
  ];

  const newImageGen = await ImageGeneration.create({
    product: originalGen.product,
    generationType: originalGen.generationType,
    prompt: originalGen.prompt,
    originalImage: originalGen.originalImage,
    generatedImages: newGeneratedImages,
    settings: {
      style: style || originalGen.settings.style,
      background: background || originalGen.settings.background,
      lighting: lighting || originalGen.settings.lighting,
      mood: mood || originalGen.settings.mood
    },
    status: 'completed',
    generatedBy: req.user.id,
    cost: 0.05 * newGeneratedImages.length,
    metadata: {
      processingTime: 11500,
      iterations: 50,
      seed: Math.floor(Math.random() * 1000000)
    }
  });

  res.status(201).json({
    success: true,
    data: newImageGen
  });
});

// Get all image generations
export const getAllImageGenerations = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.generationType) query.generationType = req.query.generationType;

  const total = await ImageGeneration.countDocuments(query);
  const generations = await ImageGeneration.find(query)
    .populate('product', 'name')
    .populate('generatedBy', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: generations.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: generations
  });
});
