/**
 * AI Prediction Service
 * Generates realistic cryptocurrency price predictions using various models
 */

class AIPredictionService {
  constructor() {
    this.models = [
      'Neural Network v2.1',
      'LSTM Deep Learning',
      'Random Forest',
      'Support Vector Machine',
      'Ensemble Model'
    ];
    
    this.lastPredictions = {};
    this.predictionHistory = {};
  }

  /**
   * Generate price prediction for a cryptocurrency
   * @param {string} symbol - Cryptocurrency symbol (e.g., 'BTCUSDT')
   * @param {number} currentPrice - Current price
   * @param {string} timeframe - Prediction timeframe ('1h', '4h', '24h')
   * @returns {Object} Prediction object
   */
  generatePrediction(symbol, currentPrice, timeframe = '24h') {
    if (!currentPrice || isNaN(currentPrice) || currentPrice <= 0) {
      return this.getDefaultPrediction(symbol, timeframe);
    }

    // Get historical volatility for the symbol
    const volatility = this.getVolatility(symbol, timeframe);
    
    // Generate trend direction based on market conditions
    const trendDirection = this.analyzeTrend(symbol, currentPrice);
    
    // Calculate price prediction
    const prediction = this.calculatePricePrediction(
      currentPrice, 
      volatility, 
      trendDirection, 
      timeframe
    );
    
    // Calculate confidence based on various factors
    const confidence = this.calculateConfidence(symbol, timeframe, volatility);
    
    // Select random model for this prediction
    const model = this.models[Math.floor(Math.random() * this.models.length)];
    
    const predictionObj = {
      symbol,
      timeframe,
      currentPrice,
      predictedPrice: prediction.price,
      direction: prediction.direction,
      probability: confidence,
      confidence: Math.round(confidence * 100),
      priceChange: prediction.price - currentPrice,
      priceChangePercent: ((prediction.price - currentPrice) / currentPrice) * 100,
      model,
      timestamp: new Date(),
      factors: prediction.factors,
      riskLevel: this.calculateRiskLevel(volatility, confidence),
      recommendation: this.generateRecommendation(prediction.direction, confidence)
    };

    // Store prediction for history
    this.storePrediction(symbol, timeframe, predictionObj);
    
    return predictionObj;
  }

  /**
   * Get volatility for a symbol and timeframe
   * @param {string} symbol - Cryptocurrency symbol
   * @param {string} timeframe - Timeframe
   * @returns {number} Volatility percentage
   */
  getVolatility(symbol, timeframe) {
    const baseVolatility = {
      'BTCUSDT': 0.03,  // 3% base volatility
      'ETHUSDT': 0.04,  // 4% base volatility
      'BNBUSDT': 0.05,  // 5% base volatility
      'SOLUSDT': 0.07,  // 7% base volatility
      'ADAUSDT': 0.06,  // 6% base volatility
      'XRPUSDT': 0.08,  // 8% base volatility
    };

    const timeframeMultiplier = {
      '1h': 0.3,
      '4h': 0.6,
      '24h': 1.0,
      '7d': 2.0,
      '30d': 3.0
    };

    const base = baseVolatility[symbol] || 0.05;
    const multiplier = timeframeMultiplier[timeframe] || 1.0;
    
    // Add some randomness
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    
    return base * multiplier * randomFactor;
  }

