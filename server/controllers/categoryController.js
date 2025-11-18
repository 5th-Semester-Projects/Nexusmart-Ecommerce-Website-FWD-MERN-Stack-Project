import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = catchAsyncErrors(async (req, res, next) => {
  const { name, description, parentCategory, tags, metaTitle, metaDescription } = req.body;

  // Check if category already exists
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });

  if (existingCategory) {
    return next(new ErrorHandler('Category already exists', 400));
  }

  const categoryData = {
    name,
    description,
    parentCategory: parentCategory || null,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    metaTitle,
    metaDescription,
  };

  // Upload image if provided
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'categories');
    categoryData.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const category = await Category.create(categoryData);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    category,
  });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const { parentOnly, includeInactive } = req.query;

  const query = {};

  // Filter for parent categories only (no parent)
  if (parentOnly === 'true') {
    query.parentCategory = null;
  }

  // Filter active categories
  if (includeInactive !== 'true') {
    query.isActive = true;
  }

  const categories = await Category.find(query)
    .populate('parentCategory', 'name slug')
    .sort({ order: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    categories,
  });
});

// @desc    Get category tree (hierarchical structure)
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find({ isActive: true })
    .populate('parentCategory', 'name slug')
    .sort({ order: 1, name: 1 });

  // Build tree structure
  const categoryMap = {};
  const tree = [];

  // First pass: create category map
  categories.forEach(category => {
    categoryMap[category._id] = {
      ...category.toObject(),
      children: [],
    };
  });

  // Second pass: build tree
  categories.forEach(category => {
    if (category.parentCategory) {
      const parent = categoryMap[category.parentCategory._id];
      if (parent) {
        parent.children.push(categoryMap[category._id]);
      }
    } else {
      tree.push(categoryMap[category._id]);
    }
  });

  res.status(200).json({
    success: true,
    tree,
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
    .populate('parentCategory', 'name slug image');

  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }

  // Get subcategories
  const subcategories = await Category.find({
    parentCategory: category._id,
    isActive: true
  }).sort({ order: 1, name: 1 });

  // Get products count
  const productsCount = await Product.countDocuments({
    category: category._id,
    isActive: true
  });

  res.status(200).json({
    success: true,
    category: {
      ...category.toObject(),
      subcategories,
      productsCount,
    },
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate('parentCategory', 'name slug image');

  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }

  // Get subcategories
  const subcategories = await Category.find({
    parentCategory: category._id,
    isActive: true
  }).sort({ order: 1, name: 1 });

  // Get products count
  const productsCount = await Product.countDocuments({
    category: category._id,
    isActive: true
  });

  res.status(200).json({
    success: true,
    category: {
      ...category.toObject(),
      subcategories,
      productsCount,
    },
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = catchAsyncErrors(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }

  const { name, description, parentCategory, tags, metaTitle, metaDescription, isActive, order } = req.body;

  const updateData = {
    name,
    description,
    parentCategory: parentCategory || null,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : category.tags,
    metaTitle,
    metaDescription,
    isActive,
    order,
  };

  // Upload new image if provided
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'categories');
    updateData.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  category = await Category.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }

  // Check if category has subcategories
  const subcategoriesCount = await Category.countDocuments({
    parentCategory: category._id,
  });

  if (subcategoriesCount > 0) {
    return next(
      new ErrorHandler(
        'Cannot delete category with subcategories. Delete subcategories first.',
        400
      )
    );
  }

  // Check if category has products
  const productsCount = await Product.countDocuments({
    category: category._id,
  });

  if (productsCount > 0) {
    return next(
      new ErrorHandler(
        `Cannot delete category with ${productsCount} products. Reassign or delete products first.`,
        400
      )
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
export const getFeaturedCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find({
    isFeatured: true,
    isActive: true,
  })
    .sort({ order: 1 })
    .limit(8);

  res.status(200).json({
    success: true,
    count: categories.length,
    categories,
  });
});

// @desc    Reorder categories
// @route   PUT /api/categories/reorder
// @access  Private/Admin
export const reorderCategories = catchAsyncErrors(async (req, res, next) => {
  const { categories } = req.body; // Array of { id, order }

  if (!Array.isArray(categories)) {
    return next(new ErrorHandler('Invalid data format', 400));
  }

  const updatePromises = categories.map(({ id, order }) =>
    Category.findByIdAndUpdate(id, { order })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    message: 'Categories reordered successfully',
  });
});
