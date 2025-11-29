import User from '../models/User.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import { sendToken } from '../utils/jwtToken.js';
import { sendEmail, getWelcomeEmailTemplate, getVerificationEmailTemplate, getPasswordResetTemplate } from '../utils/sendEmail.js';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Validate required fields
  if (!firstName || !firstName.trim()) {
    return next(new ErrorHandler('Please enter your first name', 400));
  }

  if (!lastName || !lastName.trim()) {
    return next(new ErrorHandler('Please enter your last name', 400));
  }

  if (!email || !email.trim()) {
    return next(new ErrorHandler('Please enter your email', 400));
  }

  if (!password || password.length < 8) {
    return next(new ErrorHandler('Password must be at least 8 characters', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return next(new ErrorHandler('User already exists with this email', 400));
  }

  // Check if SMTP is configured (skip email verification if not)
  const isSmtpConfigured = process.env.SMTP_MAIL &&
    process.env.SMTP_PASSWORD &&
    !process.env.SMTP_MAIL.includes('your_email') &&
    !process.env.SMTP_PASSWORD.includes('your_');

  // Create user
  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone ? phone.trim() : undefined,
    isVerified: !isSmtpConfigured, // Auto-verify if SMTP not configured
  });

  // If SMTP is not configured, skip email verification but DON'T auto-login
  // User should manually login after registration
  if (!isSmtpConfigured) {
    console.log('⚠️ SMTP not configured - skipping email verification for:', user.email);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please login to continue.',
      requiresLogin: true
    });
  }

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  // Send verification email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification - NexusMart',
      message: getVerificationEmailTemplate(user.firstName, verificationUrl),
    });

    // Send welcome email (don't fail if this one fails)
    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to NexusMart! 🎉',
        message: getWelcomeEmailTemplate(user.firstName),
      });
    } catch (welcomeError) {
      console.log('Welcome email failed but user is created:', welcomeError.message);
    }
  } catch (error) {
    // DELETE the user if email verification fails - user shouldn't exist without verified email
    await User.findByIdAndDelete(user._id);
    console.error('Email send error:', error.message);
    return next(new ErrorHandler('Registration failed - could not send verification email. Please try again.', 500));
  }

  sendToken(user, 201, res, 'User registered successfully. Please verify your email.');
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !email.trim()) {
    return next(new ErrorHandler('Please enter your email', 400));
  }

  if (!password) {
    return next(new ErrorHandler('Please enter your password', 400));
  }

  // Find user and include password
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Check if account is locked
  if (user.isLocked()) {
    return next(
      new ErrorHandler(
        'Account is temporarily locked due to multiple failed login attempts. Please try again later.',
        423
      )
    );
  }

  // Check if account is blocked
  if (user.isBlocked) {
    return next(
      new ErrorHandler(`Account is blocked. Reason: ${user.blockReason}`, 403)
    );
  }

  // Check password
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    // Increment login attempts
    await user.incLoginAttempts();
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    return res.status(200).json({
      success: true,
      message: 'Please enter your 2FA code',
      requiresTwoFactor: true,
      userId: user._id,
    });
  }

  sendToken(user, 200, res, 'Login successful');
});

/**
 * Verify 2FA code and complete login
 * @route POST /api/auth/verify-2fa
 * @access Public
 */
export const verifyTwoFactor = catchAsyncErrors(async (req, res, next) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return next(new ErrorHandler('User ID and token are required', 400));
  }

  const user = await User.findById(userId);

  if (!user || !user.twoFactorEnabled) {
    return next(new ErrorHandler('Invalid request', 400));
  }

  // Verify token
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 2,
  });

  if (!verified) {
    return next(new ErrorHandler('Invalid 2FA code', 401));
  }

  sendToken(user, 200, res, 'Login successful');
});

/**
 * Logout user
 * @route GET /api/auth/logout
 * @access Private
 */
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  // Clear refresh token from database
  await User.findByIdAndUpdate(req.user._id, {
    refreshToken: undefined,
    refreshTokenExpire: undefined,
  });

  res
    .status(200)
    .cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .cookie('refreshToken', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: 'Logged out successfully',
    });
});

