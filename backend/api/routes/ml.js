import express from 'express';
import {
  getPrediction,
  getAllPredictions,
  getRecommendations,
  generatePrediction,
  getPredictionHistory
} from '../controllers/mlController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/predictions', getAllPredictions);
router.get('/predictions/:symbol', getPrediction);
router.get('/predictions/:symbol/history', getPredictionHistory);
router.get('/recommendations', getRecommendations);

// Protected routes
router.post('/predictions/:symbol/generate', protect, generatePrediction);

export default router;