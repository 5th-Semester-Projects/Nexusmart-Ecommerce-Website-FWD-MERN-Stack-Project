import multer from 'multer';
import path from 'path';
import ErrorHandler from '../utils/errorHandler.js';

// Configure multer storage (memory storage for direct upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter to accept only images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new ErrorHandler('Only image files are allowed (JPEG, JPG, PNG, GIF, WEBP)', 400));
  }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new ErrorHandler('Only video files are allowed', 400));
  }
};

// File filter for 3D models
const modelFilter = (req, file, cb) => {
  const allowedTypes = /glb|gltf|obj|fbx|usdz/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new ErrorHandler('Only 3D model files are allowed (GLB, GLTF, OBJ, FBX, USDZ)', 400));
  }
};

// General file filter
const anyFileFilter = (req, file, cb) => {
  cb(null, true);
};

/**
 * Multer upload middleware for single image
 * Max size: 5MB
 */
export const uploadSingleImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
}).single('image');

/**
 * Multer upload middleware for multiple images
 * Max files: 10, Max size per file: 5MB
 */
export const uploadMultipleImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10,
  },
  fileFilter: imageFilter,
}).array('images', 10);

/**
 * Multer upload middleware for avatar
 * Max size: 2MB
 */
export const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: imageFilter,
}).single('avatar');

/**
 * Multer upload middleware for product media (images + videos)
 * Max images: 8, Max videos: 2
 */
export const uploadProductMedia = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
  },
  fileFilter: anyFileFilter,
}).fields([
  { name: 'images', maxCount: 8 },
  { name: 'videos', maxCount: 2 },
  { name: 'model3D', maxCount: 1 },
]);

/**
 * Multer upload middleware for 3D models
 * Max size: 50MB
 */
export const upload3DModel = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: modelFilter,
}).single('model3D');

/**
 * Multer upload middleware for review media
 * Max images: 5, Max videos: 1
 */
export const uploadReviewMedia = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter: anyFileFilter,
}).fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 1 },
]);

/**
 * Error handling middleware for multer errors
 */
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
      });
    }
  }
  next(error);
};