/**
 * Verify email
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
export const verifyEmail = catchAsyncErrors(async (req, res, next) => {
  // Hash token
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler('Email verification token is invalid or has expired', 400));
  }

  // Update user
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler('User not found with this email', 404));
  }

  // Generate reset token
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - NexusMart',
      message: getPasswordResetTemplate(user.firstName, resetUrl),
    });

    res.status(200).json({
      success: true,
      message: `Password reset email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler('Email could not be sent', 500));
  }
});

/**
 * Reset password
 * @route PUT /api/auth/reset-password/:token
 * @access Public
 */
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler('Password reset token is invalid or has expired', 400));
  }

  // Validate new password
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Passwords do not match', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res, 'Password reset successful');
});

/**
 * Enable 2FA
 * @route POST /api/auth/enable-2fa
 * @access Private
 */
export const enableTwoFactor = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.twoFactorEnabled) {
    return next(new ErrorHandler('Two-factor authentication is already enabled', 400));
  }

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `NexusMart (${user.email})`,
    issuer: 'NexusMart',
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  // Save secret and backup codes (hashed)
  user.twoFactorSecret = secret.base32;
  user.twoFactorBackupCodes = backupCodes.map(code =>
    crypto.createHash('sha256').update(code).digest('hex')
  );

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Two-factor authentication setup initiated',
    secret: secret.base32,
    qrCode: qrCodeUrl,
    backupCodes,
  });
});

/**
 * Verify and activate 2FA
 * @route POST /api/auth/verify-2fa-setup
 * @access Private
 */
export const verifyTwoFactorSetup = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.body;
  const user = await User.findById(req.user._id);

  if (!user.twoFactorSecret) {
    return next(new ErrorHandler('Two-factor setup not initiated', 400));
  }

  // Verify token
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 2,
  });

  if (!verified) {
    return next(new ErrorHandler('Invalid verification code', 401));
  }

  // Enable 2FA
  user.twoFactorEnabled = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Two-factor authentication enabled successfully',
  });
});

/**
 * Disable 2FA
 * @route POST /api/auth/disable-2fa
 * @access Private
 */
export const disableTwoFactor = catchAsyncErrors(async (req, res, next) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user.twoFactorEnabled) {
    return next(new ErrorHandler('Two-factor authentication is not enabled', 400));
  }

  // Verify password
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Invalid password', 401));
  }

  // Disable 2FA
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorBackupCodes = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Two-factor authentication disabled successfully',
  });
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * Update user password
 * @route PUT /api/auth/update-password
 * @access Private
 */
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Check current password
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Current password is incorrect', 401));
  }

  // Validate new password
  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler('Passwords do not match', 400));
  }

  user.password = newPassword;
  await user.save();

  sendToken(user, 200, res, 'Password updated successfully');
});

/**
 * Update user profile
 * @route PUT /api/auth/update-profile
 * @access Private
 */
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, phone, dateOfBirth, gender } = req.body;

  const updateData = {
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
  };

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
});

/**
 * Upload/Update user avatar
 * @route PUT /api/auth/update-avatar
 * @access Private
 */
export const updateAvatar = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler('Please upload an image', 400));
  }

  const user = await User.findById(req.user._id);

  // Delete old avatar from cloudinary if exists (not default)
  if (user.avatar?.public_id && !user.avatar.public_id.includes('default')) {
    try {
      const { deleteFromCloudinary } = await import('../utils/cloudinary.js');
      await deleteFromCloudinary(user.avatar.public_id);
    } catch (err) {
      console.log('Could not delete old avatar:', err.message);
    }
  }

  // Upload new avatar to cloudinary
  const { uploadToCloudinary } = await import('../utils/cloudinary.js');
  const result = await uploadToCloudinary(req.file.buffer, 'nexusmart/avatars', 'image');

  // Update user avatar
  user.avatar = {
    public_id: result.public_id,
    url: result.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Avatar updated successfully',
    user,
  });
});

/**
 * Change password
 * @route PUT /api/auth/change-password  
 * @access Private
 */
export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorHandler('Please provide current and new password', 400));
  }

  if (newPassword.length < 8) {
    return next(new ErrorHandler('New password must be at least 8 characters', 400));
  }

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorHandler('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});
