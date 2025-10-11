import Crypto from '../models/Crypto.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import mlPredictionService from '../services/mlPredictionService.js';
import binanceService from '../services/binanceService.js';

/**
 * @desc    Get ML prediction for a cryptocurrency
 * @route   GET /api/ml/predictions/:symbol
 * @access  Public
 */
export const getPrediction = catchAsync(async (req, res, next) => {
  const { symbol } = req.params;
  const { timeframe = '24h' } = req.query;
  
  const crypto = await Crypto.findOne({ symbol: symbol.toUpperCase() });
  
  if (!crypto) {
    return next(new AppError('Cryptocurrency not found', 404));
  }
  
  // Get the latest prediction for the timeframe
  const latestPrediction = crypto.predictions
    .filter(p => p.timeframe === timeframe)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  
  if (!latestPrediction) {
    // Generate new prediction if none exists
    try {
      const newPrediction = await mlPredictionService.generatePrediction(symbol.toUpperCase(), timeframe);
      
      return res.status(200).json({
        success: true,
        data: newPrediction,
        message: 'New prediction generated'
      });
    } catch (error) {
      return next(new AppError('Failed to generate prediction', 500));
    }
  }
  
  // Check if prediction is older than 30 minutes
  const predictionAge = Date.now() - new Date(latestPrediction.timestamp).getTime();
  const isStale = predictionAge > 30 * 60 * 1000; // 30 minutes
  
  res.status(200).json({
    success: true,
    data: {
      symbol: crypto.symbol,
      currentPrice: crypto.currentPrice,
      predictedPrice: latestPrediction.predictedPrice,
      priceChange: latestPrediction.predictedPrice - crypto.currentPrice,
      priceChangePercentage: ((latestPrediction.predictedPrice - crypto.currentPrice) / crypto.currentPrice) * 100,
      confidence: latestPrediction.confidence,
      timeframe: latestPrediction.timeframe,
      model: latestPrediction.model,
      timestamp: latestPrediction.timestamp,
      isStale
    }
  });
});

/**
 * @desc    Get all ML predictions
 * @route   GET /api/ml/predictions
 * @access  Public
 */
export const getAllPredictions = catchAsync(async (req, res, next) => {
  const { timeframe = '24h', limit = 20 } = req.query;
  
  const cryptos = await Crypto.find({})
    .sort({ marketCap: -1 })
    .limit(parseInt(limit));
  
  const predictions = [];
  
  for (const crypto of cryptos) {
    const latestPrediction = crypto.predictions
      .filter(p => p.timeframe === timeframe)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (latestPrediction) {
      predictions.push({
        symbol: crypto.symbol,
        name: crypto.name,
        currentPrice: crypto.currentPrice,
        predictedPrice: latestPrediction.predictedPrice,
        priceChange: latestPrediction.predictedPrice - crypto.currentPrice,
        priceChangePercentage: ((latestPrediction.predictedPrice - crypto.currentPrice) / crypto.currentPrice) * 100,
        confidence: latestPrediction.confidence,
        timeframe: latestPrediction.timeframe,
        timestamp: latestPrediction.timestamp
      });
    }
  }
  
  // Sort by confidence
  predictions.sort((a, b) => b.confidence - a.confidence);
  
  res.status(200).json({
    success: true,
    data: predictions
  });
});

/**
 * @desc    Get trading recommendations
 * @route   GET /api/ml/recommendations
 * @access  Public
 */
