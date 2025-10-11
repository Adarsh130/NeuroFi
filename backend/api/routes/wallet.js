import express from 'express';
import {
  getWallet,
  buyCrypto,
  sellCrypto,
  getTransactionHistory,
  getPortfolioStats,
  addFunds,
  withdrawFunds
} from '../controllers/walletController.js';
import { protect } from '../middleware/auth.js';
import {
  validateTrade,
  validateFundsOperation
} from '../middleware/validation.js';

const router = express.Router();

// All wallet routes require authentication
router.use(protect);

// Wallet overview
router.get('/', getWallet);
router.get('/stats', getPortfolioStats);

// Trading operations
router.post('/buy', validateTrade, buyCrypto);
router.post('/sell', validateTrade, sellCrypto);

// Transaction history
router.get('/transactions', getTransactionHistory);

// Funds management
router.post('/add-funds', validateFundsOperation, addFunds);
router.post('/withdraw', validateFundsOperation, withdrawFunds);

export default router;