import User from '../models/User.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { sendTokenResponse } from '../middleware/auth.js';
import mockDataService from '../services/mockDataService.js';
import { isConnected } from '../config/database.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = catchAsync(async (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;

  // Check if MongoDB is connected
  if (!isConnected()) {
    // Use mock data service
    const existingUser = await mockDataService.findUser({ email }) || await mockDataService.findUser({ username });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return next(new AppError('Email already registered', 400));
      }
      if (existingUser.username === username) {
        return next(new AppError('Username already taken', 400));
      }
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user with mock service
    const user = await mockDataService.createUser({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'user',
      isActive: true,
      isEmailVerified: false,
      preferences: {
        theme: 'dark',
        currency: 'USD',
        notifications: {
          email: true,
          push: true,
          priceAlerts: true
        },
        watchlist: []
      }
    });
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully (mock mode)',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        preferences: user.preferences,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return next(new AppError('Email already registered', 400));
    }
    if (existingUser.username === username) {
      return next(new AppError('Username already taken', 400));
    }
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName
  });

  // Send token response
  sendTokenResponse(user, 201, res, 'User registered successfully');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if MongoDB is connected
  if (!isConnected()) {
    // Use mock data service
    const user = await mockDataService.findUser({ email });
    
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
    
    return res.status(200).json({
      success: true,
      message: 'Login successful (mock mode)',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        preferences: user.preferences,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  }

  try {
    // Find user by credentials (includes password checking and login attempt handling)
    const user = await User.findByCredentials(email, password);

    // Send token response
    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = catchAsync(async (req, res, next) => {
  // Check if MongoDB is connected
  if (!isConnected()) {
    // Mock user data
    const mockUser = {
      id: 'mock-user-id',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      avatar: null,
      role: 'user',
      preferences: {
        theme: 'dark',
        currency: 'USD',
        notifications: { email: true, push: true, priceAlerts: true },
        watchlist: [],
        tradingData: { trades: [], balance: 10000 }
      },
      isEmailVerified: false,
      lastLogin: new Date(),
      createdAt: new Date()
    };

    return res.status(200).json({
      success: true,
      user: mockUser,
      message: 'Using mock data - MongoDB not connected'
    });
  }

  const user = await User.findById(req.user.id || req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user: {
      id: user.id || user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName || `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      role: user.role || 'user',
      preferences: user.preferences || {},
      isEmailVerified: user.isEmailVerified || false,
      lastLogin: user.lastLogin || new Date(),
      createdAt: user.createdAt || new Date()
    }
  });
});

/**
 * @desc    Update user preferences
 * @route   PUT /api/auth/preferences
 * @access  Private
 */
export const updatePreferences = catchAsync(async (req, res, next) => {
  const { theme, currency, notifications, watchlist, tradingData } = req.body;

  // Check if MongoDB is connected
  if (!isConnected()) {
    // Mock successful update
    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully (mock mode)',
      preferences: {
        theme: theme || 'dark',
        currency: currency || 'USD',
        notifications: notifications || { email: true, push: true, priceAlerts: true },
        watchlist: watchlist || [],
        tradingData: tradingData || { trades: [], balance: 10000 }
      }
    });
  }

  const user = await User.findById(req.user.id || req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update preferences
  if (theme) user.preferences.theme = theme;
  if (currency) user.preferences.currency = currency;
  if (notifications) {
    user.preferences.notifications = {
      ...user.preferences.notifications,
      ...notifications
    };
  }
  if (watchlist) user.preferences.watchlist = watchlist;
  if (tradingData) {
    user.preferences.tradingData = {
      ...user.preferences.tradingData,
      ...tradingData
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    preferences: user.preferences
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = catchAsync(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  // Check if MongoDB is connected
  if (!isConnected()) {
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully (mock mode)',
      user: {
        id: 'mock-user-id',
        username: fieldsToUpdate.username || 'testuser',
        email: 'test@example.com',
        firstName: fieldsToUpdate.firstName || 'Test',
        lastName: fieldsToUpdate.lastName || 'User',
        fullName: `${fieldsToUpdate.firstName || 'Test'} ${fieldsToUpdate.lastName || 'User'}`,
        avatar: null,
        role: 'user',
        preferences: {},
        isEmailVerified: false,
        lastLogin: new Date(),
        createdAt: new Date()
      }
    });
  }

  // Check if username is being updated and if it's already taken
  if (fieldsToUpdate.username) {
    const existingUser = await User.findOne({
      username: fieldsToUpdate.username,
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return next(new AppError('Username already taken', 400));
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role,
      preferences: user.preferences,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Check if MongoDB is connected
  if (!isConnected()) {
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully (mock mode)'
    });
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isCurrentPasswordCorrect = await user.matchPassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Check if MongoDB is connected
  if (!isConnected()) {
    return res.status(200).json({
      success: true,
      message: 'Password reset email sent (mock mode)',
      resetToken: 'mock-reset-token'
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

  // For now, just return the reset token (in production, send email)
  res.status(200).json({
    success: true,
    message: 'Password reset token generated',
    resetToken, // Remove this in production
    resetUrl   // Remove this in production
  });
});

/**
 * @desc    Reset password
 * @route   PUT /api/auth/reset-password/:resettoken
 * @access  Public
 */
export const resetPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  // Check if MongoDB is connected
  if (!isConnected()) {
    return res.status(200).json({
      success: true,
      message: 'Password reset successful (mock mode)'
    });
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});