export const getRecommendations = catchAsync(async (req, res, next) => {
  const { limit = 10, minConfidence = 70 } = req.query;
  
  const cryptos = await Crypto.find({})
    .sort({ marketCap: -1 })
    .limit(50);
  
  const recommendations = [];
  
  for (const crypto of cryptos) {
    const latestPrediction = crypto.predictions
      .filter(p => p.timeframe === '24h')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (latestPrediction && latestPrediction.confidence >= parseInt(minConfidence)) {
      const priceChangePercentage = ((latestPrediction.predictedPrice - crypto.currentPrice) / crypto.currentPrice) * 100;
      
      let action = 'HOLD';
      let reason = 'Neutral prediction';
      
      if (priceChangePercentage > 3 && latestPrediction.confidence > 75) {
        action = 'BUY';
        reason = `Strong upward prediction (+${priceChangePercentage.toFixed(2)}%)`;
      } else if (priceChangePercentage < -3 && latestPrediction.confidence > 75) {
        action = 'SELL';
        reason = `Strong downward prediction (${priceChangePercentage.toFixed(2)}%)`;
      } else if (priceChangePercentage > 1 && latestPrediction.confidence > 65) {
        action = 'BUY';
        reason = `Moderate upward prediction (+${priceChangePercentage.toFixed(2)}%)`;
      } else if (priceChangePercentage < -1 && latestPrediction.confidence > 65) {
        action = 'SELL';
        reason = `Moderate downward prediction (${priceChangePercentage.toFixed(2)}%)`;
      }
      
      if (action !== 'HOLD') {
        recommendations.push({
          symbol: crypto.symbol,
          name: crypto.name,
          currentPrice: crypto.currentPrice,
          predictedPrice: latestPrediction.predictedPrice,
          priceChangePercentage,
          confidence: latestPrediction.confidence,
          action,
          reason,
          timestamp: latestPrediction.timestamp,
          riskLevel: latestPrediction.confidence > 80 ? 'Low' : 
                    latestPrediction.confidence > 65 ? 'Medium' : 'High'
        });
      }
    }
  }
  
  // Sort by confidence and potential return
  recommendations.sort((a, b) => {
    const scoreA = a.confidence + Math.abs(a.priceChangePercentage);
    const scoreB = b.confidence + Math.abs(b.priceChangePercentage);
    return scoreB - scoreA;
  });
  
  res.status(200).json({
    success: true,
    data: recommendations.slice(0, parseInt(limit))
  });
});

/**
 * @desc    Generate new prediction for a cryptocurrency
 * @route   POST /api/ml/predictions/:symbol/generate
 * @access  Private
 */
export const generatePrediction = catchAsync(async (req, res, next) => {
  const { symbol } = req.params;
  const { timeframe = '24h' } = req.body;
  
  if (!binanceService.isSupported(symbol.toUpperCase())) {
    return next(new AppError('Cryptocurrency not supported', 400));
  }
  
  try {
    const prediction = await mlPredictionService.generatePrediction(symbol.toUpperCase(), timeframe);
    
    res.status(200).json({
      success: true,
      data: prediction,
      message: 'Prediction generated successfully'
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

/**
 * @desc    Get prediction history for a cryptocurrency
 * @route   GET /api/ml/predictions/:symbol/history
 * @access  Public
 */
export const getPredictionHistory = catchAsync(async (req, res, next) => {
  const { symbol } = req.params;
  const { timeframe = '24h', limit = 50 } = req.query;
  
  const crypto = await Crypto.findOne({ symbol: symbol.toUpperCase() });
  
  if (!crypto) {
    return next(new AppError('Cryptocurrency not found', 404));
  }
  
  const predictionHistory = crypto.predictions
    .filter(p => p.timeframe === timeframe)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit));
  
  // Calculate accuracy for past predictions
  const accuracyData = predictionHistory.map(prediction => {
    const predictionTime = new Date(prediction.timestamp);
    const checkTime = new Date(predictionTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
    
    // Find actual price at check time (simplified - would need more sophisticated logic)
    const actualPriceEntry = crypto.priceHistory.find(p => 
      Math.abs(new Date(p.timestamp).getTime() - checkTime.getTime()) < 60 * 60 * 1000 // within 1 hour
    );
    
    if (actualPriceEntry) {
      const actualPrice = actualPriceEntry.price;
      const predictedPrice = prediction.predictedPrice;
      const accuracy = 100 - Math.abs((actualPrice - predictedPrice) / actualPrice) * 100;
      
      return {
        ...prediction.toObject(),
        actualPrice,
        accuracy: Math.max(0, accuracy)
      };
    }
    
    return prediction.toObject();
  });
  
  res.status(200).json({
    success: true,
    data: accuracyData
  });
});