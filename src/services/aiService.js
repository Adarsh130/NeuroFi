import axios from 'axios';

// This would be your AI backend URL in production
const AI_BASE_URL = process.env.REACT_APP_AI_API_URL || 'http://localhost:5000/api';

class AIService {
  constructor() {
    this.api = axios.create({
      baseURL: AI_BASE_URL,
      timeout: 30000, // AI requests might take longer
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('neurofi-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get AI trading recommendations
   * @param {Object} params - Parameters for recommendations
   * @param {Array<string>} params.symbols - Trading pair symbols
   * @param {string} params.timeframe - Analysis timeframe (1h, 4h, 1d, etc.)
   * @param {number} params.riskLevel - Risk level (1-10)
   * @returns {Promise<Array>} AI recommendations
   */
  async getRecommendations(params = {}) {
    try {
      const response = await this.api.post('/recommendations', {
        symbols: params.symbols || ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
        timeframe: params.timeframe || '4h',
        riskLevel: params.riskLevel || 5,
        includeReasoning: true,
        ...params
      });
      
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      
      // Return mock data for development
      return this.getMockRecommendations();
    }
  }

  /**
   * Get price predictions for symbols
   * @param {Array<string>} symbols - Trading pair symbols
   * @param {Array<string>} timeframes - Prediction timeframes
   * @returns {Promise<Object>} Price predictions
   */
  async getPricePredictions(symbols, timeframes = ['1h', '4h', '1d']) {
    try {
      const response = await this.api.post('/predictions', {
        symbols,
        timeframes,
        includeConfidence: true
      });
      
      return response.data.predictions || {};
    } catch (error) {
      console.error('Error fetching price predictions:', error);
      
      // Return mock data for development
      return this.getMockPredictions(symbols, timeframes);
    }
  }

  /**
   * Analyze market sentiment and generate insights
   * @param {Object} params - Analysis parameters
   * @returns {Promise<Object>} Market analysis
   */
  async getMarketAnalysis(params = {}) {
    try {
      const response = await this.api.post('/analysis', {
        includeTA: true, // Technical Analysis
        includeSentiment: true,
        includeNews: true,
        timeframe: params.timeframe || '1d',
        ...params
      });
      
      return response.data.analysis || {};
    } catch (error) {
      console.error('Error fetching market analysis:', error);
      
      // Return mock data for development
      return this.getMockAnalysis();
    }
  }

  /**
   * Get AI model performance metrics
   * @returns {Promise<Object>} Performance metrics
   */
  async getModelPerformance() {
    try {
      const response = await this.api.get('/performance');
      return response.data.performance || {};
    } catch (error) {
      console.error('Error fetching model performance:', error);
      
      // Return mock data for development
      return {
        accuracy: 87.3,
        precision: 84.1,
        recall: 89.7,
        f1Score: 86.8,
        totalPredictions: 15420,
        correctPredictions: 13462,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Submit feedback on AI recommendations
   * @param {string} recommendationId - ID of the recommendation
   * @param {Object} feedback - Feedback data
   * @returns {Promise<Object>} Feedback response
   */
  async submitFeedback(recommendationId, feedback) {
    try {
      const response = await this.api.post('/feedback', {
        recommendationId,
        feedback: {
          helpful: feedback.helpful,
          accuracy: feedback.accuracy,
          comments: feedback.comments,
          outcome: feedback.outcome, // 'profit', 'loss', 'neutral'
          ...feedback
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw new Error('Failed to submit feedback');
    }
  }

  /**
   * Get personalized AI insights based on user portfolio
   * @param {Object} portfolio - User portfolio data
   * @returns {Promise<Object>} Personalized insights
   */
  async getPersonalizedInsights(portfolio) {
    try {
      const response = await this.api.post('/insights', {
        portfolio,
        includeRiskAnalysis: true,
        includeOptimization: true
      });
      
      return response.data.insights || {};
    } catch (error) {
      console.error('Error fetching personalized insights:', error);
      
      // Return mock data for development
      return {
        riskScore: 65,
        diversificationScore: 72,
        recommendations: [
          'Consider reducing exposure to high-risk assets',
          'Add more stablecoins for better balance',
          'Monitor Bitcoin correlation with portfolio'
        ],
        optimizationSuggestions: [
          {
            action: 'rebalance',
            description: 'Rebalance portfolio to reduce risk',
            impact: 'Reduce risk score by 10 points'
          }
        ]
      };
    }
  }

  // Mock data methods for development
  getMockRecommendations() {
    return [
      {
        id: '1',
        symbol: 'BTCUSDT',
        action: 'BUY',
        confidence: 85,
        targetPrice: '45000',
        stopLoss: '41000',
        reasoning: 'Strong bullish momentum with high volume support. Technical indicators suggest continued upward movement.',
        timeframe: '1-3 days',
        riskLevel: 'Medium',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        symbol: 'ETHUSDT',
        action: 'HOLD',
        confidence: 72,
        targetPrice: '2800',
        stopLoss: '2500',
        reasoning: 'Consolidation phase expected. Wait for clear breakout above resistance.',
        timeframe: '3-7 days',
        riskLevel: 'Low',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        symbol: 'ADAUSDT',
        action: 'SELL',
        confidence: 68,
        targetPrice: '0.42',
        stopLoss: '0.47',
        reasoning: 'Bearish divergence detected. Potential downside movement expected.',
        timeframe: '1-2 days',
        riskLevel: 'High',
        createdAt: new Date().toISOString()
      }
    ];
  }

  getMockPredictions(symbols, timeframes) {
    const predictions = {};
    
    symbols.forEach(symbol => {
      predictions[symbol] = {};
      timeframes.forEach(timeframe => {
        const basePrice = symbol === 'BTCUSDT' ? 43250 : 
                         symbol === 'ETHUSDT' ? 2650 : 0.45;
        
        predictions[symbol][timeframe] = {
          price: basePrice * (1 + (Math.random() - 0.5) * 0.1),
          direction: Math.random() > 0.5 ? 'up' : 'down',
          probability: 0.5 + Math.random() * 0.4,
          confidence: 60 + Math.random() * 30
        };
      });
    });
    
    return predictions;
  }

  getMockAnalysis() {
    return {
      marketTrend: 'bullish',
      volatility: 'medium',
      sentiment: 'positive',
      technicalIndicators: {
        rsi: 65,
        macd: 'bullish',
        movingAverages: 'bullish',
        support: 42000,
        resistance: 45000
      },
      newsImpact: 'positive',
      riskFactors: [
        'Regulatory uncertainty',
        'Market volatility',
        'Macroeconomic factors'
      ],
      opportunities: [
        'Strong institutional adoption',
        'Positive regulatory developments',
        'Technical breakout patterns'
      ]
    };
  }
}

// Create and export a singleton instance
const aiService = new AIService();
export default aiService;