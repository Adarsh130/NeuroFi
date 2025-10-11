import Crypto from '../models/Crypto.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import binanceService from '../services/binanceService.js';
import mockDataService from '../services/mockDataService.js';
import { isConnected } from '../config/database.js';

/**
 * @desc    Get market overview
 * @route   GET /api/market/overview
 * @access  Public
 */
export const getMarketOverview = catchAsync(async (req, res, next) => {
  // Check if MongoDB is connected
  if (!isConnected()) {
    // Use mock data
    const marketData = await mockDataService.getMarketOverview();
    const cryptos = await mockDataService.getAllCryptos();
    
    return res.status(200).json({
      success: true,
      data: cryptos,
      marketStats: {
        totalMarketCap: marketData.totalMarketCap,
        totalVolume24h: marketData.total24hVolume,
        gainers: marketData.topGainers.length,
        losers: marketData.topLosers.length,
        totalCryptos: marketData.totalCryptos,
        lastUpdated: new Date()
      },
      message: 'Using mock data - MongoDB not connected'
    });
  }
  
  // Get all supported cryptocurrencies
  const cryptos = await Crypto.find({})
    .sort({ marketCap: -1 })
    .limit(50);
  
  if (cryptos.length === 0) {
    // If no data in database, fetch from Binance
    try {
      await binanceService.updateCryptoData();
      const updatedCryptos = await Crypto.find({}).sort({ marketCap: -1 }).limit(50);
      
      return res.status(200).json({
        success: true,
        data: updatedCryptos,
        message: 'Market data updated from Binance'
      });
    } catch (error) {
      // Fallback to mock data if Binance fails
      const marketData = await mockDataService.getMarketOverview();
      const mockCryptos = await mockDataService.getAllCryptos();
      
      return res.status(200).json({
        success: true,
        data: mockCryptos,
        marketStats: {
          totalMarketCap: marketData.totalMarketCap,
          totalVolume24h: marketData.total24hVolume,
          gainers: marketData.topGainers.length,
          losers: marketData.topLosers.length,
          totalCryptos: marketData.totalCryptos,
          lastUpdated: new Date()
        },
        message: 'Using mock data - External API unavailable'
      });
    }
  }
  
  // Calculate market statistics
  const totalMarketCap = cryptos.reduce((sum, crypto) => sum + (crypto.marketCap || 0), 0);
  const totalVolume24h = cryptos.reduce((sum, crypto) => sum + crypto.volume24h, 0);
  const gainers = cryptos.filter(c => c.priceChangePercentage24h > 0).length;
  const losers = cryptos.filter(c => c.priceChangePercentage24h < 0).length;
  
  res.status(200).json({
    success: true,
    data: cryptos,
    marketStats: {
      totalMarketCap,
      totalVolume24h,
      gainers,
      losers,
      totalCryptos: cryptos.length,
      lastUpdated: cryptos[0]?.lastUpdated || new Date()
    }
  });
});

/**
 * @desc    Get cryptocurrency details
 * @route   GET /api/market/crypto/:symbol
 * @access  Public
 */
export const getCryptoDetails = catchAsync(async (req, res, next) => {
  const { symbol } = req.params;
  
  const crypto = await Crypto.findOne({ symbol: symbol.toUpperCase() });
  
  if (!crypto) {
    return next(new AppError('Cryptocurrency not found', 404));
  }
  
  // Get recent predictions
  const recentPredictions = crypto.predictions
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
  
  res.status(200).json({
    success: true,
    data: {
      ...crypto.toObject(),
      recentPredictions
    }
  });
});

/**
 * @desc    Get cryptocurrency chart data
 * @route   GET /api/market/crypto/:symbol/chart
 * @access  Public
 */
export const getCryptoChart = catchAsync(async (req, res, next) => {
  const { symbol } = req.params;
  const { timeframe = '24h', interval = '1h' } = req.query;
  
  // First try to get data from database
  let crypto = await Crypto.findOne({ symbol: symbol.toUpperCase() });
  
  if (!crypto) {
    return next(new AppError('Cryptocurrency not found', 404));
  }
  
  // If we need more detailed chart data, fetch from Binance
  try {
    const klineData = await binanceService.getKlines(symbol.toUpperCase(), interval, 100);
    
    const chartData = klineData.map(kline => ({
      timestamp: kline.openTime,
      open: kline.open,
      high: kline.high,
      low: kline.low,
      close: kline.close,
      volume: kline.volume
    }));
    
    res.status(200).json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        timeframe,
        interval,
        chartData,
        currentPrice: crypto.currentPrice,
        priceChange24h: crypto.priceChange24h,
        priceChangePercentage24h: crypto.priceChangePercentage24h
      }
    });
  } catch (error) {
    // Fallback to database price history
    const timeframeMap = {
      '1h': 1 * 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const timeLimit = new Date(Date.now() - timeframeMap[timeframe]);
    const priceHistory = crypto.priceHistory.filter(p => new Date(p.timestamp) >= timeLimit);
    
    res.status(200).json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        timeframe,
        chartData: priceHistory,
        currentPrice: crypto.currentPrice,
        priceChange24h: crypto.priceChange24h,
        priceChangePercentage24h: crypto.priceChangePercentage24h
      }
    });
  }
});

/**
 * @desc    Get top cryptocurrencies by market cap
 * @route   GET /api/market/top
 * @access  Public
 */
export const getTopCryptos = catchAsync(async (req, res, next) => {
  const { limit = 20 } = req.query;
  
  const topCryptos = await Crypto.find({ marketCap: { $exists: true } })
    .sort({ marketCap: -1 })
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    data: topCryptos
  });
});

/**
 * @desc    Get trending cryptocurrencies
 * @route   GET /api/market/trending
 * @access  Public
 */
export const getTrendingCryptos = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const trendingCryptos = await Crypto.find({})
    .sort({ priceChangePercentage24h: -1 })
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    data: trendingCryptos
  });
});

/**
 * @desc    Search cryptocurrencies
 * @route   GET /api/market/search
 * @access  Public
 */
export const searchCryptos = catchAsync(async (req, res, next) => {
  const { q, limit = 10 } = req.query;
  
  if (!q) {
    return next(new AppError('Search query is required', 400));
  }
  
  const searchRegex = new RegExp(q, 'i');
  const cryptos = await Crypto.find({
    $or: [
      { symbol: searchRegex },
      { name: searchRegex }
    ]
  }).limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    data: cryptos
  });
});

/**
 * @desc    Get order book for a cryptocurrency
 * @route   GET /api/market/crypto/:symbol/orderbook
 * @access  Public
 */
export const getOrderBook = catchAsync(async (req, res, next) => {
  const { symbol } = req.params;
  const { limit = 20 } = req.query;
  
  try {
    const orderBook = await binanceService.getOrderBook(symbol.toUpperCase(), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: orderBook
    });
  } catch (error) {
    return next(new AppError('Failed to fetch order book data', 500));
  }
});

/**
 * @desc    Update market data from Binance
 * @route   POST /api/market/update
 * @access  Private (Admin)
 */
export const updateMarketData = catchAsync(async (req, res, next) => {
  try {
    await binanceService.updateCryptoData();
    
    const updatedCount = await Crypto.countDocuments();
    
    res.status(200).json({
      success: true,
      message: 'Market data updated successfully',
      updatedCryptos: updatedCount
    });
  } catch (error) {
    return next(new AppError('Failed to update market data', 500));
  }
});