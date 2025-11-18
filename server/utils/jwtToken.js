/**
 * Send JWT token in response with cookie
 * @param {Object} user - User object
 * @param {Number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 */
export const sendToken = (user, statusCode, res, message = 'Success') => {
  // Generate access token
  const accessToken = user.generateAccessToken();

  // Generate refresh token
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to database
  user.save({ validateBeforeSave: false });

  // Cookie options for access token
  const accessTokenOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Cookie options for refresh token (longer expiry)
  const refreshTokenOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Update last login
  user.lastLogin = Date.now();

  // Remove sensitive fields from response
  const userResponse = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    isVerified: user.isVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    preferences: user.preferences,
    membershipTier: user.membershipTier,
    loyaltyPoints: user.loyaltyPoints,
  };

  res
    .status(statusCode)
    .cookie('token', accessToken, accessTokenOptions)
    .cookie('refreshToken', refreshToken, refreshTokenOptions)
    .json({
      success: true,
      message,
      user: userResponse,
      accessToken,
      refreshToken,
    });
};
