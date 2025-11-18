import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { catchAsyncErrors } from './catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

/**
 * Middleware to authenticate user via JWT token
 * Checks for token in cookies or Authorization header
 */
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  let token;

  // Check for token in cookies
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  // Check for token in Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorHandler('Please login to access this resource', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler('User not found', 404));
    }

    if (!req.user.isActive) {
      return next(new ErrorHandler('Account is deactivated', 403));
    }

    if (req.user.isBlocked) {
      return next(
        new ErrorHandler(
          `Account is blocked. Reason: ${req.user.blockReason || 'Not specified'}`,
          403
        )
      );
    }

    next();
  } catch (error) {
    return next(new ErrorHandler('Invalid or expired token', 401));
  }
});

/**
 * Middleware to authorize user roles
 * @param  {...String} roles - Allowed roles
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Middleware to verify email before certain actions
 */
export const requireEmailVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return next(
      new ErrorHandler('Please verify your email to access this resource', 403)
    );
  }
  next();
};

/**
 * Middleware to check if 2FA is enabled and verified
 */
export const requireTwoFactor = catchAsyncErrors(async (req, res, next) => {
  if (req.user.twoFactorEnabled && !req.session.twoFactorVerified) {
    return next(
      new ErrorHandler('Two-factor authentication required', 403)
    );
  }
  next();
});

/**
 * Middleware to refresh access token using refresh token
 */
export const refreshAccessToken = catchAsyncErrors(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return next(new ErrorHandler('Refresh token not found', 401));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return next(new ErrorHandler('Invalid refresh token', 401));
    }

    // Check if refresh token is expired
    if (user.refreshTokenExpire < Date.now()) {
      return next(new ErrorHandler('Refresh token expired', 401));
    }

    // Generate new access token
    const accessToken = user.generateAccessToken();

    // Send new access token
    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    return next(new ErrorHandler('Invalid refresh token', 401));
  }
});

/**
 * Middleware to check if user owns the resource
 */
export const checkResourceOwnership = (resourceModel) => {
  return catchAsyncErrors(async (req, res, next) => {
    const resourceId = req.params.id;
    const resource = await resourceModel.findById(resourceId);

    if (!resource) {
      return next(new ErrorHandler('Resource not found', 404));
    }

    // Admin can access all resources
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    if (resource.user?.toString() !== req.user._id.toString()) {
      return next(
        new ErrorHandler('You are not authorized to access this resource', 403)
      );
    }

    next();
  });
};
