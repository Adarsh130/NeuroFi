import apiClient from './apiClient';
import mockMarketService from './mockMarketService';

class BinanceService {
  constructor() {
    this.api = apiClient;
  }

  /**
   * Get current price for a symbol
   * @param {string} symbol - Trading pair symbol (e.g., 'BTCUSDT')
   * @returns {Promise<Object>} Price data
   */
  async getPrice(symbol) {
    try {
      const data = await this.api.getCurrentPrice(symbol);
      return {
        symbol: data.symbol,
        price: parseFloat(data.price)
      };
    } catch (error) {
      console.error('Error fetching price:', error);
      // Fallback to direct Binance API if backend is not available
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        const fallbackData = await response.json();
        return {
          symbol: fallbackData.symbol,
          price: parseFloat(fallbackData.price)
        };
      } catch (fallbackError) {
        throw new Error('Failed to fetch price data from all sources');
      }
    }
  }

  /**
   * Get 24hr ticker statistics
   * @param {string} symbol - Trading pair symbol (optional)
   * @returns {Promise<Object|Array>} Ticker data
   */
  async getTicker24hr(symbol = null) {
    try {
      return await this.api.getTicker24hr(symbol);
    } catch (error) {
      console.warn('Backend ticker API failed, using mock data:', error.message);
      // Fallback to mock data
      if (symbol) {
        return await mockMarketService.getTicker24hr(symbol);
      } else {
        // Return mock data for popular symbols
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
        return await mockMarketService.getMultipleMarketData(symbols);
      }
    }
  }

  /**
   * Get kline/candlestick data
   * @param {string} symbol - Trading pair symbol
   * @param {string} interval - Kline interval (1m, 5m, 1h, 1d, etc.)
   * @param {number} limit - Number of klines to return (max 1000)
   * @returns {Promise<Array>} Kline data
   */
  async getKlines(symbol, interval = '1h', limit = 100) {
    try {
      return await this.api.getKlines(symbol, interval, limit);
    } catch (error) {
      console.warn('Backend klines API failed, using mock data:', error.message);
      // Fallback to mock data
      return await mockMarketService.getKlines(symbol, interval, limit);
    }
  }

  /**
   * Get order book depth
   * @param {string} symbol - Trading pair symbol
   * @param {number} limit - Number of entries to return (5, 10, 20, 50, 100, 500, 1000, 5000)
   * @returns {Promise<Object>} Order book data
   */
  async getOrderBook(symbol, limit = 100) {
    try {
      return await this.api.getOrderBook(symbol, limit);
    } catch (error) {
      console.warn('Backend order book API failed, using mock data:', error.message);
      // Fallback to mock data
      return await mockMarketService.getOrderBook(symbol, limit);
    }
  }

  /**
   * Get exchange information
   * @returns {Promise<Object>} Exchange info
   */
  async getExchangeInfo() {
    try {
      return await this.api.getExchangeInfo();
    } catch (error) {
      console.error('Error fetching exchange info:', error);
      throw new Error('Failed to fetch exchange information');
    }
  }

  /**
   * Get top trading pairs by volume
   * @param {number} limit - Number of pairs to return
   * @returns {Promise<Array>} Top trading pairs
   */
  async getTopPairs(limit = 10) {
    try {
      return await this.api.getTopPairs(limit, 'USDT');
    } catch (error) {
      console.warn('Backend top pairs API failed, using mock data:', error.message);
      // Fallback to mock data
      return await mockMarketService.getTopPairs(limit);
    }
  }

  /**
   * Get market data for multiple symbols
   * @param {Array<string>} symbols - Array of trading pair symbols
   * @returns {Promise<Array>} Market data for symbols
   */
  async getMultipleMarketData(symbols) {
    try {
      return await this.api.getMultipleMarketData(symbols);
    } catch (error) {
      console.warn('Backend multiple market data API failed, using mock data:', error.message);
      // Fallback to mock data
      return await mockMarketService.getMultipleMarketData(symbols);
    }
  }

  /**
   * Get recent trades for a symbol
   * @param {string} symbol - Trading pair symbol (e.g., 'btcusdt')
   * @param {number} limit - Number of trades to return (max 1000)
   * @returns {Promise<Array>} Recent trades
   */
  async getRecentTrades(symbol, limit = 100) {
    try {
      return await this.api.getRecentTrades(symbol, limit);
    } catch (error) {
      console.warn('Backend recent trades API failed, using mock data:', error.message);
      // Fallback to mock data
      return await mockMarketService.getRecentTrades(symbol, limit);
    }
  }
}

// Create and export a singleton instance
const binanceService = new BinanceService();
export default binanceService;