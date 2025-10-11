import axios from 'axios';
import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class MLService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds for ML operations
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          authService.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get sentiment analysis for cryptocurrencies
   * @param {Array<string>} symbols - Array of cryptocurrency symbols
   * @param {Array<string>} sources - Data sources to analyze
   * @returns {Promise<Array>} Sentiment analysis results
   */
  async getSentimentAnalysis(symbols, sources = ['news', 'social']) {
    try {
      const symbolsParam = Array.isArray(symbols) ? symbols.join(',') : symbols;
      const sourcesParam = Array.isArray(sources) ? sources.join(',') : sources;
      
      const response = await this.api.get('/ml/sentiment', {
        params: {
          symbols: symbolsParam,
          sources: sourcesParam
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to get sentiment analysis');
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get price predictions for cryptocurrencies
   * @param {Array<string>} symbols - Array of cryptocurrency symbols
   * @param {string} timeframe - Prediction timeframe
   * @returns {Promise<Array>} Price prediction results
   */
  async getPricePredictions(symbols, timeframe = '1d') {
    try {
      const symbolsParam = Array.isArray(symbols) ? symbols.join(',') : symbols;
      
      const response = await this.api.get('/ml/predictions', {
        params: {
          symbols: symbolsParam,
          timeframe
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to get price predictions');
    } catch (error) {
      console.error('Price prediction error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get AI recommendations for cryptocurrencies
   * @param {Array<string>} symbols - Array of cryptocurrency symbols
   * @param {string} riskLevel - Risk level (low, medium, high)
   * @returns {Promise<Array>} AI recommendation results
   */
  async getAIRecommendations(symbols, riskLevel = 'medium') {
    try {
      const symbolsParam = Array.isArray(symbols) ? symbols.join(',') : symbols;
      
      const response = await this.api.get('/ml/recommendations', {
        params: {
          symbols: symbolsParam,
          riskLevel
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to get AI recommendations');
    } catch (error) {
      console.error('AI recommendations error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get technical analysis for a cryptocurrency
   * @param {string} symbol - Cryptocurrency symbol
   * @param {string} interval - Data interval
   * @param {string} period - Analysis period
   * @returns {Promise<Object>} Technical analysis results
   */
  async getTechnicalAnalysis(symbol, interval = '1h', period = '30d') {
    try {
      const response = await this.api.get(`/ml/technical-analysis/${symbol}`, {
        params: {
          interval,
          period
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to get technical analysis');
    } catch (error) {
      console.error('Technical analysis error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get ML service health status
   * @returns {Promise<Object>} Health status
   */
  async getHealthStatus() {
    try {
      const response = await this.api.get('/ml/health');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return { status: 'unknown' };
    } catch (error) {
      console.error('ML health check error:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Get model status (admin only)
   * @returns {Promise<Object>} Model status
   */
  async getModelStatus() {
    try {
      const response = await this.api.get('/ml/model-status');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to get model status');
    } catch (error) {
      console.error('Model status error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Train model (admin only)
   * @param {string} modelType - Type of model to train
   * @param {Array<string>} symbols - Symbols to train on
   * @param {Object} parameters - Training parameters
   * @returns {Promise<Object>} Training response
   */
  async trainModel(modelType, symbols, parameters = {}) {
    try {
      const response = await this.api.post('/ml/train', {
        modelType,
        symbols,
        parameters
      });
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to start model training');
    } catch (error) {
      console.error('Model training error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get comprehensive analysis for a symbol
   * @param {string} symbol - Cryptocurrency symbol
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Comprehensive analysis
   */
  async getComprehensiveAnalysis(symbol, options = {}) {
    try {
      const {
        includeSentiment = true,
        includePrediction = true,
        includeTechnical = true,
        timeframe = '1d',
        riskLevel = 'medium'
      } = options;

      const promises = [];
      const results = {};

      // Sentiment analysis
      if (includeSentiment) {
        promises.push(
          this.getSentimentAnalysis([symbol])
            .then(data => ({ sentiment: data[0] }))
            .catch(error => ({ sentimentError: error.message }))
        );
      }

      // Price prediction
      if (includePrediction) {
        promises.push(
          this.getPricePredictions([symbol], timeframe)
            .then(data => ({ prediction: data[0] }))
            .catch(error => ({ predictionError: error.message }))
        );
      }

      // Technical analysis
      if (includeTechnical) {
        promises.push(
          this.getTechnicalAnalysis(symbol)
            .then(data => ({ technical: data }))
            .catch(error => ({ technicalError: error.message }))
        );
      }

      // AI recommendation
      promises.push(
        this.getAIRecommendations([symbol], riskLevel)
          .then(data => ({ recommendation: data[0] }))
          .catch(error => ({ recommendationError: error.message }))
      );

      const analysisResults = await Promise.all(promises);
      
      // Merge all results
      analysisResults.forEach(result => {
        Object.assign(results, result);
      });

      return {
        symbol,
        timestamp: new Date().toISOString(),
        ...results
      };

    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get batch analysis for multiple symbols
   * @param {Array<string>} symbols - Array of cryptocurrency symbols
   * @param {Object} options - Analysis options
   * @returns {Promise<Array>} Batch analysis results
   */
  async getBatchAnalysis(symbols, options = {}) {
    try {
      const {
        includeSentiment = true,
        includePrediction = true,
        timeframe = '1d',
        riskLevel = 'medium'
      } = options;

      const promises = [];

      // Sentiment analysis for all symbols
      if (includeSentiment) {
        promises.push(
          this.getSentimentAnalysis(symbols)
            .catch(error => ({ sentimentError: error.message }))
        );
      }

      // Price predictions for all symbols
      if (includePrediction) {
        promises.push(
          this.getPricePredictions(symbols, timeframe)
            .catch(error => ({ predictionError: error.message }))
        );
      }

      // AI recommendations for all symbols
      promises.push(
        this.getAIRecommendations(symbols, riskLevel)
          .catch(error => ({ recommendationError: error.message }))
      );

      const [sentimentData, predictionData, recommendationData] = await Promise.all(promises);

      // Combine results by symbol
      const results = symbols.map(symbol => {
        const result = { symbol, timestamp: new Date().toISOString() };

        if (Array.isArray(sentimentData)) {
          result.sentiment = sentimentData.find(item => item.symbol === symbol);
        }

        if (Array.isArray(predictionData)) {
          result.prediction = predictionData.find(item => item.symbol === symbol);
        }

        if (Array.isArray(recommendationData)) {
          result.recommendation = recommendationData.find(item => item.symbol === symbol);
        }

        return result;
      });

      return results;

    } catch (error) {
      console.error('Batch analysis error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - API error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response?.status === 503) {
      return new Error('ML service is currently unavailable. Please try again later.');
    } else if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.response?.data?.detail) {
      return new Error(error.response.data.detail);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('An unexpected error occurred');
    }
  }
}

// Create and export singleton instance
const mlService = new MLService();
export default mlService;