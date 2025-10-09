import axios from 'axios';

const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

class BinanceService {
  constructor() {
    this.api = axios.create({
      baseURL: BINANCE_BASE_URL,
      timeout: 10000,
    });
  }

  /**
   * Get current price for a symbol
   * @param {string} symbol - Trading pair symbol (e.g., 'BTCUSDT')
   * @returns {Promise<Object>} Price data
   */
  async getPrice(symbol) {
    try {
      const response = await this.api.get('/ticker/price', {
        params: { symbol }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching price:', error);
      throw new Error('Failed to fetch price data');
    }
  }

  /**
   * Get 24hr ticker statistics
   * @param {string} symbol - Trading pair symbol (optional)
   * @returns {Promise<Object|Array>} Ticker data
   */
  async getTicker24hr(symbol = null) {
    try {
      const params = symbol ? { symbol } : {};
      const response = await this.api.get('/ticker/24hr', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching 24hr ticker:', error);
      throw new Error('Failed to fetch ticker data');
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
      const response = await this.api.get('/klines', {
        params: {
          symbol,
          interval,
          limit
        }
      });
      
      // Transform the data to a more usable format
      return response.data.map(kline => ({
        openTime: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        closeTime: kline[6],
        quoteAssetVolume: parseFloat(kline[7]),
        numberOfTrades: kline[8],
        takerBuyBaseAssetVolume: parseFloat(kline[9]),
        takerBuyQuoteAssetVolume: parseFloat(kline[10])
      }));
    } catch (error) {
      console.error('Error fetching klines:', error);
      throw new Error('Failed to fetch kline data');
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
      const response = await this.api.get('/depth', {
        params: {
          symbol,
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order book:', error);
      throw new Error('Failed to fetch order book data');
    }
  }

  /**
   * Get exchange information
   * @returns {Promise<Object>} Exchange info
   */
  async getExchangeInfo() {
    try {
      const response = await this.api.get('/exchangeInfo');
      return response.data;
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
      const tickers = await this.getTicker24hr();
      
      // Filter USDT pairs and sort by volume
      const usdtPairs = tickers
        .filter(ticker => ticker.symbol.endsWith('USDT'))
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, limit);
      
      return usdtPairs.map(ticker => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.lastPrice),
        change: parseFloat(ticker.priceChange),
        changePercent: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.volume),
        quoteVolume: parseFloat(ticker.quoteVolume),
        high: parseFloat(ticker.highPrice),
        low: parseFloat(ticker.lowPrice),
        count: ticker.count
      }));
    } catch (error) {
      console.error('Error fetching top pairs:', error);
      throw new Error('Failed to fetch top trading pairs');
    }
  }

  /**
   * Get market data for multiple symbols
   * @param {Array<string>} symbols - Array of trading pair symbols
   * @returns {Promise<Array>} Market data for symbols
   */
  async getMultipleMarketData(symbols) {
    try {
      const promises = symbols.map(symbol => this.getTicker24hr(symbol));
      const results = await Promise.all(promises);
      
      return results.map(ticker => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.lastPrice),
        change: parseFloat(ticker.priceChange),
        changePercent: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.volume),
        quoteVolume: parseFloat(ticker.quoteVolume),
        high: parseFloat(ticker.highPrice),
        low: parseFloat(ticker.lowPrice),
        openPrice: parseFloat(ticker.openPrice),
        prevClosePrice: parseFloat(ticker.prevClosePrice),
        count: ticker.count
      }));
    } catch (error) {
      console.error('Error fetching multiple market data:', error);
      throw new Error('Failed to fetch market data');
    }
  }

  /**
   * Get recent trades for a symbol
   * @param {string} symbol - Trading pair symbol
   * @param {number} limit - Number of trades to return (max 1000)
   * @returns {Promise<Array>} Recent trades
   */
  async getRecentTrades(symbol, limit = 100) {
    try {
      const response = await this.api.get('/trades', {
        params: {
          symbol,
          limit
        }
      });
      
      return response.data.map(trade => ({
        id: trade.id,
        price: parseFloat(trade.price),
        qty: parseFloat(trade.qty),
        quoteQty: parseFloat(trade.quoteQty),
        time: trade.time,
        isBuyerMaker: trade.isBuyerMaker,
        isBestMatch: trade.isBestMatch
      }));
    } catch (error) {
      console.error('Error fetching recent trades:', error);
      throw new Error('Failed to fetch recent trades');
    }
  }
}

// Create and export a singleton instance
const binanceService = new BinanceService();
export default binanceService;