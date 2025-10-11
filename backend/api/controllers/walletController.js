import User from '../models/User.js';
import Crypto from '../models/Crypto.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import binanceService from '../services/binanceService.js';
import mockDataService from '../services/mockDataService.js';
import { isConnected } from '../config/database.js';

/**
 * @desc    Get user wallet
 * @route   GET /api/wallet
 * @access  Private
 */
export const getWallet = catchAsync(async (req, res, next) => {
  // Check if MongoDB is connected
  if (!isConnected()) {
    // Use mock data
    const mockWallet = {
      balance: 10000,
      holdings: [
        {
          symbol: 'BTCUSDT',
          amount: 0.5,
          averagePrice: 42000,
          totalInvested: 21000,
          currentPrice: 43250,
          currentValue: 21625,
          pnl: 625,
          pnlPercentage: 2.98
        },
        {
          symbol: 'ETHUSDT',
          amount: 8,
          averagePrice: 2500,
          totalInvested: 20000,
          currentPrice: 2650,
          currentValue: 21200,
          pnl: 1200,
          pnlPercentage: 6.0
        }
      ],
      totalPortfolioValue: 52825,
      totalInvested: 41000,
      totalPnL: 1825,
      totalPnLPercentage: 4.45
    };

    return res.status(200).json({
      success: true,
      wallet: mockWallet,
      message: 'Using mock data - MongoDB not connected'
    });
  }

  const user = await User.findById(req.user.id || req.user._id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Get current prices for holdings
  const currentPrices = {};
  for (const holding of user.wallet.holdings) {
    try {
      const crypto = await Crypto.findOne({ symbol: holding.symbol });
      if (crypto) {
        currentPrices[holding.symbol] = crypto.currentPrice;
      }
    } catch (error) {
      console.error(`Error fetching price for ${holding.symbol}:`, error.message);
    }
  }
  
  // Calculate portfolio value and P&L
  const holdingsWithPnL = user.wallet.holdings.map(holding => {
    const currentPrice = currentPrices[holding.symbol] || holding.averagePrice;
    const currentValue = holding.amount * currentPrice;
    const pnl = currentValue - holding.totalInvested;
    const pnlPercentage = holding.totalInvested > 0 ? (pnl / holding.totalInvested) * 100 : 0;
    
    return {
      ...holding,
      currentPrice,
      currentValue,
      pnl,
      pnlPercentage
    };
  });
  
  const totalPortfolioValue = user.getPortfolioValue(currentPrices);
  const totalInvested = user.wallet.holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  const totalPnL = totalPortfolioValue - user.wallet.balance - totalInvested;
  
  res.status(200).json({
    success: true,
    wallet: {
      balance: user.wallet.balance,
      holdings: holdingsWithPnL,
      totalPortfolioValue,
      totalInvested,
      totalPnL,
      totalPnLPercentage: totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
    }
  });
});

/**
 * @desc    Buy cryptocurrency
 * @route   POST /api/wallet/buy
 * @access  Private
 */
export const buyCrypto = catchAsync(async (req, res, next) => {
  const { symbol, amount, price } = req.body;
  
  // Validate input
  if (!symbol || !amount || amount <= 0) {
    return next(new AppError('Invalid symbol or amount', 400));
  }

  // Check if MongoDB is connected
  if (!isConnected()) {
    // Mock successful trade
    return res.status(200).json({
      success: true,
      message: `Successfully bought ${amount} ${symbol} (mock mode)`,
      transaction: {
        type: 'buy',
        symbol,
        amount,
        price: price || 43000,
        total: amount * (price || 43000)
      }
    });
  }
  
  // Validate symbol is supported
  if (!binanceService.isSupported(symbol)) {
    return next(new AppError('Cryptocurrency not supported', 400));
  }
  
  // Get current price if not provided
  let currentPrice = price;
  if (!currentPrice) {
    const crypto = await Crypto.findOne({ symbol });
    if (!crypto) {
      return next(new AppError('Cryptocurrency data not available', 400));
    }
    currentPrice = crypto.currentPrice;
  }
  
  const user = await User.findById(req.user.id || req.user._id);
  
  try {
    await user.buyCrypto(symbol, amount, currentPrice);
    
    res.status(200).json({
      success: true,
      message: `Successfully bought ${amount} ${symbol}`,
      transaction: {
        type: 'buy',
        symbol,
        amount,
        price: currentPrice,
        total: amount * currentPrice
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

/**
 * @desc    Sell cryptocurrency
 * @route   POST /api/wallet/sell
 * @access  Private
 */
export const sellCrypto = catchAsync(async (req, res, next) => {
  const { symbol, amount, price } = req.body;
  
  // Validate input
  if (!symbol || !amount || amount <= 0) {
    return next(new AppError('Invalid symbol or amount', 400));
  }

  // Check if MongoDB is connected
  if (!isConnected()) {
    // Mock successful trade
    return res.status(200).json({
      success: true,
      message: `Successfully sold ${amount} ${symbol} (mock mode)`,
      transaction: {
        type: 'sell',
        symbol,
        amount,
        price: price || 43000,
        total: amount * (price || 43000)
      }
    });
  }
  
  // Validate symbol is supported
  if (!binanceService.isSupported(symbol)) {
    return next(new AppError('Cryptocurrency not supported', 400));
  }
  
  // Get current price if not provided
  let currentPrice = price;
  if (!currentPrice) {
    const crypto = await Crypto.findOne({ symbol });
    if (!crypto) {
      return next(new AppError('Cryptocurrency data not available', 400));
    }
    currentPrice = crypto.currentPrice;
  }
  
  const user = await User.findById(req.user.id || req.user._id);
  
  try {
    await user.sellCrypto(symbol, amount, currentPrice);
    
    res.status(200).json({
      success: true,
      message: `Successfully sold ${amount} ${symbol}`,
      transaction: {
        type: 'sell',
        symbol,
        amount,
        price: currentPrice,
        total: amount * currentPrice
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

/**
 * @desc    Get transaction history
 * @route   GET /api/wallet/transactions
 * @access  Private
 */
export const getTransactionHistory = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, type, symbol } = req.query;
  
  // Check if MongoDB is connected
  if (!isConnected()) {
    // Mock transaction data
    const mockTransactions = [
      {
        type: 'buy',
        symbol: 'BTCUSDT',
        amount: 0.5,
        price: 42000,
        total: 21000,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'buy',
        symbol: 'ETHUSDT',
        amount: 8,
        price: 2500,
        total: 20000,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    return res.status(200).json({
      success: true,
      transactions: mockTransactions,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalTransactions: mockTransactions.length,
        hasNext: false,
        hasPrev: false
      },
      message: 'Using mock data - MongoDB not connected'
    });
  }
  
  const user = await User.findById(req.user.id || req.user._id);
  let transactions = [...user.wallet.transactions];
  
  // Filter by type
  if (type && ['buy', 'sell'].includes(type)) {
    transactions = transactions.filter(t => t.type === type);
  }
  
  // Filter by symbol
  if (symbol) {
    transactions = transactions.filter(t => t.symbol === symbol.toUpperCase());
  }
  
  // Sort by timestamp (newest first)
  transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = transactions.slice(startIndex, endIndex);
  
  res.status(200).json({
    success: true,
    transactions: paginatedTransactions,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(transactions.length / limit),
      totalTransactions: transactions.length,
      hasNext: endIndex < transactions.length,
      hasPrev: startIndex > 0
    }
  });
});

/**
 * @desc    Get portfolio statistics
 * @route   GET /api/wallet/stats
 * @access  Private
 */
export const getPortfolioStats = catchAsync(async (req, res, next) => {
  // Check if MongoDB is connected
  if (!isConnected()) {
    // Mock portfolio stats
    const mockStats = {
      totalPortfolioValue: 52825,
      totalInvested: 41000,
      totalPnL: 1825,
      totalPnLPercentage: 4.45,
      cashBalance: 10000,
      portfolioDistribution: [
        { symbol: 'BTCUSDT', name: 'Bitcoin', value: 21625, percentage: 40.9, amount: 0.5 },
        { symbol: 'ETHUSDT', name: 'Ethereum', value: 21200, percentage: 40.1, amount: 8 },
        { symbol: 'USD', name: 'Cash', value: 10000, percentage: 18.9, amount: 10000 }
      ],
      tradingStats: {
        totalTrades: 2,
        buyTrades: 2,
        sellTrades: 0,
        recentTrades: 2
      },
      topHolding: { symbol: 'BTCUSDT', name: 'Bitcoin', value: 21625, percentage: 40.9, amount: 0.5 }
    };

    return res.status(200).json({
      success: true,
      stats: mockStats,
      message: 'Using mock data - MongoDB not connected'
    });
  }

  const user = await User.findById(req.user.id || req.user._id);
  
  // Get current prices
  const currentPrices = {};
  for (const holding of user.wallet.holdings) {
    try {
      const crypto = await Crypto.findOne({ symbol: holding.symbol });
      if (crypto) {
        currentPrices[holding.symbol] = crypto.currentPrice;
      }
    } catch (error) {
      console.error(`Error fetching price for ${holding.symbol}:`, error.message);
    }
  }
  
  const totalPortfolioValue = user.getPortfolioValue(currentPrices);
  const totalInvested = user.wallet.holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  const totalPnL = totalPortfolioValue - user.wallet.balance - totalInvested;
  
  // Calculate portfolio distribution
  const portfolioDistribution = user.wallet.holdings.map(holding => {
    const currentPrice = currentPrices[holding.symbol] || holding.averagePrice;
    const currentValue = holding.amount * currentPrice;
    const percentage = totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0;
    
    return {
      symbol: holding.symbol,
      name: binanceService.getCryptoName(holding.symbol),
      value: currentValue,
      percentage: percentage,
      amount: holding.amount
    };
  });
  
  // Add cash percentage
  const cashPercentage = totalPortfolioValue > 0 ? (user.wallet.balance / totalPortfolioValue) * 100 : 0;
  portfolioDistribution.push({
    symbol: 'USD',
    name: 'Cash',
    value: user.wallet.balance,
    percentage: cashPercentage,
    amount: user.wallet.balance
  });
  
  // Calculate performance metrics
  const transactions = user.wallet.transactions;
  const totalTrades = transactions.length;
  const buyTrades = transactions.filter(t => t.type === 'buy').length;
  const sellTrades = transactions.filter(t => t.type === 'sell').length;
  
  // Calculate 24h change
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentTransactions = transactions.filter(t => new Date(t.timestamp) > yesterday);
  
  res.status(200).json({
    success: true,
    stats: {
      totalPortfolioValue,
      totalInvested,
      totalPnL,
      totalPnLPercentage: totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0,
      cashBalance: user.wallet.balance,
      portfolioDistribution,
      tradingStats: {
        totalTrades,
        buyTrades,
        sellTrades,
        recentTrades: recentTransactions.length
      },
      topHolding: portfolioDistribution
        .filter(p => p.symbol !== 'USD')
        .sort((a, b) => b.value - a.value)[0] || null
    }
  });
});

/**
 * @desc    Add funds to wallet
 * @route   POST /api/wallet/add-funds
 * @access  Private
 */
export const addFunds = catchAsync(async (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return next(new AppError('Amount must be greater than 0', 400));
  }
  
  if (amount > 100000) {
    return next(new AppError('Maximum deposit amount is $100,000', 400));
  }

  // Check if MongoDB is connected
  if (!isConnected()) {
    return res.status(200).json({
      success: true,
      message: `Successfully added $${amount} to wallet (mock mode)`,
      newBalance: 10000 + amount
    });
  }
  
  const user = await User.findById(req.user.id || req.user._id);
  user.wallet.balance += amount;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: `Successfully added $${amount} to wallet`,
    newBalance: user.wallet.balance
  });
});

/**
 * @desc    Withdraw funds from wallet
 * @route   POST /api/wallet/withdraw
 * @access  Private
 */
export const withdrawFunds = catchAsync(async (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return next(new AppError('Amount must be greater than 0', 400));
  }

  // Check if MongoDB is connected
  if (!isConnected()) {
    return res.status(200).json({
      success: true,
      message: `Successfully withdrew $${amount} from wallet (mock mode)`,
      newBalance: Math.max(0, 10000 - amount)
    });
  }
  
  const user = await User.findById(req.user.id || req.user._id);
  
  if (user.wallet.balance < amount) {
    return next(new AppError('Insufficient balance', 400));
  }
  
  user.wallet.balance -= amount;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: `Successfully withdrew $${amount} from wallet`,
    newBalance: user.wallet.balance
  });
});