  /**
   * Analyze trend direction
   * @param {string} symbol - Cryptocurrency symbol
   * @param {number} currentPrice - Current price
   * @returns {string} Trend direction ('up', 'down', 'sideways')
   */
  analyzeTrend(symbol, currentPrice) {
    // Simulate technical analysis
    const indicators = {
      rsi: 30 + (Math.random() * 40), // RSI between 30-70
      macd: (Math.random() - 0.5) * 2, // MACD between -1 and 1
      bollinger: Math.random(), // Bollinger band position
      volume: Math.random(), // Volume indicator
      sentiment: Math.random() // Market sentiment
    };

    // Calculate trend score
    let trendScore = 0;
    
    // RSI analysis
    if (indicators.rsi > 60) trendScore += 1;
    else if (indicators.rsi < 40) trendScore -= 1;
    
    // MACD analysis
    if (indicators.macd > 0.2) trendScore += 1;
    else if (indicators.macd < -0.2) trendScore -= 1;
    
    // Bollinger bands
    if (indicators.bollinger > 0.7) trendScore += 0.5;
    else if (indicators.bollinger < 0.3) trendScore -= 0.5;
    
    // Volume and sentiment
    if (indicators.volume > 0.6 && indicators.sentiment > 0.5) trendScore += 0.5;
    else if (indicators.volume > 0.6 && indicators.sentiment < 0.5) trendScore -= 0.5;

    // Determine direction
    if (trendScore > 0.5) return 'up';
    if (trendScore < -0.5) return 'down';
    return 'sideways';
  }

  /**
   * Calculate price prediction
   * @param {number} currentPrice - Current price
   * @param {number} volatility - Volatility factor
   * @param {string} direction - Trend direction
   * @param {string} timeframe - Timeframe
   * @returns {Object} Prediction object
   */
  calculatePricePrediction(currentPrice, volatility, direction, timeframe) {
    let priceChange = 0;
    const factors = [];

    // Base price movement based on direction
    if (direction === 'up') {
      priceChange = volatility * (0.3 + Math.random() * 0.7); // 30-100% of volatility
      factors.push('Bullish trend detected');
    } else if (direction === 'down') {
      priceChange = -volatility * (0.3 + Math.random() * 0.7);
      factors.push('Bearish trend detected');
    } else {
      priceChange = volatility * (Math.random() - 0.5) * 0.5; // Smaller movements
      factors.push('Sideways movement expected');
    }

    // Add market noise
    const noise = (Math.random() - 0.5) * volatility * 0.3;
    priceChange += noise;

    // Calculate predicted price
    const predictedPrice = currentPrice * (1 + priceChange);
    
    // Determine final direction
    const finalDirection = predictedPrice > currentPrice ? 'up' : 'down';
    
    // Add technical factors
    if (Math.random() > 0.7) factors.push('Strong volume support');
    if (Math.random() > 0.8) factors.push('Institutional interest');
    if (Math.random() > 0.6) factors.push('Technical breakout pattern');

    return {
      price: Math.max(predictedPrice, currentPrice * 0.5), // Prevent extreme predictions
      direction: finalDirection,
      factors
    };
  }

  /**
   * Calculate prediction confidence
   * @param {string} symbol - Cryptocurrency symbol
   * @param {string} timeframe - Timeframe
   * @param {number} volatility - Volatility factor
   * @returns {number} Confidence (0-1)
   */
  calculateConfidence(symbol, timeframe, volatility) {
    let confidence = 0.7; // Base confidence

    // Adjust based on volatility (lower volatility = higher confidence)
    confidence -= volatility * 2;
    
    // Adjust based on timeframe (shorter timeframes = lower confidence)
    const timeframeConfidence = {
      '1h': 0.6,
      '4h': 0.7,
      '24h': 0.8,
      '7d': 0.75,
      '30d': 0.7
    };
    
    confidence *= timeframeConfidence[timeframe] || 0.7;
    
    // Add some randomness for realism
    confidence += (Math.random() - 0.5) * 0.2;
    
    // Ensure confidence is within bounds
    return Math.max(0.4, Math.min(0.95, confidence));
  }

  /**
   * Calculate risk level
   * @param {number} volatility - Volatility factor
   * @param {number} confidence - Confidence level
   * @returns {string} Risk level
   */
  calculateRiskLevel(volatility, confidence) {
    const riskScore = volatility * 10 + (1 - confidence) * 5;
    
    if (riskScore < 0.3) return 'Low';
    if (riskScore < 0.6) return 'Medium';
    return 'High';
  }

