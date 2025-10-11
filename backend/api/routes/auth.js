import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updatePreferences,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.put('/preferences', protect, updatePreferences);

// Password reset
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;