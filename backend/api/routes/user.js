import express from 'express';
import { protect, admin, ownerOrAdmin } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import User from '../models/User.js';

const router = express.Router();

// All routes are protected
router.use(protect);

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/user
 * @access  Private/Admin
 */
router.get('/', admin, catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  // Build search query
  const searchQuery = search ? {
    $or: [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } }
    ]
  } : {};

  // Get users with pagination
  const users = await User.find(searchQuery)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .select('-password');

  // Get total count for pagination
  const total = await User.countDocuments(searchQuery);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
}));

/**
 * @desc    Get user by ID
 * @route   GET /api/user/:id
 * @access  Private (own profile or admin)
 */
router.get('/:id', ownerOrAdmin, catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
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
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
}));

/**
 * @desc    Update user by ID (admin only)
 * @route   PUT /api/user/:id
 * @access  Private/Admin
 */
router.put('/:id', admin, catchAsync(async (req, res, next) => {
  const allowedFields = ['firstName', 'lastName', 'username', 'email', 'role', 'isActive', 'isEmailVerified'];
  const updateData = {};

  // Only include allowed fields
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Check if username or email is being updated and if they're already taken
  if (updateData.username || updateData.email) {
    const query = { _id: { $ne: req.params.id } };
    
    if (updateData.username && updateData.email) {
      query.$or = [
        { username: updateData.username },
        { email: updateData.email }
      ];
    } else if (updateData.username) {
      query.username = updateData.username;
    } else if (updateData.email) {
      query.email = updateData.email;
    }

    const existingUser = await User.findOne(query);
    
    if (existingUser) {
      if (existingUser.username === updateData.username) {
        return next(new AppError('Username already taken', 400));
      }
      if (existingUser.email === updateData.email) {
        return next(new AppError('Email already registered', 400));
      }
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
}));

/**
 * @desc    Delete user by ID (admin only)
 * @route   DELETE /api/user/:id
 * @access  Private/Admin
 */
router.delete('/:id', admin, catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user.id) {
    return next(new AppError('You cannot delete your own account', 400));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
}));

/**
 * @desc    Deactivate user account
 * @route   PUT /api/user/:id/deactivate
 * @access  Private (own account or admin)
 */
router.put('/:id/deactivate', ownerOrAdmin, catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user.id && req.user.role === 'admin') {
    return next(new AppError('Admin cannot deactivate their own account', 400));
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
}));

/**
 * @desc    Reactivate user account (admin only)
 * @route   PUT /api/user/:id/reactivate
 * @access  Private/Admin
 */
router.put('/:id/reactivate', admin, catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isActive = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Account reactivated successfully'
  });
}));

/**
 * @desc    Get user's watchlist
 * @route   GET /api/user/:id/watchlist
 * @access  Private (own watchlist or admin)
 */
router.get('/:id/watchlist', ownerOrAdmin, catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    watchlist: user.preferences.watchlist
  });
}));

export default router;