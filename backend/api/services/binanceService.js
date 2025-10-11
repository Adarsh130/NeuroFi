import axios from 'axios';
import Crypto from '../models/Crypto.js';

class BinanceService {
  constructor() {
    this.baseURL = 'https://api.binance.com/api/v3';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000
    });
    
    // Supported cryptocurrencies
    this.supportedCryptos = [
      { symbol: 'BTCUSDT', name: 'Bitcoin' },
      { symbol: 'ETHUSDT', name: 'Ethereum' },
      { symbol: 'BNBUSDT', name: 'Binance Coin' },
      { symbol: 'SOLUSDT', name: 'Solana' },
      { symbol: 'ADAUSDT', name: 'Cardano' },
      { symbol: 'XRPUSDT', name: 'XRP' },
      { symbol: 'DOTUSDT', name: 'Polkadot' },
      { symbol: 'LINKUSDT', name: 'Chainlink' },
      { symbol: 'LTCUSDT', name: 'Litecoin' },
      { symbol: 'BCHUSDT', name: 'Bitcoin Cash' },
      { symbol: 'UNIUSDT', name: 'Uniswap' },
      { symbol: 'MATICUSDT', name: 'Polygon' },
      { symbol: 'AVAXUSDT', name: 'Avalanche' },
      { symbol: 'ATOMUSDT', name: 'Cosmos' },
      { symbol: 'FTMUSDT', name: 'Fantom' }
    ];
  }

  /**
   * Get current price for a symbol
   */
  async getCurrentPrice(symbol) {
    try {
      const response = await this.api.get('/ticker/price', {
        params: { symbol }
      });
      return parseFloat(response.data.price);
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get 24hr ticker statistics
   */
  async get24hrTicker(symbol) {
    try {
      const response = await this.api.get('/ticker/24hr', {
        params: { symbol }
      });
      
      const data = response.data;
      return {
        symbol: data.symbol,
        currentPrice: parseFloat(data.lastPrice),
        priceChange24h: parseFloat(data.priceChange),
        priceChangePercentage24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        volume24h: parseFloat(data.volume),
        quoteVolume24h: parseFloat(data.quoteVolume),
        openPrice: parseFloat(data.openPrice),
        count: parseInt(data.count)
      };
    } catch (error) {
      console.error(`Error fetching 24hr ticker for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all 24hr tickers for supported cryptos
   */
  async getAllTickers() {
    try {
      const response = await this.api.get('/ticker/24hr');
      const allTickers = response.data;
      
      // Filter for supported cryptos
      const supportedSymbols = this.supportedCryptos.map(c => c.symbol);
      const filteredTickers = allTickers.filter(ticker => 
        supportedSymbols.includes(ticker.symbol)
      );
      
      return filteredTickers.map(data => ({
        symbol: data.symbol,
        currentPrice: parseFloat(data.lastPrice),
        priceChange24h: parseFloat(data.priceChange),
        priceChangePercentage24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        volume24h: parseFloat(data.volume),
        quoteVolume24h: parseFloat(data.quoteVolume),
        openPrice: parseFloat(data.openPrice),
        count: parseInt(data.count)
      }));
    } catch (error) {
      console.error('Error fetching all tickers:', error.message);
      throw error;
    }
  }

  /**
   * Get kline/candlestick data
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
      
      return response.data.map(kline => ({
        openTime: parseInt(kline[0]),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        closeTime: parseInt(kline[6]),
        quoteAssetVolume: parseFloat(kline[7]),
        numberOfTrades: parseInt(kline[8]),
        takerBuyBaseAssetVolume: parseFloat(kline[9]),
        takerBuyQuoteAssetVolume: parseFloat(kline[10])
      }));
    } catch (error) {
      console.error(`Error fetching klines for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get order book depth
   */
  async getOrderBook(symbol, limit = 100) {
    try {
      const response = await this.api.get('/depth', {
        params: { symbol, limit }
      });
      
      return {
        lastUpdateId: response.data.lastUpdateId,
        bids: response.data.bids.map(bid => ({
          price: parseFloat(bid[0]),
          quantity: parseFloat(bid[1])
        })),
        asks: response.data.asks.map(ask => ({
          price: parseFloat(ask[0]),
          quantity: parseFloat(ask[1])
        }))
      };
    } catch (error) {
      console.error(`Error fetching order book for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Update database with latest crypto data
   */
  async updateCryptoData() {
    try {
      console.log('🔄 Updating crypto data from Binance...');
      
      for (const crypto of this.supportedCryptos) {
        try {
          const tickerData = await this.get24hrTicker(crypto.symbol);
          
          await Crypto.findOneAndUpdate(
            { symbol: crypto.symbol },
            {
              $set: {
                symbol: crypto.symbol,
                name: crypto.name,
                currentPrice: tickerData.currentPrice,
                priceChange24h: tickerData.priceChange24h,
                priceChangePercentage24h: tickerData.priceChangePercentage24h,
                high24h: tickerData.high24h,
                low24h: tickerData.low24h,
                volume24h: tickerData.volume24h,
                lastUpdated: new Date(),
                updatedAt: new Date()
              },
              $push: {
                priceHistory: {
                  $each: [{
                    timestamp: new Date(),
                    price: tickerData.currentPrice,
                    volume: tickerData.volume24h
                  }],
                  $slice: -1000 // Keep only last 1000 entries
                }
              },
              $setOnInsert: {
                createdAt: new Date(),
                predictions: [],
                marketCap: null,
                circulatingSupply: null,
                totalSupply: null,
                maxSupply: null,
                ath: null,
                athDate: null,
                atl: null,
                atlDate: null
              }
            },
            { 
              upsert: true, 
              new: true
            }
          );
          
          console.log(`✅ Updated ${crypto.symbol}: $${tickerData.currentPrice}`);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Failed to update ${crypto.symbol}:`, error.message);
        }
      }
      
      console.log('✅ Crypto data update completed');
    } catch (error) {
      console.error('❌ Error updating crypto data:', error.message);
      throw error;
    }
  }

  /**
   * Get supported cryptocurrencies
   */
  getSupportedCryptos() {
    return this.supportedCryptos;
  }

  /**
   * Check if symbol is supported
   */
  isSupported(symbol) {
    return this.supportedCryptos.some(crypto => crypto.symbol === symbol);
  }

  /**
   * Get crypto name by symbol
   */
  getCryptoName(symbol) {
    const crypto = this.supportedCryptos.find(c => c.symbol === symbol);
    return crypto ? crypto.name : symbol;
  }

  /**
   * Start real-time price updates
   */
  startPriceUpdates(intervalMinutes = 1) {
    console.log(`🚀 Starting price updates every ${intervalMinutes} minute(s)`);
    
    // Initial update
    this.updateCryptoData();
    
    // Set interval for updates
    setInterval(() => {
      this.updateCryptoData();
    }, intervalMinutes * 60 * 1000);
  }
}

export default new BinanceService();