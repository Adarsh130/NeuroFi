import Crypto from '../models/Crypto.js';
import binanceService from './binanceService.js';

class MLPredictionService {
  constructor() {
    this.models = {
      'linear_regression': this.linearRegressionPredict.bind(this),
      'moving_average': this.movingAveragePredict.bind(this),
      'rsi_analysis': this.rsiAnalysisPredict.bind(this),
      'volume_analysis': this.volumeAnalysisPredict.bind(this),
      'ensemble': this.ensemblePredict.bind(this)
    };
  }

  /**
   * Generate price prediction for a cryptocurrency
   */
  async generatePrediction(symbol, timeframe = '24h') {
    try {
      console.log(`🤖 Generating ML prediction for ${symbol} (${timeframe})`);
      
      // Get historical data
      const crypto = await Crypto.findOne({ symbol });
      if (!crypto || crypto.priceHistory.length < 20) {
        throw new Error(`Insufficient data for ${symbol}`);
      }
      
      // Get recent price data
      const recentData = crypto.priceHistory.slice(-100);
      const currentPrice = crypto.currentPrice;
      
      // Generate predictions using different models
      const predictions = {};
      for (const [modelName, modelFunc] of Object.entries(this.models)) {
        try {
          predictions[modelName] = await modelFunc(recentData, currentPrice, timeframe);
        } catch (error) {
          console.error(`Error in ${modelName} model:`, error.message);
          predictions[modelName] = null;
        }
      }
      
      // Calculate ensemble prediction
      const validPredictions = Object.values(predictions).filter(p => p !== null);
      if (validPredictions.length === 0) {
        throw new Error('No valid predictions generated');
      }
      
      const ensemblePrediction = this.calculateEnsemble(validPredictions);
      
      // Save prediction to database
      await crypto.addPrediction(
        ensemblePrediction.price,
        ensemblePrediction.confidence,
        timeframe,
        'ensemble'
      );
      
      console.log(`✅ Generated prediction for ${symbol}: $${ensemblePrediction.price.toFixed(2)} (${ensemblePrediction.confidence}% confidence)`);
      
      return {
        symbol,
        currentPrice,
        predictedPrice: ensemblePrediction.price,
        priceChange: ensemblePrediction.price - currentPrice,
        priceChangePercentage: ((ensemblePrediction.price - currentPrice) / currentPrice) * 100,
        confidence: ensemblePrediction.confidence,
        timeframe,
        timestamp: new Date(),
        models: predictions,
        recommendation: this.generateRecommendation(ensemblePrediction, currentPrice)
      };
    } catch (error) {
      console.error(`❌ Error generating prediction for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Linear Regression Prediction
   */
  async linearRegressionPredict(priceHistory, currentPrice, timeframe) {
    const prices = priceHistory.map(p => p.price);
    const n = prices.length;
    
    if (n < 10) throw new Error('Insufficient data for linear regression');
    
    // Calculate linear regression
    const x = Array.from({ length: n }, (_, i) => i);
    const y = prices;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict future price
    const timeMultiplier = this.getTimeMultiplier(timeframe);
    const predictedPrice = slope * (n + timeMultiplier) + intercept;
    
    // Calculate confidence based on R-squared
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);
    const confidence = Math.max(50, Math.min(95, rSquared * 100));
    
    return {
      price: Math.max(0, predictedPrice),
      confidence: Math.round(confidence),
      model: 'linear_regression'
    };
  }

  /**
   * Moving Average Prediction
   */
  async movingAveragePredict(priceHistory, currentPrice, timeframe) {
    const prices = priceHistory.map(p => p.price);
    const n = prices.length;
    
    if (n < 20) throw new Error('Insufficient data for moving average');
    
    // Calculate different moving averages
    const sma5 = this.calculateSMA(prices, 5);
    const sma10 = this.calculateSMA(prices, 10);
    const sma20 = this.calculateSMA(prices, 20);
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    // Calculate trend strength
    const trendStrength = this.calculateTrendStrength(prices);
    
    // Weighted prediction based on multiple MAs
    const macdSignal = ema12 - ema26;
    const maWeight = macdSignal > 0 ? 0.3 : 0.2;
    const trendWeight = Math.abs(trendStrength) * 0.4;
    
    const predictedPrice = (sma5 * 0.3) + (sma10 * 0.25) + (sma20 * 0.2) + 
                          (ema12 * maWeight) + (currentPrice * (0.25 - trendWeight));
    
    // Adjust for timeframe
    const timeMultiplier = this.getTimeMultiplier(timeframe);
    const adjustedPrice = predictedPrice + (trendStrength * timeMultiplier * currentPrice * 0.01);
    
    const confidence = Math.max(60, Math.min(90, 80 - Math.abs(trendStrength) * 10));
    
    return {
      price: Math.max(0, adjustedPrice),
      confidence: Math.round(confidence),
      model: 'moving_average'
    };
  }

  /**
   * RSI Analysis Prediction
   */
  async rsiAnalysisPredict(priceHistory, currentPrice, timeframe) {
    const prices = priceHistory.map(p => p.price);
    
    if (prices.length < 15) throw new Error('Insufficient data for RSI analysis');
    
    const rsi = this.calculateRSI(prices, 14);
    const rsi7 = this.calculateRSI(prices, 7);
    
    // RSI-based prediction
    let priceMultiplier = 1;
    let confidence = 70;
    
    if (rsi < 30) {
      // Oversold - expect price increase
      priceMultiplier = 1 + (0.05 * (30 - rsi) / 30);
      confidence = 85;
    } else if (rsi > 70) {
      // Overbought - expect price decrease
      priceMultiplier = 1 - (0.05 * (rsi - 70) / 30);
      confidence = 85;
    } else {
      // Neutral zone
      const deviation = Math.abs(rsi - 50) / 50;
      priceMultiplier = 1 + (deviation * 0.02 * (rsi > 50 ? 1 : -1));
      confidence = 60 + (deviation * 20);
    }
    
    // Consider RSI divergence
    const rsiDivergence = rsi7 - rsi;
    priceMultiplier += rsiDivergence * 0.001;
    
    const timeMultiplier = this.getTimeMultiplier(timeframe);
    const predictedPrice = currentPrice * priceMultiplier * (1 + timeMultiplier * 0.1);
    
    return {
      price: Math.max(0, predictedPrice),
      confidence: Math.round(confidence),
      model: 'rsi_analysis'
    };
  }

  /**
   * Volume Analysis Prediction
   */
  async volumeAnalysisPredict(priceHistory, currentPrice, timeframe) {
    if (priceHistory.length < 10) throw new Error('Insufficient data for volume analysis');
    
    const volumes = priceHistory.map(p => p.volume);
    const prices = priceHistory.map(p => p.price);
    
    // Calculate volume trend
    const recentVolume = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const historicalVolume = volumes.slice(-20, -5).reduce((a, b) => a + b, 0) / 15;
    const volumeRatio = recentVolume / historicalVolume;
    
    // Calculate price-volume correlation
    const priceChanges = prices.slice(1).map((price, i) => price - prices[i]);
    const volumeChanges = volumes.slice(1).map((vol, i) => vol - volumes[i]);
    const correlation = this.calculateCorrelation(priceChanges, volumeChanges);
    
    // Volume-based prediction
    let priceMultiplier = 1;
    let confidence = 65;
    
    if (volumeRatio > 1.5 && correlation > 0.3) {
      // High volume with positive correlation - strong trend
      priceMultiplier = 1.02;
      confidence = 80;
    } else if (volumeRatio > 1.5 && correlation < -0.3) {
      // High volume with negative correlation - reversal
      priceMultiplier = 0.98;
      confidence = 75;
    } else if (volumeRatio < 0.7) {
      // Low volume - weak trend
      priceMultiplier = 1 + (Math.random() - 0.5) * 0.01;
      confidence = 55;
    }
    
    const timeMultiplier = this.getTimeMultiplier(timeframe);
    const predictedPrice = currentPrice * priceMultiplier * (1 + timeMultiplier * 0.05);
    
    return {
      price: Math.max(0, predictedPrice),
      confidence: Math.round(confidence),
      model: 'volume_analysis'
    };
  }

  /**
   * Ensemble Prediction (combines all models)
   */
  async ensemblePredict(priceHistory, currentPrice, timeframe) {
    // This method is called separately to combine other predictions
    return {
      price: currentPrice,
      confidence: 70,
      model: 'ensemble'
    };
  }

  /**
   * Calculate ensemble prediction from multiple models
   */
  calculateEnsemble(predictions) {
    const validPredictions = predictions.filter(p => p && p.price > 0);
    
    if (validPredictions.length === 0) {
      throw new Error('No valid predictions to ensemble');
    }
    
    // Weighted average based on confidence
    let totalWeight = 0;
    let weightedSum = 0;
    
    validPredictions.forEach(pred => {
      const weight = pred.confidence / 100;
      weightedSum += pred.price * weight;
      totalWeight += weight;
    });
    
    const ensemblePrice = weightedSum / totalWeight;
    const averageConfidence = validPredictions.reduce((sum, p) => sum + p.confidence, 0) / validPredictions.length;
    
    return {
      price: ensemblePrice,
      confidence: Math.round(averageConfidence)
    };
  }

  /**
   * Generate trading recommendation
   */
  generateRecommendation(prediction, currentPrice) {
    const priceChange = ((prediction.price - currentPrice) / currentPrice) * 100;
    const confidence = prediction.confidence;
    
    if (confidence < 60) {
      return { action: 'HOLD', reason: 'Low confidence prediction' };
    }
    
    if (priceChange > 3 && confidence > 75) {
      return { action: 'BUY', reason: `Strong upward prediction (+${priceChange.toFixed(2)}%)` };
    } else if (priceChange < -3 && confidence > 75) {
      return { action: 'SELL', reason: `Strong downward prediction (${priceChange.toFixed(2)}%)` };
    } else if (priceChange > 1 && confidence > 65) {
      return { action: 'BUY', reason: `Moderate upward prediction (+${priceChange.toFixed(2)}%)` };
    } else if (priceChange < -1 && confidence > 65) {
      return { action: 'SELL', reason: `Moderate downward prediction (${priceChange.toFixed(2)}%)` };
    } else {
      return { action: 'HOLD', reason: 'Neutral prediction' };
    }
  }

  /**
   * Helper methods for calculations
   */
  calculateSMA(prices, period) {
    if (prices.length < period) return prices[prices.length - 1];
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  calculateEMA(prices, period) {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateTrendStrength(prices) {
    if (prices.length < 10) return 0;
    
    const recent = prices.slice(-10);
    const older = prices.slice(-20, -10);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  getTimeMultiplier(timeframe) {
    const multipliers = {
      '1h': 0.1,
      '4h': 0.4,
      '24h': 1,
      '7d': 7,
      '30d': 30
    };
    return multipliers[timeframe] || 1;
  }

  /**
   * Generate predictions for all supported cryptocurrencies
   */
  async generateAllPredictions(timeframe = '24h') {
    const supportedCryptos = binanceService.getSupportedCryptos();
    const predictions = [];
    
    for (const crypto of supportedCryptos) {
      try {
        const prediction = await this.generatePrediction(crypto.symbol, timeframe);
        predictions.push(prediction);
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to generate prediction for ${crypto.symbol}:`, error.message);
      }
    }
    
    return predictions;
  }

  /**
   * Start automated prediction generation
   */
  startAutomatedPredictions(intervalMinutes = 30) {
    console.log(`🤖 Starting automated ML predictions every ${intervalMinutes} minutes`);
    
    // Initial predictions
    this.generateAllPredictions('24h');
    
    // Set interval for predictions
    setInterval(() => {
      this.generateAllPredictions('24h');
    }, intervalMinutes * 60 * 1000);
  }
}

export default new MLPredictionService();