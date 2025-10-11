import express from 'express';
import {
  getMarketOverview,
  getCryptoDetails,
  getCryptoChart,
  getTopCryptos,
  getTrendingCryptos,
  searchCryptos,
  getOrderBook,
  updateMarketData
} from '../controllers/marketController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/overview', getMarketOverview);
router.get('/top', getTopCryptos);
router.get('/trending', getTrendingCryptos);
router.get('/search', searchCryptos);
router.get('/crypto/:symbol', getCryptoDetails);
router.get('/crypto/:symbol/chart', getCryptoChart);
router.get('/crypto/:symbol/orderbook', getOrderBook);

// Protected routes
router.post('/update', protect, updateMarketData);

export default router;