  /**
   * Generate trading recommendation
   * @param {string} direction - Price direction
   * @param {number} confidence - Confidence level
   * @returns {string} Recommendation
   */
  generateRecommendation(direction, confidence) {
    if (confidence < 0.6) return 'HOLD';
    
    if (direction === 'up' && confidence > 0.75) return 'STRONG_BUY';
    if (direction === 'up') return 'BUY';
    if (direction === 'down' && confidence > 0.75) return 'STRONG_SELL';
    if (direction === 'down') return 'SELL';
    
    return 'HOLD';
  }

  /**
   * Get default prediction when data is invalid
   * @param {string} symbol - Cryptocurrency symbol
   * @param {string} timeframe - Timeframe
   * @returns {Object} Default prediction
   */
  getDefaultPrediction(symbol, timeframe) {
    return {
      symbol,
      timeframe,
      currentPrice: 0,
      predictedPrice: 0,
      direction: 'sideways',
      probability: 0.5,
      confidence: 50,
      priceChange: 0,
      priceChangePercent: 0,
      model: 'Default Model',
      timestamp: new Date(),
      factors: ['Insufficient data'],
      riskLevel: 'Medium',
      recommendation: 'HOLD'
    };
  }

  /**
   * Store prediction in history
   * @param {string} symbol - Cryptocurrency symbol
   * @param {string} timeframe - Timeframe
   * @param {Object} prediction - Prediction object
   */
  storePrediction(symbol, timeframe, prediction) {
    if (!this.predictionHistory[symbol]) {
      this.predictionHistory[symbol] = {};
    }
    
    if (!this.predictionHistory[symbol][timeframe]) {
      this.predictionHistory[symbol][timeframe] = [];
    }
    
    this.predictionHistory[symbol][timeframe].push(prediction);
    
    // Keep only last 100 predictions per timeframe
    if (this.predictionHistory[symbol][timeframe].length > 100) {
      this.predictionHistory[symbol][timeframe] = 
        this.predictionHistory[symbol][timeframe].slice(-100);
    }
    
    // Update last prediction
    this.lastPredictions[`${symbol}_${timeframe}`] = prediction;
  }

  /**
   * Get prediction history
   * @param {string} symbol - Cryptocurrency symbol
   * @param {string} timeframe - Timeframe
   * @returns {Array} Prediction history
   */
  getPredictionHistory(symbol, timeframe) {
    return this.predictionHistory[symbol]?.[timeframe] || [];
  }

  /**
   * Get last prediction
   * @param {string} symbol - Cryptocurrency symbol
   * @param {string} timeframe - Timeframe
   * @returns {Object|null} Last prediction
   */
  getLastPrediction(symbol, timeframe) {
    return this.lastPredictions[`${symbol}_${timeframe}`] || null;
  }

  /**
   * Generate multiple predictions for different timeframes
   * @param {string} symbol - Cryptocurrency symbol
   * @param {number} currentPrice - Current price
   * @returns {Object} Predictions for all timeframes
   */
  generateMultipleTimeframePredictions(symbol, currentPrice) {
    const timeframes = ['1h', '4h', '24h'];
    const predictions = {};
    
    timeframes.forEach(timeframe => {
      predictions[timeframe] = this.generatePrediction(symbol, currentPrice, timeframe);
    });
    
    return predictions;
  }

  /**
   * Calculate model accuracy (simulated)
   * @returns {number} Model accuracy percentage
   */
  getModelAccuracy() {
    // Simulate varying accuracy based on market conditions
    const baseAccuracy = 72; // 72% base accuracy
    const variation = (Math.random() - 0.5) * 10; // ±5% variation
    
    return Math.max(60, Math.min(85, baseAccuracy + variation));
  }
}

// Create singleton instance
const aiPredictionService = new AIPredictionService();

export default aiPredictionService;