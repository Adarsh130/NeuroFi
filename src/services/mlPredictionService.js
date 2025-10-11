// Simplified ML Prediction Service for demo mode
class MLPredictionService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get AI predictions for a symbol (simplified demo version)
   * @param {string} symbol - Trading pair symbol
   * @param {Array<string>} timeframes - Array of timeframes to predict
   * @returns {Promise<Object>} Predictions for each timeframe
   */
  async getPredictions(symbol, timeframes = ['1h', '4h', '24h']) {
    const cacheKey = `${symbol}_${timeframes.join('_')}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // Generate mock predictions
    const predictions = this.generateMockPredictions(symbol, timeframes);
    
    // Cache the predictions
    this.cache.set(cacheKey, {
      data: predictions,
      timestamp: Date.now()
    });

    return predictions;
  }

  /**
   * Generate mock predictions for demo
   * @param {string} symbol - Trading pair symbol
   * @param {Array<string>} timeframes - Array of timeframes
   * @returns {Object} Mock predictions
   */
  generateMockPredictions(symbol, timeframes) {
    const predictions = {};
    const basePrice = this.getBasePriceForSymbol(symbol);
    
    timeframes.forEach(timeframe => {
      const direction = Math.random() > 0.5 ? 'up' : 'down';
      const confidence = 60 + Math.random() * 30; // 60-90%
      const priceChange = 0.01 + (Math.random() * 0.05); // 1-6% change
      
      const targetPrice = direction === 'up' 
        ? basePrice * (1 + priceChange)
        : basePrice * (1 - priceChange);

      predictions[timeframe] = {
        price: targetPrice,
        direction,
        probability: confidence / 100,
        confidence: Math.round(confidence),
        signals: {
          bullish: Math.round(Math.random() * 5),
          bearish: Math.round(Math.random() * 5),
          rsi: 30 + (Math.random() * 40), // 30-70
          macd: (Math.random() - 0.5) * 2, // -1 to 1
          volumeRatio: 0.5 + (Math.random() * 1.5) // 0.5-2.0
        }
      };
    });
    
    return predictions;
  }

  /**
   * Get base price for symbol (mock data)
   */
  getBasePriceForSymbol(symbol) {
    const prices = {
      'BTCUSDT': 43250,
      'ETHUSDT': 2650,
      'BNBUSDT': 310,
      'SOLUSDT': 98,
      'XRPUSDT': 0.52,
      'ADAUSDT': 0.45,
      'DOTUSDT': 7.2,
      'LINKUSDT': 14.5
    };
    
    return prices[symbol] || 100; // Default price
  }

  /**
   * Generate AI recommendations (simplified demo version)
   * @param {Array<string>} symbols - Array of symbols to analyze
   * @returns {Promise<Array>} Array of recommendations
   */
  async generateRecommendations(symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']) {
    const recommendations = [];
    
    for (const symbol of symbols.slice(0, 3)) { // Limit to 3 recommendations
      try {
        const predictions = await this.getPredictions(symbol, ['1h', '4h', '24h']);
        const currentPrice = this.getBasePriceForSymbol(symbol);
        
        // Analyze predictions to generate recommendation
        const recommendation = this.analyzeForRecommendation(
          symbol,
          currentPrice,
          predictions
        );
        
        if (recommendation) {
          recommendations.push(recommendation);
        }
      } catch (error) {
        console.error(`Error generating recommendation for ${symbol}:`, error);
      }
    }
    
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze predictions to generate trading recommendation
   */
  analyzeForRecommendation(symbol, currentPrice, predictions) {
    const timeframes = Object.keys(predictions);
    let bullishCount = 0;
    let bearishCount = 0;
    let totalConfidence = 0;
    
    // Analyze all timeframes
    timeframes.forEach(tf => {
      const pred = predictions[tf];
      if (pred.direction === 'up') bullishCount++;
      else bearishCount++;
      totalConfidence += pred.confidence;
    });
    
    const avgConfidence = totalConfidence / timeframes.length;
    
    // Determine action
    let action = 'HOLD';
    if (bullishCount > bearishCount && avgConfidence > 65) {
      action = 'BUY';
    } else if (bearishCount > bullishCount && avgConfidence > 65) {
      action = 'SELL';
    }
    
    if (action === 'HOLD') return null; // Don't recommend holds
    
    // Calculate target and stop loss
    const mainPrediction = predictions['4h'] || predictions['1h'];
    const targetPrice = mainPrediction.price;
    const stopLoss = action === 'BUY' 
      ? currentPrice * 0.95  // 5% stop loss
      : currentPrice * 1.05;
    
    // Determine risk level
    const riskLevel = avgConfidence > 80 ? 'Low' : 
                     avgConfidence > 65 ? 'Medium' : 'High';
    
    // Generate reasoning
    const reasoning = this.generateReasoning(symbol, action, predictions, avgConfidence);
    
    return {
      id: `${symbol}_${Date.now()}`,
      symbol,
      action,
      targetPrice: parseFloat(targetPrice.toFixed(2)),
      stopLoss: parseFloat(stopLoss.toFixed(2)),
      confidence: Math.round(avgConfidence),
      riskLevel,
      timeframe: '4h',
      reasoning,
      timestamp: new Date().toISOString(),
      predictions
    };
  }

  /**
   * Generate human-readable reasoning for recommendation
   */
  generateReasoning(symbol, action, predictions, confidence) {
    const crypto = symbol.replace('USDT', '');
    const mainPred = predictions['4h'] || predictions['1h'];
    const signals = mainPred.signals;
    
    let reasoning = `AI analysis suggests a ${action.toLowerCase()} signal for ${crypto} with ${confidence.toFixed(0)}% confidence. `;
    
    if (signals.rsi < 30) {
      reasoning += 'RSI indicates oversold conditions, suggesting potential upward movement. ';
    } else if (signals.rsi > 70) {
      reasoning += 'RSI shows overbought conditions, indicating possible correction. ';
    }
    
    if (signals.volumeRatio > 1.5) {
      reasoning += 'Above-average trading volume confirms the signal strength. ';
    }
    
    if (signals.macd > 0) {
      reasoning += 'MACD shows bullish momentum. ';
    } else {
      reasoning += 'MACD indicates bearish momentum. ';
    }
    
    reasoning += `Technical analysis across multiple timeframes supports this ${action.toLowerCase()} recommendation.`;
    
    return reasoning;
  }

  /**
   * Clear prediction cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Create and export singleton instance
const mlPredictionService = new MLPredictionService();
export default mlPredictionService;