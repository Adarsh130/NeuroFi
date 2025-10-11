// Mock market data service for when backend is not available
class MockMarketService {
  constructor() {
    this.basePrice = {
      BTCUSDT: 43000,
      ETHUSDT: 2600,
      BNBUSDT: 300,
      SOLUSDT: 95,
      ADAUSDT: 0.45,
      XRPUSDT: 0.52,
      DOTUSDT: 7.2,
      LINKUSDT: 14.5
    };
  }

  // Generate realistic price with small variations
  generatePrice(symbol, basePrice) {
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    return basePrice * (1 + variation);
  }

  // Generate mock kline data
  generateKlineData(symbol, interval, limit = 100) {
    const data = [];
    const now = Date.now();
    const intervalMs = this.getIntervalMs(interval);
    const basePrice = this.basePrice[symbol] || 100;

    let currentPrice = basePrice;

    for (let i = limit - 1; i >= 0; i--) {
      const openTime = now - (i * intervalMs);
      const closeTime = openTime + intervalMs - 1;

      // Generate OHLC data with realistic movements
      const open = currentPrice;
      const volatility = 0.02; // 2% volatility
      const change = (Math.random() - 0.5) * volatility;
      
      const high = open * (1 + Math.abs(change) + Math.random() * 0.01);
      const low = open * (1 - Math.abs(change) - Math.random() * 0.01);
      const close = open * (1 + change);
      
      const volume = Math.random() * 1000 + 100;

      data.push({
        openTime,
        open,
        high,
        low,
        close,
        volume,
        closeTime,
        quoteAssetVolume: volume * ((open + close) / 2),
        numberOfTrades: Math.floor(Math.random() * 100) + 10,
        takerBuyBaseAssetVolume: volume * 0.6,
        takerBuyQuoteAssetVolume: volume * ((open + close) / 2) * 0.6
      });

      currentPrice = close;
    }

    return data;
  }

  // Get interval in milliseconds
  getIntervalMs(interval) {
    const intervals = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000
    };
    return intervals[interval] || intervals['1h'];
  }

  // Generate mock ticker data
  generateTickerData(symbol) {
    const basePrice = this.basePrice[symbol] || 100;
    const currentPrice = this.generatePrice(symbol, basePrice);
    const change = (currentPrice - basePrice) / basePrice;
    const changePercent = change * 100;

    return {
      symbol,
      price: currentPrice,
      priceChange: currentPrice - basePrice,
      priceChangePercent: changePercent,
      weightedAvgPrice: currentPrice * 0.99,
      prevClosePrice: basePrice,
      lastPrice: currentPrice,
      lastQty: Math.random() * 10,
      bidPrice: currentPrice * 0.999,
      askPrice: currentPrice * 1.001,
      openPrice: basePrice,
      highPrice: currentPrice * 1.02,
      lowPrice: currentPrice * 0.98,
      volume: Math.random() * 10000 + 1000,
      quoteVolume: (Math.random() * 10000 + 1000) * currentPrice,
      openTime: Date.now() - 24 * 60 * 60 * 1000,
      closeTime: Date.now(),
      firstId: 1,
      lastId: 1000,
      count: 1000
    };
  }

  // Mock API methods
  async getKlines(symbol, interval = '1h', limit = 100) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.generateKlineData(symbol, interval, limit);
  }

  async getTicker24hr(symbol) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.generateTickerData(symbol);
  }

  async getPrice(symbol) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    const basePrice = this.basePrice[symbol] || 100;
    return {
      symbol,
      price: this.generatePrice(symbol, basePrice)
    };
  }

  async getMultipleMarketData(symbols) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return symbols.map(symbol => this.generateTickerData(symbol));
  }

  async getOrderBook(symbol, limit = 100) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const basePrice = this.basePrice[symbol] || 100;
    const currentPrice = this.generatePrice(symbol, basePrice);

    const bids = [];
    const asks = [];

    for (let i = 0; i < limit; i++) {
      bids.push([
        (currentPrice * (1 - (i + 1) * 0.001)).toFixed(8),
        (Math.random() * 10).toFixed(8)
      ]);
      asks.push([
        (currentPrice * (1 + (i + 1) * 0.001)).toFixed(8),
        (Math.random() * 10).toFixed(8)
      ]);
    }

    return {
      lastUpdateId: Date.now(),
      bids,
      asks
    };
  }

  async getTopPairs(limit = 10) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    const symbols = Object.keys(this.basePrice).slice(0, limit);
    return symbols.map(symbol => this.generateTickerData(symbol));
  }

  async getRecentTrades(symbol, limit = 100) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const trades = [];
    const basePrice = this.basePrice[symbol] || 100;
    const now = Date.now();

    for (let i = 0; i < limit; i++) {
      trades.push({
        id: Date.now() + i,
        price: this.generatePrice(symbol, basePrice).toFixed(8),
        qty: (Math.random() * 10).toFixed(8),
        quoteQty: (Math.random() * 1000).toFixed(8),
        time: now - (i * 1000),
        isBuyerMaker: Math.random() > 0.5,
        isBestMatch: true
      });
    }

    return trades;
  }
}

export default new MockMarketService();